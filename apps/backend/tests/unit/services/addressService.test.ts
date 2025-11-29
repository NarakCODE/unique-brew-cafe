import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addressService } from '../../../src/services/addressService';
import { Address } from '../../../src/models/Address';
import * as validators from '../../../src/utils/validators';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../../src/utils/AppError';

// Mock dependencies
vi.mock('../../../src/models/Address');
vi.mock('../../../src/utils/validators');

describe('AddressService', () => {
  const userId = 'user123';
  const addressId = 'addr123';

  // Sample data
  const mockAddressData = {
    label: 'Home',
    fullName: 'John Doe',
    phoneNumber: '+85512345678',
    addressLine1: '123 Street',
    city: 'Phnom Penh',
    state: 'Phnom Penh',
    country: 'Cambodia',
    latitude: 11.55,
    longitude: 104.91,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for validators
    vi.mocked(validators.sanitizeString).mockImplementation(
      (str) => str?.trim() || str
    );
    vi.mocked(validators.validatePhoneNumber).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAddresses', () => {
    it('should return all addresses for a user sorted by default and creation', async () => {
      const mockAddresses = [
        { ...mockAddressData, _id: '1', isDefault: true },
        { ...mockAddressData, _id: '2', isDefault: false },
      ];

      // Mock chain: find().sort().lean()
      const mockLean = vi.fn().mockResolvedValue(mockAddresses);
      const mockSort = vi.fn().mockReturnValue({ lean: mockLean });
      (Address.find as any).mockReturnValue({ sort: mockSort });

      const result = await addressService.getAddresses(userId);

      expect(Address.find).toHaveBeenCalledWith({ userId });
      expect(mockSort).toHaveBeenCalledWith({ isDefault: -1, createdAt: -1 });
      expect(mockLean).toHaveBeenCalled();
      expect(result).toEqual(mockAddresses);
    });
  });

  describe('addAddress', () => {
    it('should create a new address successfully', async () => {
      // Mock existing count > 0 (not the first address)
      (Address.countDocuments as any).mockResolvedValue(1);
      (Address.create as any).mockResolvedValue({
        ...mockAddressData,
        _id: addressId,
        userId,
      });

      const result = await addressService.addAddress(userId, mockAddressData);

      expect(validators.validatePhoneNumber).toHaveBeenCalledWith(
        mockAddressData.phoneNumber
      );
      expect(Address.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          label: mockAddressData.label,
        })
      );
      expect(result).toBeDefined();
    });

    it('should automatically set isDefault to true if it is the first address', async () => {
      (Address.countDocuments as any).mockResolvedValue(0); // First address
      (Address.create as any).mockImplementation((data: any) =>
        Promise.resolve({ ...data, _id: addressId })
      );

      await addressService.addAddress(userId, mockAddressData);

      expect(Address.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isDefault: true,
        })
      );
    });

    it('should unset other default addresses if new address isDefault=true', async () => {
      const newAddressData = { ...mockAddressData, isDefault: true };

      (Address.updateMany as any).mockResolvedValue({});
      (Address.create as any).mockResolvedValue({
        ...newAddressData,
        _id: addressId,
      });

      await addressService.addAddress(userId, newAddressData);

      expect(Address.updateMany).toHaveBeenCalledWith(
        { userId },
        { isDefault: false }
      );
    });

    it('should throw BadRequestError for invalid phone number', async () => {
      vi.mocked(validators.validatePhoneNumber).mockReturnValue(false);

      await expect(
        addressService.addAddress(userId, mockAddressData)
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError for invalid coordinates', async () => {
      const invalidData = { ...mockAddressData, latitude: 91 }; // Out of range

      await expect(
        addressService.addAddress(userId, invalidData)
      ).rejects.toThrow(/Latitude/);
    });
  });

  describe('updateAddress', () => {
    it('should update address successfully', async () => {
      const existingAddress = {
        ...mockAddressData,
        _id: addressId,
        userId,
        save: vi.fn().mockResolvedValue(true),
      };

      (Address.findById as any).mockResolvedValue(existingAddress);

      const updateData = { label: 'Work' };
      const result = await addressService.updateAddress(
        userId,
        addressId,
        updateData
      );

      expect(Address.findById).toHaveBeenCalledWith(addressId);
      expect(existingAddress.label).toBe('Work');
      expect(existingAddress.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundError if address does not exist', async () => {
      (Address.findById as any).mockResolvedValue(null);

      await expect(
        addressService.updateAddress(userId, addressId, {})
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if user does not own the address', async () => {
      const otherUserAddress = {
        ...mockAddressData,
        _id: addressId,
        userId: 'otherUser',
      };
      (Address.findById as any).mockResolvedValue(otherUserAddress);

      await expect(
        addressService.updateAddress(userId, addressId, {})
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw BadRequestError if validation fails during update', async () => {
      const existingAddress = {
        ...mockAddressData,
        _id: addressId,
        userId,
      };
      (Address.findById as any).mockResolvedValue(existingAddress);

      // Attempt to update with invalid coordinate
      await expect(
        addressService.updateAddress(userId, addressId, { longitude: 200 })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('deleteAddress', () => {
    it('should delete address and reassign default if needed', async () => {
      const addressToDelete = {
        _id: addressId,
        userId,
        isDefault: true, // This is the default address
      };

      (Address.findById as any).mockResolvedValue(addressToDelete);
      (Address.findByIdAndDelete as any).mockResolvedValue(true);

      // Mock finding next address to set as default
      const nextAddress = { _id: 'addr456', save: vi.fn() };
      const mockSort = vi.fn().mockResolvedValue(nextAddress);
      (Address.findOne as any).mockReturnValue({ sort: mockSort });

      await addressService.deleteAddress(userId, addressId);

      expect(Address.findByIdAndDelete).toHaveBeenCalledWith(addressId);
      // Logic checks if deleted was default, it should find next one and save
      expect(Address.findOne).toHaveBeenCalledWith({ userId });
      expect(nextAddress.save).toHaveBeenCalled();
      // Specifically check that isDefault was set to true on next address
      expect((nextAddress as any).isDefault).toBe(true);
    });

    it('should delete address without reassigning default if not default', async () => {
      const addressToDelete = {
        _id: addressId,
        userId,
        isDefault: false,
      };

      (Address.findById as any).mockResolvedValue(addressToDelete);
      (Address.findByIdAndDelete as any).mockResolvedValue(true);

      await addressService.deleteAddress(userId, addressId);

      expect(Address.findByIdAndDelete).toHaveBeenCalledWith(addressId);
      expect(Address.findOne).not.toHaveBeenCalled(); // Shouldn't look for replacement
    });

    it('should throw ForbiddenError if user does not own address', async () => {
      (Address.findById as any).mockResolvedValue({ userId: 'other' });

      await expect(
        addressService.deleteAddress(userId, addressId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('setDefaultAddress', () => {
    it('should set address as default and unset others', async () => {
      const address = {
        _id: addressId,
        userId,
        isDefault: false,
        save: vi.fn(),
      };

      (Address.findById as any).mockResolvedValue(address);
      (Address.updateMany as any).mockResolvedValue({});

      await addressService.setDefaultAddress(userId, addressId);

      expect(Address.updateMany).toHaveBeenCalledWith(
        { userId },
        { isDefault: false }
      );
      expect(address.isDefault).toBe(true);
      expect(address.save).toHaveBeenCalled();
    });
  });

  describe('getAddressById', () => {
    it('should return address if found and owned by user', async () => {
      const address = { _id: addressId, userId };

      // Mock chain findById().lean()
      const mockLean = vi.fn().mockResolvedValue(address);
      (Address.findById as any).mockReturnValue({ lean: mockLean });

      const result = await addressService.getAddressById(userId, addressId);
      expect(result).toEqual(address);
    });

    it('should throw ForbiddenError if owned by different user', async () => {
      const address = { _id: addressId, userId: 'other' };

      const mockLean = vi.fn().mockResolvedValue(address);
      (Address.findById as any).mockReturnValue({ lean: mockLean });

      await expect(
        addressService.getAddressById(userId, addressId)
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError if not found', async () => {
      const mockLean = vi.fn().mockResolvedValue(null);
      (Address.findById as any).mockReturnValue({ lean: mockLean });

      await expect(
        addressService.getAddressById(userId, addressId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
