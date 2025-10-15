# OMI Backend API Automation Framework

A professional REST API automation framework using Playwright + TypeScript for comprehensive backend testing.

## 🚀 Key Features

- **TypeScript Support**: Full type safety and modern development experience
- **Comprehensive Testing**: Health checks, authentication, user management, and API validation
- **Professional Architecture**: Well-organized, maintainable test structure with utilities
- **Multiple Reports**: HTML, JSON, and JUnit XML formats for different use cases
- **CI/CD Ready**: Pre-configured for GitHub Actions and Jenkins integration
- **Code Quality**: ESLint, Prettier, and best practices enforcement

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

## 🛠️ Quick Start

1. **Install & Setup**
   ```bash
   cd tests/api-automation
   npm install
   npm run install:browsers
   cp .env .env.local  # Configure your API endpoints
   ```

2. **Run Tests**
   ```bash
   npm test                    # All tests
   npm run test:auth          # Authentication tests
   npm run test:users         # User management tests
   npm run test:report        # View HTML report
   ```

## 🧪 Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:auth` | Authentication tests |
| `npm run test:users` | User management tests |
| `npm run test:healthcheck` | Health check tests |
| `npm run test:headed` | Run with browser UI |
| `npm run test:debug` | Debug mode |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:report` | View HTML report |

## 🔧 Development

### Code Quality
```bash
npm run lint          # Lint code
npm run lint:fix      # Fix linting issues  
npm run format        # Format code
npm run format:check  # Check formatting
```

### Adding New Tests

Create a new test file in the appropriate directory:
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

## 📊 Test Coverage & Features

**Comprehensive Testing**: Health checks, authentication, user management, error handling, data validation, and security testing.

**Security Features**: Data sanitization, secure token management, input validation, and secure error handling.

**Multiple Report Formats**:
- **HTML**: Interactive results with screenshots and videos
- **JSON**: Machine-readable for external tools  
- **JUnit XML**: CI/CD integration standard

## 🚀 CI/CD Integration

Ready for GitHub Actions and Jenkins with pre-configured workflows and test result publishing.

## 🐛 Troubleshooting

**Common Issues**:
- Environment variables: Ensure `.env.local` exists with proper API endpoints
- Connection issues: Verify API endpoint with `curl http://localhost:3000/health`
- Timeouts: Increase timeout in `playwright.config.ts`
- Auth failures: Check credentials in `.env` file

## 📚 Best Practices

- **Organization**: Group tests in describe blocks, use descriptive names, follow AAA pattern
- **Data Management**: Use test data generators, clean up after tests, use unique identifiers  
- **Error Handling**: Test success/failure scenarios, verify error messages and status codes
- **Maintenance**: Keep tests independent, use proper setup/teardown, regular reviews

## 🤝 Contributing

1. Fork → Create feature branch → Write tests → Submit PR

## 📄 License

MIT License

## 🆘 Support

- Create an issue in the repository
- Check documentation and existing examples
