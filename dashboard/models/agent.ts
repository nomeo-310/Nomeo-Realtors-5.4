import mongoose from 'mongoose';
import generateAgentId from '../utils/generateAgentId';

type Image = {
  public_id: string;
  secure_url: string;
};

interface IAgent extends mongoose.Document {
  licenseNumber: string;
  coverPicture?: string;
  officeNumber: string;
  officeAddress: string;
  agentRatings: string;
  agencyName: string;
  agencyWebsite?: string;
  agentVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'unverified' | 'rejected';
  inspectionFeePerHour: number;
  coverImage?: Image;
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

const agentSchema: mongoose.Schema<IAgent> = new mongoose.Schema(
  {
    licenseNumber: { 
      type: String, 
      default: undefined,
      unique: true
    },
    coverPicture: { 
      type: String, 
      default: undefined 
    },
    officeNumber: { 
      type: String, 
      default: undefined
    },
    officeAddress: { 
      type: String, 
      default: undefined
    },
    agencyName: { 
      type: String, 
      default: undefined
    },
    coverImage: {
      public_id: { 
        type: String, 
        default: undefined
      },
      secure_url: { 
        type: String, 
        default: undefined
      },
    },
    getListings: {
      type: Boolean, 
      default: false
    },
    isACollaborator: {
      type: Boolean, 
      default: false
    },
    agentRatings: { 
      type: String, 
      default: undefined
    },
    agencyWebsite: { 
      type: String, 
      default: undefined
    },
    agentVerified: { 
      type: Boolean, 
      default: false
    },
    verificationStatus: { 
      type: String, 
      enum: ['verified', 'pending', 'unverified', 'rejected'], 
      default: 'unverified'
    },
    inspectionFeePerHour: { 
      type: Number, 
      default: 0
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
      unique: true
    },
    inspections: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Inspection' 
    }],
    apartments: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Apartment' 
    }],
    clients: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    potentialClients: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    createdAt: { 
      type: Date, 
      default: Date.now
    },
  },
  { timestamps: true }
);

// FIXED: Remove any potentially redundant indexes that might be auto-created
// Single field indexes - only essential ones
agentSchema.index({ verificationStatus: 1 });
agentSchema.index({ agentVerified: 1 });
agentSchema.index({ agencyName: 1 });

// Compound indexes for common query patterns
agentSchema.index({ verificationStatus: 1, agentVerified: 1 });
agentSchema.index({ verificationStatus: 1, createdAt: -1 });
agentSchema.index({ agentVerified: 1, getListings: 1 });
agentSchema.index({ agencyName: 1, verificationStatus: 1 });
agentSchema.index({ userId: 1, verificationStatus: 1 });
agentSchema.index({ createdAt: -1, verificationStatus: 1 });
agentSchema.index({ inspectionFeePerHour: 1, verificationStatus: 1 });
agentSchema.index({ isACollaborator: 1, getListings: 1 });
agentSchema.index({ agentRatings: -1, verificationStatus: 1 });

// Multi-key indexes for array fields
agentSchema.index({ apartments: 1 });
agentSchema.index({ inspections: 1 });
agentSchema.index({ clients: 1 });
agentSchema.index({ potentialClients: 1 });

// Text search index for agent discovery
agentSchema.index({
  agencyName: 'text',
  officeAddress: 'text',
  licenseNumber: 'text'
});

// Sparse indexes for optional fields
agentSchema.index({ agencyWebsite: 1 }, { sparse: true });
agentSchema.index({ coverPicture: 1 }, { sparse: true });

// Popular agents index (based on portfolio size and ratings)
agentSchema.index({ 
  apartments: -1, 
  clients: -1, 
  verificationStatus: 1,
  agentRatings: -1 
});

agentSchema.pre<IAgent>('save', async function (next) {
  // Only generate license number if it doesn't exist
  if (!this.licenseNumber) {
    const agentIdTag = generateAgentId();
    this.licenseNumber = agentIdTag;
  }
  next();
});

// FIXED: Improved model creation with better caching
let Agent: mongoose.Model<IAgent>;

if (mongoose.models.Agent) {
  Agent = mongoose.models.Agent;
  // Optional: Check if we need to reapply indexes
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Using cached Agent model');
  }
} else {
  Agent = mongoose.model<IAgent>('Agent', agentSchema);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Created new Agent model');
  }
}

export default Agent;