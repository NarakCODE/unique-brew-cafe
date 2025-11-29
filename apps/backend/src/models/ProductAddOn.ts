import mongoose, { Document, Schema } from 'mongoose';

export interface IProductAddOn extends Document {
  productId: mongoose.Types.ObjectId;
  addOnId: mongoose.Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
}

const productAddOnSchema = new Schema<IProductAddOn>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    addOnId: {
      type: Schema.Types.ObjectId,
      ref: 'AddOn',
      required: [true, 'Add-on ID is required'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ✅ Indexes for optimized querying
productAddOnSchema.index({ productId: 1 });
productAddOnSchema.index({ addOnId: 1 });
productAddOnSchema.index({ productId: 1, addOnId: 1 }, { unique: true });

// ✅ Transform output
productAddOnSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ProductAddOn = mongoose.model<IProductAddOn>(
  'ProductAddOn',
  productAddOnSchema
);
