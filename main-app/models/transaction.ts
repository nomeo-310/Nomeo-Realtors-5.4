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
  transactionId:string;
  paymentMethod:string;
  referenceId: string;
  amount: number;
  currency: string;
};

const transactionSchema: Schema<ITransaction> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    apartment: { type: String, required: true },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    status: { type: String, enum: ['completed', 'cancelled', 'pending'], default: 'pending' },
    type: { type: String, default: '' },
    approval: {type: String, enum: ['approved', 'pending', 'unapproved'], default: 'pending'},
    createdAt: {type: String, default: ''},
    transactionId: {type: String, default: ''},
    paymentMethod: {type: String, enum: ['online_transfer', 'bank_transfer'], default: 'bank_transfer'},
    referenceId: {type: String, default: ''},
    transactionStatus: {type: String, default: ''},
    currency: {type: String, default: ''},
    amount: {type: Number, default: undefined},
  });

let Transaction: Model<ITransaction>;

try {
  Transaction = mongoose.model<ITransaction>('Transaction');
} catch (error) {
  if (error instanceof mongoose.Error.OverwriteModelError) {
    Transaction = mongoose.model<ITransaction>('Transaction');
  } else {
    Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
  }
  Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
}

export default Transaction; 