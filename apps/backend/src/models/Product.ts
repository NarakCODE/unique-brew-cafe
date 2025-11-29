import mongoose, { Document, Schema } from 'mongoose';
import slugifyLib from 'slugify';

const slugify = slugifyLib.default || slugifyLib;

export interface INutritionalInfo {
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  caffeine?: number;
}

export interface ICustomizationSelection {
  customizationType: string;
  optionId: string;
  priceModifier: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  images: string[];
  basePrice: number;
  currency: 'USD' | 'KHR';
  preparationTime: number;
  calories?: number;
  rating?: number;
  totalReviews: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSelling: boolean;
  allergens: string[];
  tags: string[];
  nutritionalInfo?: INutritionalInfo;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  calculatePriceWithCustomizations(
    customizations: ICustomizationSelection[]
  ): number;
}

// ✅ Extract the nested schema to prevent TS inference overflow
const nutritionalInfoSchema = new Schema<INutritionalInfo>(
  {
    protein: { type: Number, min: [0, 'Protein cannot be negative'] },
    carbohydrates: {
      type: Number,
      min: [0, 'Carbohydrates cannot be negative'],
    },
    fat: { type: Number, min: [0, 'Fat cannot be negative'] },
    caffeine: { type: Number, min: [0, 'Caffeine cannot be negative'] },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one product image is required',
      },
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    currency: {
      type: String,
      enum: ['USD', 'KHR'],
      default: 'USD',
    },
    preparationTime: {
      type: Number,
      default: 5,
      min: [1, 'Preparation time must be at least 1 minute'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating must be between 0 and 5'],
      max: [5, 'Rating must be between 0 and 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSelling: {
      type: Boolean,
      default: false,
    },
    allergens: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    // ✅ Use sub-schema here to prevent type explosion
    nutritionalInfo: {
      type: nutritionalInfoSchema,
      default: undefined,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, 'Display order cannot be negative'],
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Pre-save hook for auto-slug
productSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// ✅ Instance method for dynamic price calculation
productSchema.methods.calculatePriceWithCustomizations = function (
  customizations: ICustomizationSelection[]
): number {
  let totalPrice = this.basePrice;
  for (const customization of customizations) {
    totalPrice += customization.priceModifier;
  }
  return totalPrice;
};

// ✅ Indexes for optimized querying (slug already has unique index)
productSchema.index({ name: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSelling: 1 });
productSchema.index({ createdAt: 1 });
productSchema.index({ deletedAt: 1 });

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

productSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
