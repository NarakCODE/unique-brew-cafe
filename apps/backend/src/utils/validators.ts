/**
 * Validation utility functions
 * Used across the application for consistent data validation
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if email format is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (international format)
 * Accepts formats like: +1234567890, +12 345 678 90, +12-345-678-90
 * @param phoneNumber - Phone number to validate
 * @returns true if phone number format is valid
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // E.164 format: +[country code][number] (max 15 digits)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  // Remove spaces and dashes for validation
  const cleanedPhone = phoneNumber.replace(/[\s-]/g, '');
  return phoneRegex.test(cleanedPhone);
}

/**
 * Validate postal code format
 * Supports various international formats
 * @param postalCode - Postal code to validate
 * @param country - Optional country code for country-specific validation
 * @returns true if postal code format is valid
 */
export function validatePostalCode(
  postalCode: string,
  country?: string
): boolean {
  // Remove spaces for validation
  const cleaned = postalCode.replace(/\s/g, '');

  // Country-specific validation
  if (country) {
    switch (country.toUpperCase()) {
      case 'US':
        return /^\d{5}(-\d{4})?$/.test(cleaned);
      case 'UK':
        return /^[A-Z]{1,2}\d{1,2}[A-Z]?\d[A-Z]{2}$/i.test(cleaned);
      case 'CA':
        return /^[A-Z]\d[A-Z]\d[A-Z]\d$/i.test(cleaned);
      default:
        break;
    }
  }

  // Generic validation: 3-10 alphanumeric characters
  return /^[A-Z0-9]{3,10}$/i.test(cleaned);
}

/**
 * Validate password strength
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { isValid: true };
}

/**
 * Sanitize string input by trimming and removing excessive whitespace
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns true if URL format is valid
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
