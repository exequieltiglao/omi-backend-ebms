import { faker } from '@faker-js/faker';

/**
 * Test data generator utility
 * Provides realistic test data for API testing
 */
export class TestDataGenerator {
  /**
   * Generate user data
   */
  static generateUser(overrides: Partial<UserData> = {}): UserData {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.userName(),
      phone: faker.phone.number(),
      dateOfBirth: faker.date.birthdate().toISOString().split('T')[0],
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      ...overrides,
    };
  }

  /**
   * Generate authentication data
   */
  static generateAuthData(overrides: Partial<AuthData> = {}): AuthData {
    return {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      ...overrides,
    };
  }

  /**
   * Generate product data
   */
  static generateProduct(overrides: Partial<ProductData> = {}): ProductData {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      inStock: faker.datatype.boolean(),
      quantity: faker.number.int({ min: 0, max: 1000 }),
      ...overrides,
    };
  }

  /**
   * Generate order data
   */
  static generateOrder(overrides: Partial<OrderData> = {}): OrderData {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        productId: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        price: parseFloat(faker.commerce.price()),
      })),
      total: parseFloat(faker.commerce.price()),
      status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
      shippingAddress: this.generateAddress(),
      ...overrides,
    };
  }

  /**
   * Generate address data
   */
  static generateAddress(overrides: Partial<AddressData> = {}): AddressData {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
      ...overrides,
    };
  }

  /**
   * Generate API error response
   */
  static generateErrorResponse(overrides: Partial<ErrorResponse> = {}): ErrorResponse {
    return {
      error: {
        code: faker.helpers.arrayElement(['VALIDATION_ERROR', 'AUTHENTICATION_ERROR', 'NOT_FOUND', 'INTERNAL_ERROR']),
        message: faker.lorem.sentence(),
        details: faker.lorem.paragraph(),
        timestamp: new Date().toISOString(),
      },
      ...overrides,
    };
  }

  /**
   * Generate pagination data
   */
  static generatePaginationData<T>(items: T[], page: number = 1, limit: number = 10): PaginationData<T> {
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 10): string {
    return faker.string.alphanumeric(length);
  }

  /**
   * Generate random number
   */
  static generateRandomNumber(min: number = 1, max: number = 100): number {
    return faker.number.int({ min, max });
  }

  /**
   * Generate random email
   */
  static generateRandomEmail(): string {
    return faker.internet.email();
  }

  /**
   * Generate random phone number
   */
  static generateRandomPhone(): string {
    return faker.phone.number();
  }

  /**
   * Generate random date
   */
  static generateRandomDate(startDate?: Date, endDate?: Date): string {
    return faker.date.between({
      from: startDate || new Date('2020-01-01'),
      to: endDate || new Date(),
    }).toISOString();
  }
}

/**
 * Type definitions for test data
 */
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  dateOfBirth: string;
  address: AddressData;
}

export interface AuthData {
  email: string;
  password: string;
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  inStock: boolean;
  quantity: number;
}

export interface OrderData {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  shippingAddress: AddressData;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details: string;
    timestamp: string;
  };
}

export interface PaginationData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Predefined test data sets
 */
export const TestDataSets = {
  validUsers: [
    TestDataGenerator.generateUser({ email: 'john.doe@example.com' }),
    TestDataGenerator.generateUser({ email: 'jane.smith@example.com' }),
    TestDataGenerator.generateUser({ email: 'bob.wilson@example.com' }),
  ],

  invalidUsers: [
    TestDataGenerator.generateUser({ email: 'invalid-email' }),
    TestDataGenerator.generateUser({ firstName: '' }),
    TestDataGenerator.generateUser({ phone: 'invalid-phone' }),
  ],

  validProducts: [
    TestDataGenerator.generateProduct({ name: 'Test Product 1' }),
    TestDataGenerator.generateProduct({ name: 'Test Product 2' }),
    TestDataGenerator.generateProduct({ name: 'Test Product 3' }),
  ],

  validOrders: [
    TestDataGenerator.generateOrder({ status: 'pending' }),
    TestDataGenerator.generateOrder({ status: 'processing' }),
    TestDataGenerator.generateOrder({ status: 'shipped' }),
  ],
};
