// Configuration adjustments for Vercel deployment
export const vercelConfig = {
  // Feature flags for Vercel compatibility
  features: {
    // Disable features that don't work in serverless
    useQueues: !process.env.VERCEL,
    useWebSockets: !process.env.VERCEL,
    useScheduler: !process.env.VERCEL,
    useBullBoard: false,
    
    // Use external services
    useRedisCache: !process.env.VERCEL,
    useLocalFileStorage: false,
    
    // Adjust timeouts
    defaultTimeout: process.env.VERCEL ? 9000 : 30000, // 9s for Vercel, 30s otherwise
  },
  
  // Database settings
  database: {
    // Use connection pooling for serverless
    connectionLimit: process.env.VERCEL ? 1 : 10,
    // Aggressive connection timeout
    connectTimeout: process.env.VERCEL ? 3000 : 10000,
  },
  
  // API settings
  api: {
    // Reduce payload size for serverless
    maxPayloadSize: process.env.VERCEL ? '5mb' : '50mb',
    // Disable file uploads in Vercel
    enableFileUploads: !process.env.VERCEL,
  },
  
  // Cache settings
  cache: {
    // Use in-memory cache for Vercel
    store: process.env.VERCEL ? 'memory' : 'redis',
    ttl: process.env.VERCEL ? 300 : 3600, // 5 min vs 1 hour
  },
};

// Helper to check if running on Vercel
export const isVercel = () => !!process.env.VERCEL;

// Helper to get feature flag
export const isFeatureEnabled = (feature: keyof typeof vercelConfig.features) => {
  return vercelConfig.features[feature];
};
