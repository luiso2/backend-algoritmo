// Configuración ultra simple sin validación
export default () => {
  console.log('📋 Cargando configuración...');
  
  const config = {
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

    // Security
    CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
    RATE_LIMIT_TTL: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    RATE_LIMIT_LIMIT: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,

    // Email
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@algoritmo.com',
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Algoritmo Finanzas',

    // Encryption
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,

    // Railway specific
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL,
  };

  console.log('✅ Configuración cargada exitosamente');
  return config;
};
