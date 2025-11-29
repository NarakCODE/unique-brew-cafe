import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  userId?: mongoose.Types.ObjectId;
  email: string;
  otpCode: string;
  verificationType: 'registration' | 'password_reset' | 'email_verification';
  verified: boolean;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  verifiedAt?: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    otpCode: {
      type: String,
      required: [true, 'OTP code is required'],
    },
    verificationType: {
      type: String,
      enum: ['registration', 'password_reset', 'email_verification'],
      required: [true, 'Verification type is required'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: { expires: 0 }, // TTL index for auto-deletion
    },
    verifiedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
otpSchema.index({ email: 1, verificationType: 1 });

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
