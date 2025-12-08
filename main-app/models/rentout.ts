import mongoose, { Schema, Document } from 'mongoose';

const RENTOUT_STATUS = ['pending', 'active', 'completed', 'cancelled', 'expired'] as const;
export type RentoutStatus = typeof RENTOUT_STATUS[number];

export interface IRentout extends Document {
  user: mongoose.Types.ObjectId;  
  apartment: mongoose.Types.ObjectId;
  agent: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  totalAmount?: number;
  status: RentoutStatus;
  isActive: boolean;
  isCompleted: boolean;
  isCancelled: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const rentoutSchema = new Schema<IRentout>(
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

    startDate: { type: Date },
    endDate: { type: Date },
    totalAmount: { type: Number, min: 0 },

    status: {
      type: String,
      enum: RENTOUT_STATUS,
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

rentoutSchema.virtual('isActive').get(function () {
  return this.status === 'active';
});
rentoutSchema.virtual('isCompleted').get(function () {
  return this.status === 'completed';
});
rentoutSchema.virtual('isCancelled').get(function () {
  return this.status === 'cancelled' || this.status === 'expired';
});

rentoutSchema.index({ user: 1, createdAt: -1 });    
rentoutSchema.index({ agent: 1, createdAt: -1 });       
rentoutSchema.index({ apartment: 1 });                  
rentoutSchema.index({ status: 1 });                     
rentoutSchema.index({ status: 1, createdAt: -1 });      
rentoutSchema.index({ endDate: 1 }, {                  
  expireAfterSeconds: 0,
  partialFilterExpression: { status: 'active' }
});


rentoutSchema.pre('save', function (next) {
  const now = new Date();
  if (this.endDate && this.endDate < now && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

const RentoutModel =
  (mongoose.models.Rentout as mongoose.Model<IRentout> | undefined) ??
  mongoose.model<IRentout>('Rentout', rentoutSchema);

export default RentoutModel;