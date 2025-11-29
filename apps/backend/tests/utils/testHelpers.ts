import { User } from '../../src/models/User.js';
import { Store } from '../../src/models/Store.js';
import { Category } from '../../src/models/Category.js';
import { Product } from '../../src/models/Product.js';
import { generateAccessToken } from '../../src/utils/jwt.js';

/**
 * Create a test user
 */
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    fullName: 'Test User',
    email: 'channarak23@gmail.com',
    password: 'password123',
    role: 'user' as const,
    emailVerified: true,
    phoneVerified: false,
    status: 'active' as const,
  };

  const user = await User.create({ ...defaultUser, ...overrides });
  return user;
};

/**
 * Create a test admin user
 */
export const createTestAdmin = async (overrides = {}) => {
  return createTestUser({
    fullName: 'Test Admin',
    email: 'channarakluy@gmail.com',
    role: 'admin',
    ...overrides,
  });
};

/**
 * Generate auth token for a user
 */
export const generateAuthToken = (userId: string, role: string = 'user') => {
  return generateAccessToken(
    userId,
    'channarak23@gmail.com',
    role as 'user' | 'admin' | 'moderator'
  );
};

/**
 * Create a test store
 */
export const createTestStore = async (overrides = {}) => {
  const defaultStore = {
    name: 'Test Store',
    slug: 'test-store',
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
    phone: '+1234567890',
    latitude: 40.7128,
    longitude: -74.006,
    openingHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { open: '10:00', close: '16:00' },
    },
    isOpen: true,
    isActive: true,
    averagePrepTime: 15,
  };

  const store = await Store.create({ ...defaultStore, ...overrides });
  return store;
};

/**
 * Create a test category
 */
export const createTestCategory = async (overrides = {}) => {
  const defaultCategory = {
    name: 'Test Category',
    slug: 'test-category',
    displayOrder: 1,
    isActive: true,
  };

  const category = await Category.create({ ...defaultCategory, ...overrides });
  return category;
};

/**
 * Create a test product
 */
export const createTestProduct = async (categoryId: string, overrides = {}) => {
  const defaultProduct = {
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test product description',
    categoryId,
    basePrice: 10.0,
    currency: 'USD',
    preparationTime: 10,
    isAvailable: true,
    isFeatured: false,
    displayOrder: 1,
    images: ['test-image.jpg'],
  };

  const product = await Product.create({ ...defaultProduct, ...overrides });
  return product;
};

/**
 * Clean up all test data
 */
export const cleanupTestData = async () => {
  await User.deleteMany({});
  await Store.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
};
