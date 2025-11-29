import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceToken extends Document {
  userId: mongoose.Types.ObjectId;
  fcmToken: string;
  deviceId?: string;
  deviceType: 'ios' | 'android';
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deviceTokenSchema = new Schema<IDeviceToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fcmToken: {
      type: String,
      required: true,
      unique: true,
    },
    deviceId: {
      type: String,
    },
    deviceType: {
      type: String,
      enum: ['ios', 'android'],
      required: true,
    },
    deviceModel: {
      type: String,
    },
    osVersion: {
      type: String,
    },
    appVersion: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Transform JSON output
deviceTokenSchema.set('toJSON', {
  transform: (doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = ret as any;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

const DeviceToken = mongoose.model<IDeviceToken>(
  'DeviceToken',
  deviceTokenSchema
);

export default DeviceToken;
