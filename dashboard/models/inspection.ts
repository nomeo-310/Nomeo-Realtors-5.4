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
  createdAt: Date;
  updatedAt: Date;
}

const inspectionSchema: Schema<IInspection> = new Schema(
  {
    date: { 
      type: String, 
      required: true,
      index: true 
    },
    time: { 
      type: String, 
      required: true,
      index: true 
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      index: true 
    },
    apartment: { 
      type: Schema.Types.ObjectId, 
      ref: 'Apartment',
      index: true 
    },
    agent: { 
      type: Schema.Types.ObjectId, 
      ref: 'Agent',
      index: true 
    },
    additionalNumber: { 
      type: String, 
      default: undefined,
      index: true 
    },
    status: {
      type: String, 
      enum: ['completed', 'pending', 'uncompleted'], 
      default: 'pending',
      index: true 
    },
    verdict: {
      type: String, 
      enum: ['accepted', 'rejected', 'pending'], 
      default: 'pending',
      index: true 
    }
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
inspectionSchema.index({ date: 1, time: 1 });
inspectionSchema.index({ user: 1, status: 1 });
inspectionSchema.index({ user: 1, verdict: 1 });
inspectionSchema.index({ agent: 1, status: 1 });
inspectionSchema.index({ agent: 1, date: 1 });
inspectionSchema.index({ apartment: 1, status: 1 });
inspectionSchema.index({ status: 1, verdict: 1 });
inspectionSchema.index({ date: 1, status: 1 });
inspectionSchema.index({ createdAt: -1, status: 1 });
inspectionSchema.index({ user: 1, agent: 1, status: 1 });
inspectionSchema.index({ apartment: 1, agent: 1, date: 1 });

// Date range queries for scheduling
inspectionSchema.index({ date: 1, time: 1, status: 1 });
inspectionSchema.index({ date: 1, agent: 1, status: 1 });

// Sparse indexes for optional fields
inspectionSchema.index({ additionalNumber: 1 }, { sparse: true });

// Text search index for additional number (if needed for search)
// inspectionSchema.index({ additionalNumber: 'text' });

// Simplified model creation
const Inspection: Model<IInspection> = mongoose.models.Inspection || 
  mongoose.model<IInspection>('Inspection', inspectionSchema);

export default Inspection;