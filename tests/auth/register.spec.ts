import { test, expect } from '@playwright/test';
import { ApiClient } from '../../utils/apiClient';
import { logger } from '../../utils/logger';
import { env } from '../../utils/env';
import { TestDataGenerator } from '../../utils/testData';

test.describe('User Registration Tests', () => {
  let apiClient: ApiClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request, env.AUTH_BASE_URL);
  });

  test.describe('Successful Registration', () => {
    test('should register new user with complete valid data', async () => {
      logger.info('Testing complete user registration');
      
      const userData = TestDataGenerator.generateUser();
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('token');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(userData.email);
      expect(response.data.user.firstName).toBe(userData.firstName);
      expect(response.data.user.lastName).toBe(userData.lastName);
      
      logger.info('Complete registration test passed');
    });

    test('should register user with minimal required data', async () => {
      logger.info('Testing minimal user registration');
      
      const minimalUserData = {
        email: TestDataGenerator.generateRandomEmail(),
        password: 'validpassword123',
        firstName: 'John',
        lastName: 'Doe',
      };
      
      const response = await apiClient.post('/register', minimalUserData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('token');
      
      logger.info('Minimal registration test passed');
    });

    test('should return user data without sensitive information', async () => {
      logger.info('Testing user data sanitization');
      
      const userData = TestDataGenerator.generateUser();
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user).not.toHaveProperty('password');
      expect(response.data.user).not.toHaveProperty('passwordHash');
      
      logger.info('Data sanitization test passed');
    });
  });

  test.describe('Validation Errors', () => {
    test('should reject registration with duplicate email', async () => {
      logger.info('Testing duplicate email rejection');
      
      const userData = TestDataGenerator.generateUser({
        email: env.TEST_USER_EMAIL, // Use existing email
      });
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(409);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error.message).toContain('email');
      
      logger.info('Duplicate email test passed');
    });

    test('should reject registration with invalid email format', async () => {
      logger.info('Testing invalid email format rejection');
      
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example..com',
      ];

      for (const email of invalidEmails) {
        const userData = TestDataGenerator.generateUser({ email });
        
        const response = await apiClient.post('/register', userData);
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Invalid email format test passed');
    });

    test('should reject registration with weak password', async () => {
      logger.info('Testing weak password rejection');
      
      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'abcdefgh',
        'Password1', // No special character
      ];

      for (const password of weakPasswords) {
        const userData = TestDataGenerator.generateUser();
        userData.password = password;
        
        const response = await apiClient.post('/register', userData);
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Weak password test passed');
    });

    test('should reject registration with missing required fields', async () => {
      logger.info('Testing missing required fields rejection');
      
      const requiredFields = ['email', 'password', 'firstName', 'lastName'];
      
      for (const field of requiredFields) {
        const userData = TestDataGenerator.generateUser();
        delete userData[field as keyof typeof userData];
        
        const response = await apiClient.post('/register', userData);
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Missing required fields test passed');
    });

    test('should reject registration with empty string values', async () => {
      logger.info('Testing empty string values rejection');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = '';
      userData.lastName = '';
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Empty string values test passed');
    });

    test('should reject registration with extremely long values', async () => {
      logger.info('Testing extremely long values rejection');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = 'a'.repeat(1000);
      userData.lastName = 'b'.repeat(1000);
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Long values test passed');
    });
  });

  test.describe('Data Sanitization', () => {
    test('should sanitize HTML in user input', async () => {
      logger.info('Testing HTML sanitization');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = '<script>alert("xss")</script>John';
      userData.lastName = 'Doe<script>alert("xss")</script>';
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user.firstName).not.toContain('<script>');
      expect(response.data.user.lastName).not.toContain('<script>');
      
      logger.info('HTML sanitization test passed');
    });

    test('should handle special characters in names', async () => {
      logger.info('Testing special characters in names');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = "Jean-Pierre O'Connor";
      userData.lastName = 'Müller-Schmidt';
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user.firstName).toBe(userData.firstName);
      expect(response.data.user.lastName).toBe(userData.lastName);
      
      logger.info('Special characters test passed');
    });

    test('should trim whitespace from input fields', async () => {
      logger.info('Testing whitespace trimming');
      
      const userData = TestDataGenerator.generateUser();
      userData.firstName = '  John  ';
      userData.lastName = '  Doe  ';
      userData.email = '  test@example.com  ';
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(201);
      expect(response.data.user.firstName).toBe('John');
      expect(response.data.user.lastName).toBe('Doe');
      expect(response.data.user.email).toBe('test@example.com');
      
      logger.info('Whitespace trimming test passed');
    });
  });

  test.describe('Concurrent Registration', () => {
    test('should handle multiple simultaneous registrations', async () => {
      logger.info('Testing concurrent registrations');
      
      const registrations = Array.from({ length: 5 }, () => {
        const userData = TestDataGenerator.generateUser();
        return apiClient.post('/register', userData);
      });
      
      const responses = await Promise.all(registrations);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('user');
        expect(response.data).toHaveProperty('token');
      });
      
      logger.info('Concurrent registration test passed');
    });

    test('should handle race condition with duplicate emails', async () => {
      logger.info('Testing race condition with duplicate emails');
      
      const email = TestDataGenerator.generateRandomEmail();
      const userData1 = TestDataGenerator.generateUser({ email });
      const userData2 = TestDataGenerator.generateUser({ email });
      
      const [response1, response2] = await Promise.all([
        apiClient.post('/register', userData1),
        apiClient.post('/register', userData2),
      ]);
      
      // One should succeed, one should fail
      const successCount = [response1, response2].filter(r => r.status === 201).length;
      const failureCount = [response1, response2].filter(r => r.status === 409).length;
      
      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);
      
      logger.info('Race condition test passed');
    });
  });

  test.describe('Email Verification', () => {
    test('should send verification email after registration', async () => {
      logger.info('Testing verification email sending');
      
      const userData = TestDataGenerator.generateUser();
      
      const response = await apiClient.post('/register', userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('message');
      expect(response.data.message).toContain('verification');
      
      logger.info('Verification email test passed');
    });

    test('should handle email verification with valid token', async () => {
      logger.info('Testing email verification with valid token');
      
      const response = await apiClient.post('/verify-email', {
        token: 'valid-verification-token',
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      
      logger.info('Email verification test passed');
    });

    test('should reject email verification with invalid token', async () => {
      logger.info('Testing email verification with invalid token');
      
      const response = await apiClient.post('/verify-email', {
        token: 'invalid-token',
      });
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Invalid verification token test passed');
    });
  });
});
