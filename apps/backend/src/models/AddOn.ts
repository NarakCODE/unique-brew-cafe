import mongoose, { Document, Schema } from 'mongoose';

export interface IAddOn extends Document {
  name: string;
  description?: string;
  price: number;
  category: 'syrup' | 'topping' | 'extra_shot' | 'dessert';
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const addOnSchema = new Schema<IAddOn>(
  {
    name: {
      type: String,
      required: [true, 'Add-on name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Add-on price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      enum: {
        values: ['syrup', 'topping', 'extra_shot', 'dessert'],
        message: '{VALUE} is not a valid add-on category',
      },
      required: [true, 'Add-on category is required'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Indexes for optimized querying
addOnSchema.index({ isAvailable: 1 });
addOnSchema.index({ category: 1 });
addOnSchema.index({ category: 1, isAvailable: 1 });
addOnSchema.index({ deletedAt: 1 });

// ✅ Transform output
addOnSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const AddOn = mongoose.model<IAddOn>('AddOn', addOnSchema);
