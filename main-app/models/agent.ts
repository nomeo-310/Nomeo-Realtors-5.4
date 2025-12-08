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
  apartments: mongoose.Types.ObjectId[];
  inspections: mongoose.Types.ObjectId[];
  clients: mongoose.Types.ObjectId[];
  potentialClients: mongoose.Types.ObjectId[];
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
    }],
    inspections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection',
    }],
    clients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    potentialClients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Core filters
agentSchema.index({ verificationStatus: 1 });
agentSchema.index({ agentVerified: 1 });
agentSchema.index({ getListings: 1 });
agentSchema.index({ isACollaborator: 1 });

// Common compound queries
agentSchema.index({ verificationStatus: 1, createdAt: -1 });
agentSchema.index({ verificationStatus: 1, agentVerified: 1 });
agentSchema.index({ getListings: 1, verificationStatus: 1 });
agentSchema.index({ isACollaborator: 1, verificationStatus: 1 });

// Search & discovery
agentSchema.index({
  agencyName: 'text',
  officeAddress: 'text',
  licenseNumber: 'text',
}, {
  weights: { agencyName: 10, licenseNumber: 8, officeAddress: 5 },
  name: 'agent_search_text',
});

// Sorting by activity/rating
agentSchema.index({ 'apartments.0': 1 }); // Has at least one apartment (partial index alternative)
agentSchema.index({ inspectionFeePerHour: 1, verificationStatus: 1 });
agentSchema.index({ createdAt: -1 });

// Sparse/optional fields
agentSchema.index({ agencyWebsite: 1 }, { sparse: true });

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

// Example: Total portfolio size
agentSchema.virtual('portfolioSize').get(function () {
  return this.apartments.length;
});

agentSchema.virtual('totalClients').get(function () {
  return this.clients.length + this.potentialClients.length;
});

const AgentModel =
  mongoose.models.Agent ||
  mongoose.model<IAgent>('Agent', agentSchema);

export default AgentModel;