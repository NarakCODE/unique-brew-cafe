import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportMessage extends Document {
  ticketId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  attachments: string[];
  createdAt: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'SupportTicket',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

supportMessageSchema.index({ ticketId: 1, createdAt: 1 });

export const SupportMessage = mongoose.model<ISupportMessage>(
  'SupportMessage',
  supportMessageSchema
);
