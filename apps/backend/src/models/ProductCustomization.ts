/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomizationOption {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
}

export interface IProductCustomization extends Document {
  productId: mongoose.Types.ObjectId;
  customizationType: 'size' | 'sugar_level' | 'ice_level' | 'coffee_level';
  options: ICustomizationOption[];
  isRequired: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  calculatePriceModifier(optionId: string): number;
  getDefaultOption(): ICustomizationOption | undefined;
}

const customizationOptionSchema = new Schema(
  {
    id: {
      type: String,
      required: [true, 'Option ID is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Option name is required'],
      trim: true,
    },
    priceModifier: {
      type: Number,
      required: [true, 'Price modifier is required'],
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// ✅ Define schema separately to help TS inference
const productCustomizationSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    customizationType: {
      type: String,
      enum: {
        values: ['size', 'sugar_level', 'ice_level', 'coffee_level'],
        message: '{VALUE} is not a valid customization type',
      },
      required: [true, 'Customization type is required'],
      index: true,
    },
    options: {
      type: [customizationOptionSchema],
      required: [true, 'At least one option is required'],
      validate: {
        validator: function (v: ICustomizationOption[]) {
          if (!Array.isArray(v) || v.length === 0) return false;

          // Must have unique IDs
          const ids = v.map((opt) => opt.id);
          const uniqueIds = new Set(ids);
          if (ids.length !== uniqueIds.size) return false;

          // Check default count
          const defaultCount = v.filter((opt) => opt.isDefault).length;
          if (defaultCount > 1) return false;

          return true;
        },
        message:
          'Options must have unique IDs and proper default configuration',
      },
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, 'Display order cannot be negative'],
    },
  },
  { timestamps: true }
);

// ✅ Schema methods
productCustomizationSchema.methods.calculatePriceModifier = function (
  optionId: string
): number {
  const option = this.options.find((opt: any) => opt.id === optionId);
  return option ? option.priceModifier : 0;
};

productCustomizationSchema.methods.getDefaultOption = function ():
  | ICustomizationOption
  | undefined {
  return this.options.find((opt: any) => opt.isDefault);
};

// ✅ Indexes
productCustomizationSchema.index(
  { productId: 1, customizationType: 1 },
  { unique: true }
);
productCustomizationSchema.index({ displayOrder: 1 });

// ✅ Transform output
productCustomizationSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ProductCustomization = mongoose.model<IProductCustomization>(
  'ProductCustomization',
  productCustomizationSchema
);
