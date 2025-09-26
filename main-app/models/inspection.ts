import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IInspection extends Document {
  date: string;
  time: string;
  user: Types.ObjectId;
  apartment: string;
  agent: Types.ObjectId;
  additionalNumber?: string;
}

const inspectionSchema: Schema<IInspection> = new Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    apartment: { type: String, required: true },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    additionalNumber: { type: String, default: undefined }
  },
  { timestamps: true });

let Inspection: Model<IInspection>;

try {
  Inspection = mongoose.model<IInspection>('Inspection');
} catch (error) {
  Inspection = mongoose.model<IInspection>('Inspection', inspectionSchema);
}

export default Inspection;