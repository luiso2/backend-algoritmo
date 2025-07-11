
-- Crear tabla app_contracts
CREATE TABLE IF NOT EXISTS "app_contracts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "ContractDifficulty" NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "value" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "parties" JSONB NOT NULL,
    "clauses" JSONB NOT NULL,
    "attachments" TEXT[],
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "templateId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_contracts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "app_contracts_userId_idx" ON "app_contracts"("userId");
CREATE INDEX IF NOT EXISTS "app_contracts_status_idx" ON "app_contracts"("status");

-- Crear tabla app_tags
CREATE TABLE IF NOT EXISTS "app_tags" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "app_tags_userId_name_key" ON "app_tags"("userId", "name");
CREATE INDEX IF NOT EXISTS "app_tags_userId_idx" ON "app_tags"("userId");

-- Crear tabla app_goals
CREATE TABLE IF NOT EXISTS "app_goals" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" DECIMAL(15,2) NOT NULL,
    "currentAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_goals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "app_goals_userId_idx" ON "app_goals"("userId");
CREATE INDEX IF NOT EXISTS "app_goals_status_idx" ON "app_goals"("status");

-- Crear tabla app_reminders
CREATE TABLE IF NOT EXISTS "app_reminders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ReminderType" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "creditCardId" TEXT,
    "billId" TEXT,
    "contractId" TEXT,
    "goalId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_reminders_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "app_reminders_userId_idx" ON "app_reminders"("userId");
CREATE INDEX IF NOT EXISTS "app_reminders_dueDate_idx" ON "app_reminders"("dueDate");
CREATE INDEX IF NOT EXISTS "app_reminders_type_idx" ON "app_reminders"("type");

-- Crear tabla app_notifications
CREATE TABLE IF NOT EXISTS "app_notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "app_notifications_userId_idx" ON "app_notifications"("userId");
CREATE INDEX IF NOT EXISTS "app_notifications_isRead_idx" ON "app_notifications"("isRead");

-- Crear tabla app_ai_interactions
CREATE TABLE IF NOT EXISTS "app_ai_interactions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "context" JSONB,
    "model" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_ai_interactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "app_ai_interactions_userId_idx" ON "app_ai_interactions"("userId");

-- Crear tabla app_pricing_plans
CREATE TABLE IF NOT EXISTS "app_pricing_plans" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "interval" "BillingInterval" NOT NULL,
    "features" JSONB NOT NULL,
    "stripePriceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_pricing_plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "app_pricing_plans_stripePriceId_key" ON "app_pricing_plans"("stripePriceId");

-- Crear tabla app_subscriptions
CREATE TABLE IF NOT EXISTS "app_subscriptions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "app_subscriptions_stripeSubscriptionId_key" ON "app_subscriptions"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "app_subscriptions_userId_idx" ON "app_subscriptions"("userId");

-- Crear tabla app_file_uploads
CREATE TABLE IF NOT EXISTS "app_file_uploads" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "metadata" JSONB,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "app_file_uploads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "app_file_uploads_userId_idx" ON "app_file_uploads"("userId");

-- Agregar las foreign keys
ALTER TABLE "app_refresh_tokens" ADD CONSTRAINT "app_refresh_tokens_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_accounts" ADD CONSTRAINT "app_accounts_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_credit_cards" ADD CONSTRAINT "app_credit_cards_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_transactions" ADD CONSTRAINT "app_transactions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_transactions" ADD CONSTRAINT "app_transactions_accountId_fkey" 
    FOREIGN KEY ("accountId") REFERENCES "app_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "app_transactions" ADD CONSTRAINT "app_transactions_creditCardId_fkey" 
    FOREIGN KEY ("creditCardId") REFERENCES "app_credit_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "app_transactions" ADD CONSTRAINT "app_transactions_billId_fkey" 
    FOREIGN KEY ("billId") REFERENCES "app_bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "app_bills" ADD CONSTRAINT "app_bills_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_contracts" ADD CONSTRAINT "app_contracts_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_tags" ADD CONSTRAINT "app_tags_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_goals" ADD CONSTRAINT "app_goals_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_reminders" ADD CONSTRAINT "app_reminders_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_reminders" ADD CONSTRAINT "app_reminders_creditCardId_fkey" 
    FOREIGN KEY ("creditCardId") REFERENCES "app_credit_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "app_reminders" ADD CONSTRAINT "app_reminders_billId_fkey" 
    FOREIGN KEY ("billId") REFERENCES "app_bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "app_reminders" ADD CONSTRAINT "app_reminders_contractId_fkey" 
    FOREIGN KEY ("contractId") REFERENCES "app_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "app_reminders" ADD CONSTRAINT "app_reminders_goalId_fkey" 
    FOREIGN KEY ("goalId") REFERENCES "app_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "app_notifications" ADD CONSTRAINT "app_notifications_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_ai_interactions" ADD CONSTRAINT "app_ai_interactions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_subscriptions" ADD CONSTRAINT "app_subscriptions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "app_subscriptions" ADD CONSTRAINT "app_subscriptions_planId_fkey" 
    FOREIGN KEY ("planId") REFERENCES "app_pricing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "app_file_uploads" ADD CONSTRAINT "app_file_uploads_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Crear triggers para actualizar updatedAt
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updatedAt
CREATE TRIGGER set_timestamp_app_users BEFORE UPDATE ON "app_users" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_accounts BEFORE UPDATE ON "app_accounts" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_credit_cards BEFORE UPDATE ON "app_credit_cards" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_transactions BEFORE UPDATE ON "app_transactions" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_bills BEFORE UPDATE ON "app_bills" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_contracts BEFORE UPDATE ON "app_contracts" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_tags BEFORE UPDATE ON "app_tags" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_goals BEFORE UPDATE ON "app_goals" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_reminders BEFORE UPDATE ON "app_reminders" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_pricing_plans BEFORE UPDATE ON "app_pricing_plans" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_app_subscriptions BEFORE UPDATE ON "app_subscriptions" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
