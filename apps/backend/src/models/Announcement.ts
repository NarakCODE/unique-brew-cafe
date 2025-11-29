import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  actionType: 'promo_code' | 'deep_link' | 'external_url' | 'none';
  actionValue?: string;
  priority: number;
  targetAudience: 'all' | 'new_users' | 'loyal_users' | 'specific_tier';
  userTierFilter?: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    actionType: {
      type: String,
      enum: ['promo_code', 'deep_link', 'external_url', 'none'],
      default: 'none',
    },
    actionValue: {
      type: String,
    },
    priority: {
      type: Number,
      default: 0,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'new_users', 'loyal_users', 'specific_tier'],
      default: 'all',
    },
    userTierFilter: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
announcementSchema.index({ priority: -1 });

// Transform JSON output
announcementSchema.set('toJSON', {
  transform: (doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as any;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

const Announcement = mongoose.model<IAnnouncement>(
  'Announcement',
  announcementSchema
);

export default Announcement;
