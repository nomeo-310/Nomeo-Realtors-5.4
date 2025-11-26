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
    unique: true,
    lowercase: true
  },
  isUser: { 
    type: Boolean, 
    required: true
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
}, { 
  timestamps: true,
  autoIndex: process.env.NODE_ENV !== 'development' // Disable auto-indexing in dev
});

subscriptionSchema.index({ isUser: 1 });

// This is the ONLY custom index needed
subscriptionSchema.index({ userId: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { userId: { $type: 'objectId' } }
});

// FIXED: Improved model creation with better caching
let Subscription: Model<ISubscription>;

if (mongoose.models.Subscription) {
  Subscription = mongoose.models.Subscription;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Using cached Subscription model');
  }
} else {
  Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Created new Subscription model');
  }
}

export default Subscription;