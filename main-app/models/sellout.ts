import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface ISellout extends Document {
  user: Types.ObjectId;
  apartment: string;
  agent: Types.ObjectId;
  sold: boolean;
  status: string;
  totalAmount?: number;
}

const selloutSchema: Schema<ISellout> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    apartment: { type: String, required: true },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    sold: { type: Boolean, default: false },
    status: { type: String, enum: ['initiated', 'completed', 'cancelled', 'pending'], default: 'initiated' },
    totalAmount: { type: Number, default: undefined }
  },
  { timestamps: true });

let Sellout: Model<ISellout>;

try {
  Sellout = mongoose.model<ISellout>('Sellout');
} catch (error) {
  if (error instanceof mongoose.Error.OverwriteModelError) {
    Sellout = mongoose.model<ISellout>('Sellout');
  } else {
    Sellout = mongoose.model<ISellout>('Sellout', selloutSchema);
  }
  Sellout = mongoose.model<ISellout>('Sellout', selloutSchema);
}

export default Sellout;