-- Script para agregar las tablas y campos faltantes

-- Crear tabla app_user_settings
CREATE TABLE IF NOT EXISTS "app_user_settings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
    "pushAlerts" BOOLEAN NOT NULL DEFAULT true,
    "gamificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiAssistantEnabled" BOOLEAN NOT NULL DEFAULT true,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_user_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "app_user_settings_userId_key" UNIQUE ("userId")
);

-- Crear tabla app_roles
CREATE TABLE IF NOT EXISTS "app_roles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_roles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "app_roles_name_key" UNIQUE ("name")
);

-- Crear tabla app_user_roles
CREATE TABLE IF NOT EXISTS "app_user_roles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_user_roles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "app_user_roles_userId_roleId_key" UNIQUE ("userId", "roleId")
);

-- Crear tabla app_permissions
CREATE TABLE IF NOT EXISTS "app_permissions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_permissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "app_permissions_name_key" UNIQUE ("name")
);

-- Crear tabla app_role_permissions
CREATE TABLE IF NOT EXISTS "app_role_permissions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_role_permissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "app_role_permissions_roleId_permissionId_key" UNIQUE ("roleId", "permissionId")
);

-- Crear tabla app_achievements
CREATE TABLE IF NOT EXISTS "app_achievements" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "condition" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_achievements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "app_achievements_name_key" UNIQUE ("name")
);

-- Crear tabla app_user_achievements
CREATE TABLE IF NOT EXISTS "app_user_achievements" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_user_achievements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "app_user_achievements_userId_achievementId_key" UNIQUE ("userId", "achievementId")
);

-- Crear tabla app_contract_templates
CREATE TABLE IF NOT EXISTS "app_contract_templates" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" "ContractDifficulty" NOT NULL,
    "estimatedTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_contract_templates_pkey" PRIMARY KEY ("id")
);

-- Agregar columnas faltantes a app_users
ALTER TABLE "app_users" ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'es';
ALTER TABLE "app_users" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD';
ALTER TABLE "app_users" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- Agregar columnas faltantes a app_accounts
ALTER TABLE "app_accounts" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "app_accounts" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;

-- Agregar columnas faltantes a app_credit_cards
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "lastFourDigits" TEXT;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "bank" TEXT;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "limit" DECIMAL(15,2);
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "balance" DECIMAL(15,2) DEFAULT 0;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "minimumPayment" DECIMAL(15,2) DEFAULT 0;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "interestRate" DOUBLE PRECISION;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "closingDate" INTEGER;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "dueDate" INTEGER;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "reminderClosing" BOOLEAN DEFAULT true;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "reminderPayment" BOOLEAN DEFAULT true;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "daysBeforeClosing" INTEGER DEFAULT 3;
ALTER TABLE "app_credit_cards" ADD COLUMN IF NOT EXISTS "daysBeforePayment" INTEGER DEFAULT 5;

-- Agregar columnas faltantes a app_transactions
ALTER TABLE "app_transactions" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD';

-- Agregar columnas faltantes a app_bills
ALTER TABLE "app_bills" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "app_bills" ADD COLUMN IF NOT EXISTS "company" TEXT;
ALTER TABLE "app_bills" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD';
ALTER TABLE "app_bills" ADD COLUMN IF NOT EXISTS "reminderDate" TIMESTAMP(3);
ALTER TABLE "app_bills" ADD COLUMN IF NOT EXISTS "recurringFrequency" "RecurringFrequency";
ALTER TABLE "app_bills" ADD COLUMN IF NOT EXISTS "notificationEmail" BOOLEAN DEFAULT true;
ALTER TABLE "app_bills" ADD COLUMN IF NOT EXISTS "notificationPush" BOOLEAN DEFAULT true;
ALTER TABLE "app_bills" ADD COLUMN IF NOT EXISTS "notificationSms" BOOLEAN DEFAULT false;

-- Agregar columnas faltantes a app_reminders
ALTER TABLE "app_reminders" ADD COLUMN IF NOT EXISTS "date" TIMESTAMP(3);
ALTER TABLE "app_reminders" ADD COLUMN IF NOT EXISTS "cardId" TEXT;
ALTER TABLE "app_reminders" ADD COLUMN IF NOT EXISTS "amount" DECIMAL(15,2);
ALTER TABLE "app_reminders" ADD COLUMN IF NOT EXISTS "notificationSent" BOOLEAN DEFAULT false;
ALTER TABLE "app_reminders" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);

-- Agregar columnas faltantes a app_notifications
ALTER TABLE "app_notifications" ADD COLUMN IF NOT EXISTS "read" BOOLEAN DEFAULT false;

-- Agregar foreign keys para las nuevas tablas
ALTER TABLE "app_user_settings" ADD CONSTRAINT "app_user_settings_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_user_roles" ADD CONSTRAINT "app_user_roles_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_user_roles" ADD CONSTRAINT "app_user_roles_roleId_fkey" 
    FOREIGN KEY ("roleId") REFERENCES "app_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_role_permissions" ADD CONSTRAINT "app_role_permissions_roleId_fkey" 
    FOREIGN KEY ("roleId") REFERENCES "app_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_role_permissions" ADD CONSTRAINT "app_role_permissions_permissionId_fkey" 
    FOREIGN KEY ("permissionId") REFERENCES "app_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_user_achievements" ADD CONSTRAINT "app_user_achievements_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_user_achievements" ADD CONSTRAINT "app_user_achievements_achievementId_fkey" 
    FOREIGN KEY ("achievementId") REFERENCES "app_achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Actualizar triggers para las nuevas tablas
CREATE TRIGGER set_timestamp_app_user_settings BEFORE UPDATE ON "app_user_settings" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_roles BEFORE UPDATE ON "app_roles" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_contract_templates BEFORE UPDATE ON "app_contract_templates" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Copiar valores de last4Digits a lastFourDigits si existe
UPDATE "app_credit_cards" SET "lastFourDigits" = "last4Digits" WHERE "lastFourDigits" IS NULL AND "last4Digits" IS NOT NULL;

-- Copiar valores de closingDay a closingDate y dueDay a dueDate
UPDATE "app_credit_cards" SET "closingDate" = "closingDay" WHERE "closingDate" IS NULL;
UPDATE "app_credit_cards" SET "dueDate" = "dueDay" WHERE "dueDate" IS NULL;

-- Copiar valores de creditLimit a limit
UPDATE "app_credit_cards" SET "limit" = "creditLimit" WHERE "limit" IS NULL;

-- Copiar valores de name a title en bills
UPDATE "app_bills" SET "title" = "name" WHERE "title" IS NULL;

-- Copiar valores de frequency a recurringFrequency
UPDATE "app_bills" SET "recurringFrequency" = "frequency" WHERE "recurringFrequency" IS NULL AND "frequency" IS NOT NULL;

-- Copiar valores de dueDate a date en reminders
UPDATE "app_reminders" SET "date" = "dueDate" WHERE "date" IS NULL;

-- Copiar valores de creditCardId a cardId
UPDATE "app_reminders" SET "cardId" = "creditCardId" WHERE "cardId" IS NULL AND "creditCardId" IS NOT NULL;

-- Copiar valores de isRead a read en notifications
UPDATE "app_notifications" SET "read" = "isRead" WHERE "read" IS NULL;

-- Copiar valores de avatarUrl a avatar en users
UPDATE "app_users" SET "avatar" = "avatarUrl" WHERE "avatar" IS NULL AND "avatarUrl" IS NOT NULL;
