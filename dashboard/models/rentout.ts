import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IRentout extends Document {
  user: Types.ObjectId;
  apartment: Types.ObjectId;
  agent: Types.ObjectId;
  rented: boolean;
  status: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
}

const rentoutSchema: Schema<IRentout> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    apartment: { type: Schema.Types.ObjectId, ref: 'Apartment' },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    startDate: { type: String, default: undefined },
    endDate: { type: String, default: undefined},
    rented: { type: Boolean, default: false },
    status: { type: String, enum: ['initiated', 'completed', 'cancelled', 'pending'], default: 'initiated' },
    totalAmount: { type: Number, default: undefined }
  },
  { timestamps: true });

let Rentout: Model<IRentout>;

try {
  Rentout = mongoose.model<IRentout>('Rentout');
} catch (error) {
  if (error instanceof mongoose.Error.OverwriteModelError) {
    Rentout = mongoose.model<IRentout>('Rentout');
  } else {
    Rentout = mongoose.model<IRentout>('Rentout', rentoutSchema);
  }
  Rentout = mongoose.model<IRentout>('Rentout', rentoutSchema);
}

export default Rentout;