import mongoose, { Schema, Types, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { generatePlaceholderColor } from '../utils/generatePlaceholderColor';

type Image = {
  public_id: string;
  secure_url: string;
};

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  surName?: string;
  lastName?: string;
  profilePicture?: string;
  profileImage?: Image;
  bio?: string;
  phoneNumber?: string;
  additionalPhoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  otp?: string;
  otpExpiresIn?: number;
  resetPasswordOtp?: string;
  placeholderColor: string;
  resetPasswordOtpExpiresIn?: number;
  userOnboarded: boolean;
  profileCreated: boolean;
  userVerified: boolean;
  userIsAnAgent: boolean;
  userAccountDeleted: boolean;
  userAccountSuspended: boolean;
  suspensionReason: string;
  suspendedAt: Date;
  suspendedBy: Types.ObjectId;
  deletedAt: Date;
  deletedBy: Types.ObjectId;
  showLikedApartments: boolean;
  showBookmarkedApartments: boolean;
  showLikedBlogs: boolean;
  showBookmarkedBlogs: boolean;
  subscribedToNewsletter: boolean;
  blogCollaborator: boolean;
  collaborations: Types.ObjectId[];
  createdBlogs: Types.ObjectId[];
  agentId?: Types.ObjectId;
  notifications?: Types.ObjectId[];
  likedApartments?: Types.ObjectId[];
  bookmarkedApartments?: Types.ObjectId[];
  likedBlogs?: Types.ObjectId[];
  bookmarkedABlogs?: Types.ObjectId[];
  comments?: Types.ObjectId[];
  propertyAgents?: Types.ObjectId[];
  propertiesRented?: Types.ObjectId[];
  previousRole?: string;
  roleChangedAt?: Date;
  roleChangedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Common schema options for string fields
const stringField = { type: String, default: undefined };
const booleanField = { type: Boolean, default: false };

const userSchema: Schema<IUser> = new Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true
    },
    password: stringField,
    role: { 
      type: String, 
      enum: ['user', 'agent', 'admin', 'creator', 'superAdmin'], 
      default: 'user'
    },
    surName: stringField,
    lastName: stringField,
    profilePicture: stringField,
    profileImage: {
      public_id: stringField,
      secure_url: stringField,
    },
    bio: stringField,
    phoneNumber: stringField,
    additionalPhoneNumber: stringField,
    address: stringField,
    city: stringField,
    state: stringField,
    otp: stringField,
    otpExpiresIn: { type: Number, default: undefined },
    resetPasswordOtp: stringField,
    placeholderColor: { type: String, default: '' },
    resetPasswordOtpExpiresIn: { type: Number, default: undefined },
    userOnboarded: booleanField,
    profileCreated: booleanField,
    userVerified: booleanField,
    userIsAnAgent: booleanField,
    userAccountDeleted: booleanField,
    userAccountSuspended: booleanField,
    suspensionReason: { type: String, default: '' },
    suspendedAt: { type: Date, default: undefined },
    suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: undefined },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    showLikedApartments: booleanField,
    showBookmarkedApartments: booleanField,
    showLikedBlogs: booleanField,
    showBookmarkedBlogs: booleanField,
    subscribedToNewsletter: booleanField,
    blogCollaborator: booleanField,
    collaborations: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    createdBlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
    notifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
    likedApartments: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    bookmarkedApartments: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    likedBlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    bookmarkedABlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    propertyAgents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
    propertiesRented: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    previousRole: stringField,
    roleChangedAt: { type: Date, default: undefined },
    roleChangedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { 
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'development' 
  }
);

// Single field indexes to KEEP:
userSchema.index({ role: 1 }); // Keep if you query role alone frequently
userSchema.index({ city: 1 }); // Keep for city-based queries
userSchema.index({ state: 1 }); // Keep for state-based queries
userSchema.index({ userVerified: 1 }); // Keep for verification queries
userSchema.index({ previousRole: 1 }); // Unique enough to keep

// Compound indexes to KEEP:
userSchema.index({ email: 1, role: 1 }); // Good for admin lookups
userSchema.index({ username: 1, userVerified: 1 }); // Good for user lookups
userSchema.index({ role: 1, userIsAnAgent: 1 }); // Good for agent management
userSchema.index({ userAccountSuspended: 1, userAccountDeleted: 1 }); // Good for admin dashboard
userSchema.index({ createdAt: -1 }); // Essential for pagination
userSchema.index({ updatedAt: -1 }); // Good for activity tracking
userSchema.index({ userOnboarded: 1, profileCreated: 1 }); // Good for onboarding flow

// Text search - KEEP
userSchema.index({
  username: 'text',
  email: 'text',
  surName: 'text',
  lastName: 'text',
  bio: 'text'
});

// Sparse indexes - KEEP
userSchema.index({ phoneNumber: 1 }, { sparse: true });
userSchema.index({ agentId: 1 }, { sparse: true });

userSchema.pre<IUser>('save', async function (next) {
  // Only generate color if it's not already set or for new documents
  if (!this.placeholderColor) {
    this.placeholderColor = generatePlaceholderColor();
  }

  // Only hash password if it's modified and exists
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return this.password ? bcrypt.compare(password, this.password) : false;
};

// Improved model creation with better caching
let User: Model<IUser>;

if (mongoose.models.User) {
  User = mongoose.models.User;
} else {
  User = mongoose.model<IUser>('User', userSchema);
}

export default User;