import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchHistory extends Document {
  userId: mongoose.Types.ObjectId;
  query: string;
  searchType: 'store' | 'product' | 'all';
  resultsCount: number;
  createdAt: Date;
}

const searchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    query: {
      type: String,
      required: [true, 'Search query is required'],
      trim: true,
    },
    searchType: {
      type: String,
      enum: ['store', 'product', 'all'],
      required: [true, 'Search type is required'],
    },
    resultsCount: {
      type: Number,
      required: [true, 'Results count is required'],
      min: [0, 'Results count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of user's recent searches
searchHistorySchema.index({ userId: 1, createdAt: -1 });

searchHistorySchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SearchHistory = mongoose.model<ISearchHistory>(
  'SearchHistory',
  searchHistorySchema
);
