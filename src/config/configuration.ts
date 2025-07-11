// Parse Redis URL if provided (Railway format)
function parseRedisUrl(url: string) {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
    };
  } catch (error) {
    console.error('Failed to parse Redis URL:', error);
    return null;
  }
}

export default () => {
  // Parse Redis configuration
  const redisConfig = process.env.REDIS_URL 
    ? parseRedisUrl(process.env.REDIS_URL)
    : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
      };

  return {
    // Application
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 3001,
    APP_URL: process.env.APP_URL || process.env.RAILWAY_STATIC_URL || 'http://localhost:3001',

    // Database
    DATABASE_URL: process.env.DATABASE_URL,

    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,

    // Redis
    REDIS_URL: process.env.REDIS_URL,
    REDIS_HOST: redisConfig?.host || 'localhost',
    REDIS_PORT: redisConfig?.port || 6379,
    REDIS_PASSWORD: redisConfig?.password,

    // AWS/Storage
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,

    // Email
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@algoritmo.com',
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Algoritmo Finanzas',

    // SMS
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

    // Directus
    DIRECTUS_URL: process.env.DIRECTUS_URL,
    DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN,

    // Security
    CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:5173',
    RATE_LIMIT_TTL: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    RATE_LIMIT_LIMIT: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,

    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',

    // Encryption
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,

    // External APIs
    EXCHANGE_RATES_API_KEY: process.env.EXCHANGE_RATES_API_KEY,
    
    // Sentry
    SENTRY_DSN: process.env.SENTRY_DSN,
    
    // Railway specific
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL,
  };
};
