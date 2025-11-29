import {
  brevoEmailApi,
  getDefaultSender,
  isBrevoConfigured,
  SendSmtpEmail,
} from '../config/brevo.js';

interface SendOtpEmailParams {
  email: string;
  otpCode: string;
  userName?: string | undefined;
}

interface SendWelcomeEmailParams {
  email: string;
  userName: string;
}

interface SendPasswordResetEmailParams {
  email: string;
  otpCode: string;
  userName?: string | undefined;
}

/**
 * Send OTP email via Brevo
 * @param params - Email parameters
 */
export const sendOtpEmail = async (
  params: SendOtpEmailParams
): Promise<void> => {
  const { email, otpCode, userName } = params;

  if (!isBrevoConfigured()) {
    console.warn('Brevo not configured. OTP email not sent.');
    console.log(`[DEV MODE] OTP Code for ${email}: ${otpCode}`);
    return;
  }

  try {
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.sender = getDefaultSender();
    sendSmtpEmail.to = [{ email, name: userName || email }];
    sendSmtpEmail.subject = 'Your Verification Code';
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h2>Verification Code</h2>
          <p>Hello ${userName || 'there'},</p>
          <p>Your verification code is: <strong>${otpCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <br>
          <p>Best regards,<br>Coffee Pickup Team</p>
        </body>
      </html>
    `;

    await brevoEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    console.log(`[FALLBACK] OTP Code for ${email}: ${otpCode}`);
  }
};

/**
 * Send welcome email after successful registration
 * @param params - Email parameters
 */
export const sendWelcomeEmail = async (
  params: SendWelcomeEmailParams
): Promise<void> => {
  const { email, userName } = params;

  if (!isBrevoConfigured()) {
    console.warn('Brevo not configured. Welcome email not sent.');
    return;
  }

  try {
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.sender = getDefaultSender();
    sendSmtpEmail.to = [{ email, name: userName }];
    sendSmtpEmail.subject = 'Welcome to Coffee Pickup!';
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h2>Welcome to Coffee Pickup!</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for registering with Coffee Pickup. We're excited to have you!</p>
          <p>You can now browse our menu, customize your orders, and schedule pickups at your convenience.</p>
          <br>
          <p>Best regards,<br>Coffee Pickup Team</p>
        </body>
      </html>
    `;

    await brevoEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`Welcome email sent successfully to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

/**
 * Send password reset email with OTP
 * @param params - Email parameters
 */
export const sendPasswordResetEmail = async (
  params: SendPasswordResetEmailParams
): Promise<void> => {
  const { email, otpCode, userName } = params;

  if (!isBrevoConfigured()) {
    console.warn('Brevo not configured. Password reset email not sent.');
    console.log(`[DEV MODE] Password Reset OTP for ${email}: ${otpCode}`);
    return;
  }

  try {
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.sender = getDefaultSender();
    sendSmtpEmail.to = [{ email, name: userName || email }];
    sendSmtpEmail.subject = 'Password Reset Code';
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h2>Password Reset Request</h2>
          <p>Hello ${userName || 'there'},</p>
          <p>You requested to reset your password. Your verification code is: <strong>${otpCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          <br>
          <p>Best regards,<br>Coffee Pickup Team</p>
        </body>
      </html>
    `;

    await brevoEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`Password reset email sent successfully to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    console.log(`[FALLBACK] Password Reset OTP for ${email}: ${otpCode}`);
  }
};
