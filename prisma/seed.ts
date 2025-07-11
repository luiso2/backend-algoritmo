import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles first
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator role with full access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user role',
    },
  });

  console.log('✅ Created roles');

  // Create permissions
  const permissions = [
    { name: 'users:read', resource: 'users', action: 'read' },
    { name: 'users:write', resource: 'users', action: 'write' },
    { name: 'users:delete', resource: 'users', action: 'delete' },
    { name: 'transactions:read', resource: 'transactions', action: 'read' },
    { name: 'transactions:write', resource: 'transactions', action: 'write' },
    { name: 'reports:read', resource: 'reports', action: 'read' },
    { name: 'admin:access', resource: 'admin', action: 'access' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: {
        ...perm,
        description: `Permission to ${perm.action} ${perm.resource}`,
      },
    });
  }

  console.log('✅ Created permissions');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      language: 'es',
      currency: 'USD',
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      monthlyIncome: 5000,
      currency: 'USD',
      language: 'es',
      emailAlerts: true,
      smsAlerts: false,
      pushAlerts: true,
      timezone: 'America/Bogota',
    },
  });

  console.log('✅ Created test user');

  // Assign role to user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: testUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      roleId: userRole.id,
    },
  });

  console.log('✅ Assigned user role');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      language: 'es',
      currency: 'USD',
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create admin settings
  await prisma.userSettings.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      monthlyIncome: 10000,
      currency: 'USD',
      language: 'es',
      emailAlerts: true,
      smsAlerts: true,
      pushAlerts: true,
      timezone: 'America/Bogota',
    },
  });

  console.log('✅ Created admin user');

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Assigned admin role');

  // Create sample accounts for test user
  const checkingAccount = await prisma.account.create({
    data: {
      userId: testUser.id,
      name: 'Cuenta Corriente',
      type: 'CHECKING',
      currency: 'USD',
      balance: 2500.00,
      initialBalance: 2000.00,
      bankName: 'Banco do Brasil',
      accountNumber: '****1234',
      color: '#3B82F6',
      icon: '🏦',
    },
  });

  const savingsAccount = await prisma.account.create({
    data: {
      userId: testUser.id,
      name: 'Cuenta de Ahorros',
      type: 'SAVINGS',
      currency: 'USD',
      balance: 10000.00,
      initialBalance: 8000.00,
      bankName: 'Caixa Econômica',
      accountNumber: '****5678',
      color: '#10B981',
      icon: '💰',
    },
  });

  console.log('✅ Created sample accounts');

  // Create sample credit cards
  const visaCard = await prisma.creditCard.create({
    data: {
      userId: testUser.id,
      name: 'Visa Gold',
      last4Digits: '1234',
      brand: 'Visa',
      bank: 'Banco do Brasil',
      creditLimit: 5000.00,
      availableLimit: 3500.00,
      balance: 1500.00,
      minimumPayment: 150.00,
      closingDay: 15,
      dueDay: 25,
      reminderClosing: true,
      reminderPayment: true,
      daysBeforeClosing: 3,
      daysBeforePayment: 5,
      color: '#1A56DB',
      isActive: true,
    },
  });

  const masterCard = await prisma.creditCard.create({
    data: {
      userId: testUser.id,
      name: 'Mastercard Platinum',
      last4Digits: '5678',
      brand: 'Mastercard',
      bank: 'Santander',
      creditLimit: 8000.00,
      availableLimit: 6000.00,
      balance: 2000.00,
      minimumPayment: 200.00,
      closingDay: 5,
      dueDay: 15,
      reminderClosing: true,
      reminderPayment: true,
      daysBeforeClosing: 3,
      daysBeforePayment: 3,
      color: '#DC2626',
      isActive: true,
    },
  });

  console.log('✅ Created sample credit cards');

  // Create sample transactions
  const today = new Date();
  const transactions = [
    {
      userId: testUser.id,
      accountId: checkingAccount.id,
      amount: 1200.00,
      currency: 'USD',
      type: 'INCOME' as const,
      category: 'Salary',
      description: 'Monthly salary payment',
      date: new Date(today.getFullYear(), today.getMonth(), 1),
      paymentMethod: 'TRANSFER' as const,
    },
    {
      userId: testUser.id,
      accountId: checkingAccount.id,
      amount: 85.50,
      currency: 'USD',
      type: 'EXPENSE' as const,
      category: 'Food',
      subcategory: 'Groceries',
      description: 'Supermarket purchase',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
      paymentMethod: 'DEBIT' as const,
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({ data: transaction });
  }

  console.log('✅ Created sample transactions');

  // Create achievements
  const achievements = [
    {
      name: 'first_transaction',
      description: 'Complete your first transaction',
      icon: '🎯',
      points: 10,
      category: 'beginner',
      condition: { type: 'transaction_count', value: 1 },
    },
    {
      name: 'savings_goal',
      description: 'Save $1000',
      icon: '💰',
      points: 50,
      category: 'savings',
      condition: { type: 'savings_amount', value: 1000 },
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement });
  }

  console.log('✅ Created achievements');

  // Create contract templates
  const templates = [
    {
      name: 'Rental Agreement',
      category: 'Real Estate',
      description: 'Standard rental agreement template',
      content: 'This is a rental agreement between {{landlord}} and {{tenant}}...',
      variables: ['landlord', 'tenant', 'address', 'rent', 'startDate'],
      difficulty: 'BASIC' as const,
      featured: true,
    },
    {
      name: 'Service Contract',
      category: 'Services',
      description: 'General service agreement template',
      content: 'This service agreement is entered into between {{provider}} and {{client}}...',
      variables: ['provider', 'client', 'services', 'payment', 'duration'],
      difficulty: 'INTERMEDIATE' as const,
      featured: true,
    },
  ];

  for (const template of templates) {
    await prisma.contractTemplate.create({ data: template });
  }

  console.log('✅ Created contract templates');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
