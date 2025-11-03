import mongoose, { Schema, Types, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { generatePlaceholderColor } from '../utils/generatePlaceholderColor';

type Image = {
  public_id: string;
  secure_url: string;
};

interface IUser extends Document {
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
  userAccountDeleted:  boolean;
  userAccountSuspended: boolean;
  suspensionReason: string;
  suspendedAt: Date;
  suspendedBy: Types.ObjectId;
  showLikedApartments: boolean;
  showBookmarkedApartments: boolean;
  showLikedBlogs: boolean;
  showBookmarkedBlogs: boolean;
  subscribedToNewsletter: boolean;
  blogCollaborator: boolean;
  collaborations: mongoose.Types.ObjectId[];
  createdBlogs: mongoose.Types.ObjectId[];
  agentId?: Types.ObjectId;
  notifications?: Types.ObjectId[];
  likedApartments?: Types.ObjectId[];
  bookmarkedApartments?: Types.ObjectId[];
  likedBlogs?: Types.ObjectId[];
  bookmarkedABlogs?: Types.ObjectId[];
  comments?: Types.ObjectId[];
  propertyAgents?: Types.ObjectId[];
  propertiesRented?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: undefined },
    role: { type: String, enum: ['user', 'agent', 'admin', 'creator', 'superAdmin'], default: 'user' },
    surName: { type: String, default: undefined },
    lastName: { type: String, default: undefined },
    profilePicture: { type: String, default: undefined },
    profileImage: {
      public_id: { type: String, default: undefined },
      secure_url: { type: String, default: undefined },
    },
    bio: { type: String, default: undefined },
    phoneNumber: { type: String, default: undefined },
    additionalPhoneNumber: { type: String, default: undefined },
    address: { type: String, default: undefined },
    city: { type: String, default: undefined },
    state: { type: String, default: undefined },
    otp: { type: String, default: undefined },
    otpExpiresIn: { type: Number, default: undefined },
    resetPasswordOtp: { type: String, default: undefined },
    placeholderColor: { type: String, default: '' },
    resetPasswordOtpExpiresIn: { type: Number, default: undefined },
    userOnboarded: { type: Boolean, default: false },
    profileCreated: { type: Boolean, default: false },
    userVerified: { type: Boolean, default: false },
    userIsAnAgent: { type: Boolean, default: false },
    userAccountDeleted: { type: Boolean, default: false },
    userAccountSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, default: '' },
    suspendedAt: { type: Date, default: undefined },
    suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    showLikedApartments: { type: Boolean, default: false },
    showBookmarkedApartments: { type: Boolean, default: false },
    showLikedBlogs: { type: Boolean, default: false },
    showBookmarkedBlogs: { type: Boolean, default: false },
    subscribedToNewsletter: { type: Boolean, default: false },
    blogCollaborator: {type: Boolean, default: false},
    collaborations: [{ type: mongoose.Schema.ObjectId, ref: 'Blog' }],
    createdBlogs: [{ type: mongoose.Schema.ObjectId, ref: 'Blog' }],
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
    notifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
    likedApartments: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    bookmarkedApartments: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
    likedBlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    bookmarkedABlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    propertyAgents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
    propertiesRented: [{ type: Schema.Types.ObjectId, ref: 'Apartment' }],
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    if (this.password) {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }
  }

  const color = generatePlaceholderColor();
  this.placeholderColor = color;

  next();
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

let User: Model<IUser>;

try {
  User = mongoose.model<IUser>('User');
} catch (error) {
  User = mongoose.model<IUser>('User', userSchema);
}

export default User;