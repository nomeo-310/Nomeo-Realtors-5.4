import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import generateAdminId from '@/utils/generateAdminId';
import { IUser } from './user';

// Admin History Interface
export interface IAdminHistory {
  role: string;
  changedAt: Date;
  changedBy: mongoose.Types.ObjectId;
  reason?: string;
}

export interface IAdmin extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: IUser |  mongoose.Types.ObjectId;
  role: string;
  adminAccess: 'full_access' | 'limited_access' | 'no_access';
  adminPermissions: string[];
  adminId: string;
  isActivated: boolean;
  activatedAt: Date;
  activatedBy: mongoose.Types.ObjectId;
  isSuspended: boolean;
  suspendedAt: Date;
  suspendedBy: mongoose.Types.ObjectId;
  suspensionReason: string;
  password?: string;
  passwordAdded: boolean;
  accessId: string;
  accessIdExpires?: number;
  otp?: string;
  otpExpiresIn?: number;
  resetAccessIdOtp?: string;
  resetAccessIdOtpExpiresIn?: number;
  lockUntil?: Date;
  deactivatedAt: Date;
  deactivatedBy: mongoose.Types.ObjectId;
  deactivationReason: string;
  reactivatedAt: Date;
  reactivatedBy: mongoose.Types.ObjectId;
  adminOnboarded: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
  adminHistory: IAdminHistory[];
}

const adminHistorySchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['admin', 'creator', 'superAdmin']
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    default: ''
  }
});

const adminSchema: mongoose.Schema<IAdmin> = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true
    },
    role: { 
      type: String, 
      enum: ['admin', 'creator', 'superAdmin'], 
      default: 'admin'
    },
    adminAccess: { 
      type: String, 
      enum: ['full_access', 'limited_access', 'no_access'], 
      default: 'no_access'
    },
    adminPermissions: { 
      type: [String], 
      default: [] 
    },
    adminId: { 
      type: String, 
      unique: true, 
      default: undefined
    },
    isActivated: { 
      type: Boolean, 
      default: false
    },
    activatedAt: { 
      type: Date, 
      default: Date.now
    },
    activatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    password: { 
      type: String, 
      default: undefined 
    },
    passwordAdded: { 
      type: Boolean, 
      default: false
    },
    accessId: { 
      type: String, 
      unique: true
    },
    accessIdExpires: { 
      type: Number, 
      default: undefined
    },
    otp: { 
      type: String
    },
    otpExpiresIn: { 
      type: Number, 
      default: undefined
    },
    resetAccessIdOtp: { 
      type: String, 
      default: undefined
    },
    resetAccessIdOtpExpiresIn: { 
      type: Number, 
      default: undefined
    },
    isSuspended: { 
      type: Boolean, 
      default: false
    },
    suspendedAt: { 
      type: Date, 
      default: undefined
    },
    suspendedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin'
    },
    suspensionReason: { 
      type: String, 
      default: undefined 
    },
    lockUntil: { 
      type: Date, 
      default: undefined
    },
    deactivatedAt: { 
      type: Date, 
      default: undefined
    },
    deactivatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin'
    },
    deactivationReason: {
      type: String, 
      default: undefined 
    },
    reactivatedAt: { 
      type: Date, 
      default: undefined
    },
    reactivatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin'
    },
    adminOnboarded: { 
      type: Boolean, 
      default: false
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin'
    },
    // NEW FIELDS
    updatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      sparse: true
    },
    adminHistory: { 
      type: [adminHistorySchema], 
      default: [] 
    },
  },
  { timestamps: true }
);

// EXISTING INDEXES (keep all your current indexes)
adminSchema.index({ role: 1 });
adminSchema.index({ adminAccess: 1 });
adminSchema.index({ isActivated: 1 });
adminSchema.index({ activatedAt: 1 });
adminSchema.index({ passwordAdded: 1 });
adminSchema.index({ otp: 1 });
adminSchema.index({ isSuspended: 1 });
adminSchema.index({ suspendedAt: 1 });
adminSchema.index({ lockUntil: 1 });
adminSchema.index({ deactivatedAt: 1 });
adminSchema.index({ reactivatedAt: 1 })
adminSchema.index({ adminOnboarded: 1 });

// Compound indexes
adminSchema.index({ role: 1, adminAccess: 1 });
adminSchema.index({ role: 1, isActivated: 1 });
adminSchema.index({ isActivated: 1, adminOnboarded: 1 });
adminSchema.index({ isSuspended: 1, isActivated: 1 });
adminSchema.index({ adminAccess: 1, isActivated: 1 });
adminSchema.index({ createdAt: -1, role: 1 });
adminSchema.index({ activatedAt: -1, isActivated: 1 });
adminSchema.index({ suspendedAt: -1, isSuspended: 1 });
adminSchema.index({ userId: 1, isActivated: 1 });
adminSchema.index({ accessId: 1, accessIdExpires: 1 });
adminSchema.index({ otp: 1, otpExpiresIn: 1 });
adminSchema.index({ passwordAdded: 1, isActivated: 1 });

// TTL indexes
adminSchema.index({ otpExpiresIn: 1 }, { 
  expireAfterSeconds: 0
});

adminSchema.index({ accessIdExpires: 1 }, { 
  expireAfterSeconds: 0
});

adminSchema.index({ resetAccessIdOtpExpiresIn: 1 }, { 
  expireAfterSeconds: 0
});

// Sparse indexes
adminSchema.index({ activatedBy: 1 }, { sparse: true });
adminSchema.index({ suspendedBy: 1 }, { sparse: true });
adminSchema.index({ deactivatedBy: 1 }, { sparse: true });
adminSchema.index({ reactivatedBy: 1 }, { sparse: true });
adminSchema.index({ createdBy: 1 }, { sparse: true });
adminSchema.index({ updatedBy: 1 }, { sparse: true }); // NEW INDEX

// NEW: Index for admin history queries
adminSchema.index({ 'adminHistory.changedAt': -1 });
adminSchema.index({ 'adminHistory.changedBy': 1 });

adminSchema.pre<IAdmin>('save', async function (next) {
  // Only generate adminId if it doesn't exist
  if (!this.adminId) {
    const adminIdTag = generateAdminId();
    this.adminId = adminIdTag;
  }

  // Update permissions and access based on role changes
  if (this.isModified('role') || this.adminPermissions.length === 0) {
    const roleKey = this.role.toUpperCase() as keyof typeof ROLE_PERMISSIONS;
    this.adminPermissions = ROLE_PERMISSIONS[roleKey] || [];
  }

  // Update admin access based on role
  if (this.isModified('role')) {
    if (this.role === 'superAdmin') {
      this.adminAccess = 'full_access';
    } else {
      this.adminAccess = 'limited_access';
    }
  }

  // Hash password if modified
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

// Add method to compare access ID/password
adminSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return this.password ? bcrypt.compare(password, this.password) : false;
};

// FIXED: Better model creation with connection check
let Admin: mongoose.Model<IAdmin>;

// Check if model already exists to prevent recompilation
if (mongoose.models.Admin) {
  Admin = mongoose.models.Admin;
} else {
  Admin = mongoose.model<IAdmin>('Admin', adminSchema);
}

export default Admin;