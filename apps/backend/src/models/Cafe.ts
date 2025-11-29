import mongoose, { Document, Schema } from 'mongoose';

export interface IOperatingHours {
  open: string;
  close: string;
}

export interface ISpecialHours {
  date: string;
  open: string;
  close: string;
}

export interface IFeatures {
  parking: boolean;
  wifi: boolean;
  outdoorSeating: boolean;
  driveThrough: boolean;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export interface ICafe extends Document {
  name: string;
  slug: string;
  description?: string;
  address: IAddress;
  coordinates: ICoordinates;
  phone: string;
  email?: string;
  imageUrl?: string;
  operatingHours: {
    monday: IOperatingHours;
    tuesday: IOperatingHours;
    wednesday: IOperatingHours;
    thursday: IOperatingHours;
    friday: IOperatingHours;
    saturday: IOperatingHours;
    sunday: IOperatingHours;
  };
  specialHours?: ISpecialHours[];
  isOpen: boolean;
  isActive: boolean;
  averagePrepTime: number;
  rating?: number;
  totalReviews: number;
  features: IFeatures;
  managerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isOpenNow(): boolean;
  getPickupTimes(date?: Date): string[];
}

const operatingHoursSchema = new Schema<IOperatingHours>(
  {
    open: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: 'Time must be in HH:MM format (24-hour)',
      },
    },
    close: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: 'Time must be in HH:MM format (24-hour)',
      },
    },
  },
  { _id: false }
);

const specialHoursSchema = new Schema<ISpecialHours>(
  {
    date: {
      type: String,
      required: true,
    },
    open: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: 'Time must be in HH:MM format (24-hour)',
      },
    },
    close: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: 'Time must be in HH:MM format (24-hour)',
      },
    },
  },
  { _id: false }
);

const addressSchema = new Schema<IAddress>(
  {
    street: {
      type: String,
      required: [true, 'Street address is required'],
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
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
  },
  { _id: false }
);

const coordinatesSchema = new Schema<ICoordinates>(
  {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
  },
  { _id: false }
);

const featuresSchema = new Schema<IFeatures>(
  {
    parking: {
      type: Boolean,
      default: false,
    },
    wifi: {
      type: Boolean,
      default: false,
    },
    outdoorSeating: {
      type: Boolean,
      default: false,
    },
    driveThrough: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const cafeSchema = new Schema<ICafe>(
  {
    name: {
      type: String,
      required: [true, 'Cafe name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: addressSchema,
      required: [true, 'Address is required'],
    },
    coordinates: {
      type: coordinatesSchema,
      required: [true, 'Coordinates are required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    operatingHours: {
      monday: operatingHoursSchema,
      tuesday: operatingHoursSchema,
      wednesday: operatingHoursSchema,
      thursday: operatingHoursSchema,
      friday: operatingHoursSchema,
      saturday: operatingHoursSchema,
      sunday: operatingHoursSchema,
    },
    specialHours: [specialHoursSchema],
    isOpen: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    averagePrepTime: {
      type: Number,
      required: [true, 'Average preparation time is required'],
      min: [1, 'Average prep time must be at least 1 minute'],
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
    features: {
      type: featuresSchema,
      default: () => ({}),
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
cafeSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
cafeSchema.index({ slug: 1 });
cafeSchema.index({ isActive: 1 });

// Method to check if cafe is currently open
cafeSchema.methods.isOpenNow = function (): boolean {
  if (!this.isActive || !this.isOpen) {
    return false;
  }

  const now = new Date();
  const currentDay = now
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as keyof typeof this.operatingHours;
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  // Check for special hours first
  if (this.specialHours && this.specialHours.length > 0) {
    const todayDate = now.toISOString().split('T')[0];
    const specialHour = this.specialHours.find(
      (sh: ISpecialHours) => sh.date === todayDate
    );

    if (specialHour) {
      return currentTime >= specialHour.open && currentTime < specialHour.close;
    }
  }

  // Check regular operating hours
  const hours = this.operatingHours[currentDay];
  if (!hours) {
    return false;
  }

  return currentTime >= hours.open && currentTime < hours.close;
};

// Method to generate available pickup time slots
cafeSchema.methods.getPickupTimes = function (date?: Date): string[] {
  const targetDate = date || new Date();
  const pickupTimes: string[] = [];

  // Get the day of week for the target date
  const dayOfWeek = targetDate
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as keyof typeof this.operatingHours;

  // Check for special hours
  let openTime: string;
  let closeTime: string;

  const targetDateStr = targetDate.toISOString().split('T')[0];
  const specialHour = this.specialHours?.find(
    (sh: ISpecialHours) => sh.date === targetDateStr
  );

  if (specialHour) {
    openTime = specialHour.open;
    closeTime = specialHour.close;
  } else {
    const hours = this.operatingHours[dayOfWeek];
    if (!hours) {
      return [];
    }
    openTime = hours.open;
    closeTime = hours.close;
  }

  // Parse open and close times
  const openParts = openTime.split(':').map(Number);
  const closeParts = closeTime.split(':').map(Number);
  const openHour = openParts[0] ?? 0;
  const openMinute = openParts[1] ?? 0;
  const closeHour = closeParts[0] ?? 0;
  const closeMinute = closeParts[1] ?? 0;

  // Create date objects for comparison
  const openDateTime = new Date(targetDate);
  openDateTime.setHours(openHour, openMinute, 0, 0);

  const closeDateTime = new Date(targetDate);
  closeDateTime.setHours(closeHour, closeMinute, 0, 0);

  // Start time is either opening time or 15 minutes from now, whichever is later
  const now = new Date();
  const minimumTime = new Date(now.getTime() + 15 * 60 * 1000);

  let currentSlot = new Date(openDateTime);

  // If target date is today, start from minimum time
  if (targetDate.toDateString() === now.toDateString()) {
    if (minimumTime > openDateTime) {
      // Round up to next 15-minute interval
      const minutes = minimumTime.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 15) * 15;
      currentSlot = new Date(minimumTime);
      currentSlot.setMinutes(roundedMinutes, 0, 0);
    }
  }

  // Generate 15-minute intervals
  while (currentSlot < closeDateTime) {
    if (currentSlot >= openDateTime) {
      const timeStr = currentSlot.toTimeString().slice(0, 5);
      pickupTimes.push(timeStr);
    }
    currentSlot = new Date(currentSlot.getTime() + 15 * 60 * 1000);
  }

  return pickupTimes;
};

// Transform to exclude __v from JSON responses
cafeSchema.set('toJSON', {
  transform: function (_doc, ret) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as any;
    delete obj.__v;
    return obj;
  },
});

export const Cafe = mongoose.model<ICafe>('Cafe', cafeSchema);
