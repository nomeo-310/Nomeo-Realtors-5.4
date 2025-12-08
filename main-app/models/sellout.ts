import mongoose, { Schema, Document } from 'mongoose';

const SELLOUT_STATUS = ['pending', 'active', 'completed', 'cancelled', 'expired'] as const;
export type SelloutStatus = typeof SELLOUT_STATUS[number];

export interface ISellout extends Document {
  user: mongoose.Types.ObjectId;
  apartment: mongoose.Types.ObjectId; 
  agent: mongoose.Types.ObjectId;
  totalAmount?: number;
  status: SelloutStatus;
  isActive: boolean;
  isCompleted: boolean;
  isCancelled: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const selloutSchema = new Schema<ISellout>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    apartment: {
      type: Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
      index: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
      index: true,
    },

    totalAmount: { type: Number, min: 0 },

    status: {
      type: String,
      enum: SELLOUT_STATUS,
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

selloutSchema.virtual('isActive').get(function () {
  return this.status === 'active';
});
selloutSchema.virtual('isCompleted').get(function () {
  return this.status === 'completed';
});
selloutSchema.virtual('isCancelled').get(function () {
  return ['cancelled', 'expired'].includes(this.status);
});

selloutSchema.index({ user: 1, createdAt: -1 });        
selloutSchema.index({ agent: 1, createdAt: -1 });      
selloutSchema.index({ apartment: 1 });                  
selloutSchema.index({ status: 1 });                     
selloutSchema.index({ status: 1, createdAt: -1 });     
selloutSchema.index({ createdAt: 1 }, {          
  expireAfterSeconds: 365 * 24 * 60 * 60, 
  partialFilterExpression: { status: { $in: ['completed', 'cancelled', 'expired'] } }
});

const SelloutModel =
  (mongoose.models.Sellout as mongoose.Model<ISellout> | undefined) ??
  mongoose.model<ISellout>('Sellout', selloutSchema);

export default SelloutModel;