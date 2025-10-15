import { test, expect } from '@playwright/test';
import { ApiClient } from '../utils/apiClient';
import { logger } from '../utils/logger';
import { env } from '../utils/env';

test.describe('Health Check Tests', () => {
  let apiClient: ApiClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request, env.BASE_URL);
  });

  test('API health check should return 200', async () => {
    logger.info('Testing API health check endpoint');
    
    const response = await apiClient.get('/health');
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'ok');
    expect(response.data).toHaveProperty('timestamp');
    
    logger.info('Health check test passed');
  });

  test('API health check should include service information', async () => {
    logger.info('Testing health check service information');
    
    const response = await apiClient.get('/health');
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('service');
    expect(response.data).toHaveProperty('version');
    expect(response.data).toHaveProperty('environment');
    
    logger.info('Service information test passed');
  });

  test('API health check should respond within acceptable time', async () => {
    logger.info('Testing health check response time');
    
    const startTime = Date.now();
    const response = await apiClient.get('/health');
    const responseTime = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    
    logger.info(`Health check response time: ${responseTime}ms`);
  });

  test('API health check should handle concurrent requests', async () => {
    logger.info('Testing concurrent health check requests');
    
    const promises = Array.from({ length: 10 }, () => 
      apiClient.get('/health')
    );
    
    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'ok');
    });
    
    logger.info('Concurrent health check test passed');
  });

  test('API should return proper error for non-existent endpoints', async () => {
    logger.info('Testing non-existent endpoint error handling');
    
    const response = await apiClient.get('/non-existent-endpoint');
    
    expect(response.status).toBe(404);
    expect(response.data).toHaveProperty('error');
    
    logger.info('Error handling test passed');
  });
});
