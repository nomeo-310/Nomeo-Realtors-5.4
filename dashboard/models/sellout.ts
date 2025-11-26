import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface ISellout extends Document {
  user: Types.ObjectId;
  apartment: string;
  agent: Types.ObjectId;
  sold: boolean;
  status: string;
  totalAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const selloutSchema: Schema<ISellout> = new Schema(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    apartment: { 
      type: String, 
      required: true
    },
    agent: { 
      type: Schema.Types.ObjectId, 
      ref: 'Agent'
    },
    sold: { 
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
selloutSchema.index({ user: 1 });
selloutSchema.index({ apartment: 1 });
selloutSchema.index({ agent: 1 });
selloutSchema.index({ sold: 1 });
selloutSchema.index({ status: 1 });
selloutSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
selloutSchema.index({ user: 1, sold: 1 });
selloutSchema.index({ user: 1, status: 1 });
selloutSchema.index({ agent: 1, sold: 1 });
selloutSchema.index({ agent: 1, status: 1 });
selloutSchema.index({ sold: 1, status: 1 });
selloutSchema.index({ status: 1, createdAt: -1 });

// FIXED: Improved model creation with better caching
let Sellout: Model<ISellout>;

if (mongoose.models.Sellout) {
  Sellout = mongoose.models.Sellout;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Using cached Sellout model');
  }
} else {
  Sellout = mongoose.model<ISellout>('Sellout', selloutSchema);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Created new Sellout model');
  }
}

export default Sellout;