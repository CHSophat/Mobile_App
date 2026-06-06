// Environment configuration for AMS_Mobile - Staging
export const ENV_CONFIG = {
  ENVIRONMENT: 'staging',
  API_BASE_URL: 'https://api-staging.apartment-management.com/api/v1',
  API_TIMEOUT: 30000,
  WEB_URL: 'https://staging.apartment-management.com',
  MOBILE_URL: 'https://mobile-staging.apartment-management.com',
  
  // Authentication
  AUTH: {
    ENABLE_2FA: true,
    TOKEN_EXPIRY: 3600,
    REFRESH_TOKEN_EXPIRY: 604800,
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
    LEVEL: 'info',
    ENABLE_CONSOLE: true,
    ENABLE_FILE: true,
  },
  
  // Firebase (Staging)
  FIREBASE: {
    API_KEY: 'AIzaSyStaging...',
    AUTH_DOMAIN: 'apartment-management-staging.firebaseapp.com',
    PROJECT_ID: 'apartment-management-staging',
    STORAGE_BUCKET: 'apartment-management-staging.appspot.com',
    MESSAGING_SENDER_ID: 'staging-sender-id',
    APP_ID: 'staging-app-id',
    DATABASE_URL: 'https://apartment-management-staging.firebaseio.com',
  },
  
  // Payment (Staging - Test Mode)
  PAYMENT: {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_staging...',
    ENABLE_TEST_MODE: true,
  },
  
  // App Settings
  APP: {
    VERSION: '1.0.0',
    NAME: 'Property Management',
    DESCRIPTION: 'Mobile property management app',
  },
};

export default ENV_CONFIG;
