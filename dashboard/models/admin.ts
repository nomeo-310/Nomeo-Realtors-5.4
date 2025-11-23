import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import generateAdminId from '@/utils/generateAdminId';

export interface IAdmin extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
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
}

const adminSchema: mongoose.Schema<IAdmin> = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true, // One admin per user
      index: true 
    },
    role: { 
      type: String, 
      enum: ['admin', 'creator', 'superAdmin'], 
      default: 'admin',
      index: true 
    },
    adminAccess: { 
      type: String, 
      enum: ['full_access', 'limited_access', 'no_access'], 
      default: 'no_access',
      index: true 
    },
    adminPermissions: { 
      type: [String], 
      default: [] 
    },
    adminId: { 
      type: String, 
      unique: true, 
      default: undefined,
      index: true 
    },
    isActivated: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    activatedAt: { 
      type: Date, 
      default: Date.now, // Fixed: removed parentheses
      index: true 
    },
    activatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      index: true 
    },
    password: { 
      type: String, 
      default: undefined 
    },
    passwordAdded: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    accessId: { 
      type: String, 
      unique: true,
      index: true 
    },
    accessIdExpires: { 
      type: Number, 
      default: undefined,
      index: true 
    },
    otp: { 
      type: String,
      index: true 
    },
    otpExpiresIn: { 
      type: Number, 
      default: undefined,
      index: true 
    },
    resetAccessIdOtp: { 
      type: String, 
      default: undefined,
      index: true 
    },
    resetAccessIdOtpExpiresIn: { 
      type: Number, 
      default: undefined,
      index: true 
    },
    isSuspended: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    suspendedAt: { 
      type: Date, 
      default: undefined,
      index: true 
    },
    suspendedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin',
      index: true 
    },
    suspensionReason: { 
      type: String, 
      default: undefined 
    },
    lockUntil: { 
      type: Date, 
      default: undefined,
      index: true 
    },
    deactivatedAt: { 
      type: Date, 
      default: undefined,
      index: true 
    },
    deactivatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin',
      index: true 
    },
    deactivationReason: {
      type: String, 
      default: undefined 
    },
    reactivatedAt: { 
      type: Date, 
      default: undefined,
      index: true 
    },
    reactivatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin',
      index: true 
    },
    adminOnboarded: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin',
      index: true 
    },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
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

// TTL index for expired OTPs and access IDs (auto-cleanup)
adminSchema.index({ otpExpiresIn: 1 }, { 
  expireAfterSeconds: 0, 
  partialFilterExpression: { otpExpiresIn: { $lte: Date.now() } } 
});

adminSchema.index({ accessIdExpires: 1 }, { 
  expireAfterSeconds: 0, 
  partialFilterExpression: { accessIdExpires: { $lte: Date.now() } } 
});

adminSchema.index({ resetAccessIdOtpExpiresIn: 1 }, { 
  expireAfterSeconds: 0, 
  partialFilterExpression: { resetAccessIdOtpExpiresIn: { $lte: Date.now() } } 
});

// Sparse indexes for optional fields
adminSchema.index({ activatedBy: 1 }, { sparse: true });
adminSchema.index({ suspendedBy: 1 }, { sparse: true });
adminSchema.index({ deactivatedBy: 1 }, { sparse: true });
adminSchema.index({ reactivatedBy: 1 }, { sparse: true });
adminSchema.index({ createdBy: 1 }, { sparse: true });
adminSchema.index({ lockUntil: 1 }, { sparse: true });

// Multi-key index for permissions (if you need to query specific permissions)
// adminSchema.index({ adminPermissions: 1 });

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

// Simplified model creation
const Admin: mongoose.Model<IAdmin> = mongoose.models.Admin || 
  mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;