import mongoose, { Schema, Types, Document, Model } from 'mongoose';

interface ISuspension extends Document {
  category: string;
  reason: string;
  role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  duration: string;
  suspendedUntil?: Date;
  suspendedAt: Date;
  suspendedBy: Types.ObjectId;
  user: Types.ObjectId;
  isActive: boolean;
  liftedAt?: Date;
  liftedBy?: Types.ObjectId;
  liftReason?: string;
  suspensionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const suspensionSchema: Schema<ISuspension> = new Schema({
  category: { 
    type: String, 
    required: true, 
    enum: ['policy_violation', 'suspicious_activity', 'payment_issues', 'content_violation', 'security_concerns', 'behavioral_issues', 'other'],
    index: true 
  },
  reason: { 
    type: String, 
    required: true,
    index: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'agent', 'admin', 'creator', 'superAdmin'],
    required: true,
    index: true 
  },
  duration: { 
    type: String, 
    required: true, 
    enum: ['24_hours', '7_days', '30_days', 'indefinite', 'permanent'],
    index: true 
  },
  suspendedUntil: { 
    type: Date, 
    required: false,
    index: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true 
  },
  suspendedAt: { 
    type: Date, 
    required: true,
    index: true 
  },
  suspendedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true 
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true 
  },
  suspensionCount: { 
    type: Number, 
    required: true,
    index: true 
  },
  liftedAt: { 
    type: Date, 
    required: false,
    index: true 
  },
  liftedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true 
  },
  liftReason: { 
    type: String, 
    required: false 
  },
}, { timestamps: true });

// Compound indexes for common query patterns
suspensionSchema.index({ user: 1, isActive: 1 });
suspensionSchema.index({ user: 1, suspendedAt: -1 });
suspensionSchema.index({ user: 1, suspensionCount: -1 });
suspensionSchema.index({ isActive: 1, suspendedUntil: 1 });
suspensionSchema.index({ isActive: 1, suspendedAt: -1 });
suspensionSchema.index({ role: 1, isActive: 1 });
suspensionSchema.index({ category: 1, isActive: 1 });
suspensionSchema.index({ duration: 1, isActive: 1 });
suspensionSchema.index({ suspendedBy: 1, suspendedAt: -1 });
suspensionSchema.index({ suspendedUntil: 1, isActive: 1 });
suspensionSchema.index({ createdAt: -1, isActive: 1 });
suspensionSchema.index({ liftedAt: -1, isActive: 1 });

// TTL index for automatic cleanup of expired suspensions
suspensionSchema.index({ 
  suspendedUntil: 1 
}, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { 
    isActive: true,
    suspendedUntil: { $ne: null },
    duration: { $ne: 'permanent' }
  }
});

// Text search index for reason and liftReason
suspensionSchema.index({
  reason: 'text',
  liftReason: 'text'
});

// Sparse indexes for optional fields
suspensionSchema.index({ liftedBy: 1 }, { sparse: true });
suspensionSchema.index({ liftedAt: 1 }, { sparse: true });
suspensionSchema.index({ liftReason: 1 }, { sparse: true });

// Analytics and reporting indexes
suspensionSchema.index({ category: 1, role: 1, suspendedAt: -1 });
suspensionSchema.index({ suspendedAt: 1, role: 1 });
suspensionSchema.index({ duration: 1, role: 1 });

// Simplified model creation
const Suspension: Model<ISuspension> = mongoose.models.Suspension || 
  mongoose.model<ISuspension>('Suspension', suspensionSchema);

export default Suspension;