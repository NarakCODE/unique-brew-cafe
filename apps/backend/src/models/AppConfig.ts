import mongoose, { Schema, type Document } from 'mongoose';

export interface IAppConfig extends Document {
  configKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configValue: any;
  description?: string;
  isPublic: boolean;
  type: 'string' | 'number' | 'boolean' | 'json';
  createdAt: Date;
  updatedAt: Date;
}

const appConfigSchema = new Schema<IAppConfig>(
  {
    configKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    configValue: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json'],
      default: 'string',
    },
  },
  {
    timestamps: true,
  }
);

export const AppConfig = mongoose.model<IAppConfig>(
  'AppConfig',
  appConfigSchema
);
