import mongoose, { Schema, Types, Document, Model } from 'mongoose';

export const SUSPENSION_CATEGORIES = {
  POLICY_VIOLATION: 'policy_violation',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  PAYMENT_ISSUES: 'payment_issues',
  CONTENT_VIOLATION: 'content_violation',
  SECURITY_CONCERNS: 'security_concerns',
  BEHAVIORAL_ISSUES: 'behavioral_issues',
  OTHER: 'other'
} as const;

export type SuspensionCategory = typeof SUSPENSION_CATEGORIES[keyof typeof SUSPENSION_CATEGORIES];

export const SUSPENSION_DURATIONS = {
  HOURS_24: '24_hours',
  DAYS_3: '3_days',
  DAYS_7: '7_days',
  DAYS_30: '30_days',
  INDEFINITE: 'indefinite',
} as const;

export type SuspensionDuration = typeof SUSPENSION_DURATIONS[keyof typeof SUSPENSION_DURATIONS];

export interface ISuspensionHistory {
  action: 'suspend' | 'appeal' | 'lift';
  description: string;
  performedBy: Types.ObjectId;
  performedAt: Date;
  reason?: string;
  duration?: SuspensionDuration;
  data?: Record<string, any>;
}

export interface ISuspension extends Document {
  user: Types.ObjectId;
  isActive: boolean;
  suspendedUntil?: Date;
  history: ISuspensionHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const SuspensionHistorySchema = new Schema({
  action: {
    type: String,
    required: true,
    enum: ['suspend', 'appeal', 'lift']
  },
  description: {
    type: String,
    required: true
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String
  },
  duration: {
    type: String,
    enum: Object.values(SUSPENSION_DURATIONS)
  },
  data: Schema.Types.Mixed
});

// Main suspension schema - very simple
const suspensionSchema: Schema<ISuspension> = new Schema({
  user: { 
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
  suspendedUntil: { 
    type: Date,
    index: true
  },
  history: [SuspensionHistorySchema]
}, {timestamps: true
});

suspensionSchema.index({ user: 1, isActive: 1 });
suspensionSchema.index({ suspendedUntil: 1 });

suspensionSchema.index({ 
  suspendedUntil: 1 
}, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { 
    isActive: true,
    suspendedUntil: { $ne: null }
  }
});

const Suspension: Model<ISuspension> = mongoose.models.Suspension || 
  mongoose.model<ISuspension>('Suspension', suspensionSchema);

export default Suspension;