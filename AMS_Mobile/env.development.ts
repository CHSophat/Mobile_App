// Environment configuration for AMS_Mobile - Development
import { Platform } from 'react-native';

// Android emulator routes "localhost" to the emulator itself, not the host machine.
// 10.0.2.2 is the special alias that reaches the host's loopback.
// For a physical device set EXPO_PUBLIC_API_URL=http://<your-machine-ip>:5168/api/v1
const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const ENV_CONFIG = {
  ENVIRONMENT: 'development',
  API_BASE_URL: `http://${API_HOST}:5168/api/v1`,
  API_TIMEOUT: 30000,
  WEB_URL: `http://${API_HOST}:3000`,
  // MOBILE_URL: 'http://localhost:8081',
  MOBILE_URL: `http://localhost:5168`,

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
