import { test, expect } from '@playwright/test';
import { ApiClient } from '../../utils/apiClient';
import { logger } from '../../utils/logger';
import { env } from '../../utils/env';
import { TestDataGenerator } from '../../utils/testData';

test.describe('User Creation Tests', () => {
  let apiClient: ApiClient;
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request, env.USERS_BASE_URL);
    
    // Get authentication token
    const authClient = new ApiClient(request, env.AUTH_BASE_URL);
    const loginResponse = await authClient.post('/login', {
      email: env.ADMIN_USER_EMAIL,
      password: env.ADMIN_USER_PASSWORD,
    });
    
    authToken = loginResponse.data.token;
    apiClient.setAuthToken(authToken);
  });

  test.describe('Successful User Creation', () => {
    test('should create user with complete valid data', async () => {
      logger.info('Testing create user with complete data');
      
      const userData = TestDataGenerator.generateUser();
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(userData.email);
      expect(response.data.user.firstName).toBe(userData.firstName);
      expect(response.data.user.lastName).toBe(userData.lastName);
      expect(response.data.user.username).toBe(userData.username);
      expect(response.data.user.phone).toBe(userData.phone);
      expect(response.data.user.dateOfBirth).toBe(userData.dateOfBirth);
      expect(response.data.user.address).toEqual(userData.address);
      
      logger.info('Complete user creation test passed');
    });

    test('should create user with minimal required data', async () => {
      logger.info('Testing create user with minimal data');
      
      const minimalUserData = {
        email: TestDataGenerator.generateRandomEmail(),
        password: 'validpassword123',
        firstName: 'John',
        lastName: 'Doe',
      };
      
      const response = await apiClient.post('/users', minimalUserData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(minimalUserData.email);
      expect(response.data.user.firstName).toBe(minimalUserData.firstName);
      expect(response.data.user.lastName).toBe(minimalUserData.lastName);
      
      logger.info('Minimal user creation test passed');
    });

    test('should return user data without sensitive information', async () => {
      logger.info('Testing user data sanitization');
      
      const userData = TestDataGenerator.generateUser();
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user).not.toHaveProperty('password');
      expect(response.data.user).not.toHaveProperty('passwordHash');
      expect(response.data.user).not.toHaveProperty('salt');
      
      logger.info('Data sanitization test passed');
    });

    test('should assign unique ID to new user', async () => {
      logger.info('Testing unique ID assignment');
      
      const userData1 = TestDataGenerator.generateUser();
      const userData2 = TestDataGenerator.generateUser();
      
      const response1 = await apiClient.post('/users', userData1);
      const response2 = await apiClient.post('/users', userData2);
      
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.data.user.id).not.toBe(response2.data.user.id);
      
      logger.info('Unique ID assignment test passed');
    });

    test('should set default values for optional fields', async () => {
      logger.info('Testing default values for optional fields');
      
      const userData = {
        email: TestDataGenerator.generateRandomEmail(),
        password: 'validpassword123',
        firstName: 'John',
        lastName: 'Doe',
      };
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user).toHaveProperty('isActive', true);
      expect(response.data.user).toHaveProperty('role', 'user');
      expect(response.data.user).toHaveProperty('createdAt');
      expect(response.data.user).toHaveProperty('updatedAt');
      
      logger.info('Default values test passed');
    });
  });

  test.describe('Validation Errors', () => {
    test('should reject user creation with duplicate email', async () => {
      logger.info('Testing duplicate email rejection');
      
      const userData = TestDataGenerator.generateUser({
        email: env.TEST_USER_EMAIL, // Use existing email
      });
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(409);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error.message).toContain('email');
      
      logger.info('Duplicate email test passed');
    });

    test('should reject user creation with invalid email format', async () => {
      logger.info('Testing invalid email format rejection');
      
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example..com',
        'test@.com',
        '.test@example.com',
      ];

      for (const email of invalidEmails) {
        const userData = TestDataGenerator.generateUser({ email });
        
        const response = await apiClient.post('/users', userData);
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Invalid email format test passed');
    });

    test('should reject user creation with weak password', async () => {
      logger.info('Testing weak password rejection');
      
      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'abcdefgh',
        'Password1', // No special character
        'password!', // No uppercase
        'PASSWORD!', // No lowercase
        'Pass1', // Too short
      ];

      for (const password of weakPasswords) {
        const userData = TestDataGenerator.generateUser();
        userData.password = password;
        
        const response = await apiClient.post('/users', userData);
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Weak password test passed');
    });

    test('should reject user creation with missing required fields', async () => {
      logger.info('Testing missing required fields rejection');
      
      const requiredFields = ['email', 'password', 'firstName', 'lastName'];
      
      for (const field of requiredFields) {
        const userData = TestDataGenerator.generateUser();
        delete userData[field as keyof typeof userData];
        
        const response = await apiClient.post('/users', userData);
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Missing required fields test passed');
    });

    test('should reject user creation with empty string values', async () => {
      logger.info('Testing empty string values rejection');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = '';
      userData.lastName = '';
      userData.email = '';
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Empty string values test passed');
    });

    test('should reject user creation with extremely long values', async () => {
      logger.info('Testing extremely long values rejection');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = 'a'.repeat(1000);
      userData.lastName = 'b'.repeat(1000);
      userData.email = 'c'.repeat(1000) + '@example.com';
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Long values test passed');
    });

    test('should reject user creation with invalid phone number format', async () => {
      logger.info('Testing invalid phone number format');
      
      const invalidPhones = [
        'invalid-phone',
        '123',
        'abc-def-ghij',
        '+1-800-INVALID',
      ];

      for (const phone of invalidPhones) {
        const userData = TestDataGenerator.generateUser({ phone });
        
        const response = await apiClient.post('/users', userData);
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Invalid phone format test passed');
    });

    test('should reject user creation with invalid date of birth', async () => {
      logger.info('Testing invalid date of birth');
      
      const invalidDates = [
        'invalid-date',
        '32/13/2023', // Invalid day/month
        '2023-13-01', // Invalid month
        '2023-02-30', // Invalid day for February
        '2025-01-01', // Future date
      ];

      for (const dateOfBirth of invalidDates) {
        const userData = TestDataGenerator.generateUser({ dateOfBirth });
        
        const response = await apiClient.post('/users', userData);
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Invalid date of birth test passed');
    });
  });

  test.describe('Data Sanitization', () => {
    test('should sanitize HTML in user input', async () => {
      logger.info('Testing HTML sanitization');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = '<script>alert("xss")</script>John';
      userData.lastName = 'Doe<script>alert("xss")</script>';
      userData.username = 'user<script>alert("xss")</script>name';
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user.firstName).not.toContain('<script>');
      expect(response.data.user.lastName).not.toContain('<script>');
      expect(response.data.user.username).not.toContain('<script>');
      
      logger.info('HTML sanitization test passed');
    });

    test('should handle special characters in names', async () => {
      logger.info('Testing special characters in names');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = "Jean-Pierre O'Connor";
      userData.lastName = 'Müller-Schmidt';
      userData.username = 'user_name-123';
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user.firstName).toBe(userData.firstName);
      expect(response.data.user.lastName).toBe(userData.lastName);
      expect(response.data.user.username).toBe(userData.username);
      
      logger.info('Special characters test passed');
    });

    test('should trim whitespace from input fields', async () => {
      logger.info('Testing whitespace trimming');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = '  John  ';
      userData.lastName = '  Doe  ';
      userData.email = '  test@example.com  ';
      userData.username = '  username  ';
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user.firstName).toBe('John');
      expect(response.data.user.lastName).toBe('Doe');
      expect(response.data.user.email).toBe('test@example.com');
      expect(response.data.user.username).toBe('username');
      
      logger.info('Whitespace trimming test passed');
    });

    test('should normalize email to lowercase', async () => {
      logger.info('Testing email normalization');
      
      const userData = TestDataGenerator.generateUser();
      userData.email = 'TEST@EXAMPLE.COM';
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user.email).toBe('test@example.com');
      
      logger.info('Email normalization test passed');
    });
  });

  test.describe('Concurrent User Creation', () => {
    test('should handle multiple simultaneous user creations', async () => {
      logger.info('Testing concurrent user creation');
      
      const userCreations = Array.from({ length: 5 }, () => {
        const userData = TestDataGenerator.generateUser();
        return apiClient.post('/users', userData);
      });
      
      const responses = await Promise.all(userCreations);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('user');
        expect(response.data.user).toHaveProperty('id');
      });
      
      logger.info('Concurrent user creation test passed');
    });

    test('should handle race condition with duplicate emails', async () => {
      logger.info('Testing race condition with duplicate emails');
      
      const email = TestDataGenerator.generateRandomEmail();
      const userData1 = TestDataGenerator.generateUser({ email });
      const userData2 = TestDataGenerator.generateUser({ email });
      
      const [response1, response2] = await Promise.all([
        apiClient.post('/users', userData1),
        apiClient.post('/users', userData2),
      ]);
      
      // One should succeed, one should fail
      const successCount = [response1, response2].filter(r => r.status === 201).length;
      const failureCount = [response1, response2].filter(r => r.status === 409).length;
      
      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);
      
      logger.info('Race condition test passed');
    });
  });

  test.describe('Authorization', () => {
    test('should reject user creation without authentication', async () => {
      logger.info('Testing unauthenticated user creation');
      
      apiClient.clearAuthToken();
      
      const userData = TestDataGenerator.generateUser();
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Unauthenticated creation test passed');
    });

    test('should reject user creation with invalid token', async () => {
      logger.info('Testing invalid token user creation');
      
      apiClient.setAuthToken('invalid-token');
      
      const userData = TestDataGenerator.generateUser();
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Invalid token creation test passed');
    });

    test('should reject user creation with expired token', async () => {
      logger.info('Testing expired token user creation');
      
      // This would require a specific expired token
      apiClient.setAuthToken('expired-token');
      
      const userData = TestDataGenerator.generateUser();
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Expired token creation test passed');
    });
  });

  test.describe('Role-Based Access', () => {
    test('should allow admin to create users', async () => {
      logger.info('Testing admin user creation');
      
      const userData = TestDataGenerator.generateUser();
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      
      logger.info('Admin user creation test passed');
    });

    test('should reject regular user creation by non-admin', async () => {
      logger.info('Testing non-admin user creation');
      
      // Login as regular user
      const authClient = new ApiClient(apiClient['request'], env.AUTH_BASE_URL);
      const loginResponse = await authClient.post('/login', {
        email: env.TEST_USER_EMAIL,
        password: env.TEST_USER_PASSWORD,
      });
      
      apiClient.setAuthToken(loginResponse.data.token);
      
      const userData = TestDataGenerator.generateUser();
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(403);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Non-admin user creation test passed');
    });
  });
});
