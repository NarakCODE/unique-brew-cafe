import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';
import dotenv from "dotenv";
dotenv.config();

// Initialize the Transactional Email API with authentication
const brevoEmailApi = new TransactionalEmailsApi();

// Set API key authentication
if (process.env.BREVO_API_KEY) {
  brevoEmailApi.setApiKey(
    0, // apiKey enum value
    process.env.BREVO_API_KEY
  );
}

export { brevoEmailApi };

// Reusable sender configuration
export const getDefaultSender = () => ({
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@yourdomain.com',
  name: process.env.BREVO_SENDER_NAME || 'Coffee Pickup App',
});

// Check if Brevo is configured
export const isBrevoConfigured = (): boolean => {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
};

// Export SendSmtpEmail for type usage
export { SendSmtpEmail };
