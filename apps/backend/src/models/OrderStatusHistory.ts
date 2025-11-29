import mongoose, { Document, Schema } from 'mongoose';
import type { OrderStatus } from './Order.js';

export interface IOrderStatusHistory extends Document {
  orderId: mongoose.Types.ObjectId;
  status: OrderStatus;
  notes?: string;
  changedBy: 'system' | 'customer' | 'store' | 'admin';
  createdAt: Date;
}

const orderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      index: true,
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
      required: [true, 'Status is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    changedBy: {
      type: String,
      enum: ['system', 'customer', 'store', 'admin'],
      required: [true, 'Changed by is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for efficient queries
orderStatusHistorySchema.index({ orderId: 1, createdAt: -1 });

// Transform to JSON
orderStatusHistorySchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const OrderStatusHistory = mongoose.model<IOrderStatusHistory>(
  'OrderStatusHistory',
  orderStatusHistorySchema
);
