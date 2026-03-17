import mongoose, { Document, Schema } from 'mongoose';
import type { ICustomization } from './CartItem.js';

export type CheckoutSessionStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'completed'
  | 'failed'
  | 'expired';

export type CheckoutPaymentMethod = 'bakong_khqr' | 'cash';

export interface ICheckoutAddOnSnapshot {
  id: string;
  name: string;
  price: number;
}

export interface ICheckoutItemSnapshot {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: ICustomization;
  addOns: ICheckoutAddOnSnapshot[];
  notes?: string;
}

export interface ICheckoutPromoCode {
  code: string;
  discountAmount: number;
}

export interface ICheckoutPaymentData {
  provider: 'bakong';
  qrPayload: string;
  qrImageDataUrl: string;
  md5: string;
  expiresAt: Date;
}

export interface ICheckoutSession extends Document {
  userId: mongoose.Types.ObjectId;
  cartId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  status: CheckoutSessionStatus;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod?: CheckoutPaymentMethod | undefined;
  fulfillmentType: 'pickup' | 'delivery';
  items: ICheckoutItemSnapshot[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  deliveryAddress?: string | undefined;
  notes?: string | undefined;
  promoCode?: ICheckoutPromoCode | undefined;
  orderId?: mongoose.Types.ObjectId | undefined;
  payment?: ICheckoutPaymentData | undefined;
  completedAt?: Date | undefined;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const customizationSchema = new Schema<ICustomization>(
  {
    size: { type: String },
    sugarLevel: { type: String },
    iceLevel: { type: String },
    coffeeLevel: { type: String },
  },
  { _id: false }
);

const addOnSnapshotSchema = new Schema<ICheckoutAddOnSnapshot>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const itemSnapshotSchema = new Schema<ICheckoutItemSnapshot>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    customization: { type: customizationSchema },
    addOns: { type: [addOnSnapshotSchema], default: [] },
    notes: { type: String },
  },
  { _id: false }
);

const promoCodeSchema = new Schema<ICheckoutPromoCode>(
  {
    code: { type: String, required: true },
    discountAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const paymentSchema = new Schema<ICheckoutPaymentData>(
  {
    provider: {
      type: String,
      enum: ['bakong'],
      required: true,
    },
    qrPayload: { type: String, required: true },
    qrImageDataUrl: { type: String, required: true },
    md5: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const checkoutSessionSchema = new Schema<ICheckoutSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cartId: {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'awaiting_payment', 'completed', 'failed', 'expired'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['bakong_khqr', 'cash'],
    },
    fulfillmentType: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: true,
    },
    items: {
      type: [itemSnapshotSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    promoCode: {
      type: promoCodeSchema,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    payment: {
      type: paymentSchema,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

checkoutSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });
checkoutSessionSchema.index({ cartId: 1, createdAt: -1 });

checkoutSessionSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CheckoutSession = mongoose.model<ICheckoutSession>(
  'CheckoutSession',
  checkoutSessionSchema
);
