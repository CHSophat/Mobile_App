// Environment configuration for AMS_Mobile - Production
export const ENV_CONFIG = {
  ENVIRONMENT: 'production',
  API_BASE_URL: 'https://api.apartment-management.com/api/v1',
  API_TIMEOUT: 30000,
  WEB_URL: 'https://app.apartment-management.com',
  MOBILE_URL: 'https://mobile.apartment-management.com',
  
  // Authentication
  AUTH: {
    ENABLE_2FA: true,
    TOKEN_EXPIRY: 1800, // 30 minutes
    REFRESH_TOKEN_EXPIRY: 2592000, // 30 days
  },
  
  // Features
  FEATURES: {
    ENABLE_ANALYTICS: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_BIOMETRIC: true,
  },
  
  // Logging
  LOGGING: {
    LEVEL: 'warn',
    ENABLE_CONSOLE: false,
    ENABLE_FILE: true,
  },
  
  // Firebase (Production)
  FIREBASE: {
    API_KEY: 'AIzaSyProduction...',
    AUTH_DOMAIN: 'apartment-management.firebaseapp.com',
    PROJECT_ID: 'apartment-management-prod',
    STORAGE_BUCKET: 'apartment-management.appspot.com',
    MESSAGING_SENDER_ID: 'prod-sender-id',
    APP_ID: 'prod-app-id',
    DATABASE_URL: 'https://apartment-management.firebaseio.com',
  },
  
  // Payment (Production - Live Mode)
  PAYMENT: {
    STRIPE_PUBLISHABLE_KEY: 'pk_live_production...',
    ENABLE_TEST_MODE: false,
  },
  
  // App Settings
  APP: {
    VERSION: '1.0.0',
    NAME: 'Property Management',
    DESCRIPTION: 'Mobile property management app',
  },
};

export default ENV_CONFIG;
