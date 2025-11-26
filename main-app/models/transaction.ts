import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface ITransaction extends Document {
  user: Types.ObjectId;
  apartment: string;
  agent: Types.ObjectId;
  type: string;
  status: string;
  approval: string;
  createdAt: string;
  transactionStatus: string;
  transactionId: string;
  paymentMethod: string;
  referenceId: string;
  amount: number;
  currency: string;
}

const transactionSchema: Schema<ITransaction> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    apartment: {
      type: String,
      required: true
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'Agent'
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled', 'pending'],
      default: 'pending'
    },
    type: {
      type: String,
      default: ''
    },
    approval: {
      type: String,
      enum: ['approved', 'pending', 'unapproved'],
      default: 'pending'
    },
    createdAt: {
      type: String,
      default: ''
    },
    transactionId: {
      type: String,
      default: ''
    },
    paymentMethod: {
      type: String,
      enum: ['online_transfer', 'bank_transfer'],
      default: 'bank_transfer'
    },
    referenceId: {
      type: String,
      default: ''
    },
    transactionStatus: {
      type: String,
      default: ''
    },
    currency: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      default: undefined
    },
  },
  { 
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'development' // Disable auto-indexing in dev
  }
);

// FIXED: Keep only essential single field indexes
transactionSchema.index({ user: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentMethod: 1 });
transactionSchema.index({ amount: 1 });
transactionSchema.index({ transactionId: 1 });

// Compound indexes for common query patterns
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ status: 1, approval: 1 });
transactionSchema.index({ paymentMethod: 1, status: 1 });
transactionSchema.index({ amount: 1, currency: 1 });

// FIXED: Improved model creation with better caching
let Transaction: Model<ITransaction>;

if (mongoose.models.Transaction) {
  Transaction = mongoose.models.Transaction;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Using cached Transaction model');
  }
} else {
  Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Created new Transaction model');
  }
}

export default Transaction;