import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IInspection extends Document {
  date: string;
  time: string;
  user: Types.ObjectId;
  apartment: Types.ObjectId;
  agent: Types.ObjectId;
  additionalNumber?: string;
  status: string;
  verdict: string;
}

const inspectionSchema: Schema<IInspection> = new Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    apartment: { type: Schema.Types.ObjectId, ref: 'Apartment' },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    additionalNumber: { type: String, default: undefined },
    status: {type: String, enum: ['completed', 'pending', 'uncompleted'], default: 'pending'},
    verdict: {type: String, enum: ['accepted', 'rejected', 'pending'], default: 'pending'}
  },
  { timestamps: true });
 
let Inspection: Model<IInspection>;

try {
  Inspection = mongoose.model<IInspection>('Inspection');
} catch (error) {
  Inspection = mongoose.model<IInspection>('Inspection', inspectionSchema);
}

export default Inspection;