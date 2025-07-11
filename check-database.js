// Script para verificar las tablas existentes en la base de datos
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  console.log('===========================================');
  console.log('  Verificando Base de Datos');
  console.log('===========================================\n');

  try {
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Listar todas las tablas
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;

    console.log('📋 Tablas encontradas en la base de datos:\n');
    
    const directusTables = [];
    const appTables = [];
    const otherTables = [];

    tables.forEach(table => {
      const tableName = table.tablename;
      if (tableName.startsWith('directus_')) {
        directusTables.push(tableName);
      } else if (tableName.startsWith('app_')) {
        appTables.push(tableName);
      } else {
        otherTables.push(tableName);
      }
    });

    if (directusTables.length > 0) {
      console.log('🔷 Tablas de Directus:');
      directusTables.forEach(t => console.log(`   - ${t}`));
      console.log();
    }

    if (appTables.length > 0) {
      console.log('🔶 Tablas de la Aplicación:');
      appTables.forEach(t => console.log(`   - ${t}`));
      console.log();
    }

    if (otherTables.length > 0) {
      console.log('⚪ Otras tablas:');
      otherTables.forEach(t => console.log(`   - ${t}`));
      console.log();
    }

    console.log(`Total de tablas: ${tables.length}`);
    console.log(`- Directus: ${directusTables.length}`);
    console.log(`- Aplicación: ${appTables.length}`);
    console.log(`- Otras: ${otherTables.length}`);

    // Verificar si hay conflictos potenciales
    const conflictingTables = otherTables.filter(t => 
      ['users', 'accounts', 'transactions', 'bills', 'contracts', 'goals', 
       'reminders', 'notifications', 'tags'].includes(t)
    );

    if (conflictingTables.length > 0) {
      console.log('\n⚠️  ADVERTENCIA: Se encontraron tablas que podrían causar conflictos:');
      conflictingTables.forEach(t => console.log(`   - ${t}`));
      console.log('\nRecomendación: El schema de Prisma está configurado para usar prefijo "app_"');
      console.log('para evitar conflictos con estas tablas existentes.');
    } else {
      console.log('\n✅ No se detectaron conflictos con las tablas existentes.');
    }

  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n===========================================');
  console.log('  Verificación completada');
  console.log('===========================================');
}

// Ejecutar verificación
checkDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error durante la verificación:', error);
    process.exit(1);
  });
