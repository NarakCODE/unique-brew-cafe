import { describe, it, expect } from 'vitest';
import { User } from '../../../src/models/User.js';

describe('User Model', () => {
  it('should create a user with valid attributes', async () => {
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'user',
    };

    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.fullName).toBe(userData.fullName);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(userData.role);
    expect(user.password).not.toBe(userData.password); // Should be hashed
  });

  it('should fail if required fields are missing', async () => {
    const userData = {
      fullName: 'Test User',
      // Missing email and password
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should fail if email is invalid', async () => {
    const userData = {
      fullName: 'Test User',
      email: 'invalid-email',
      password: 'Password123!',
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should compare password correctly', async () => {
    const userData = {
      fullName: 'Test User',
      email: 'auth@example.com',
      password: 'Password123!',
    };

    const user = await User.create(userData);

    const isMatch = await user.comparePassword('Password123!');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('WrongPassword');
    expect(isNotMatch).toBe(false);
  });
});
