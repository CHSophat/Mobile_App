import ENV_CONFIG from '../../env.development';

/**
 * Environment service for managing environment-specific configurations
 * Loads the correct environment based on build/runtime environment
 */
 class EnvironmentService {
  private config: typeof ENV_CONFIG;
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = this.loadEnvironment();
  }

  /**
   * Load the appropriate environment configuration
   */
  private loadEnvironment() {
    const env = this.environment.toLowerCase();
    
    try {
      switch (env) {
        case 'production':
        case 'prod':
          return require('../../env.production').default;
        case 'staging':
          return require('../../env.staging').default;
        case 'qa':
          return require('../../env.qa').default;
        case 'uat':
          return require('../../env.uat').default;
        case 'development':
        case 'dev':
        default:
          return require('../../env.development').default;
      }
    } catch (error) {
      console.warn(`Failed to load environment config for ${env}, using development`, error);
      return require('../../env.development').default;
    }
  }

  /**
   * Get full configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get API base URL.
   * EXPO_PUBLIC_API_URL env var wins over the per-env config file so the same
   * binary works for web/emulator/USB device without editing source.
   */
  getApiBaseUrl(): string {
    return process.env.EXPO_PUBLIC_API_URL || this.config.API_BASE_URL;
  }

  getApiWebUrl(): string {
    return process.env.EXPO_PUBLIC_WEB_URL || this.config.WEB_URL;
  }

  /**
   * Get API timeout
   */
  getApiTimeout(): number {
    return this.config.API_TIMEOUT;
  }

  /**
   * Get current environment
   */
  getEnvironment(): string {
    return this.config.ENVIRONMENT;
  }

  /**
   * Check if production
   */
  isProduction(): boolean {
    return this.config.ENVIRONMENT === 'production';
  }

  /**
   * Check if development
   */
  isDevelopment(): boolean {
    return this.config.ENVIRONMENT === 'development';
  }

  /**
   * Get Firebase config
   */
  getFirebaseConfig() {
    return this.config.FIREBASE;
  }

  /**
   * Get feature flags
   */
  getFeatureFlags() {
    return this.config.FEATURES;
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig() {
    return this.config.LOGGING;
  }

  /**
   * Get auth configuration
   */
  getAuthConfig() {
    return this.config.AUTH;
  }

  /**
   * Get payment configuration
   */
  getPaymentConfig() {
    return this.config.PAYMENT;
  }
}

// Export singleton instance
export const envService = new EnvironmentService();
export default EnvironmentService;
