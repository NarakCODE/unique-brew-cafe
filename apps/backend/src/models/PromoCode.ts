import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableStores?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const promoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: [true, 'Promo code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minOrderAmount: {
      type: Number,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, 'Maximum discount amount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      min: [1, 'Usage limit must be at least 1'],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative'],
    },
    userUsageLimit: {
      type: Number,
      min: [1, 'User usage limit must be at least 1'],
    },
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required'],
    },
    validUntil: {
      type: Date,
      required: [true, 'Valid until date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    applicableStores: {
      type: [Schema.Types.ObjectId],
      ref: 'Store',
      default: [],
    },
    applicableCategories: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Validate that validUntil is after validFrom
promoCodeSchema.pre('save', function (next) {
  if (this.validUntil <= this.validFrom) {
    next(new Error('Valid until date must be after valid from date'));
  }
  next();
});

// Transform to JSON
promoCodeSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const PromoCode = mongoose.model<IPromoCode>(
  'PromoCode',
  promoCodeSchema
);
