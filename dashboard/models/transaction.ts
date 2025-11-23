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
      ref: 'User',
      index: true
    },
    apartment: {
      type: String,
      required: true,
      index: true
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      index: true
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled', 'pending'],
      default: 'pending',
      index: true
    },
    type: {
      type: String,
      default: '',
      index: true
    },
    approval: {
      type: String,
      enum: ['approved', 'pending', 'unapproved'],
      default: 'pending',
      index: true
    },
    createdAt: {
      type: String,
      default: '',
      index: true
    },
    transactionId: {
      type: String,
      default: '',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['online_transfer', 'bank_transfer'],
      default: 'bank_transfer',
      index: true
    },
    referenceId: {
      type: String,
      default: '',
      index: true
    },
    transactionStatus: {
      type: String,
      default: '',
      index: true
    },
    currency: {
      type: String,
      default: '',
      index: true
    },
    amount: {
      type: Number,
      default: undefined,
      index: true
    },
  },
  { timestamps: true } // Added timestamps for automatic createdAt/updatedAt
);

// Compound indexes for common query patterns
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ agent: 1, status: 1 });
transactionSchema.index({ status: 1, approval: 1 });
transactionSchema.index({ createdAt: -1, status: 1 });
transactionSchema.index({ amount: 1, currency: 1 });
transactionSchema.index({ transactionId: 1, referenceId: 1 });
transactionSchema.index({ paymentMethod: 1, status: 1 });
transactionSchema.index({ user: 1, agent: 1, status: 1 });

// Text search index for search functionality
transactionSchema.index({
  apartment: 'text',
  transactionId: 'text',
  referenceId: 'text'
});

// Sparse indexes for optional fields
transactionSchema.index({ referenceId: 1 }, { sparse: true });
transactionSchema.index({ transactionId: 1 }, { sparse: true });

// Fixed model creation (removed duplicate assignment)
const Transaction: Model<ITransaction> = mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;