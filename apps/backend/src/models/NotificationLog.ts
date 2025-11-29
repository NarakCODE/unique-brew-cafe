import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLog extends Document {
  adminId: mongoose.Types.ObjectId;
  type: 'individual' | 'broadcast' | 'segment';
  recipientCount: number;
  successCount: number;
  failureCount: number;
  criteria?: Record<string, unknown>;
  title: string;
  message: string;
  createdAt: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['individual', 'broadcast', 'segment'],
      required: true,
    },
    recipientCount: {
      type: Number,
      required: true,
      default: 0,
    },
    successCount: {
      type: Number,
      required: true,
      default: 0,
    },
    failureCount: {
      type: Number,
      required: true,
      default: 0,
    },
    criteria: {
      type: Schema.Types.Mixed,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Transform JSON output
notificationLogSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = (obj._id as mongoose.Types.ObjectId).toString();
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

const NotificationLog = mongoose.model<INotificationLog>(
  'NotificationLog',
  notificationLogSchema
);

export default NotificationLog;
