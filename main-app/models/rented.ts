import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IRented extends Document {
  user: Types.ObjectId;
  apartment: string;
  agent: Types.ObjectId;
  rented: boolean;
  status: string;
  startDate?: string;
  endDate?: string;
}

const rentedSchema: Schema<IRented> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    apartment: { type: String, required: true },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    startDate: { type: String, default: undefined },
    endDate: { type: String, default: undefined},
    rented: { type: Boolean, default: false },
    status: { type: String, enum: ['initiated', 'completed', 'cancelled', 'pending'], default: 'initiated' },
  },
  { timestamps: true });

let Rented: Model<IRented>;

try {
  Rented = mongoose.model<IRented>('Rented');
} catch (error) {
  if (error instanceof mongoose.Error.OverwriteModelError) {
    Rented = mongoose.model<IRented>('Rented');
  } else {
    Rented = mongoose.model<IRented>('Rented', rentedSchema);
  }
  Rented = mongoose.model<IRented>('Rented', rentedSchema);
}

export default Rented;