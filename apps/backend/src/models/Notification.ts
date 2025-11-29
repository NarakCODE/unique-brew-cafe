import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'order_status' | 'promotion' | 'announcement' | 'system';
  title: string;
  message: string;
  imageUrl?: string;
  actionType?: 'order_details' | 'promotion' | 'external_url' | 'none';
  actionValue?: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['order_status', 'promotion', 'announcement', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    actionType: {
      type: String,
      enum: ['order_details', 'promotion', 'external_url', 'none'],
    },
    actionValue: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Transform JSON output
notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as any;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);

export default Notification;
