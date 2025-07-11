import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(3001),
  APP_URL: Joi.string().uri().required(),

  // Database
  DATABASE_URL: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Stripe
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().optional(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),

  // AWS
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_BUCKET_NAME: Joi.string().optional(),

  // Email
  SENDGRID_API_KEY: Joi.string().optional(),
  EMAIL_FROM: Joi.string().email().default('noreply@algoritmo.com'),
  EMAIL_FROM_NAME: Joi.string().default('Algoritmo Finanzas'),

  // SMS
  TWILIO_ACCOUNT_SID: Joi.string().optional(),
  TWILIO_AUTH_TOKEN: Joi.string().optional(),
  TWILIO_PHONE_NUMBER: Joi.string().optional(),

  // Directus
  DIRECTUS_URL: Joi.string().uri().required(),
  DIRECTUS_TOKEN: Joi.string().required(),

  // Security
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_LIMIT: Joi.number().default(100),

  // OpenAI
  OPENAI_API_KEY: Joi.string().optional(),
  OPENAI_MODEL: Joi.string().default('gpt-4-turbo-preview'),

  // Encryption
  ENCRYPTION_KEY: Joi.string().optional(),

  // External APIs
  EXCHANGE_RATES_API_KEY: Joi.string().optional(),
});
