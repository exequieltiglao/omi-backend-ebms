import { test, expect } from '@playwright/test';
import { ApiClient } from '../../utils/apiClient';
import { logger } from '../../utils/logger';
import { env } from '../../utils/env';
import { TestDataGenerator } from '../../utils/testData';

test.describe('User Management Tests', () => {
  let apiClient: ApiClient;
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request, env.USERS_BASE_URL);
    
    // Get authentication token
    const authClient = new ApiClient(request, env.AUTH_BASE_URL);
    const loginResponse = await authClient.post('/login', {
      email: env.TEST_USER_EMAIL,
      password: env.TEST_USER_PASSWORD,
    });
    
    authToken = loginResponse.data.token;
    apiClient.setAuthToken(authToken);
  });

  test.describe('Get Users', () => {
    test('should retrieve all users with valid authentication', async () => {
      logger.info('Testing get all users');
      
      const response = await apiClient.get('/users');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('users');
      expect(Array.isArray(response.data.users)).toBe(true);
      
      if (response.data.users.length > 0) {
        const user = response.data.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
      }
      
      logger.info('Get all users test passed');
    });

    test('should retrieve users with pagination', async () => {
      logger.info('Testing get users with pagination');
      
      const response = await apiClient.get('/users', {
        params: { page: 1, limit: 5 }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('users');
      expect(response.data).toHaveProperty('pagination');
      expect(response.data.pagination).toHaveProperty('page', 1);
      expect(response.data.pagination).toHaveProperty('limit', 5);
      expect(response.data.pagination).toHaveProperty('total');
      expect(response.data.pagination).toHaveProperty('totalPages');
      
      logger.info('Pagination test passed');
    });

    test('should filter users by search query', async () => {
      logger.info('Testing user search functionality');
      
      const response = await apiClient.get('/users', {
        params: { search: 'test' }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('users');
      
      // Verify search results contain the search term
      response.data.users.forEach((user: any) => {
        const searchTerm = 'test';
        const matchesSearch = 
          user.firstName?.toLowerCase().includes(searchTerm) ||
          user.lastName?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm);
        
        expect(matchesSearch).toBe(true);
      });
      
      logger.info('User search test passed');
    });

    test('should sort users by different criteria', async () => {
      logger.info('Testing user sorting');
      
      const sortOptions = ['firstName', 'lastName', 'email', 'createdAt'];
      
      for (const sortBy of sortOptions) {
        const response = await apiClient.get('/users', {
          params: { sortBy, sortOrder: 'asc' }
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('users');
        
        // Verify sorting order
        const users = response.data.users;
        for (let i = 1; i < users.length; i++) {
          const prev = users[i - 1][sortBy];
          const curr = users[i][sortBy];
          expect(prev <= curr).toBe(true);
        }
      }
      
      logger.info('User sorting test passed');
    });

    test('should reject request without authentication', async () => {
      logger.info('Testing unauthenticated request rejection');
      
      apiClient.clearAuthToken();
      
      const response = await apiClient.get('/users');
      
      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Unauthenticated request test passed');
    });

    test('should handle invalid pagination parameters', async () => {
      logger.info('Testing invalid pagination parameters');
      
      const invalidParams = [
        { page: -1, limit: 10 },
        { page: 1, limit: -5 },
        { page: 'invalid', limit: 10 },
        { page: 1, limit: 'invalid' },
      ];
      
      for (const params of invalidParams) {
        const response = await apiClient.get('/users', { params });
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Invalid pagination parameters test passed');
    });
  });

  test.describe('Get Single User', () => {
    test('should retrieve specific user by ID', async () => {
      logger.info('Testing get user by ID');
      
      // First get a user ID from the users list
      const usersResponse = await apiClient.get('/users');
      expect(usersResponse.status).toBe(200);
      
      if (usersResponse.data.users.length > 0) {
        const userId = usersResponse.data.users[0].id;
        
        const response = await apiClient.get(`/users/${userId}`);
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('user');
        expect(response.data.user).toHaveProperty('id', userId);
        expect(response.data.user).toHaveProperty('email');
        expect(response.data.user).toHaveProperty('firstName');
        expect(response.data.user).toHaveProperty('lastName');
        
        logger.info('Get user by ID test passed');
      }
    });

    test('should return 404 for non-existent user', async () => {
      logger.info('Testing get non-existent user');
      
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      const response = await apiClient.get(`/users/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Non-existent user test passed');
    });

    test('should return 400 for invalid user ID format', async () => {
      logger.info('Testing invalid user ID format');
      
      const invalidIds = ['invalid-id', '123', 'not-a-uuid'];
      
      for (const invalidId of invalidIds) {
        const response = await apiClient.get(`/users/${invalidId}`);
        
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      }
      
      logger.info('Invalid user ID format test passed');
    });
  });

  test.describe('Create User', () => {
    test('should create new user with valid data', async () => {
      logger.info('Testing create new user');
      
      const userData = TestDataGenerator.generateUser();
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(userData.email);
      expect(response.data.user.firstName).toBe(userData.firstName);
      expect(response.data.user.lastName).toBe(userData.lastName);
      
      logger.info('Create user test passed');
    });

    test('should reject user creation with duplicate email', async () => {
      logger.info('Testing create user with duplicate email');
      
      const userData = TestDataGenerator.generateUser({
        email: env.TEST_USER_EMAIL, // Use existing email
      });
      
      const response = await apiClient.post('/users', userData);
      
      expect(response.status).toBe(409);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Duplicate email creation test passed');
    });

    test('should reject user creation with invalid data', async () => {
      logger.info('Testing create user with invalid data');
      
      const invalidUserData = {
        email: 'invalid-email',
        firstName: '',
        lastName: '',
      };
      
      const response = await apiClient.post('/users', invalidUserData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Invalid data creation test passed');
    });

    test('should reject user creation without required fields', async () => {
      logger.info('Testing create user without required fields');
      
      const incompleteUserData = {
        email: 'test@example.com',
        // Missing required fields
      };
      
      const response = await apiClient.post('/users', incompleteUserData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Missing required fields creation test passed');
    });
  });

  test.describe('Update User', () => {
    let userId: string;

    test.beforeEach(async () => {
      // Create a user for update tests
      const userData = TestDataGenerator.generateUser();
      const createResponse = await apiClient.post('/users', userData);
      userId = createResponse.data.user.id;
    });

    test('should update user with valid data', async () => {
      logger.info('Testing update user');
      
      const updateData = {
        firstName: 'Updated First Name',
        lastName: 'Updated Last Name',
      };
      
      const response = await apiClient.put(`/users/${userId}`, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.firstName).toBe(updateData.firstName);
      expect(response.data.user.lastName).toBe(updateData.lastName);
      
      logger.info('Update user test passed');
    });

    test('should reject update with invalid data', async () => {
      logger.info('Testing update user with invalid data');
      
      const invalidUpdateData = {
        email: 'invalid-email',
        firstName: '',
      };
      
      const response = await apiClient.put(`/users/${userId}`, invalidUpdateData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Invalid update data test passed');
    });

    test('should return 404 for updating non-existent user', async () => {
      logger.info('Testing update non-existent user');
      
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateData = { firstName: 'Updated Name' };
      
      const response = await apiClient.put(`/users/${nonExistentId}`, updateData);
      
      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Update non-existent user test passed');
    });
  });

  test.describe('Delete User', () => {
    let userId: string;

    test.beforeEach(async () => {
      // Create a user for delete tests
      const userData = TestDataGenerator.generateUser();
      const createResponse = await apiClient.post('/users', userData);
      userId = createResponse.data.user.id;
    });

    test('should delete user successfully', async () => {
      logger.info('Testing delete user');
      
      const response = await apiClient.delete(`/users/${userId}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      
      // Verify user is deleted
      const getResponse = await apiClient.get(`/users/${userId}`);
      expect(getResponse.status).toBe(404);
      
      logger.info('Delete user test passed');
    });

    test('should return 404 for deleting non-existent user', async () => {
      logger.info('Testing delete non-existent user');
      
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      const response = await apiClient.delete(`/users/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('error');
      
      logger.info('Delete non-existent user test passed');
    });
  });

  test.describe('User Profile Management', () => {
    test('should retrieve current user profile', async () => {
      logger.info('Testing get current user profile');
      
      const response = await apiClient.get('/profile');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user).toHaveProperty('email');
      
      logger.info('Get profile test passed');
    });

    test('should update current user profile', async () => {
      logger.info('Testing update user profile');
      
      const profileData = {
        firstName: 'Updated Profile First Name',
        lastName: 'Updated Profile Last Name',
        phone: TestDataGenerator.generateRandomPhone(),
      };
      
      const response = await apiClient.put('/profile', profileData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.firstName).toBe(profileData.firstName);
      expect(response.data.user.lastName).toBe(profileData.lastName);
      
      logger.info('Update profile test passed');
    });
  });
});
