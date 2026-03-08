import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const requireEnv = (key: string): string => {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: getEnv('PORT') || 8081,
  mongoUri: getEnv('MONGODB_URI') || getEnv('DATABASE_URL') || '',
  nodeEnv: getEnv('NODE_ENV') || 'development',
  jwtSecret: getEnv('JWT_SECRET') || '',
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN') || '24h',
  jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET') || '',
  jwtRefreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN') || '7d',

  brevoApiKey: getEnv('BREVO_API_KEY') || '',
  brevoSenderEmail: getEnv('BREVO_SENDER_EMAIL') || '',
  brevoSenderName: getEnv('BREVO_SENDER_NAME') || '',
  brevoPartnerKey: getEnv('BREVO_PARTNER_KEY') || '',

  cloudinaryCloudName: getEnv('CLOUDINARY_CLOUD_NAME') || '',
  cloudinaryApiKey: getEnv('CLOUDINARY_API_KEY') || '',
  cloudinaryApiSecret: getEnv('CLOUDINARY_API_SECRET') || '',
  corsOrigin: getEnv('CORS_ORIGIN') || '',
  diagnosticsEnabled: getEnv('ENABLE_DIAGNOSTICS') === 'true',
  diagnosticsToken: getEnv('DIAGNOSTICS_TOKEN') || '',
  redisEnabled: getEnv('REDIS_ENABLED') === 'true',
  redisUrl: getEnv('REDIS_URL') || '',
  redisKeyPrefix: getEnv('REDIS_KEY_PREFIX') || 'slide',
};

export const validateRuntimeConfig = (): void => {
  const requiredForAllEnvironments = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

  requiredForAllEnvironments.forEach(requireEnv);

  if (config.nodeEnv === 'production' && !config.mongoUri) {
    throw new Error(
      'Missing required environment variable: MONGODB_URI or DATABASE_URL'
    );
  }

  if (config.nodeEnv === 'production' && !config.corsOrigin) {
    throw new Error('Missing required environment variable: CORS_ORIGIN');
  }

  if (
    config.nodeEnv === 'production' &&
    config.diagnosticsEnabled &&
    !config.diagnosticsToken
  ) {
    throw new Error(
      'Missing required environment variable: DIAGNOSTICS_TOKEN'
    );
  }

  if (config.redisEnabled && !config.redisUrl) {
    throw new Error('Missing required environment variable: REDIS_URL');
  }
};
