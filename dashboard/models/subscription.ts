import mongoose, { Schema, Types, Document, Model } from 'mongoose';

interface ISubscription extends Document {
  email: string;
  isUser: boolean;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema: Schema<ISubscription> = new Schema({
  email: { 
    type: String, 
    required: true,
    unique: true, // Added unique constraint
    lowercase: true, // Added for consistency
    index: true 
  },
  isUser: { 
    type: Boolean, 
    required: true,
    index: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true 
  },
}, { timestamps: true });

// Compound indexes for common query patterns
subscriptionSchema.index({ email: 1, isUser: 1 });
subscriptionSchema.index({ isUser: 1, createdAt: -1 });
subscriptionSchema.index({ userId: 1 }, { sparse: true });
subscriptionSchema.index({ createdAt: -1 });
subscriptionSchema.index({ updatedAt: -1 });

// Unique compound index for user-specific subscriptions
subscriptionSchema.index({ userId: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { userId: { $type: 'objectId' } }
});

let Subscription: Model<ISubscription>;

try {
  Subscription = mongoose.model<ISubscription>('Subscription');
} catch (error) {
  Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
}

export default Subscription;