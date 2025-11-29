/**
 * Database Index Optimization Guide
 *
 * This file documents the recommended indexes for optimal query performance.
 * Indexes should be created during database initialization or migration.
 */

import mongoose from 'mongoose';
import { logger } from './logger.js';

/**
 * Recommended indexes for all models
 */
export const RECOMMENDED_INDEXES: Record<
  string,
  Array<{
    fields: Record<string, number | string>;
    options?: Record<string, unknown>;
  }>
> = {
  User: [
    { fields: { email: 1 }, options: { unique: true, sparse: true } },
    { fields: { phoneNumber: 1 }, options: { unique: true } },
    { fields: { role: 1 } },
    { fields: { status: 1 } },
    { fields: { referralCode: 1 }, options: { unique: true } },
    { fields: { createdAt: -1 } },
    { fields: { lastLoginAt: -1 } },
  ],

  Store: [
    { fields: { slug: 1 }, options: { unique: true } },
    { fields: { isActive: 1 } },
    { fields: { city: 1 } },
    { fields: { createdAt: -1 } },
  ],

  Category: [
    { fields: { slug: 1 }, options: { unique: true } },
    { fields: { storeId: 1, displayOrder: 1 } },
    { fields: { isActive: 1 } },
    { fields: { parentCategoryId: 1 } },
  ],

  Product: [
    { fields: { slug: 1 }, options: { unique: true } },
    { fields: { categoryId: 1 } },
    { fields: { isAvailable: 1 } },
    { fields: { isFeatured: 1 } },
    { fields: { isBestSelling: 1 } },
    { fields: { displayOrder: 1 } },
    { fields: { deletedAt: 1 } },
    { fields: { basePrice: 1 } },
    { fields: { tags: 1 } },
    {
      fields: { name: 'text', description: 'text' },
      options: { name: 'product_text_search' },
    },
    { fields: { createdAt: -1 } },
  ],

  Order: [
    { fields: { orderNumber: 1 }, options: { unique: true } },
    { fields: { userId: 1, createdAt: -1 } },
    { fields: { storeId: 1, createdAt: -1 } },
    { fields: { status: 1 } },
    { fields: { paymentStatus: 1 } },
    { fields: { createdAt: -1 } },
    { fields: { userId: 1, status: 1 } },
  ],

  Cart: [
    {
      fields: { userId: 1, status: 1 },
      options: { unique: true, partialFilterExpression: { status: 'active' } },
    },
    { fields: { storeId: 1 } },
    { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },
  ],

  CartItem: [{ fields: { cartId: 1 } }, { fields: { productId: 1 } }],

  OrderItem: [{ fields: { orderId: 1 } }, { fields: { productId: 1 } }],

  OrderStatusHistory: [
    { fields: { orderId: 1, createdAt: -1 } },
    { fields: { status: 1 } },
  ],

  Notification: [
    { fields: { userId: 1, isRead: 1, createdAt: -1 } },
    { fields: { userId: 1, type: 1 } },
    { fields: { createdAt: -1 } },
  ],

  DeviceToken: [
    { fields: { userId: 1 } },
    { fields: { fcmToken: 1 }, options: { unique: true } },
    { fields: { isActive: 1 } },
  ],

  Favorite: [
    { fields: { userId: 1, productId: 1 }, options: { unique: true } },
    { fields: { userId: 1, createdAt: -1 } },
    { fields: { productId: 1 } },
  ],

  SearchHistory: [
    { fields: { userId: 1, createdAt: -1 } },
    { fields: { query: 1 } },
    { fields: { searchType: 1 } },
  ],

  Address: [{ fields: { userId: 1 } }, { fields: { userId: 1, isDefault: 1 } }],

  Announcement: [
    { fields: { isActive: 1, startDate: 1, endDate: 1 } },
    { fields: { priority: -1 } },
    { fields: { targetAudience: 1 } },
  ],

  PromoCode: [
    { fields: { code: 1 }, options: { unique: true } },
    { fields: { isActive: 1, validFrom: 1, validUntil: 1 } },
  ],

  PromoCodeUsage: [
    { fields: { promoCodeId: 1, userId: 1 } },
    { fields: { orderId: 1 } },
  ],

  SupportTicket: [
    { fields: { ticketNumber: 1 }, options: { unique: true } },
    { fields: { userId: 1, status: 1 } },
    { fields: { status: 1, createdAt: -1 } },
    { fields: { category: 1 } },
  ],

  SupportMessage: [
    { fields: { ticketId: 1, createdAt: 1 } },
    { fields: { senderId: 1 } },
  ],

  FAQ: [
    { fields: { category: 1, displayOrder: 1 } },
    { fields: { isActive: 1 } },
  ],

  AppConfig: [
    { fields: { configKey: 1 }, options: { unique: true } },
    { fields: { isActive: 1 } },
  ],

  RefreshToken: [
    { fields: { token: 1 }, options: { unique: true } },
    { fields: { userId: 1 } },
    { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },
  ],

  Otp: [
    { fields: { email: 1, type: 1 } },
    { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },
  ],
};

/**
 * Verify that all recommended indexes exist
 */
export async function verifyIndexes(): Promise<void> {
  logger.info('Verifying database indexes...');

  let totalMissing = 0;

  for (const [modelName, indexes] of Object.entries(RECOMMENDED_INDEXES)) {
    try {
      const model = mongoose.model(modelName);
      const existingIndexes = await model.collection.getIndexes();

      // Count missing indexes
      for (const indexSpec of indexes) {
        const indexName = Object.keys(indexSpec.fields).join('_');
        if (!existingIndexes[indexName] && !existingIndexes[`${indexName}_1`]) {
          totalMissing++;
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error verifying indexes for ${modelName}:`,
          error.message
        );
      } else {
        logger.error(`Error verifying indexes for ${modelName}:`, error);
      }
    } finally {
      // Silently skip models that don't exist
    }
  }

  if (totalMissing > 0) {
    logger.warn(`Found ${totalMissing} missing recommended indexes`);
  } else {
    logger.info('All recommended indexes are present');
  }
}

/**
 * Create missing indexes (use with caution in production)
 */
export async function createMissingIndexes(): Promise<void> {
  logger.info('Creating missing indexes...');

  let created = 0;

  for (const [modelName, indexes] of Object.entries(RECOMMENDED_INDEXES)) {
    try {
      const model = mongoose.model(modelName);

      for (const indexSpec of indexes) {
        try {
          await model.collection.createIndex(
            indexSpec.fields as Record<string, number>,
            (indexSpec.options || {}) as Record<string, unknown>
          );
          created++;
        } catch (error: unknown) {
          if (error instanceof Error) {
            logger.error(
              `Error creating index for ${modelName}:`,
              error.message
            );
          } else {
            logger.error(`Error creating index for ${modelName}:`, error);
          }
        }
      }
    } catch (error: unknown) {
      // Model doesn't exist, skip silently
      if (error instanceof Error) {
        logger.error(`Error creating indexes for ${modelName}:`, error.message);
      } else {
        logger.error(`Error creating indexes for ${modelName}:`, error);
      }
    }
  }

  if (created > 0) {
    logger.info(`Created ${created} missing indexes`);
  } else {
    logger.info('No new indexes created');
  }
}

/**
 * Analyze query performance and suggest indexes
 */
export async function analyzeQueryPerformance(
  modelName: string,
  query: Record<string, unknown>
): Promise<void> {
  try {
    const model = mongoose.model(modelName);
    const explain = await model.find(query).explain('executionStats');

    const stats = (
      explain as unknown as {
        executionStats: {
          executionTimeMillis: number;
          totalDocsExamined: number;
          totalKeysExamined: number;
        };
      }
    ).executionStats;

    logger.info(`Query performance for ${modelName}:`, {
      executionTime: `${stats.executionTimeMillis}ms`,
      docsExamined: stats.totalDocsExamined,
      keysExamined: stats.totalKeysExamined,
      query,
    });

    // Suggest index if query is slow
    if (stats.executionTimeMillis > 100) {
      logger.warn(
        `Slow query detected on ${modelName}. Consider adding an index for:`,
        Object.keys(query)
      );
    }
  } catch (error) {
    logger.error(`Error analyzing query performance:`, error);
  }
}
