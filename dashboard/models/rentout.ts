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
  createdAt: Date;
  updatedAt: Date;
}

const rentoutSchema: Schema<IRentout> = new Schema(
  {
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
    startDate: { 
      type: String, 
      default: undefined,
      index: true 
    },
    endDate: { 
      type: String, 
      default: undefined,
      index: true 
    },
    rented: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    status: { 
      type: String, 
      enum: ['initiated', 'completed', 'cancelled', 'pending'], 
      default: 'initiated',
      index: true 
    },
    totalAmount: { 
      type: Number, 
      default: undefined,
      index: true 
    }
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
rentoutSchema.index({ user: 1, rented: 1 });
rentoutSchema.index({ user: 1, status: 1 });
rentoutSchema.index({ agent: 1, rented: 1 });
rentoutSchema.index({ agent: 1, status: 1 });
rentoutSchema.index({ apartment: 1, rented: 1 });
rentoutSchema.index({ apartment: 1, status: 1 });
rentoutSchema.index({ rented: 1, status: 1 });
rentoutSchema.index({ status: 1, createdAt: -1 });
rentoutSchema.index({ rented: 1, createdAt: -1 });
rentoutSchema.index({ startDate: 1, endDate: 1 });
rentoutSchema.index({ startDate: 1, rented: 1 });
rentoutSchema.index({ endDate: 1, rented: 1 });
rentoutSchema.index({ totalAmount: -1, rented: 1 });
rentoutSchema.index({ user: 1, agent: 1, rented: 1 });

// Date range queries for rental periods
rentoutSchema.index({ startDate: 1, endDate: 1, rented: 1 });

// Sparse indexes for optional fields
rentoutSchema.index({ totalAmount: 1 }, { sparse: true });
rentoutSchema.index({ startDate: 1 }, { sparse: true });
rentoutSchema.index({ endDate: 1 }, { sparse: true });

// Fixed model creation (removed duplicate assignment)
const Rentout: Model<IRentout> = mongoose.models.Rentout || 
  mongoose.model<IRentout>('Rentout', rentoutSchema);

export default Rentout;