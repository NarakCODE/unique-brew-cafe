import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCodeUsage extends Document {
  promoCodeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  discountAmount: number;
  usedAt: Date;
  createdAt: Date;
}

const promoCodeUsageSchema = new Schema<IPromoCodeUsage>(
  {
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'PromoCode',
      required: [true, 'Promo code ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      index: true,
    },
    discountAmount: {
      type: Number,
      required: [true, 'Discount amount is required'],
      min: [0, 'Discount amount cannot be negative'],
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
promoCodeUsageSchema.index({ promoCodeId: 1, userId: 1 });
promoCodeUsageSchema.index({ userId: 1, usedAt: -1 });

// Transform to JSON
promoCodeUsageSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const PromoCodeUsage = mongoose.model<IPromoCodeUsage>(
  'PromoCodeUsage',
  promoCodeUsageSchema
);
