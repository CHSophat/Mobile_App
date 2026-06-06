// Environment configuration for AMS_Mobile - QA
export const ENV_CONFIG = {
  ENVIRONMENT: 'qa',
  API_BASE_URL: 'https://api-qa.apartment-management.com/api/v1',
  API_TIMEOUT: 30000,
  WEB_URL: 'https://qa.apartment-management.com',
  MOBILE_URL: 'https://mobile-qa.apartment-management.com',
  
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
    ENABLE_FILE: true,
  },
  
  // Firebase (QA)
  FIREBASE: {
    API_KEY: 'AIzaSyQA...',
    AUTH_DOMAIN: 'apartment-management-qa.firebaseapp.com',
    PROJECT_ID: 'apartment-management-qa',
    STORAGE_BUCKET: 'apartment-management-qa.appspot.com',
    MESSAGING_SENDER_ID: 'qa-sender-id',
    APP_ID: 'qa-app-id',
    DATABASE_URL: 'https://apartment-management-qa.firebaseio.com',
  },
  
  // Payment (QA - Test Mode)
  PAYMENT: {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_qa...',
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
