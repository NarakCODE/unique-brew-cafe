import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  profileImage?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  emailVerified: boolean;
  phoneVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  referralCode: string;
  referredBy?: string;
  totalOrders: number;
  totalSpent: number;
  preferences: {
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    language: 'en' | 'km';
    currency: 'USD' | 'KHR';
    notifications?: {
      orderUpdates?: boolean | undefined;
      promotions?: boolean | undefined;
      announcements?: boolean | undefined;
      systemNotifications?: boolean | undefined;
    };
  };
  status: 'active' | 'suspended' | 'deleted';
  lastLoginAt?: Date;
  lastLogoutAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateReferralCode(): string;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    loyaltyTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: String,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    preferences: {
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        enum: ['en', 'km'],
        default: 'en',
      },
      currency: {
        type: String,
        enum: ['USD', 'KHR'],
        default: 'USD',
      },
      notifications: {
        orderUpdates: {
          type: Boolean,
          default: true,
        },
        promotions: {
          type: Boolean,
          default: true,
        },
        announcements: {
          type: Boolean,
          default: true,
        },
        systemNotifications: {
          type: Boolean,
          default: true,
        },
      },
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
    lastLoginAt: {
      type: Date,
    },
    lastLogoutAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique referral code before saving
userSchema.pre('save', async function (next) {
  // Generate referral code if not exists
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate unique referral code
userSchema.methods.generateReferralCode = function (): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF${timestamp}${randomStr}`.substring(0, 12);
};

// Transform to exclude password from JSON responses
userSchema.set('toJSON', {
  transform: function (_doc, ret) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as any;
    delete obj.password;
    delete obj.__v;
    return obj;
  },
});

// Indexes (email and referralCode already have unique indexes)
userSchema.index({ status: 1 });
userSchema.index({ createdAt: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
