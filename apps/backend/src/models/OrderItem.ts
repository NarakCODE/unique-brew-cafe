import mongoose, { Document, Schema } from 'mongoose';
import type { ICustomization } from './CartItem.js';

export interface IAddOnSnapshot {
  id: string;
  name: string;
  price: number;
}

export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  customization?: ICustomization;
  addOns?: IAddOnSnapshot[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

const addOnSnapshotSchema = new Schema<IAddOnSnapshot>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const customizationSchema = new Schema<ICustomization>(
  {
    size: { type: String },
    sugarLevel: { type: String },
    iceLevel: { type: String },
    coffeeLevel: { type: String },
  },
  { _id: false }
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    productImage: {
      type: String,
      required: [true, 'Product image is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    customization: {
      type: customizationSchema,
    },
    addOns: {
      type: [addOnSnapshotSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Transform to JSON
orderItemSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const OrderItem = mongoose.model<IOrderItem>(
  'OrderItem',
  orderItemSchema
);
