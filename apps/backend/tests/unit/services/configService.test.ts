import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configService } from '../../../src/services/configService.js';
import { AppConfig } from '../../../src/models/AppConfig.js';
import { DeliveryZone } from '../../../src/models/DeliveryZone.js';

// Mock dependencies
vi.mock('../../../src/models/AppConfig.js');
vi.mock('../../../src/models/DeliveryZone.js');

describe('ConfigService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPublicConfig', () => {
    it('should return only public configurations as key-value pairs', async () => {
      const mockConfigs = [
        {
          configKey: 'app_name',
          configValue: 'Corner Coffee',
          isPublic: true,
        },
        {
          configKey: 'max_order_items',
          configValue: 10,
          isPublic: true,
        },
      ];

      vi.mocked(AppConfig.find).mockResolvedValue(mockConfigs as any);

      const result = await configService.getPublicConfig();

      expect(AppConfig.find).toHaveBeenCalledWith({ isPublic: true });
      expect(result).toEqual({
        app_name: 'Corner Coffee',
        max_order_items: 10,
      });
    });

    it('should return empty object if no public configs exist', async () => {
      vi.mocked(AppConfig.find).mockResolvedValue([] as any);

      const result = await configService.getPublicConfig();

      expect(result).toEqual({});
    });
  });

  describe('getAllConfig', () => {
    it('should return all configurations sorted by key', async () => {
      const mockConfigs = [
        {
          _id: 'config1',
          configKey: 'app_name',
          configValue: 'Corner Coffee',
          isPublic: true,
        },
        {
          _id: 'config2',
          configKey: 'secret_key',
          configValue: 'xyz123',
          isPublic: false,
        },
      ];

      vi.mocked(AppConfig.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockConfigs),
      } as any);

      const result = await configService.getAllConfig();

      expect(AppConfig.find).toHaveBeenCalled();
      expect(result).toEqual(mockConfigs);
    });
  });

  describe('updateConfig', () => {
    it('should update existing configuration', async () => {
      const key = 'app_name';
      const value = 'New App Name';
      const description = 'Application name';
      const isPublic = true;
      const type = 'string';

      const mockUpdatedConfig = {
        _id: 'config1',
        configKey: key,
        configValue: value,
        description,
        isPublic,
        type,
      };

      vi.mocked(AppConfig.findOneAndUpdate).mockResolvedValue(
        mockUpdatedConfig as any
      );

      const result = await configService.updateConfig(
        key,
        value,
        description,
        isPublic,
        type
      );

      expect(AppConfig.findOneAndUpdate).toHaveBeenCalledWith(
        { configKey: key },
        {
          configValue: value,
          description,
          isPublic,
          type,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      expect(result).toEqual(mockUpdatedConfig);
    });

    it('should create new configuration if not exists (upsert)', async () => {
      const key = 'new_config';
      const value = 'new value';

      const mockNewConfig = {
        _id: 'config2',
        configKey: key,
        configValue: value,
      };

      vi.mocked(AppConfig.findOneAndUpdate).mockResolvedValue(
        mockNewConfig as any
      );

      const result = await configService.updateConfig(key, value);

      expect(result.configKey).toBe(key);
      expect(result.configValue).toBe(value);
    });

    it('should update only value when optional parameters are not provided', async () => {
      const key = 'some_key';
      const value = 123;

      const mockConfig = {
        _id: 'config3',
        configKey: key,
        configValue: value,
      };

      vi.mocked(AppConfig.findOneAndUpdate).mockResolvedValue(
        mockConfig as any
      );

      await configService.updateConfig(key, value);

      expect(AppConfig.findOneAndUpdate).toHaveBeenCalledWith(
        { configKey: key },
        { configValue: value },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    });
  });

  describe('getDeliveryZones', () => {
    it('should return only active delivery zones by default', async () => {
      const mockZones = [
        {
          _id: 'zone1',
          name: 'Zone 1',
          isActive: true,
        },
        {
          _id: 'zone2',
          name: 'Zone 2',
          isActive: true,
        },
      ];

      vi.mocked(DeliveryZone.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockZones),
      } as any);

      const result = await configService.getDeliveryZones();

      expect(DeliveryZone.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(mockZones);
    });

    it('should return all delivery zones when onlyActive is false', async () => {
      const mockZones = [
        {
          _id: 'zone1',
          name: 'Zone 1',
          isActive: true,
        },
        {
          _id: 'zone2',
          name: 'Zone 2',
          isActive: false,
        },
      ];

      vi.mocked(DeliveryZone.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockZones),
      } as any);

      const result = await configService.getDeliveryZones(false);

      expect(DeliveryZone.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockZones);
    });
  });

  describe('createDeliveryZone', () => {
    it('should create a new delivery zone', async () => {
      const zoneData = {
        name: 'New Zone',
        deliveryFee: 5,
        minOrderAmount: 10,
        isActive: true,
      };

      const mockCreatedZone = {
        _id: 'zone123',
        ...zoneData,
      };

      vi.mocked(DeliveryZone.create).mockResolvedValue(mockCreatedZone as any);

      const result = await configService.createDeliveryZone(zoneData);

      expect(DeliveryZone.create).toHaveBeenCalledWith(zoneData);
      expect(result).toEqual(mockCreatedZone);
    });
  });

  describe('updateDeliveryZone', () => {
    it('should update delivery zone successfully', async () => {
      const zoneId = 'zone123';
      const updateData = {
        name: 'Updated Zone',
        deliveryFee: 7,
      };

      const mockUpdatedZone = {
        _id: zoneId,
        ...updateData,
      };

      vi.mocked(DeliveryZone.findByIdAndUpdate).mockResolvedValue(
        mockUpdatedZone as any
      );

      const result = await configService.updateDeliveryZone(zoneId, updateData);

      expect(DeliveryZone.findByIdAndUpdate).toHaveBeenCalledWith(
        zoneId,
        updateData,
        { new: true }
      );
      expect(result).toEqual(mockUpdatedZone);
    });

    it('should throw error if delivery zone not found', async () => {
      const zoneId = 'nonexistent';
      const updateData = { name: 'Updated Zone' };

      vi.mocked(DeliveryZone.findByIdAndUpdate).mockResolvedValue(null);

      await expect(
        configService.updateDeliveryZone(zoneId, updateData)
      ).rejects.toThrow('Delivery zone not found');
    });
  });

  describe('deleteDeliveryZone', () => {
    it('should delete delivery zone successfully', async () => {
      const zoneId = 'zone123';
      const mockDeletedZone = {
        _id: zoneId,
        name: 'Deleted Zone',
      };

      vi.mocked(DeliveryZone.findByIdAndDelete).mockResolvedValue(
        mockDeletedZone as any
      );

      const result = await configService.deleteDeliveryZone(zoneId);

      expect(DeliveryZone.findByIdAndDelete).toHaveBeenCalledWith(zoneId);
      expect(result).toEqual(mockDeletedZone);
    });

    it('should throw error if delivery zone not found', async () => {
      const zoneId = 'nonexistent';

      vi.mocked(DeliveryZone.findByIdAndDelete).mockResolvedValue(null);

      await expect(configService.deleteDeliveryZone(zoneId)).rejects.toThrow(
        'Delivery zone not found'
      );
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health status', async () => {
      const result = await configService.getSystemHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('database');
      expect(result.database).toHaveProperty('status');

      // Verify uptime is a number
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);

      // Verify timestamp is a Date
      expect(result.timestamp).toBeInstanceOf(Date);

      // Verify database status is either connected or disconnected
      expect(['connected', 'disconnected']).toContain(result.database.status);
    });
  });
});
