import mongoose, { Schema, Document } from 'mongoose';

const INSPECTION_STATUS = ['pending', 'completed', 'cancelled', 'no-show'] as const;
const VERDICT = ['pending', 'accepted', 'rejected'] as const;

export type InspectionStatus = typeof INSPECTION_STATUS[number];
export type InspectionVerdict = typeof VERDICT[number];

export interface IInspection extends Document {
  date: Date;                    
  time: string;                  
  user: mongoose.Types.ObjectId;   
  apartment: mongoose.Types.ObjectId;
  agent: mongoose.Types.ObjectId;
  additionalNumber?: string;
  status: InspectionStatus;
  verdict: InspectionVerdict;
  createdAt: Date;
  updatedAt: Date;
  isPast: boolean;
  isToday: boolean;
}

const inspectionSchema = new Schema<IInspection>(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },

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

    additionalNumber: String,

    status: {
      type: String,
      enum: INSPECTION_STATUS,
      default: 'pending',
      index: true,
    },
    verdict: {
      type: String,
      enum: VERDICT,
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

inspectionSchema.virtual('isPast').get(function () {
  const now = new Date();
  const inspectionDate = new Date(this.date);
  const [hours, minutes] = this.time.split(':').map(Number);
  inspectionDate.setHours(hours, minutes, 0, 0);
  return inspectionDate < now;
});

inspectionSchema.virtual('isToday').get(function () {
  const today = new Date();
  const inspectionDate = new Date(this.date);
  return (
    inspectionDate.getFullYear() === today.getFullYear() &&
    inspectionDate.getMonth() === today.getMonth() &&
    inspectionDate.getDate() === today.getDate()
  );
});

// Core lookups
inspectionSchema.index({ user: 1, date: -1 });      
inspectionSchema.index({ agent: 1, date: -1 });    
inspectionSchema.index({ apartment: 1 });            

// Status filtering
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ verdict: 1 });

// Most common compound queries
inspectionSchema.index({ agent: 1, date: 1, status: 1 });    
inspectionSchema.index({ user: 1, status: 1, date: -1 });  
inspectionSchema.index({ date: 1, status: 1 });         
inspectionSchema.index({ status: 1, createdAt: -1 });  

inspectionSchema.pre('save', function (next) {
  if (this.time) {
    const [h, m] = this.time.split(':');
    this.time = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  }
  next();
});

const InspectionModel =
  (mongoose.models.Inspection as mongoose.Model<IInspection> | undefined) ??
  mongoose.model<IInspection>('Inspection', inspectionSchema);

export default InspectionModel;