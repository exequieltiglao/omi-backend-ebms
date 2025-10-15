import { test, expect } from '@playwright/test';
import { ApiClient } from '../utils/apiClient';
import { logger } from '../utils/logger';

test.describe('Meow Facts API Test', () => {
  let apiClient: ApiClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request, 'https://meowfacts.herokuapp.com');
  });

  test('should fetch meow facts from API', async () => {
    logger.info('Testing Meow Facts API endpoint');
    
    const response = await apiClient.get('/');
    
    logger.info('API Response Status:', response.status);
    logger.info('API Response Data:', response.data);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBeGreaterThan(0);
    
    // Log the actual fact
    const fact = response.data.data[0];
    logger.info('Meow Fact:', fact);
    
    // Verify the fact is a string
    expect(typeof fact).toBe('string');
    expect(fact.length).toBeGreaterThan(0);
    
    logger.info('Meow Facts API test completed successfully');
  });

  test('should handle API response structure correctly', async () => {
    logger.info('Testing API response structure');
    
    const response = await apiClient.get('/');
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
    
    // Log the complete response structure
    logger.info('Complete API Response:', JSON.stringify(response.data, null, 2));
    
    // Verify response headers
    logger.info('Response Headers:', response.headers);
    
    logger.info('API response structure test completed');
  });

  test('should test API performance', async () => {
    logger.info('Testing API performance');
    
    const startTime = Date.now();
    const response = await apiClient.get('/');
    const responseTime = Date.now() - startTime;
    
    logger.info(`API Response Time: ${responseTime}ms`);
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    
    logger.info('API performance test completed');
  });
});
