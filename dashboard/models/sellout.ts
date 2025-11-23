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
      ref: 'User',
      index: true 
    },
    apartment: { 
      type: String, 
      required: true,
      index: true 
    },
    agent: { 
      type: Schema.Types.ObjectId, 
      ref: 'Agent',
      index: true 
    },
    sold: { 
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
selloutSchema.index({ user: 1, sold: 1 });
selloutSchema.index({ user: 1, status: 1 });
selloutSchema.index({ agent: 1, sold: 1 });
selloutSchema.index({ agent: 1, status: 1 });
selloutSchema.index({ sold: 1, status: 1 });
selloutSchema.index({ status: 1, createdAt: -1 });
selloutSchema.index({ sold: 1, createdAt: -1 });
selloutSchema.index({ apartment: 1, sold: 1 });
selloutSchema.index({ totalAmount: -1, sold: 1 });
selloutSchema.index({ user: 1, agent: 1, sold: 1 });

// Text search index for apartment search
selloutSchema.index({ apartment: 'text' });

// Sparse index for totalAmount (optional field)
selloutSchema.index({ totalAmount: 1 }, { sparse: true });

// Fixed model creation (removed duplicate assignment)
const Sellout: Model<ISellout> = mongoose.models.Sellout || 
  mongoose.model<ISellout>('Sellout', selloutSchema);

export default Sellout;