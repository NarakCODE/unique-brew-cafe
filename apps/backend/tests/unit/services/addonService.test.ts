import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createAddOn,
  getAllAddOns,
  getAddOnById,
  updateAddOn,
  deleteAddOn,
  getAddOnsByProductId,
} from '../../../src/services/addonService';
import { AddOn } from '../../../src/models/AddOn';
import { ProductAddOn } from '../../../src/models/ProductAddOn';
import { NotFoundError } from '../../../src/utils/AppError';

// Mock the Mongoose models
vi.mock('../../../src/models/AddOn');
vi.mock('../../../src/models/ProductAddOn');

describe('AddOn Service', () => {
  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAddOn', () => {
    it('should create and return a new add-on', async () => {
      const mockData = {
        name: 'Vanilla Syrup',
        price: 0.5,
        category: 'syrup' as const,
      };

      const mockCreatedAddOn = { ...mockData, _id: 'addon123' };

      // Mock AddOn.create
      (AddOn.create as any).mockResolvedValue(mockCreatedAddOn);

      const result = await createAddOn(mockData as any);

      expect(AddOn.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockCreatedAddOn);
    });
  });

  describe('getAllAddOns', () => {
    it('should return all non-deleted add-ons sorted by category and name', async () => {
      const mockAddOns = [
        { name: 'Caramel', category: 'syrup' },
        { name: 'Chocolate', category: 'topping' },
      ];

      // Mock chain: .find().sort()
      const mockSort = vi.fn().mockResolvedValue(mockAddOns);
      (AddOn.find as any).mockReturnValue({
        sort: mockSort,
      });

      const result = await getAllAddOns();

      expect(AddOn.find).toHaveBeenCalledWith({ deletedAt: null });
      expect(mockSort).toHaveBeenCalledWith({ category: 1, name: 1 });
      expect(result).toEqual(mockAddOns);
    });
  });

  describe('getAddOnById', () => {
    it('should return the add-on if found', async () => {
      const mockAddOn = { _id: '123', name: 'Test Addon' };
      (AddOn.findOne as any).mockResolvedValue(mockAddOn);

      const result = await getAddOnById('123');

      expect(AddOn.findOne).toHaveBeenCalledWith({
        _id: '123',
        deletedAt: null,
      });
      expect(result).toEqual(mockAddOn);
    });

    it('should throw NotFoundError if add-on does not exist', async () => {
      (AddOn.findOne as any).mockResolvedValue(null);

      await expect(getAddOnById('999')).rejects.toThrow(NotFoundError);
      expect(AddOn.findOne).toHaveBeenCalledWith({
        _id: '999',
        deletedAt: null,
      });
    });
  });

  describe('updateAddOn', () => {
    it('should update and return the add-on if found', async () => {
      const updateData = { price: 1.0 };
      const mockUpdatedAddOn = { _id: '123', name: 'Existing', price: 1.0 };

      (AddOn.findOneAndUpdate as any).mockResolvedValue(mockUpdatedAddOn);

      const result = await updateAddOn('123', updateData);

      expect(AddOn.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '123', deletedAt: null },
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockUpdatedAddOn);
    });

    it('should throw NotFoundError if add-on to update is not found', async () => {
      (AddOn.findOneAndUpdate as any).mockResolvedValue(null);

      await expect(updateAddOn('999', { price: 20 })).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('deleteAddOn', () => {
    it('should soft delete the add-on by setting deletedAt', async () => {
      const mockDeletedAddOn = { _id: '123', deletedAt: new Date() };

      (AddOn.findOneAndUpdate as any).mockResolvedValue(mockDeletedAddOn);

      await deleteAddOn('123');

      expect(AddOn.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '123', deletedAt: null },
        expect.objectContaining({ deletedAt: expect.any(Date) }),
        { new: true }
      );
    });

    it('should throw NotFoundError if add-on to delete is not found', async () => {
      (AddOn.findOneAndUpdate as any).mockResolvedValue(null);

      await expect(deleteAddOn('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAddOnsByProductId', () => {
    it('should return formatted add-ons, filtering out nulls and unavailable items', async () => {
      const productId = 'prod123';

      // Mock data returned from Database (populated)
      const mockProductAddOns = [
        {
          productId: 'prod123',
          addOnId: {
            _id: 'addon1',
            name: 'Extra Shot',
            description: 'Strong',
            price: 1.5,
            category: 'extra_shot',
            imageUrl: 'shot.jpg',
            isAvailable: true,
          },
          isDefault: false,
        },
        {
          productId: 'prod123',
          addOnId: {
            _id: 'addon2',
            name: 'Unavailable Item',
            isAvailable: false, // Should be filtered out
          },
          isDefault: false,
        },
        {
          productId: 'prod123',
          addOnId: null, // Should be filtered out (broken reference)
          isDefault: false,
        },
      ];

      // Mock chain: ProductAddOn.find().populate().lean()
      const mockLean = vi.fn().mockResolvedValue(mockProductAddOns);
      const mockPopulate = vi.fn().mockReturnValue({ lean: mockLean });
      (ProductAddOn.find as any).mockReturnValue({ populate: mockPopulate });

      const result = await getAddOnsByProductId(productId);

      // Verify Mongoose calls
      expect(ProductAddOn.find).toHaveBeenCalledWith({ productId });
      expect(mockPopulate).toHaveBeenCalledWith('addOnId');
      expect(mockLean).toHaveBeenCalled();

      // Verify Logic: Should only have 1 item left after filter
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'addon1',
        name: 'Extra Shot',
        description: 'Strong',
        price: 1.5,
        category: 'extra_shot',
        imageUrl: 'shot.jpg',
        isAvailable: true,
        isDefault: false,
      });
    });

    it('should return empty array if no add-ons exist', async () => {
      // Mock chain returning empty array
      const mockLean = vi.fn().mockResolvedValue([]);
      const mockPopulate = vi.fn().mockReturnValue({ lean: mockLean });
      (ProductAddOn.find as any).mockReturnValue({ populate: mockPopulate });

      const result = await getAddOnsByProductId('prod999');

      expect(result).toEqual([]);
    });
  });
});
