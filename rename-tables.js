// Script para renombrar las tablas existentes agregando el prefijo app_
require('dotenv').config();
const { Client } = require('pg');

async function renameTables() {
  // Parsear la URL de la base de datos
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('Error: DATABASE_URL no está definida en el archivo .env');
    process.exit(1);
  }

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
  console.log('  Renombrando Tablas Existentes');
  console.log('===========================================\n');

  const tablesToRename = [
    { old: 'User', new: 'app_users' },
    { old: 'RefreshToken', new: 'app_refresh_tokens' },
    { old: 'Account', new: 'app_accounts' },
    { old: 'CreditCard', new: 'app_credit_cards' },
    { old: 'Transaction', new: 'app_transactions' },
    { old: 'Bill', new: 'app_bills' },
    { old: 'Contract', new: 'app_contracts' },
    { old: 'Tag', new: 'app_tags' },
    { old: 'Goal', new: 'app_goals' },
    { old: 'Reminder', new: 'app_reminders' },
    { old: 'Notification', new: 'app_notifications' },
    { old: 'AIInteraction', new: 'app_ai_interactions' },
    { old: 'PricingPlan', new: 'app_pricing_plans' },
    { old: 'Subscription', new: 'app_subscriptions' },
    { old: 'FileUpload', new: 'app_file_uploads' }
  ];

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    console.log('📋 Renombrando tablas...\n');

    for (const table of tablesToRename) {
      try {
        // Verificar si la tabla antigua existe
        const checkOld = await client.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          [table.old]
        );

        // Verificar si la tabla nueva ya existe
        const checkNew = await client.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          [table.new]
        );

        if (checkOld.rows[0].exists && !checkNew.rows[0].exists) {
          // Renombrar la tabla
          await client.query(`ALTER TABLE "${table.old}" RENAME TO "${table.new}"`);
          console.log(`✅ ${table.old} → ${table.new}`);
        } else if (!checkOld.rows[0].exists && checkNew.rows[0].exists) {
          console.log(`⚪ ${table.new} ya existe`);
        } else if (!checkOld.rows[0].exists) {
          console.log(`❌ ${table.old} no encontrada`);
        } else {
          console.log(`⚠️  ${table.old} y ${table.new} ambas existen`);
        }
      } catch (error) {
        console.error(`❌ Error al renombrar ${table.old}:`, error.message);
      }
    }

    console.log('\n📊 Verificando el resultado...\n');

    // Mostrar todas las tablas app_
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename LIKE 'app_%'
      ORDER BY tablename;
    `);

    console.log('✅ Tablas con prefijo app_:');
    result.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });

    console.log(`\nTotal: ${result.rows.length} tablas`);

    // Verificar tablas de Directus
    const directusCheck = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename LIKE 'directus_%';
    `);

    console.log(`\n✅ Tablas de Directus intactas: ${directusCheck.rows[0].count} tablas`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log('\n===========================================');
  console.log('  Proceso completado');
  console.log('===========================================');
}

// Ejecutar
renameTables()
  .then(() => {
    console.log('\n✅ Las tablas fueron renombradas correctamente.');
    console.log('   Ahora puedes ejecutar el servidor.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
