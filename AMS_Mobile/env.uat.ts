// Environment configuration for AMS_Mobile - UAT
export const ENV_CONFIG = {
  ENVIRONMENT: 'uat',
  API_BASE_URL: 'https://api-uat.apartment-management.com/api/v1',
  API_TIMEOUT: 30000,
  WEB_URL: 'https://uat.apartment-management.com',
  MOBILE_URL: 'https://mobile-uat.apartment-management.com',
  
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
    ENABLE_CONSOLE: false,
    ENABLE_FILE: true,
  },
  
  // Firebase (UAT)
  FIREBASE: {
    API_KEY: 'AIzaSyUAT...',
    AUTH_DOMAIN: 'apartment-management-uat.firebaseapp.com',
    PROJECT_ID: 'apartment-management-uat',
    STORAGE_BUCKET: 'apartment-management-uat.appspot.com',
    MESSAGING_SENDER_ID: 'uat-sender-id',
    APP_ID: 'uat-app-id',
    DATABASE_URL: 'https://apartment-management-uat.firebaseio.com',
  },
  
  // Payment (UAT - Test Mode)
  PAYMENT: {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_uat...',
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
