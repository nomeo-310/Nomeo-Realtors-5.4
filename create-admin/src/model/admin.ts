import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import generateAdminId from '../utils/generateAdminId';
import { ROLE_PERMISSIONS } from '../utils/permissions';

const ADMIN_ROLES = ['admin', 'creator', 'superAdmin'] as const;
const ADMIN_ACCESS_LEVELS = ['full_access', 'limited_access', 'no_access'] as const;

export type AdminRole = typeof ADMIN_ROLES[number];
export type AdminAccess = typeof ADMIN_ACCESS_LEVELS[number];

export interface IAdminHistory {
  role: AdminRole;
  changedAt: Date;
  changedBy: mongoose.Types.ObjectId;
  reason?: string;
}

export interface IAdmin extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  role: AdminRole;
  adminAccess: AdminAccess;
  adminPermissions: string[];
  adminId: string;

  // Status flags
  isActive: boolean;
  isActivated: boolean;
  activatedAt?: Date;
  activatedBy?: mongoose.Types.ObjectId;

  isSuspended: boolean;
  suspendedAt?: Date;
  suspendedBy?: mongoose.Types.ObjectId;
  suspensionReason?: string;

  deactivated: boolean;
  deactivatedAt?: Date;
  deactivatedBy?: mongoose.Types.ObjectId;
  deactivationReason?: string;
  reactivatedAt?: Date;
  reactivatedBy?: mongoose.Types.ObjectId;

  // Auth & Security
  password?: string;
  passwordAdded: boolean;
  accessId?: string;
  accessIdExpires?: number;
  otp?: string;
  otpExpiresIn?: number;
  resetAccessIdOtp?: string;
  resetAccessIdOtpExpiresIn?: number;
  lockUntil?: Date;

  // Onboarding & Metadata
  adminOnboarded: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  adminHistory: IAdminHistory[];

  // Methods
  comparePassword(candidate: string): Promise<boolean>;
}

const AdminHistorySchema = new mongoose.Schema<IAdminHistory>(
  {
    role: { type: String, enum: ADMIN_ROLES, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const adminSchema = new mongoose.Schema<IAdmin>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true, // ✅ Added inline index (removes need for separate userId index)
    },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      default: 'admin',
      index: true, // ✅ Added inline index
    },
    adminAccess: {
      type: String,
      enum: ADMIN_ACCESS_LEVELS,
      default: 'no_access',
      index: true, // ✅ Added inline index
    },
    adminPermissions: {
      type: [String],
      default: [],
    },
    adminId: {
      type: String,
      unique: true,
      sparse: true,
      index: true, // ✅ Added inline index
    },

    // Status
    isActive: { type: Boolean, default: false },
    isActivated: { type: Boolean, default: false, index: true }, // ✅ Added inline index
    activatedAt: { type: Date, index: true }, // ✅ Added inline index

    isSuspended: { type: Boolean, default: false, index: true }, // ✅ Added inline index
    suspendedAt: { type: Date },
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    suspensionReason: String,

    deactivated: { type: Boolean, default: false, index: true }, // ✅ Added inline index
    deactivatedAt: { type: Date },
    deactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    deactivationReason: String,
    reactivatedAt: { type: Date },
    reactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

    // Auth
    password: String,
    passwordAdded: { type: Boolean, default: false },
    accessId: String,
    accessIdExpires: Number,
    otp: String,
    otpExpiresIn: Number,
    resetAccessIdOtp: String,
    resetAccessIdOtpExpiresIn: Number,
    lockUntil: Date,

    // Metadata
    adminOnboarded: { type: Boolean, default: false, index: true }, // ✅ Added inline index
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin',
      index: true, // ✅ Added inline index with sparse
      sparse: true 
    },
    updatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      sparse: true,
      // ❌ NO INDEX HERE - Already handled by sparse index below
    },
    adminHistory: { type: [AdminHistorySchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// KEEP THESE COMPOUND INDEXES (not covered by inline indexes):
adminSchema.index({ isActivated: 1, isSuspended: 1, deactivated: 1 });
adminSchema.index({ role: 1, isActivated: 1 });
adminSchema.index({ adminAccess: 1, isActivated: 1 });

// KEEP THESE TTL INDEXES:
adminSchema.index({ otpExpiresIn: 1 }, { expireAfterSeconds: 0 });
adminSchema.index({ accessIdExpires: 1 }, { expireAfterSeconds: 0 });
adminSchema.index({ resetAccessIdOtpExpiresIn: 1 }, { expireAfterSeconds: 0 });

// KEEP THESE SPARSE INDEXES (but remove duplicates):
adminSchema.index({ activatedBy: 1 }, { sparse: true });
// ❌ adminSchema.index({ createdBy: 1 }, { sparse: true }); // DUPLICATE - Already defined inline
// ❌ adminSchema.index({ updatedBy: 1 }, { sparse: true }); // KEEPING THIS ONE - not defined inline
adminSchema.index({ suspendedBy: 1 }, { sparse: true });
adminSchema.index({ deactivatedBy: 1 }, { sparse: true });
adminSchema.index({ reactivatedBy: 1 }, { sparse: true });

// KEEP THESE HISTORY INDEXES:
adminSchema.index({ "adminHistory.changedAt": -1 });
adminSchema.index({ "adminHistory.changedBy": 1 });

// ADD THESE NEW INDEXES FOR BETTER QUERY PERFORMANCE:
adminSchema.index({ activatedAt: -1, isActivated: 1 }); // For sorting active admins
adminSchema.index({ suspendedAt: -1, isSuspended: 1 }); // For suspension reports
adminSchema.index({ deactivatedAt: -1, deactivated: 1 }); // For deactivation reports
adminSchema.index({ passwordAdded: 1, isActivated: 1 }); // For onboarding flows

adminSchema.pre('save', async function (next) {
  // Generate adminId only once
  if (!this.adminId) {
    this.adminId = generateAdminId();
  }

  // Sync permissions & access level on role change
  if (this.isModified('role') || this.adminPermissions.length === 0) {
    const key = this.role.toUpperCase() as keyof typeof ROLE_PERMISSIONS;
    this.adminPermissions = ROLE_PERMISSIONS[key] || [];

    // Auto-set access level
    this.adminAccess = this.role === 'superAdmin' ? 'full_access' : 'limited_access';
  }

  // Hash password if modified and present
  if (this.isModified('password') && this.password) {
    try {
      this.password = await bcrypt.hash(this.password, 12);
      this.passwordAdded = true;
    } catch (err) {
      return next(err as Error);
    }
  }

  next();
});

adminSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

const AdminModel = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);

export default AdminModel;