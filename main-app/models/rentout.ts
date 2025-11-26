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
    startDate: { 
      type: String, 
      default: undefined
    },
    endDate: { 
      type: String, 
      default: undefined
    },
    rented: { 
      type: Boolean, 
      default: false
    },
    status: { 
      type: String, 
      enum: ['initiated', 'completed', 'cancelled', 'pending'], 
      default: 'initiated'
    },
    totalAmount: { 
      type: Number, 
      default: undefined
    }
  },
  { 
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'development' // Disable auto-indexing in dev
  }
);

// FIXED: Keep only essential single field indexes
rentoutSchema.index({ user: 1 });
rentoutSchema.index({ apartment: 1 });
rentoutSchema.index({ agent: 1 });
rentoutSchema.index({ status: 1 });
rentoutSchema.index({ rented: 1 });
rentoutSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
rentoutSchema.index({ user: 1, rented: 1 });
rentoutSchema.index({ user: 1, status: 1 });
rentoutSchema.index({ agent: 1, rented: 1 });
rentoutSchema.index({ agent: 1, status: 1 });
rentoutSchema.index({ apartment: 1, rented: 1 });
rentoutSchema.index({ rented: 1, status: 1 });
rentoutSchema.index({ status: 1, createdAt: -1 });

// FIXED: Improved model creation with better caching
let Rentout: Model<IRentout>;

if (mongoose.models.Rentout) {
  Rentout = mongoose.models.Rentout;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Using cached Rentout model');
  }
} else {
  Rentout = mongoose.model<IRentout>('Rentout', rentoutSchema);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Created new Rentout model');
  }
}

export default Rentout;