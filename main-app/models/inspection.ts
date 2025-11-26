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
      required: true
    },
    time: { 
      type: String, 
      required: true
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    apartment: { 
      type: Schema.Types.ObjectId, 
      ref: 'Apartment'
    },
    agent: { 
      type: Schema.Types.ObjectId, 
      ref: 'Agent'
    },
    additionalNumber: { 
      type: String, 
      default: undefined
    },
    status: {
      type: String, 
      enum: ['completed', 'pending', 'uncompleted'], 
      default: 'pending'
    },
    verdict: {
      type: String, 
      enum: ['accepted', 'rejected', 'pending'], 
      default: 'pending'
    }
  },
  { 
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'development' // Disable auto-indexing in dev
  }
);

// FIXED: Keep only essential single field indexes
inspectionSchema.index({ date: 1 });
inspectionSchema.index({ user: 1 });
inspectionSchema.index({ agent: 1 });
inspectionSchema.index({ apartment: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
inspectionSchema.index({ date: 1, time: 1 });
inspectionSchema.index({ user: 1, status: 1 });
inspectionSchema.index({ agent: 1, status: 1 });
inspectionSchema.index({ agent: 1, date: 1 });
inspectionSchema.index({ status: 1, verdict: 1 });
inspectionSchema.index({ date: 1, status: 1 });

// Date range queries for scheduling
inspectionSchema.index({ date: 1, time: 1, status: 1 });
inspectionSchema.index({ date: 1, agent: 1, status: 1 });

// FIXED: Improved model creation with better caching
let Inspection: Model<IInspection>;

if (mongoose.models.Inspection) {
  Inspection = mongoose.models.Inspection;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Using cached Inspection model');
  }
} else {
  Inspection = mongoose.model<IInspection>('Inspection', inspectionSchema);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Created new Inspection model');
  }
}

export default Inspection;