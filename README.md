# OMI Backend API Automation Framework

A professional, scalable REST API automation framework using Playwright + TypeScript.

## 🚀 Features

- **Professional Structure**: Well-organized, maintainable test architecture
- **TypeScript Support**: Full type safety and IntelliSense support
- **Comprehensive Testing**: Health checks, authentication, user management
- **Robust Utilities**: API client, logging, test data generation
- **Multiple Report Formats**: HTML, JSON, JUnit XML reports
- **CI/CD Ready**: Configured for continuous integration
- **Best Practices**: ESLint, Prettier, proper error handling

## 📁 Project Structure

```
tests/api-automation/
├── playwright.config.ts      # Playwright configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .env                      # Environment variables
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
├── tests/                    # Test specifications
│   ├── healthcheck.spec.ts    # API health check tests
│   ├── auth/                 # Authentication tests
│   │   ├── login.spec.ts     # Login functionality
│   │   └── register.spec.ts  # User registration
│   └── users/                # User management tests
│       ├── getUsers.spec.ts  # Get users functionality
│       └── createUser.spec.ts # Create user functionality
├── utils/                    # Utility modules
│   ├── apiClient.ts          # HTTP client wrapper
│   ├── env.ts                # Environment configuration
│   ├── logger.ts             # Logging utility
│   └── testData.ts           # Test data generation
├── fixtures/                 # Test fixtures
│   └── globalSetup.ts        # Global test setup
└── reports/                  # Test reports
    └── README.md             # Report documentation
```

## 🛠️ Installation

1. **Install Dependencies**
   ```bash
   cd tests/api-automation
   npm install
   ```

2. **Install Playwright Browsers**
   ```bash
   npm run install:browsers
   ```

3. **Configure Environment**
   ```bash
   cp .env .env.local
   # Edit .env.local with your API endpoints and credentials
   ```

## 🧪 Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Health check tests
npm run test:healthcheck

# Authentication tests
npm run test:auth

# User management tests
npm run test:users
```

### Test Modes
```bash
# Headed mode (with browser UI)
npm run test:headed

# Debug mode
npm run test:debug

# UI mode (interactive)
npm run test:ui
```

### View Reports
```bash
npm run test:report
```

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Adding New Tests

1. **Create Test File**
   ```typescript
   // tests/feature/newFeature.spec.ts
   import { test, expect } from '@playwright/test';
   import { ApiClient } from '../../utils/apiClient';
   
   test.describe('New Feature Tests', () => {
     let apiClient: ApiClient;
   
     test.beforeEach(async ({ request }) => {
       apiClient = new ApiClient(request, env.API_BASE_URL);
     });
   
     test('should test new feature', async () => {
       // Test implementation
     });
   });
   ```

2. **Add Test Data**
   ```typescript
   // utils/testData.ts
   export class TestDataGenerator {
     static generateNewFeatureData(): NewFeatureData {
       return {
         // Generated test data
       };
     }
   }
   ```

3. **Update Package Scripts**
   ```json
   // package.json
   {
     "scripts": {
       "test:new-feature": "playwright test tests/feature/"
     }
   }
   ```

## 📊 Test Coverage

The framework includes comprehensive test coverage for:

- **Health Checks**: API availability and response times
- **Authentication**: Login, registration, token management
- **User Management**: CRUD operations, validation, authorization
- **Error Handling**: Invalid requests, edge cases
- **Data Validation**: Input sanitization, format validation
- **Security**: Authentication, authorization, data protection

## 🔒 Security Features

- **Data Sanitization**: Automatic removal of sensitive data from logs
- **Token Management**: Secure token handling and validation
- **Input Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Secure error responses without sensitive information

## 📈 Reporting

### HTML Report
- Interactive test results
- Detailed test execution timeline
- Screenshots and videos for failed tests
- Test performance metrics

### JSON Report
- Machine-readable test results
- Integration with external tools
- Detailed test metadata

### JUnit XML
- CI/CD integration
- Standard test result format
- Compatible with most CI systems

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
- name: Run API Tests
  run: |
    cd tests/api-automation
    npm install
    npm test

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: tests/api-automation/reports/
```

### Jenkins
```groovy
pipeline {
  agent any
  stages {
    stage('Test') {
      steps {
        sh 'cd tests/api-automation && npm install && npm test'
      }
    }
  }
  post {
    always {
      publishTestResults testResultsPattern: 'tests/api-automation/reports/results.xml'
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'tests/api-automation/reports/html-report',
        reportFiles: 'index.html',
        reportName: 'API Test Report'
      ])
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables Not Loaded**
   ```bash
   # Ensure .env file exists and is properly formatted
   cp .env .env.local
   ```

2. **API Connection Issues**
   ```bash
   # Check API endpoint configuration
   curl http://localhost:3000/health
   ```

3. **Test Timeout Issues**
   ```bash
   # Increase timeout in playwright.config.ts
   timeout: 60000
   ```

4. **Authentication Failures**
   ```bash
   # Verify credentials in .env file
   echo $TEST_USER_EMAIL
   echo $TEST_USER_PASSWORD
   ```

## 📚 Best Practices

1. **Test Organization**
   - Group related tests in describe blocks
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Data Management**
   - Use test data generators for realistic data
   - Clean up test data after tests
   - Use unique identifiers to avoid conflicts

3. **Error Handling**
   - Test both success and failure scenarios
   - Verify error messages and status codes
   - Handle edge cases and boundary conditions

4. **Maintenance**
   - Keep tests independent and isolated
   - Use proper setup and teardown
   - Regular code reviews and refactoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions and support:
- Create an issue in the repository
- Check the documentation
- Review existing test examples
