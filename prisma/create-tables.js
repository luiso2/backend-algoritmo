// Script para crear las tablas manualmente sin afectar Directus
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function createTables() {
  // Asegurarse de que las variables de entorno están cargadas
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL no está definida');
    console.error('Asegúrate de que el archivo .env existe y contiene DATABASE_URL');
    process.exit(1);
  }

  // Parsear la URL de la base de datos
  const dbUrl = process.env.DATABASE_URL;
  const urlParts = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  
  if (!urlParts) {
    console.error('Error: No se pudo parsear DATABASE_URL');
    console.error('URL recibida:', dbUrl);
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
  console.log('  Creando Tablas de la Aplicación');
  console.log('===========================================\n');

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'create-tables.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error('Error: No se encontró el archivo create-tables.sql');
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 Ejecutando script SQL...\n');

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
      } catch (error) {
        if (error.code === '42P07') { // Tabla ya existe
          console.log(`⚪ Tabla ya existe: ${error.message.match(/relation "(.*)" already exists/)?.[1] || 'desconocida'}`);
        } else if (error.code === '42710') { // Tipo ya existe
          console.log(`⚪ Tipo ya existe: ${error.message.match(/type "(.*)" already exists/)?.[1] || 'desconocido'}`);
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

    // Verificar las tablas creadas
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename LIKE 'app_%'
      ORDER BY tablename;
    `);

    console.log('\n📊 Tablas de la aplicación:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.tablename}`);
    });

    console.log(`\nTotal: ${result.rows.length} tablas\n`);

    // Verificar que las tablas de Directus siguen intactas
    const directusCheck = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename LIKE 'directus_%';
    `);

    console.log(`✅ Tablas de Directus intactas: ${directusCheck.rows[0].count} tablas`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nDetalles:', error.detail || '');
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log('\n===========================================');
  console.log('  Proceso completado');
  console.log('===========================================');
}

// Ejecutar
createTables()
  .then(() => {
    console.log('\n✅ Proceso completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
