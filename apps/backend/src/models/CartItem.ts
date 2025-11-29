import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomization {
  size?: string;
  sugarLevel?: string;
  iceLevel?: string;
  coffeeLevel?: string;
}

export interface ICartItem extends Document {
  cartId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  customization?: ICustomization;
  addOns?: mongoose.Types.ObjectId[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
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

const cartItemSchema = new Schema<ICartItem>(
  {
    cartId: {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
      required: [true, 'Cart ID is required'],
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    customization: {
      type: customizationSchema,
    },
    addOns: {
      type: [Schema.Types.ObjectId],
      ref: 'AddOn',
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

// Index for efficient cart item queries
cartItemSchema.index({ cartId: 1, productId: 1 });

// Transform to JSON
cartItemSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CartItem = mongoose.model<ICartItem>('CartItem', cartItemSchema);
