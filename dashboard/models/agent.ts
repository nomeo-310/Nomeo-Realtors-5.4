import mongoose from 'mongoose';
import generateAgentId from '../utils/generateAgentId';

type image = {
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
  verificationStatus: 'verified' | 'pending' | 'unverified';
  inspectionFeePerHour: number;
  coverImage?: image;
  getListings: boolean;
  isACollaborator: boolean;
  userId: mongoose.Types.ObjectId;
  apartments: mongoose.Types.ObjectId[];
  inspections: mongoose.Types.ObjectId[];
  clients: mongoose.Types.ObjectId[];
  potentialClients: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const agentSchema: mongoose.Schema<IAgent> = new mongoose.Schema(
  {
    licenseNumber: { type: String, default: undefined },
    coverPicture: { type: String, default: undefined },
    officeNumber: { type: String, default: undefined },
    officeAddress: { type: String, default: undefined },
    agencyName: { type: String, default: undefined },
    coverImage: {
      public_id: { type: String, default: undefined },
      secure_url: { type: String, default: undefined },
    },
    getListings: {type: Boolean, default: false},
    isACollaborator: {type: Boolean, default: false},
    agentRatings: { type: String, default: undefined },
    agencyWebsite: { type: String, default: undefined },
    agentVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['verified', 'pending', 'unverified'], default: 'unverified' },
    inspectionFeePerHour: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.ObjectId, ref: 'User' },
    inspections: [{ type: mongoose.Schema.ObjectId, ref: 'Inspection' }],
    apartments: [{ type: mongoose.Schema.ObjectId, ref: 'Apartment' }],
    clients: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    potentialClients: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

agentSchema.pre<IAgent>('save', async function (next) {
  const agentIdTag = generateAgentId();
  this.licenseNumber = agentIdTag;

  next();
});

let Agent: mongoose.Model<IAgent>;

try {

  Agent = mongoose.model<IAgent>('Agent');
} catch (error) {

  Agent = mongoose.model<IAgent>('Agent', agentSchema);
}

export default Agent;