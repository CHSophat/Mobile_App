// Environment configuration for AMS_Mobile - Development
export const ENV_CONFIG = {
  ENVIRONMENT: 'development',
  API_BASE_URL: 'http://localhost:5000/api/v1',
  API_TIMEOUT: 30000,
  WEB_URL: 'http://localhost:3000',
  MOBILE_URL: 'http://localhost:8081',
  
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
    LEVEL: 'debug',
    ENABLE_CONSOLE: true,
    ENABLE_FILE: false,
  },
  
  // Firebase (Development)
  FIREBASE: {
    API_KEY: 'AIzaSyDev...',
    AUTH_DOMAIN: 'apartment-management-dev.firebaseapp.com',
    PROJECT_ID: 'apartment-management-dev',
    STORAGE_BUCKET: 'apartment-management-dev.appspot.com',
    MESSAGING_SENDER_ID: 'dev-sender-id',
    APP_ID: 'dev-app-id',
    DATABASE_URL: 'https://apartment-management-dev.firebaseio.com',
  },
  
  // Payment (Development - Test Mode)
  PAYMENT: {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_dev...',
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
