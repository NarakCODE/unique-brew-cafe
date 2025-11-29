import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentProviderTransactionId?: string;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  promoCodeId?: mongoose.Types.ObjectId;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  deliveryAddress?: string;
  pickupTime?: Date;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  pickedUpAt?: Date;
  notes?: string;
  internalNotes?: string;
  assignedDriverId?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'store' | 'system' | 'admin';
  refundAmount?: number;
  refundStatus?: RefundStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
    },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'confirmed',
        'preparing',
        'ready',
        'picked_up',
        'completed',
        'cancelled',
      ],
      default: 'pending_payment',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
    },
    paymentProviderTransactionId: {
      type: String,
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'PromoCode',
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
      min: [0, 'Loyalty points used cannot be negative'],
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Loyalty points earned cannot be negative'],
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    pickupTime: {
      type: Date,
    },
    estimatedReadyTime: {
      type: Date,
    },
    actualReadyTime: {
      type: Date,
    },
    pickedUpAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    internalNotes: {
      type: String,
      trim: true,
    },
    assignedDriverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'store', 'system', 'admin'],
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative'],
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Indexes for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

// Transform to JSON
orderSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
