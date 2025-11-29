import mongoose, { Document, Schema } from 'mongoose';

export interface IOpeningHours {
  open: string;
  close: string;
}

export interface ISpecialHour {
  date: Date;
  open: string;
  close: string;
  reason?: string;
}

export interface IStoreFeatures {
  parking: boolean;
  wifi: boolean;
  outdoorSeating: boolean;
  driveThrough: boolean;
}

export interface IStore extends Document {
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  images: string[]; // Gallery images
  openingHours: Record<
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday',
    IOpeningHours | undefined
  >;
  specialHours?: ISpecialHour[];
  isOpen: boolean;
  isActive: boolean;
  averagePrepTime: number;
  rating?: number;
  totalReviews: number;
  features: IStoreFeatures;
  managerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  isOpenNow(): boolean;
  getPickupTimes(date?: Date): string[];
}

const storeSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Store slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, required: [true, 'State is required'], trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: 'Cambodia', trim: true },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: { type: String, trim: true, lowercase: true },
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
    imageUrl: { type: String, trim: true },
    images: {
      type: [String],
      default: [],
    },
    openingHours: {
      type: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String },
      },
      required: [true, 'Opening hours are required'],
    },
    specialHours: [
      {
        date: { type: Date, required: true },
        open: { type: String, required: true },
        close: { type: String, required: true },
        reason: String,
      },
    ],
    isOpen: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    averagePrepTime: {
      type: Number,
      default: 15,
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
      type: {
        parking: { type: Boolean, default: false },
        wifi: { type: Boolean, default: false },
        outdoorSeating: { type: Boolean, default: false },
        driveThrough: { type: Boolean, default: false },
      },
      default: {
        parking: false,
        wifi: false,
        outdoorSeating: false,
        driveThrough: false,
      },
    },
    managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ✅ Type-safe helper to parse time "HH:mm"
const parseTimeToMinutes = (time: string): number => {
  const [hourStr, minStr] = time.split(':');
  const hour = Number(hourStr);
  const min = Number(minStr);
  if (isNaN(hour) || isNaN(min)) return 0;
  return hour * 60 + min;
};

// ✅ Check if store is currently open
storeSchema.methods.isOpenNow = function (): boolean {
  const now = new Date();
  const dayOfWeek = now
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as keyof IStore['openingHours'];

  const currentTime = now.getHours() * 60 + now.getMinutes();

  // 1️⃣ Check special hours first
  const todaySpecial = this.specialHours?.find((sh: ISpecialHour) => {
    const specialDate = new Date(sh.date);
    return (
      specialDate.getDate() === now.getDate() &&
      specialDate.getMonth() === now.getMonth() &&
      specialDate.getFullYear() === now.getFullYear()
    );
  });

  if (todaySpecial) {
    const openTime = parseTimeToMinutes(todaySpecial.open);
    const closeTime = parseTimeToMinutes(todaySpecial.close);
    return currentTime >= openTime && currentTime < closeTime;
  }

  // 2️⃣ Check regular hours
  const todayHours = this.openingHours[dayOfWeek];
  if (!todayHours?.open || !todayHours?.close) return false;

  const openTime = parseTimeToMinutes(todayHours.open);
  const closeTime = parseTimeToMinutes(todayHours.close);
  return currentTime >= openTime && currentTime < closeTime;
};

// ✅ Generate available pickup time slots
storeSchema.methods.getPickupTimes = function (date?: Date): string[] {
  const targetDate = date || new Date();
  const dayOfWeek = targetDate
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as keyof IStore['openingHours'];

  const todayHours = this.openingHours[dayOfWeek];
  const now = new Date();

  let openTimeStr: string | undefined;
  let closeTimeStr: string | undefined;

  // Prefer special hours if available
  const specialHour = this.specialHours?.find((sh: ISpecialHour) => {
    const d = new Date(sh.date);
    return (
      d.getDate() === targetDate.getDate() &&
      d.getMonth() === targetDate.getMonth() &&
      d.getFullYear() === targetDate.getFullYear()
    );
  });

  if (specialHour) {
    openTimeStr = specialHour.open;
    closeTimeStr = specialHour.close;
  } else {
    openTimeStr = todayHours?.open;
    closeTimeStr = todayHours?.close;
  }

  // Guard: missing hours
  if (!openTimeStr || !closeTimeStr) return [];

  const openMinutes = parseTimeToMinutes(openTimeStr);
  const closeMinutes = parseTimeToMinutes(closeTimeStr);

  const isToday =
    targetDate.getDate() === now.getDate() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getFullYear() === now.getFullYear();

  // Start time: opening or now + 15 minutes
  let startMinutes = openMinutes;
  if (isToday) {
    const nowPlus15 = now.getHours() * 60 + now.getMinutes() + 15;
    startMinutes = Math.max(startMinutes, nowPlus15);
  }

  const slots: string[] = [];
  for (let minutes = startMinutes; minutes < closeMinutes; minutes += 15) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    slots.push(
      `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
    );
  }

  return slots;
};

// Text index for search functionality
storeSchema.index({ name: 'text', description: 'text' });

storeSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete (ret as Record<string, unknown>)._id;
    delete (ret as Record<string, unknown>).__v;
    return ret;
  },
});

export const Store = mongoose.model<IStore>('Store', storeSchema);
