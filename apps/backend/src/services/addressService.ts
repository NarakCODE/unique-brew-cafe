import { Address, type IAddress } from '../models/Address.js';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../utils/AppError.js';
import { validatePhoneNumber, sanitizeString } from '../utils/validators.js';

interface CreateAddressData {
  label: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  deliveryInstructions?: string;
}

interface UpdateAddressData {
  label?: string;
  fullName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string;
}

export class AddressService {
  /**
   * Get all addresses for a user
   * Requirements: 20.1
   */
  async getAddresses(userId: string) {
    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return addresses;
  }

  /**
   * Add a new address
   * Requirements: 20.2, 20.6
   */
  async addAddress(
    userId: string,
    addressData: CreateAddressData
  ): Promise<IAddress> {
    // Validate and sanitize inputs
    const validationErrors: string[] = [];
    const sanitizedData: CreateAddressData = { ...addressData };

    // Sanitize string fields
    sanitizedData.label = sanitizeString(addressData.label);
    sanitizedData.fullName = sanitizeString(addressData.fullName);
    sanitizedData.addressLine1 = sanitizeString(addressData.addressLine1);
    sanitizedData.city = sanitizeString(addressData.city);
    sanitizedData.state = sanitizeString(addressData.state);

    if (addressData.addressLine2) {
      sanitizedData.addressLine2 = sanitizeString(addressData.addressLine2);
    }

    if (addressData.deliveryInstructions) {
      sanitizedData.deliveryInstructions = sanitizeString(
        addressData.deliveryInstructions
      );
    }

    // Validate phone number
    const sanitizedPhone = sanitizeString(addressData.phoneNumber);
    if (!validatePhoneNumber(sanitizedPhone)) {
      validationErrors.push(
        'Invalid phone number format. Use international format (e.g., +1234567890)'
      );
    } else {
      sanitizedData.phoneNumber = sanitizedPhone;
    }

    // Validate postal code format if provided
    if (addressData.postalCode) {
      const sanitizedPostalCode = sanitizeString(addressData.postalCode);
      if (!/^[A-Za-z0-9\s-]{3,10}$/.test(sanitizedPostalCode)) {
        validationErrors.push(
          'Invalid postal code format. Must be 3-10 alphanumeric characters'
        );
      } else {
        sanitizedData.postalCode = sanitizedPostalCode;
      }
    }

    // Validate coordinates if provided
    if (addressData.latitude !== undefined) {
      if (addressData.latitude < -90 || addressData.latitude > 90) {
        validationErrors.push('Latitude must be between -90 and 90');
      }
    }

    if (addressData.longitude !== undefined) {
      if (addressData.longitude < -180 || addressData.longitude > 180) {
        validationErrors.push('Longitude must be between -180 and 180');
      }
    }

    // Throw all validation errors at once
    if (validationErrors.length > 0) {
      throw new BadRequestError(validationErrors.join('; '));
    }

    // If this is set as default, unmark other defaults
    if (sanitizedData.isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    } else {
      // If this is the first address, make it default
      const existingAddressCount = await Address.countDocuments({ userId });
      if (existingAddressCount === 0) {
        sanitizedData.isDefault = true;
      }
    }

    // Create the address
    const address = await Address.create({
      userId,
      ...sanitizedData,
    });

    return address;
  }

  /**
   * Update an existing address
   * Requirements: 20.3, 20.6
   */
  async updateAddress(
    userId: string,
    addressId: string,
    addressData: UpdateAddressData
  ): Promise<IAddress> {
    // Find the address
    const address = await Address.findById(addressId);

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    // Verify ownership
    if (address.userId.toString() !== userId) {
      throw new ForbiddenError(
        'You do not have permission to update this address'
      );
    }

    // Validate and sanitize inputs
    const validationErrors: string[] = [];

    // Sanitize string fields if provided
    if (addressData.label !== undefined) {
      address.label = sanitizeString(addressData.label);
    }

    if (addressData.fullName !== undefined) {
      address.fullName = sanitizeString(addressData.fullName);
    }

    if (addressData.addressLine1 !== undefined) {
      address.addressLine1 = sanitizeString(addressData.addressLine1);
    }

    if (addressData.addressLine2 !== undefined) {
      address.addressLine2 = sanitizeString(addressData.addressLine2);
    }

    if (addressData.city !== undefined) {
      address.city = sanitizeString(addressData.city);
    }

    if (addressData.state !== undefined) {
      address.state = sanitizeString(addressData.state);
    }

    if (addressData.country !== undefined) {
      address.country = sanitizeString(addressData.country);
    }

    if (addressData.deliveryInstructions !== undefined) {
      address.deliveryInstructions = sanitizeString(
        addressData.deliveryInstructions
      );
    }

    // Validate phone number if provided
    if (addressData.phoneNumber !== undefined) {
      const sanitizedPhone = sanitizeString(addressData.phoneNumber);
      if (!validatePhoneNumber(sanitizedPhone)) {
        validationErrors.push(
          'Invalid phone number format. Use international format (e.g., +1234567890)'
        );
      } else {
        address.phoneNumber = sanitizedPhone;
      }
    }

    // Validate postal code format if provided
    if (addressData.postalCode !== undefined) {
      const sanitizedPostalCode = sanitizeString(addressData.postalCode);
      if (
        sanitizedPostalCode &&
        !/^[A-Za-z0-9\s-]{3,10}$/.test(sanitizedPostalCode)
      ) {
        validationErrors.push(
          'Invalid postal code format. Must be 3-10 alphanumeric characters'
        );
      } else {
        address.postalCode = sanitizedPostalCode;
      }
    }

    // Validate coordinates if provided
    if (addressData.latitude !== undefined) {
      if (addressData.latitude < -90 || addressData.latitude > 90) {
        validationErrors.push('Latitude must be between -90 and 90');
      } else {
        address.latitude = addressData.latitude;
      }
    }

    if (addressData.longitude !== undefined) {
      if (addressData.longitude < -180 || addressData.longitude > 180) {
        validationErrors.push('Longitude must be between -180 and 180');
      } else {
        address.longitude = addressData.longitude;
      }
    }

    // Throw all validation errors at once
    if (validationErrors.length > 0) {
      throw new BadRequestError(validationErrors.join('; '));
    }

    await address.save();

    return address;
  }

  /**
   * Delete an address
   * Requirements: 20.4
   */
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await Address.findById(addressId);

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    // Verify ownership
    if (address.userId.toString() !== userId) {
      throw new ForbiddenError(
        'You do not have permission to delete this address'
      );
    }

    const wasDefault = address.isDefault;

    await Address.findByIdAndDelete(addressId);

    // If deleted address was default, set another address as default
    if (wasDefault) {
      const nextAddress = await Address.findOne({ userId }).sort({
        createdAt: -1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }
  }

  /**
   * Set an address as default
   * Requirements: 20.5
   */
  async setDefaultAddress(
    userId: string,
    addressId: string
  ): Promise<IAddress> {
    const address = await Address.findById(addressId);

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    // Verify ownership
    if (address.userId.toString() !== userId) {
      throw new ForbiddenError(
        'You do not have permission to modify this address'
      );
    }

    // Unmark all other addresses as default
    await Address.updateMany({ userId }, { isDefault: false });

    // Mark this address as default
    address.isDefault = true;
    await address.save();

    return address;
  }

  /**
   * Get a specific address by ID
   */
  async getAddressById(userId: string, addressId: string) {
    const address = await Address.findById(addressId).lean();

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    // Verify ownership
    if (address.userId.toString() !== userId) {
      throw new ForbiddenError(
        'You do not have permission to view this address'
      );
    }

    return address;
  }
}

export const addressService = new AddressService();
