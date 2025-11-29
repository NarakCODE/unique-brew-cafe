import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  deliveryInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  distanceFrom(latitude: number, longitude: number): number | null;
}

const addressSchemaDefinition = {
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  label: {
    type: String,
    required: [true, 'Address label is required'],
    trim: true,
    maxlength: [50, 'Label cannot exceed 50 characters'],
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function (v: string) {
        // E.164 format validation
        const cleaned = v.replace(/[\s-]/g, '');
        return /^\+?[1-9]\d{1,14}$/.test(cleaned);
      },
      message:
        'Invalid phone number format. Use international format (e.g., +1234567890)',
    },
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  postalCode: {
    type: String,
    trim: true,
    validate: {
      validator: function (v: string) {
        // Allow empty or validate format (alphanumeric with optional spaces/hyphens)
        if (!v) return true;
        return /^[A-Za-z0-9\s-]{3,10}$/.test(v);
      },
      message: 'Invalid postal code format',
    },
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'Cambodia',
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  deliveryInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Delivery instructions cannot exceed 500 characters'],
  },
} as const;

const addressSchema = new Schema<IAddress>(
  addressSchemaDefinition as unknown as mongoose.SchemaDefinition<IAddress>,
  {
    timestamps: true,
  }
);

// Ensure only one default address per user
addressSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Unset other default addresses for this user
    await Address.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Instance method to calculate distance from a point
addressSchema.methods.distanceFrom = function (
  latitude: number,
  longitude: number
): number | null {
  if (!this.latitude || !this.longitude) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((latitude - this.latitude) * Math.PI) / 180;
  const dLng = ((longitude - this.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.latitude * Math.PI) / 180) *
      Math.cos((latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

// Virtual for formatted full address
addressSchema.virtual('fullAddress').get(function () {
  const parts: (string | undefined)[] = [
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.state,
    this.postalCode,
    this.country,
  ];

  return parts.filter(Boolean).join(', ');
});

// Compound index for user addresses
addressSchema.index({ userId: 1, createdAt: -1 });

// Prevent duplicate labels per user
addressSchema.index({ userId: 1, label: 1 }, { unique: true });

// Transform to JSON with consistent format
addressSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    const transformed = ret as unknown as Record<string, unknown>;
    transformed.id = (transformed._id as mongoose.Types.ObjectId)?.toString?.();
    delete transformed._id;
    delete transformed.__v;
    return transformed;
  },
});

export const Address = mongoose.model<IAddress>('Address', addressSchema);
