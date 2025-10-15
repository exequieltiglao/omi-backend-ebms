import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration utility
 * Provides type-safe access to environment variables with defaults
 */
export const env = {
  // Base URLs
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  AUTH_BASE_URL: process.env.AUTH_BASE_URL || 'http://localhost:3000/api/auth',
  USERS_BASE_URL: process.env.USERS_BASE_URL || 'http://localhost:3000/api/users',

  // Test Configuration
  TEST_TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
  ASSERTION_TIMEOUT: parseInt(process.env.ASSERTION_TIMEOUT || '10000', 10),

  // Authentication
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || 'test@example.com',
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || 'testpassword123',
  ADMIN_USER_EMAIL: process.env.ADMIN_USER_EMAIL || 'admin@example.com',
  ADMIN_USER_PASSWORD: process.env.ADMIN_USER_PASSWORD || 'adminpassword123',

  // Database Configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'test_db',
  DB_USER: process.env.DB_USER || 'test_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'test_password',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'reports/test-execution.log',

  // Test Data
  TEST_DATA_DIR: process.env.TEST_DATA_DIR || './test-data',

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'test',
  CI: process.env.CI === 'true',
} as const;

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  const requiredVars = [
    'BASE_URL',
    'API_BASE_URL',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  return {
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    isProduction: env.NODE_ENV === 'production',
    isCI: env.CI,
  };
}
