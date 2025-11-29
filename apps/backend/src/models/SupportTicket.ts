import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
  ticketNumber: string;
  userId: mongoose.Types.ObjectId;
  subject: string;
  category: 'general' | 'order' | 'payment' | 'account' | 'technical' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['general', 'order', 'payment', 'account', 'technical', 'other'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
supportTicketSchema.index({ userId: 1, status: 1 });
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ status: 1 });

export const SupportTicket = mongoose.model<ISupportTicket>(
  'SupportTicket',
  supportTicketSchema
);
