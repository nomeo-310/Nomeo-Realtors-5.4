import mongoose from 'mongoose';
import generateAgentId from '../utils/generateAgentId';
import bcrypt from 'bcryptjs';


interface IAdmin extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  adminAccess: 'full_access' | 'limited_access' | 'no_access';
  adminPermissions: string[];
  adminId: string;
  isActivated: boolean;
  activatedAt: Date;
  activatedBy: mongoose.Types.ObjectId;
  password?: string;
  passwordAdded: boolean;
  accessId: string;
  accessIdExpires?:  number;
  otp?: string;
  otpExpiresIn?: number;
  resetAccessIdOtp?: string;
  resetAccessIdOtpExpiresIn?: number;
  lockUntil?: Date;
  deactivatedAt: Date;
  deactivatedBy: mongoose.Types.ObjectId;
  adminOnboarded: boolean;
  createdBy:  mongoose.Types.ObjectId;
}

const adminSchema: mongoose.Schema<IAdmin> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'creator', 'superAdmin'], default: 'admin',},
    adminAccess: { type: String, enum: ['full_access', 'limited_access', 'no_access'], default: 'no_access' },
    adminPermissions: { type: [String], default: [] },
    adminId: { type: String, unique: true, default: undefined },
    isActivated: { type: Boolean, default: false },
    activatedAt: { type: Date, default: Date.now()},
    activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    password: { type: String, default: undefined },
    passwordAdded: { type: Boolean, default: false }, 
    accessId: { type: String, unique: true },
    accessIdExpires: { type: Number, default: undefined},
    otp: { type: String },
    otpExpiresIn: { type: Number, default: undefined },
    resetAccessIdOtp: { type: String, default: undefined },
    resetAccessIdOtpExpiresIn: { type: Number, default: undefined },
    lockUntil: { type: Date, default: undefined },
    deactivatedAt: { type: Date, default: undefined },
    deactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminOnboarded: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

adminSchema.pre<IAdmin>('save', async function (next) {
  if (!this.adminId) {
    const adminIdTag = generateAgentId();
    this.adminId = adminIdTag;
  }

  if (this.isModified('password') && this.password) {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 12);
      this.password = hashedPassword;
      
      if (!this.passwordAdded) {
        this.passwordAdded = true;
      }
    } catch (error) {
      return next(error as Error);
    }
  }

  next();
});

let Admin: mongoose.Model<IAdmin>;

try {

  Admin = mongoose.model<IAdmin>('Admin');
} catch (error) {

  Admin = mongoose.model<IAdmin>('Admin', adminSchema);
}

export default Admin;