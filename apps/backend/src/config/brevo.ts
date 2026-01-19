import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the Transactional Email API with authentication
const brevoEmailApi = new TransactionalEmailsApi();

// Set API key authentication (modern method)
if (process.env.BREVO_API_KEY) {
  try {
    // Use type assertion to access protected property
    const authApi = brevoEmailApi as any;
    if (authApi.authentications && authApi.authentications['apiKey']) {
      authApi.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;
    } else {
      // Fallback: create the authentication object if it doesn't exist
      authApi.authentications = {
        apiKey: { apiKey: process.env.BREVO_API_KEY },
      };
    }

    console.log('✅ Brevo API configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Brevo API:', error);
    console.error(
      'BREVO_API_KEY length:',
      process.env.BREVO_API_KEY?.length || 0
    );
  }
} else {
  console.warn('⚠️ BREVO_API_KEY not found in environment variables');
}

export { brevoEmailApi };

// Reusable sender configuration
export const getDefaultSender = () => {
  const sender = {
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@yourdomain.com',
    name: process.env.BREVO_SENDER_NAME || 'Coffee Pickup App',
  };

  console.log('📧 Using sender:', {
    ...sender,
    email: sender.email.replace(/(.{3}).*@/, '$1***@'),
  });
  return sender;
};

// Check if Brevo is configured
export const isBrevoConfigured = (): boolean => {
  const isConfigured = !!(
    process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL
  );

  if (!isConfigured) {
    console.warn('⚠️ Brevo is NOT configured. Missing:', {
      hasApiKey: !!process.env.BREVO_API_KEY,
      hasSenderEmail: !!process.env.BREVO_SENDER_EMAIL,
    });
  }

  return isConfigured;
};

// Export SendSmtpEmail for type usage
export { SendSmtpEmail };
