import mongoose, { Schema, type Document } from 'mongoose';

export interface IDeliveryZone extends Document {
  name: string;
  coordinates?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon',
      },
      coordinates: {
        type: [[[Number]]], // Array of arrays of arrays of numbers
      },
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedDeliveryTime: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for geospatial queries if coordinates are provided
deliveryZoneSchema.index({ coordinates: '2dsphere' });

export const DeliveryZone = mongoose.model<IDeliveryZone>(
  'DeliveryZone',
  deliveryZoneSchema
);
