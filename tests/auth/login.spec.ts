import { test, expect } from '@playwright/test';
import { ApiClient } from '../../utils/apiClient';
import { logger } from '../../utils/logger';
import { env } from '../../utils/env';
import { TestDataGenerator, TestDataSets } from '../../utils/testData';

test.describe('Authentication Tests', () => {
  let apiClient: ApiClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request, env.AUTH_BASE_URL);
  });

  test.describe('User Login', () => {
    test('should login with valid credentials', async () => {
      logger.info('Testing user login with valid credentials');
      
      const loginData = {
        email: env.TEST_USER_EMAIL,
        password: env.TEST_USER_PASSWORD,
      };

      const response = await apiClient.post('/login', loginData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user).toHaveProperty('email', loginData.email);
      
      logger.info('Valid login test passed');
    });

    test('should reject login with invalid email', async () => {
      logger.info('Testing login with invalid email');
      
      const loginData = {
        email: 'invalid@example.com',
        password: env.TEST_USER_PASSWORD,
      };

      const response = await apiClient.post('/login', loginData);
      
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error).toHaveProperty('message');
      
      logger.info('Invalid email login test passed');
    });

    test('should reject login with invalid password', async () => {
      logger.info('Testing login with invalid password');
      
      const loginData = {
        email: env.TEST_USER_EMAIL,
        password: 'wrongpassword',
      };

      const response = await apiClient.post('/login', loginData);
      
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Invalid password login test passed');
    });

    test('should reject login with missing credentials', async () => {
      logger.info('Testing login with missing credentials');
      
      const response = await apiClient.post('/login', {});
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Missing credentials login test passed');
    });

    test('should handle malformed login request', async () => {
      logger.info('Testing malformed login request');
      
      const response = await apiClient.post('/login', {
        email: 'not-an-email',
        password: '',
      });
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Malformed login request test passed');
    });
  });

  test.describe('User Registration', () => {
    test('should register new user with valid data', async () => {
      logger.info('Testing user registration with valid data');
      
      const userData = TestDataGenerator.generateUser();
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('token');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(userData.email);
      
      logger.info('Valid registration test passed');
    });

    test('should reject registration with existing email', async () => {
      logger.info('Testing registration with existing email');
      
      const userData = TestDataGenerator.generateUser({
        email: env.TEST_USER_EMAIL, // Use existing email
      });
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(409);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Existing email registration test passed');
    });

    test('should reject registration with invalid email format', async () => {
      logger.info('Testing registration with invalid email format');
      
      const userData = TestDataGenerator.generateUser({
        email: 'invalid-email-format',
      });
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Invalid email format registration test passed');
    });

    test('should reject registration with weak password', async () => {
      logger.info('Testing registration with weak password');
      
      const userData = TestDataGenerator.generateUser();
      userData.password = '123'; // Weak password
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Weak password registration test passed');
    });

    test('should reject registration with missing required fields', async () => {
      logger.info('Testing registration with missing required fields');
      
      const incompleteUserData = {
        email: 'test@example.com',
        // Missing required fields
      };
      
      const response = await apiClient.post('/register', incompleteUserData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Missing fields registration test passed');
    });
  });

  test.describe('Token Management', () => {
    let authToken: string;

    test.beforeEach(async () => {
      // Get auth token for protected endpoints
      const loginResponse = await apiClient.post('/login', {
        email: env.TEST_USER_EMAIL,
        password: env.TEST_USER_PASSWORD,
      });
      
      authToken = loginResponse.data.token;
      apiClient.setAuthToken(authToken);
    });

    test('should validate token and return user info', async () => {
      logger.info('Testing token validation');
      
      const response = await apiClient.get('/me');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user).toHaveProperty('email');
      
      logger.info('Token validation test passed');
    });

    test('should reject requests with invalid token', async () => {
      logger.info('Testing invalid token rejection');
      
      apiClient.setAuthToken('invalid-token');
      
      const response = await apiClient.get('/me');
      
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Invalid token test passed');
    });

    test('should reject requests without token', async () => {
      logger.info('Testing missing token rejection');
      
      apiClient.clearAuthToken();
      
      const response = await apiClient.get('/me');
      
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Missing token test passed');
    });

    test('should handle token refresh', async () => {
      logger.info('Testing token refresh');
      
      const response = await apiClient.post('/refresh', {
        token: authToken,
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data.token).not.toBe(authToken);
      
      logger.info('Token refresh test passed');
    });
  });

  test.describe('Password Management', () => {
    test('should handle password reset request', async () => {
      logger.info('Testing password reset request');
      
      const response = await apiClient.post('/forgot-password', {
        email: env.TEST_USER_EMAIL,
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      
      logger.info('Password reset request test passed');
    });

    test('should reject password reset for non-existent email', async () => {
      logger.info('Testing password reset for non-existent email');
      
      const response = await apiClient.post('/forgot-password', {
        email: 'nonexistent@example.com',
      });
      
      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Non-existent email password reset test passed');
    });

    test('should handle password change with valid token', async () => {
      logger.info('Testing password change with valid token');
      
      const response = await apiClient.post('/change-password', {
        token: 'valid-reset-token',
        newPassword: 'newpassword123',
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      
      logger.info('Password change test passed');
    });
  });
});
