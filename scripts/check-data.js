// Script para verificar datos existentes en la base de datos
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkData() {
  const prisma = new PrismaClient();
  
  console.log('===========================================');
  console.log('  Verificando Datos en la Base de Datos');
  console.log('===========================================\n');

  try {
    await prisma.$connect();

    // Verificar usuarios
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { email: true, firstName: true, lastName: true }
    });
    console.log(`👤 Usuarios: ${userCount}`);
    users.forEach(u => console.log(`   - ${u.email} (${u.firstName} ${u.lastName})`));
    console.log();

    // Verificar roles
    const roleCount = await prisma.role.count();
    const roles = await prisma.role.findMany({
      select: { name: true, description: true }
    });
    console.log(`🎭 Roles: ${roleCount}`);
    roles.forEach(r => console.log(`   - ${r.name}: ${r.description || 'Sin descripción'}`));
    console.log();

    // Verificar cuentas bancarias
    const accountCount = await prisma.account.count();
    console.log(`🏦 Cuentas bancarias: ${accountCount}`);

    // Verificar tarjetas de crédito
    const creditCardCount = await prisma.creditCard.count();
    console.log(`💳 Tarjetas de crédito: ${creditCardCount}`);

    // Verificar transacciones
    const transactionCount = await prisma.transaction.count();
    console.log(`💰 Transacciones: ${transactionCount}`);

    // Verificar bills
    const billCount = await prisma.bill.count();
    console.log(`📄 Bills/Cuentas por pagar: ${billCount}`);

    // Verificar contratos
    const contractCount = await prisma.contract.count();
    console.log(`📋 Contratos: ${contractCount}`);

    // Verificar templates de contratos
    const templateCount = await prisma.contractTemplate.count();
    console.log(`📑 Templates de contratos: ${templateCount}`);

    // Verificar achievements
    const achievementCount = await prisma.achievement.count();
    console.log(`🏆 Achievements/Logros: ${achievementCount}`);

    // Verificar planes de precio
    const planCount = await prisma.pricingPlan.count();
    console.log(`💵 Planes de precio: ${planCount}`);

    console.log('\n===========================================');
    console.log('  Resumen');
    console.log('===========================================');
    
    if (userCount === 0) {
      console.log('⚠️  No hay usuarios en la base de datos');
      console.log('   Ejecuta: npm run prisma:seed');
    } else {
      console.log('✅ La base de datos contiene datos');
      
      if (accountCount === 0 || creditCardCount === 0 || transactionCount === 0) {
        console.log('\n⚠️  Algunos datos de ejemplo faltan:');
        if (accountCount === 0) console.log('   - Cuentas bancarias');
        if (creditCardCount === 0) console.log('   - Tarjetas de crédito');
        if (transactionCount === 0) console.log('   - Transacciones');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
