import { createClient } from 'redis';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

type RedisValue = string | number | Buffer;
type RedisClient = ReturnType<typeof createClient>;

class RedisManager {
  private client: RedisClient | null = null;
  private connectPromise: Promise<RedisClient> | null = null;

  isEnabled(): boolean {
    return config.redisEnabled;
  }

  isConnected(): boolean {
    return !!this.client?.isOpen;
  }

  getKey(key: string): string {
    return `${config.redisKeyPrefix}:${key}`;
  }

  async connect(): Promise<RedisClient | null> {
    if (!this.isEnabled()) {
      logger.info('Redis is disabled. Using local runtime state.');
      return null;
    }

    if (this.client?.isOpen) {
      return this.client;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    const client = createClient({
      url: config.redisUrl,
    });

    client.on('error', (error) => {
      logger.error('Redis client error', error);
    });

    client.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });

    this.connectPromise = client.connect().then(() => {
      this.client = client;
      this.connectPromise = null;
      logger.info('Redis connected');
      return client;
    });

    try {
      return await this.connectPromise;
    } catch (error) {
      this.connectPromise = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    if (this.client.isOpen) {
      await this.client.quit();
      logger.info('Redis disconnected');
    }

    this.client = null;
    this.connectPromise = null;
  }

  async getClient(): Promise<RedisClient> {
    const client = await this.connect();

    if (!client) {
      throw new Error('Redis client requested while Redis is disabled');
    }

    return client;
  }

  async set(
    key: string,
    value: RedisValue,
    ttlSeconds?: number
  ): Promise<void> {
    const client = await this.getClient();
    const namespacedKey = this.getKey(key);

    if (ttlSeconds) {
      await client.set(namespacedKey, value, { EX: ttlSeconds });
      return;
    }

    await client.set(namespacedKey, value);
  }

  async get(key: string): Promise<string | null> {
    const client = await this.getClient();
    return client.get(this.getKey(key));
  }

  async del(key: string): Promise<void> {
    const client = await this.getClient();
    await client.del(this.getKey(key));
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const client = await this.getClient();
    await client.expire(this.getKey(key), ttlSeconds);
  }
}

export const redisManager = new RedisManager();
