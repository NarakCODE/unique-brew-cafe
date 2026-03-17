import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8081,
  mongoUri:
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    'mongodb://localhost:27017/myapp',
  nodeEnv: process.env.NODE_ENV || 'development',

  brevoApiKey: process.env.BREVO_API_KEY || '',
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || '',
  brevoSenderName: process.env.BREVO_SENDER_NAME || '',
  brevoPartnerKey: process.env.BREVO_PARTNER_KEY || '',

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',

  bakongApiBaseUrl:
    process.env.BAKONG_API_BASE_URL || 'https://api-bakong.nbc.gov.kh',
  bakongApiEmail: process.env.BAKONG_API_EMAIL || '',
  bakongMerchantAccountId: process.env.BAKONG_MERCHANT_ACCOUNT_ID || '',
  bakongMerchantName: process.env.BAKONG_MERCHANT_NAME || '',
  bakongMerchantCity: process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh',
  bakongMerchantId: process.env.BAKONG_MERCHANT_ID || '',
  bakongAcquiringBank: process.env.BAKONG_ACQUIRING_BANK || '',
};
