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
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    apartment: { type: String, required: true },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    status: { 
      type: String, 
      enum: ['completed', 'cancelled', 'pending'], 
      default: 'pending', 
      index: true 
    },
    type: { type: String, default: '' },
    approval: { 
      type: String, 
      enum: ['approved', 'pending', 'unapproved'], 
      default: 'pending' 
    },
    transactionId: { 
      type: String, 
      default: '', 
      unique: true, 
      sparse: true 
    },
    paymentMethod: { 
      type: String, 
      enum: ['online_transfer', 'bank_transfer'], 
      default: 'bank_transfer' 
    },
    referenceId: { type: String, default: '' },
    transactionStatus: { type: String, default: '' },
    currency: { type: String, default: '' },
    amount: { type: Number, default: undefined },
  },
  { timestamps: true, autoIndex: process.env.NODE_ENV !== 'development' }
);

// Compound indexes
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ status: 1, approval: 1 });

// Timestamp indexes (essential for sorting)
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ updatedAt: -1 });

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