// Verificar conexiones a la base de datos y Redis
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

async function verifyConnections() {
  console.log('===========================================');
  console.log('  Verificando Conexiones');
  console.log('===========================================\n');

  // Verificar PostgreSQL
  console.log('1. Verificando conexión a PostgreSQL...');
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL conectado exitosamente');
    console.log(`   - Host: ${process.env.DATABASE_URL.match(/\@([\d\.]+):/)[1]}`);
    console.log(`   - Puerto: ${process.env.DATABASE_URL.match(/:(\d+)\/algoritmo/)[1]}`);
    console.log(`   - Base de datos: algoritmo`);
    
    // Verificar si hay tablas
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`   - Tablas encontradas: ${tableCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n2. Verificando conexión a Redis...');
  
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: () => null
  });

  try {
    await redis.ping();
    console.log('✅ Redis conectado exitosamente');
    console.log(`   - Host: ${process.env.REDIS_HOST}`);
    console.log(`   - Puerto: ${process.env.REDIS_PORT}`);
    
    // Verificar algunas estadísticas básicas
    const info = await redis.info('server');
    const version = info.match(/redis_version:(.+)/);
    if (version) {
      console.log(`   - Versión de Redis: ${version[1]}`);
    }
    
  } catch (error) {
    console.error('❌ Error al conectar con Redis:', error.message);
  } finally {
    redis.disconnect();
  }

  console.log('\n3. Verificando variables de entorno...');
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_PASSWORD',
    'DIRECTUS_URL',
    'DIRECTUS_TOKEN'
  ];

  let allEnvVarsPresent = true;
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Configurado`);
    } else {
      console.log(`❌ ${varName}: NO configurado`);
      allEnvVarsPresent = false;
    }
  });

  if (allEnvVarsPresent) {
    console.log('\n✅ Todas las variables de entorno requeridas están configuradas');
  } else {
    console.log('\n❌ Faltan algunas variables de entorno requeridas');
  }

  console.log('\n===========================================');
  console.log('  Verificación completada');
  console.log('===========================================');
}

// Ejecutar verificación
verifyConnections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error durante la verificación:', error);
    process.exit(1);
  });
