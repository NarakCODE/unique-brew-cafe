# Testing Guide

This directory contains unit and integration tests for the Corner Coffee API.

## Test Structure

```
tests/
├── setup.ts                 # Test setup and teardown
├── utils/
│   └── testHelpers.ts      # Shared test utilities
├── unit/
│   └── services/           # Unit tests for services
│       ├── authService.test.ts
│       └── cartService.test.ts
└── integration/            # Integration tests for API endpoints
    ├── auth.test.ts
    ├── stores.test.ts
    └── cart.test.ts
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Test Database

Tests use **MongoDB Memory Server** which creates an in-memory MongoDB instance for testing. This means:

- No need for a separate test database
- Tests are isolated and don't affect your development database
- Fast test execution
- Automatic cleanup after tests

## Writing Tests

### Unit Tests

Unit tests focus on testing individual functions/methods in isolation.

**Example:**

```typescript
import { describe, it, expect } from 'vitest';
import { authService } from '../../../src/services/authService.js';

describe('AuthService', () => {
  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const result = await authService.login(
        'test@example.com',
        'password',
        '127.0.0.1',
        'test-agent'
      );

      expect(result).toHaveProperty('accessToken');
    });
  });
});
```

### Integration Tests

Integration tests test the entire request/response cycle through the API.

**Example:**

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## Test Helpers

Use the provided test helpers to create test data:

```typescript
import {
  createTestUser,
  createTestAdmin,
  createTestStore,
  createTestCategory,
  createTestProduct,
  generateAuthToken,
} from '../utils/testHelpers.js';

// Create test user
const user = await createTestUser();

// Create admin user
const admin = await createTestAdmin();

// Generate auth token
const token = generateAuthToken(user.id, 'user');

// Create test store
const store = await createTestStore();

// Create test product
const category = await createTestCategory();
const product = await createTestProduct(category.id);
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Use `afterEach` to clean up test data
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
5. **Mock External Services**: Mock email services, payment providers, etc.
6. **Test Edge Cases**: Test both success and failure scenarios

## Coverage Goals

- **Service Layer**: 80%+ coverage
- **Controllers**: 70%+ coverage
- **Middleware**: 90%+ coverage
- **Overall**: 75%+ coverage

## Continuous Integration

Tests run automatically on:

- Every commit (pre-commit hook)
- Pull requests
- Before deployment

## Troubleshooting

### Tests Timing Out

If tests are timing out, increase the timeout in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    testTimeout: 20000, // Increase to 20 seconds
  },
});
```

### Memory Issues

If you encounter memory issues with MongoDB Memory Server:

```typescript
// In tests/setup.ts
mongoServer = await MongoMemoryServer.create({
  instance: {
    dbName: 'test',
    storageEngine: 'ephemeralForTest', // Use ephemeral storage
  },
});
```

### Port Conflicts

If you get port conflicts, make sure your development server is not running when executing tests.

## Adding New Tests

When adding new features:

1. Write unit tests for service layer logic
2. Write integration tests for API endpoints
3. Test both success and error cases
4. Update this README if adding new test patterns

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
