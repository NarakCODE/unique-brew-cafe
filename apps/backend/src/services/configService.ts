import { AppConfig } from '../models/AppConfig.js';
import { DeliveryZone, type IDeliveryZone } from '../models/DeliveryZone.js';
import { NotFoundError } from '../utils/AppError.js';
import mongoose from 'mongoose';

export const configService = {
  /**
   * Get all public configuration
   */
  async getPublicConfig() {
    const configs = await AppConfig.find({ isPublic: true });
    return configs.reduce(
      (acc, config) => {
        acc[config.configKey] = config.configValue;
        return acc;
      },
      {} as Record<string, unknown>
    );
  },

  /**
   * Get all configuration (Admin)
   */
  async getAllConfig() {
    return await AppConfig.find().sort({ configKey: 1 });
  },

  /**
   * Update or create a configuration
   */
  async updateConfig(
    key: string,
    value: unknown,
    description?: string,
    isPublic?: boolean,
    type?: 'string' | 'number' | 'boolean' | 'json'
  ) {
    const config = await AppConfig.findOneAndUpdate(
      { configKey: key },
      {
        configValue: value,
        ...(description && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(type && { type }),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return config;
  },

  /**
   * Get active delivery zones
   */
  async getDeliveryZones(onlyActive = true) {
    const query = onlyActive ? { isActive: true } : {};
    return await DeliveryZone.find(query).sort({ name: 1 });
  },

  /**
   * Create delivery zone
   */
  async createDeliveryZone(data: Partial<IDeliveryZone>) {
    return await DeliveryZone.create(data);
  },

  /**
   * Update delivery zone
   */
  async updateDeliveryZone(id: string, data: Partial<IDeliveryZone>) {
    const zone = await DeliveryZone.findByIdAndUpdate(id, data, { new: true });
    if (!zone) {
      throw new NotFoundError('Delivery zone not found');
    }
    return zone;
  },

  /**
   * Delete delivery zone
   */
  async deleteDeliveryZone(id: string) {
    const zone = await DeliveryZone.findByIdAndDelete(id);
    if (!zone) {
      throw new NotFoundError('Delivery zone not found');
    }
    return zone;
  },

  /**
   * Get system health
   */
  async getSystemHealth() {
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: {
        status: dbStatus,
      },
    };
  },
};
