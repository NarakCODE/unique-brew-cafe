/**
 * Query performance logging middleware
 * Tracks and logs slow database queries for optimization
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

interface QueryLog {
  operation: string;
  collection: string;
  duration: number;
  query: unknown;
  timestamp: Date;
}

const SLOW_QUERY_THRESHOLD = 100; // milliseconds
const queryLogs: QueryLog[] = [];
const MAX_LOGS = 100;

/**
 * Enable query performance monitoring
 */
export function enableQueryPerformanceMonitoring() {
  // Only enable in development or when explicitly configured
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_QUERY_LOGGING === 'true'
  ) {
    mongoose.set(
      'debug',
      (collectionName: string, method: string, ...args: unknown[]) => {
        const query = args[0];
        const startTime = Date.now();

        // Log the query execution
        logger.debug(`MongoDB Query: ${collectionName}.${method}`, {
          collection: collectionName,
          operation: method,
          query,
        });

        // Track query duration (this is a simplified version)
        // In production, you'd use mongoose query middleware for accurate timing
        const duration = Date.now() - startTime;

        if (duration > SLOW_QUERY_THRESHOLD) {
          logger.warn(`Slow query detected: ${collectionName}.${method}`, {
            collection: collectionName,
            operation: method,
            duration: `${duration}ms`,
            query,
          });

          // Store slow query log
          const queryLog: QueryLog = {
            operation: method,
            collection: collectionName,
            duration,
            query,
            timestamp: new Date(),
          };

          queryLogs.push(queryLog);

          // Keep only the last MAX_LOGS entries
          if (queryLogs.length > MAX_LOGS) {
            queryLogs.shift();
          }
        }
      }
    );
  }
}

/**
 * Get slow query logs
 */
export function getSlowQueryLogs(): QueryLog[] {
  return [...queryLogs];
}

/**
 * Clear query logs
 */
export function clearQueryLogs(): void {
  queryLogs.length = 0;
}

/**
 * Get query performance statistics
 */
export function getQueryStats() {
  if (queryLogs.length === 0) {
    return {
      totalQueries: 0,
      averageDuration: 0,
      slowestQuery: null,
    };
  }

  const totalDuration = queryLogs.reduce((sum, log) => sum + log.duration, 0);
  const averageDuration = totalDuration / queryLogs.length;
  const slowestQuery = queryLogs.reduce((slowest, current) =>
    current.duration > slowest.duration ? current : slowest
  );

  return {
    totalQueries: queryLogs.length,
    averageDuration: Math.round(averageDuration),
    slowestQuery: {
      operation: slowestQuery.operation,
      collection: slowestQuery.collection,
      duration: slowestQuery.duration,
      timestamp: slowestQuery.timestamp,
    },
  };
}

/**
 * Mongoose query middleware for accurate performance tracking
 */
export function setupQueryMiddleware() {
  // Pre-query hook to record start time
  mongoose.plugin((schema) => {
    schema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>) {
      (this as unknown as { _startTime: number })._startTime = Date.now();
    });

    schema.post(/^find/, function (this: mongoose.Query<unknown, unknown>) {
      const startTime = (this as unknown as { _startTime: number })._startTime;
      if (startTime) {
        const duration = Date.now() - startTime;

        if (duration > SLOW_QUERY_THRESHOLD) {
          logger.warn('Slow query detected', {
            model: this.model?.modelName,
            operation: (this as unknown as { op?: string }).op || 'find',
            duration: `${duration}ms`,
          });
        }
      }
    });
  });
}
