// Script para actualizar el schema de la base de datos
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function updateSchema() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL no está definida');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  const urlParts = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  
  if (!urlParts) {
    console.error('Error: No se pudo parsear DATABASE_URL');
    process.exit(1);
  }

  const [, user, password, host, port, database] = urlParts;

  const client = new Client({
    user,
    password,
    host,
    port: parseInt(port),
    database,
    ssl: false
  });

  console.log('===========================================');
  console.log('  Actualizando Schema de Base de Datos');
  console.log('===========================================\n');

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'update-schema.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error('Error: No se encontró el archivo update-schema.sql');
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 Ejecutando actualizaciones...\n');

    // Dividir el SQL en statements individuales
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        await client.query(statement + ';');
        successCount++;
        
        // Mostrar qué se está haciendo
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE IF NOT EXISTS "([^"]+)"/)?.[1];
          if (tableName) console.log(`✅ Tabla creada/verificada: ${tableName}`);
        } else if (statement.includes('ALTER TABLE')) {
          const tableName = statement.match(/ALTER TABLE "([^"]+)"/)?.[1];
          const columnName = statement.match(/ADD COLUMN IF NOT EXISTS "([^"]+)"/)?.[1];
          if (tableName && columnName) console.log(`✅ Columna agregada: ${tableName}.${columnName}`);
        }
      } catch (error) {
        if (error.code === '42P07' || error.code === '42701') { // Ya existe
          // Ignorar errores de "ya existe"
        } else {
          console.error(`❌ Error: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n✅ Statements ejecutados: ${successCount}`);
    if (errorCount > 0) {
      console.log(`⚠️  Errores encontrados: ${errorCount}`);
    }

    // Verificar las nuevas tablas
    const newTables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN (
        'app_user_settings',
        'app_roles',
        'app_user_roles',
        'app_permissions',
        'app_role_permissions',
        'app_achievements',
        'app_user_achievements',
        'app_contract_templates'
      )
      ORDER BY tablename;
    `);

    console.log('\n📊 Nuevas tablas verificadas:');
    newTables.rows.forEach(row => {
      console.log(`   ✓ ${row.tablename}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log('\n===========================================');
  console.log('  Actualización completada');
  console.log('===========================================');
}

// Ejecutar
updateSchema()
  .then(() => {
    console.log('\n✅ Schema actualizado exitosamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
