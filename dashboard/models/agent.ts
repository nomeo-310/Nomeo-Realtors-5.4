import mongoose from 'mongoose';
import generateAgentId from '../utils/generateAgentId';

type Image = {
  public_id: string;
  secure_url: string;
};

const VERIFICATION_STATUS = [
  'verified',
  'pending',
  'unverified',
  'rejected',
] as const;

export type VerificationStatus = typeof VERIFICATION_STATUS[number];

export interface IAgent extends mongoose.Document {
  licenseNumber: string;
  coverPicture?: string;
  coverImage?: Image;

  officeNumber?: string;
  officeAddress?: string;
  agencyName?: string;
  agencyWebsite?: string;

  agentRatings?: string;
  inspectionFeePerHour: number;

  agentVerified: boolean;
  verificationStatus: VerificationStatus;

  getListings: boolean;
  isACollaborator: boolean;

  userId: mongoose.Types.ObjectId;

  // Relations (populated often)
  apartments: mongoose.Types.ObjectId[];
  inspections: mongoose.Types.ObjectId[];
  clients: mongoose.Types.ObjectId[];
  potentialClients: mongoose.Types.ObjectId[];

  // Timestamps handled by mongoose
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new mongoose.Schema<IAgent>(
  {
    licenseNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    coverPicture: { type: String },
    coverImage: {
      public_id: String,
      secure_url: String,
    },

    officeNumber: String,
    officeAddress: String,
    agencyName: String,
    agencyWebsite: String,

    agentRatings: String,
    inspectionFeePerHour: {
      type: Number,
      default: 0,
      min: [0, 'Inspection fee cannot be negative'],
    },

    agentVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUS,
      default: 'unverified',
    },

    getListings: {
      type: Boolean,
      default: false,
    },
    isACollaborator: {
      type: Boolean,
      default: false,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    apartments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      default: [],
    }],
    inspections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection',
      default: [],
    }],
    clients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    potentialClients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
  },
  {
    timestamps: true,
    // CRITICAL: Disable virtuals completely
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  }
);

// Only essential indexes
agentSchema.index({ verificationStatus: 1 });
agentSchema.index({ agentVerified: 1 });

agentSchema.pre('save', function (next) {
  // Generate license number only once
  if (!this.licenseNumber) {
    this.licenseNumber = generateAgentId();
  }

  // Sync agentVerified with verificationStatus
  if (this.isModified('verificationStatus')) {
    this.agentVerified = this.verificationStatus === 'verified';
  }

  next();
});

// NO VIRTUAL PROPERTIES AT ALL

const Agent =
  mongoose.models.Agent ||
  mongoose.model<IAgent>('Agent', agentSchema);

export default Agent;