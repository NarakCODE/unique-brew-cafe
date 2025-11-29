import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import * as storeService from '../../../src/services/storeService.js';
import { Store } from '../../../src/models/Store.js';

// Mock dependencies
vi.mock('../../../src/models/Store.js');

const createObjectId = () => new mongoose.Types.ObjectId().toString();

const createMockStore = (overrides = {}) => ({
  _id: createObjectId(),
  name: 'Coffee Corner',
  slug: 'coffee-corner',
  description: 'Best coffee in town',
  address: '123 Main St',
  city: 'Seattle',
  state: 'WA',
  postalCode: '98101',
  country: 'USA',
  phone: '+1234567890',
  latitude: 47.6062,
  longitude: -122.3321,
  isOpen: true,
  isActive: true,
  averagePrepTime: 15,
  rating: 4.5,
  totalReviews: 100,
  images: ['image1.jpg', 'image2.jpg'],
  openingHours: {
    monday: { open: '07:00', close: '20:00' },
    tuesday: { open: '07:00', close: '20:00' },
    wednesday: { open: '07:00', close: '20:00' },
    thursday: { open: '07:00', close: '20:00' },
    friday: { open: '07:00', close: '21:00' },
    saturday: { open: '08:00', close: '21:00' },
    sunday: { open: '08:00', close: '18:00' },
  },
  specialHours: [],
  features: {
    parking: true,
    wifi: true,
    outdoorSeating: false,
    driveThrough: false,
  },
  ...overrides,
});

describe('StoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      // Seattle to Portland (approximately 233 km)
      const distance = storeService.calculateDistance(
        47.6062,
        -122.3321,
        45.5152,
        -122.6784
      );

      expect(distance).toBeGreaterThan(200);
      expect(distance).toBeLessThan(250);
    });

    it('should return 0 for same coordinates', () => {
      const distance = storeService.calculateDistance(
        47.6062,
        -122.3321,
        47.6062,
        -122.3321
      );

      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const distance = storeService.calculateDistance(
        -33.8688,
        151.2093,
        -37.8136,
        144.9631
      );

      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('createStore', () => {
    it('should create a new store', async () => {
      const storeData = createMockStore();
      const mockSave = vi.fn().mockResolvedValue(storeData);

      vi.mocked(Store).mockImplementation(
        () =>
          ({
            ...storeData,
            save: mockSave,
          }) as any
      );

      const result = await storeService.createStore(storeData);

      expect(mockSave).toHaveBeenCalled();
      expect(result.name).toBe(storeData.name);
    });
  });

  describe('getAllStores', () => {
    it('should return paginated active stores', async () => {
      const mockStores = [
        createMockStore(),
        createMockStore({ name: 'Store 2' }),
      ];

      vi.mocked(Store.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockStores),
      } as any);

      vi.mocked(Store.countDocuments).mockResolvedValue(2);
      vi.mocked(Store.findById).mockResolvedValue({
        isOpenNow: vi.fn().mockReturnValue(true),
      } as any);

      const result = await storeService.getAllStores();

      expect(Store.find).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true })
      );
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter stores by city', async () => {
      vi.mocked(Store.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Store.countDocuments).mockResolvedValue(0);

      await storeService.getAllStores({ city: 'Seattle' });

      expect(Store.find).toHaveBeenCalledWith(
        expect.objectContaining({
          city: { $regex: 'Seattle', $options: 'i' },
        })
      );
    });

    it('should filter stores by location and radius', async () => {
      const mockStores = [
        createMockStore({ latitude: 47.6062, longitude: -122.3321 }),
      ];

      vi.mocked(Store.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockStores),
      } as any);

      vi.mocked(Store.countDocuments).mockResolvedValue(1);
      vi.mocked(Store.findById).mockResolvedValue({
        isOpenNow: vi.fn().mockReturnValue(true),
      } as any);

      const result = await storeService.getAllStores({
        latitude: 47.6,
        longitude: -122.3,
        radius: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('distance');
    });

    it('should apply pagination correctly', async () => {
      vi.mocked(Store.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Store.countDocuments).mockResolvedValue(50);

      const result = await storeService.getAllStores(
        {},
        { page: 2, limit: 10 }
      );

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('getAllStoresAdmin', () => {
    it('should return all stores including inactive', async () => {
      const mockStores = [
        createMockStore({ isActive: true }),
        createMockStore({ isActive: false, name: 'Inactive Store' }),
      ];

      vi.mocked(Store.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockStores),
      } as any);

      vi.mocked(Store.countDocuments).mockResolvedValue(2);
      vi.mocked(Store.findById).mockResolvedValue({
        isOpenNow: vi.fn().mockReturnValue(false),
      } as any);

      const result = await storeService.getAllStoresAdmin();

      expect(Store.find).toHaveBeenCalledWith({});
      expect(result.data).toHaveLength(2);
    });

    it('should filter by isActive status', async () => {
      vi.mocked(Store.find).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.mocked(Store.countDocuments).mockResolvedValue(0);

      await storeService.getAllStoresAdmin({}, { isActive: false });

      expect(Store.find).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false })
      );
    });
  });

  describe('getStoreById', () => {
    it('should return store by ID', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({ _id: storeId });

      vi.mocked(Store.findOne).mockResolvedValue({
        ...mockStore,
        toObject: vi.fn().mockReturnValue(mockStore),
        isOpenNow: vi.fn().mockReturnValue(true),
      } as any);

      const result = await storeService.getStoreById(storeId);

      expect(Store.findOne).toHaveBeenCalledWith({
        _id: storeId,
        isActive: true,
      });
      expect(result.name).toBe(mockStore.name);
      expect(result.isOpenNow).toBe(true);
    });

    it('should throw NotFoundError if store not found', async () => {
      vi.mocked(Store.findOne).mockResolvedValue(null);

      await expect(storeService.getStoreById(createObjectId())).rejects.toThrow(
        'Store not found'
      );
    });
  });

  describe('getStoreBySlug', () => {
    it('should return store by slug', async () => {
      const mockStore = createMockStore();

      vi.mocked(Store.findOne).mockResolvedValue({
        ...mockStore,
        toObject: vi.fn().mockReturnValue(mockStore),
        isOpenNow: vi.fn().mockReturnValue(true),
      } as any);

      const result = await storeService.getStoreBySlug('coffee-corner');

      expect(Store.findOne).toHaveBeenCalledWith({
        slug: 'coffee-corner',
        isActive: true,
      });
      expect(result.slug).toBe('coffee-corner');
    });

    it('should throw NotFoundError if store not found by slug', async () => {
      vi.mocked(Store.findOne).mockResolvedValue(null);

      await expect(storeService.getStoreBySlug('non-existent')).rejects.toThrow(
        'Store not found'
      );
    });
  });

  describe('getAvailablePickupTimes', () => {
    it('should return pickup times for a store', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({ _id: storeId });
      const mockPickupTimes = ['10:00', '10:15', '10:30'];

      vi.mocked(Store.findOne).mockResolvedValue({
        ...mockStore,
        _id: storeId,
        getPickupTimes: vi.fn().mockReturnValue(mockPickupTimes),
      } as any);

      const result = await storeService.getAvailablePickupTimes(storeId);

      expect(result.storeId).toBe(storeId);
      expect(result.pickupTimes).toEqual(mockPickupTimes);
    });

    it('should throw NotFoundError if store not found', async () => {
      vi.mocked(Store.findOne).mockResolvedValue(null);

      await expect(
        storeService.getAvailablePickupTimes(createObjectId())
      ).rejects.toThrow('Store not found');
    });

    it('should accept optional date parameter', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({ _id: storeId });
      const testDate = new Date('2025-12-25');

      vi.mocked(Store.findOne).mockResolvedValue({
        ...mockStore,
        _id: storeId,
        getPickupTimes: vi.fn().mockReturnValue([]),
      } as any);

      const result = await storeService.getAvailablePickupTimes(
        storeId,
        testDate
      );

      expect(result.date).toEqual(testDate);
    });
  });

  describe('getStoreGallery', () => {
    it('should return store gallery images', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({
        _id: storeId,
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      });

      vi.mocked(Store.findOne).mockResolvedValue(mockStore as any);

      const result = await storeService.getStoreGallery(storeId);

      expect(result.storeId).toBe(storeId);
      expect(result.images).toHaveLength(3);
    });

    it('should throw NotFoundError if store not found', async () => {
      vi.mocked(Store.findOne).mockResolvedValue(null);

      await expect(
        storeService.getStoreGallery(createObjectId())
      ).rejects.toThrow('Store not found');
    });

    it('should return empty array if no images', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({ _id: storeId, images: undefined });

      vi.mocked(Store.findOne).mockResolvedValue(mockStore as any);

      const result = await storeService.getStoreGallery(storeId);

      expect(result.images).toEqual([]);
    });
  });

  describe('getStoreHours', () => {
    it('should return store opening hours', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({ _id: storeId });

      vi.mocked(Store.findOne).mockResolvedValue({
        ...mockStore,
        _id: storeId,
        isOpenNow: vi.fn().mockReturnValue(true),
      } as any);

      const result = await storeService.getStoreHours(storeId);

      expect(result.storeId).toBe(storeId);
      expect(result.openingHours).toBeDefined();
      expect(result.isOpenNow).toBe(true);
    });

    it('should throw NotFoundError if store not found', async () => {
      vi.mocked(Store.findOne).mockResolvedValue(null);

      await expect(
        storeService.getStoreHours(createObjectId())
      ).rejects.toThrow('Store not found');
    });

    it('should include special hours if available', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({
        _id: storeId,
        specialHours: [
          {
            date: new Date('2025-12-25'),
            open: '10:00',
            close: '16:00',
            reason: 'Christmas',
          },
        ],
      });

      vi.mocked(Store.findOne).mockResolvedValue({
        ...mockStore,
        _id: storeId,
        isOpenNow: vi.fn().mockReturnValue(false),
      } as any);

      const result = await storeService.getStoreHours(storeId);

      expect(result.specialHours).toHaveLength(1);
    });
  });

  describe('getStoreLocation', () => {
    it('should return store location details', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({ _id: storeId });

      vi.mocked(Store.findOne).mockResolvedValue(mockStore as any);

      const result = await storeService.getStoreLocation(storeId);

      expect(result.storeId).toBe(storeId);
      expect(result.address).toBe(mockStore.address);
      expect(result.city).toBe(mockStore.city);
      expect(result.latitude).toBe(mockStore.latitude);
      expect(result.longitude).toBe(mockStore.longitude);
    });

    it('should throw NotFoundError if store not found', async () => {
      vi.mocked(Store.findOne).mockResolvedValue(null);

      await expect(
        storeService.getStoreLocation(createObjectId())
      ).rejects.toThrow('Store not found');
    });
  });

  describe('updateStore', () => {
    it('should update store details', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({ _id: storeId });
      const updateData = { name: 'Updated Coffee Corner' };

      const saveMock = vi.fn().mockResolvedValue(true);

      vi.mocked(Store.findById).mockResolvedValue({
        ...mockStore,
        save: saveMock,
        toObject: vi.fn().mockReturnValue({ ...mockStore, ...updateData }),
        isOpenNow: vi.fn().mockReturnValue(true),
      } as any);

      const result = await storeService.updateStore(storeId, updateData);

      expect(saveMock).toHaveBeenCalled();
      expect(result.name).toBe('Updated Coffee Corner');
    });

    it('should throw NotFoundError if store not found', async () => {
      vi.mocked(Store.findById).mockResolvedValue(null);

      await expect(
        storeService.updateStore(createObjectId(), { name: 'Test' })
      ).rejects.toThrow('Store not found');
    });
  });

  describe('deleteStore', () => {
    it('should delete store', async () => {
      const storeId = createObjectId();

      vi.mocked(Store.findById).mockResolvedValue(createMockStore() as any);
      vi.mocked(Store.findByIdAndDelete).mockResolvedValue(true as any);

      await storeService.deleteStore(storeId);

      expect(Store.findByIdAndDelete).toHaveBeenCalledWith(storeId);
    });

    it('should throw NotFoundError if store not found', async () => {
      vi.mocked(Store.findById).mockResolvedValue(null);

      await expect(storeService.deleteStore(createObjectId())).rejects.toThrow(
        'Store not found'
      );
    });
  });

  describe('toggleStoreStatus', () => {
    it('should toggle store active status from true to false', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({ _id: storeId, isActive: true });

      const saveMock = vi.fn().mockResolvedValue(true);

      vi.mocked(Store.findById).mockResolvedValue({
        ...mockStore,
        isActive: true,
        save: saveMock,
        toObject: vi.fn().mockReturnValue({ ...mockStore, isActive: false }),
        isOpenNow: vi.fn().mockReturnValue(false),
      } as any);

      const result = await storeService.toggleStoreStatus(storeId);

      expect(saveMock).toHaveBeenCalled();
      expect(result.isActive).toBe(false);
    });

    it('should toggle store active status from false to true', async () => {
      const storeId = createObjectId();
      const mockStore = createMockStore({ _id: storeId, isActive: false });

      const saveMock = vi.fn().mockResolvedValue(true);

      vi.mocked(Store.findById).mockResolvedValue({
        ...mockStore,
        isActive: false,
        save: saveMock,
        toObject: vi.fn().mockReturnValue({ ...mockStore, isActive: true }),
        isOpenNow: vi.fn().mockReturnValue(true),
      } as any);

      const result = await storeService.toggleStoreStatus(storeId);

      expect(saveMock).toHaveBeenCalled();
      expect(result.isActive).toBe(true);
    });

    it('should throw NotFoundError if store not found', async () => {
      vi.mocked(Store.findById).mockResolvedValue(null);

      await expect(
        storeService.toggleStoreStatus(createObjectId())
      ).rejects.toThrow('Store not found');
    });
  });
});
