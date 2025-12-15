'use server'

import { connectToMongoDB } from "@/utils/connectToMongoDB";
import User from "@/models/user";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import Suspension, { SuspensionDuration } from "@/models/suspension";
import { getCurrentUser } from "./auth-actions";
import { createServerPermissionService } from "@/utils/permission-service";
import Apartment from "@/models/apartment";
import { AccountSuspendedEmailTemplate } from "@/components/email-templates/account-suspension-email-template";
import { render } from "@react-email/components";
import { sendEmail } from "@/utils/send-email";
import { capitalizeName } from "@/utils/capitalizeName";
import { formatDateWithFullMonth } from "@/utils/formatDate";
import mongoose from "mongoose";
import Admin from "@/models/admin";

interface userDetails {
  userId: string;
  path: string;
  reason: string;
}

interface suspendAccountProps extends userDetails {
  category: string;
  duration: SuspensionDuration;
}

interface liftSuspensionProps {
  suspensionId: string;
  liftReason?: string;
  path?: string;
}

interface ExtendSuspensionProps {
  userId: string;
  suspensionId: string;
  duration: SuspensionDuration;
  extensionReason: string;
  category: string;
  path?: string;
}

interface HandleAppealProps {
  suspensionId: string;
  appealId: string;
  decision: 'approve' | 'reject';
  adminNotes?: string;
  path?: string;
}

interface SuspendAdminProps {
  adminId: string;
  reason: string;
  category: string;
  duration: SuspensionDuration;
  path?: string;
}

// Utility functions
const calculateSuspendedUntil = (duration: SuspensionDuration): Date | undefined => {
  const now = new Date();

  switch (duration) {
    case '24_hours':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '3_days':
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case '7_days':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '30_days':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'indefinite':
      return undefined;
    default:
      return undefined;
  }
};

const sendSuspensionEmail = async (
  type: 'suspension' | 'lift' | 'extension' | 'appeal' | 'appeal_approved' | 'appeal_rejected' | 'auto_lift',
  name: string,
  reason: string,
  category: string,
  suspensionDate: string,
  email: string,
  subject: string,
  isExtended?: boolean,
  contactEmail?: string,
): Promise<boolean> => {
  try {
    const emailTemplate = await render(
      AccountSuspendedEmailTemplate({
        type,
        name,
        reason,
        category,
        suspensionDate,
        contactEmail,
        isExtended: isExtended || false,
      })
    );

    await sendEmail({ email, subject, html: emailTemplate });
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

const getSuspensionCount = async (userId: string): Promise<number> => {
  await connectToMongoDB();
  return await Suspension.countDocuments({ user: userId });
};

const canModifySuspension = (suspension: any, currentUser: any): boolean => {
  const suspensionEntry = suspension.history.find((h: any) => h.action === 'suspension');
  return suspensionEntry?.performedBy?.toString() === currentUser.userId._id.toString();
};

export const canSuspendAdmin = async (adminId: string) => {
  try {
    await connectToMongoDB();

    const current_user = await getCurrentUser();

    if (!current_user) {
      return { 
        success: false, 
        canSuspend: false, 
        message: 'Not authenticated' 
      };
    }

    const permissions = createServerPermissionService(current_user.role);
    
    if (!permissions.isSuperAdmin) {
      return { 
        success: true, 
        canSuspend: false, 
        message: 'Only Super Admins can suspend other admins' 
      };
    }

    const adminToCheck = await User.findById(adminId);
    
    if (!adminToCheck) {
      return { 
        success: true, 
        canSuspend: false, 
        message: 'Admin not found' 
      };
    }

    // Cannot suspend yourself
    if (current_user.userId._id.toString() === adminId) {
      return { 
        success: true, 
        canSuspend: false, 
        message: 'Cannot suspend your own account' 
      };
    }

    // Check if already suspended
    const activeSuspension = await Suspension.findOne({ 
      user: adminId, 
      isActive: true 
    });

    if (activeSuspension) {
      return { 
        success: true, 
        canSuspend: false, 
        message: 'Admin is already suspended' 
      };
    }

    return { 
      success: true, 
      canSuspend: true, 
      message: 'Admin can be suspended',
      adminDetails: {
        role: adminToCheck.role,
        name: `${adminToCheck.surName} ${adminToCheck.lastName}`,
        email: adminToCheck.email
      }
    };

  } catch (error) {
    console.error('Error checking admin suspension eligibility:', error);
    return { 
      success: false, 
      canSuspend: false, 
      message: 'Error checking suspension eligibility' 
    };
  }
};

// Suspend user
export const suspendUser = async (values: suspendAccountProps) => {
  const { userId, category, reason, duration, path } = values;

  try {
    await connectToMongoDB();

    const current_user = await getCurrentUser();

    if (!current_user) {
      return { success: false, message: 'You are not logged in', status: 403 };
    }

    const permissions = createServerPermissionService(current_user.role);

    if (!permissions.canManageUsers()) {
      return { success: false, message: 'You are not authorized to suspend user accounts', status: 403 };
    }

    if (current_user.userId._id === userId) {
      return { success: false, message: 'You cannot suspend your own account', status: 400 };
    }

    const focusedUser = await User.findById(userId);

    if (!focusedUser) {
      return { success: false, message: 'User does not exist', status: 404 };
    }

    // Enhanced check: Verify no active suspension exists
    const activeSuspension = await Suspension.findOne({ user: userId, isActive: true });

    if (activeSuspension) {
      return {
        success: false,
        message: 'User account is already suspended by another admin',
        status: 400
      };
    }

    if (focusedUser.userAccountSuspended) {
      return { success: false, message: 'User account is already suspended', status: 400 };
    }

    if (['superAdmin', 'admin', 'creator'].includes(focusedUser.role) && !permissions.isSuperAdmin) {
      return { success: false, message: 'You cannot suspend other admin accounts', status: 403 };
    }

    // Start transaction for atomic operations
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const suspensionCount = await getSuspensionCount(userId) + 1;
        const suspendedUntil = calculateSuspendedUntil(duration);
        const suspendedAt = new Date();
        const suspensionDuration = duration;

        const newSuspensionData = {
          user: focusedUser._id,
          isActive: true,
          suspendedUntil,
          history: [{
            action: 'suspension',
            description: `Suspension #${suspensionCount}: ${reason}`,
            performedBy: new Types.ObjectId(current_user.userId._id),
            performedAt: suspendedAt,
            reason,
            duration,
            data: { category, suspensionCount }
          }]
        };

        const suspension = new Suspension(newSuspensionData);
        await suspension.save({ session });

        const userSuspensionUpdate = {
          userAccountSuspended: true,
          suspensionReason: reason,
          suspensionDuration,
          suspendedAt,
          suspendedBy: new Types.ObjectId(current_user.userId._id)
        };

        await User.findByIdAndUpdate(userId, userSuspensionUpdate, { session });

        if (focusedUser.role === 'agent') {
          await Apartment.updateMany(
            { agent: focusedUser.agentId },
            { hideProperty: true },
            { session }
          );
        }

        const formattedDate = formatDateWithFullMonth(suspendedAt);
        const name = `${capitalizeName(focusedUser.surName ?? '')} ${capitalizeName(focusedUser.lastName ?? '')}`;

        // Send suspension email
        await sendSuspensionEmail(
          'suspension',
          name,
          reason,
          category,
          formattedDate || " ",
          focusedUser.email,
          'Account Suspended',
          false
        );
      });

      revalidatePath(path);
      return { success: true, message: 'User account successfully suspended', status: 200 };

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Error suspending user:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

// Lift user suspension (manual lift by admin)
export const liftUserSuspension = async (values: liftSuspensionProps) => {
  const { suspensionId, liftReason, path } = values;

  try {
    await connectToMongoDB();

    const current_user = await getCurrentUser();

    if (!current_user) {
      return { success: false, message: 'You are not logged in', status: 403 };
    }

    const permissions = createServerPermissionService(current_user.role);

    if (!permissions.canManageUsers()) {
      return { success: false, message: 'You are not authorized to revoke suspensions', status: 403 };
    }

    const suspension = await Suspension.findOne({ _id: suspensionId, isActive: true });

    if (!suspension) {
      return { success: false, message: 'Active suspension not found', status: 404 };
    }

    // Check if current user is the one who performed the suspension
    if (!canModifySuspension(suspension, current_user)) {
      // For admin suspensions, allow superAdmins to lift any suspension
      const user = await User.findById(suspension.user);
      if (user && ['admin', 'superAdmin', 'creator'].includes(user.role)) {
        // Only superAdmins can lift admin suspensions (including those by other admins)
        if (!permissions.isSuperAdmin) {
          return { 
            success: false, 
            message: 'Only Super Admins can lift suspensions on admin accounts', 
            status: 403 
          };
        }
      } else {
        return { 
          success: false, 
          message: 'Only the admin who suspended this user can lift the suspension', 
          status: 403 
        };
      }
    }

    const user = await User.findById(suspension.user);
    if (!user) {
      return { success: false, message: 'User not found', status: 404 };
    }

    // Check if this is an admin account
    const isAdminAccount = ['admin', 'superAdmin', 'creator'].includes(user.role);
    const adminRecord = isAdminAccount ? await Admin.findOne({ userId: user._id }) : null;

    // Start transaction for atomic operations
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Lift suspension
        suspension.isActive = false;
        suspension.suspendedUntil = undefined;
        suspension.history.push({
          action: 'lift',
          description: liftReason ? `Suspension lifted: ${liftReason}` : 'Suspension lifted by administrator',
          performedBy: new Types.ObjectId(current_user.userId._id),
          performedAt: new Date(),
          reason: liftReason || 'Suspension lifted by administrator'
        });

        await suspension.save({ session });

        // Update user account
        const updateUserData = {
          userAccountSuspended: false,
          suspensionReason: '',
          suspendedAt: undefined,
          suspendedBy: undefined,
          suspensionDuration: undefined,
        };

        await User.findByIdAndUpdate(suspension.user, updateUserData, { session });

        // If it's an admin, also update the Admin record
        if (isAdminAccount && adminRecord) {
          const adminUpdateData = {
            isActive: true,
            isSuspended: false,
            suspendedAt: undefined,
            suspendedBy: undefined,
            suspensionReason: ''
          };

          await Admin.findByIdAndUpdate(adminRecord._id, adminUpdateData, { session });
        }

        // Reactivate agent properties if applicable
        if (user.role === 'agent') {
          await Apartment.updateMany(
            { agent: user.agentId },
            { hideProperty: false },
            { session }
          );
        }

        const currentDate = new Date();
        const formattedDate = formatDateWithFullMonth(currentDate);
        const name = `${capitalizeName(user.surName ?? '')} ${capitalizeName(user.lastName ?? '')}`;

        // Send appropriate lift email based on user type
        if (isAdminAccount) {
          await sendSuspensionEmail(
            'lift',
            name,
            liftReason || 'Your admin suspension has been lifted',
            'Admin Suspension Lifted',
            formattedDate || "",
            user.email,
            'ADMIN ACCOUNT SUSPENSION LIFTED',
            false,
            'admin-support@yourdomain.com'
          );
        } else {
          await sendSuspensionEmail(
            'lift',
            name,
            liftReason || 'Your suspension has been lifted by an administrator',
            '',
            formattedDate || "",
            user.email,
            'Account Suspension Lifted',
            false
          );
        }
      });

      path && revalidatePath(path);
      
      return { 
        success: true, 
        message: isAdminAccount ? 'Admin suspension successfully lifted' : 'Suspension successfully lifted', 
        status: 200,
        data: {
          userType: user.role,
          liftedBy: current_user.userId._id
        }
      };

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Error lifting suspension:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500
    };
  }
};

// Extend suspension duration
export const extendSuspension = async (values: ExtendSuspensionProps) => {
  const { suspensionId, duration, extensionReason, path, userId, category } = values;

  try {
    await connectToMongoDB();

    const current_user = await getCurrentUser();

    if (!current_user) {
      return { success: false, message: 'You are not logged in', status: 403 };
    }

    const permissions = createServerPermissionService(current_user.role);

    if (!permissions.canManageUsers()) {
      return { success: false, message: 'You are not authorized to extend suspensions', status: 403 };
    }

    const suspension = await Suspension.findOne({ _id: suspensionId, isActive: true });

    if (!suspension) {
      return { success: false, message: 'Active suspension not found', status: 404 };
    }

    // Check if current user is the one who performed the suspension
    if (!canModifySuspension(suspension, current_user)) {
      return { success: false, message: 'Only the admin who suspended this user can extend the suspension', status: 403 };
    }

    const focusedUser = await User.findById(userId);
    if (!focusedUser) {
      return { success: false, message: 'User does not exist', status: 404 };
    }

    const newSuspendedUntil = calculateSuspendedUntil(duration);
    const extendedAt = new Date();

    // Update suspension
    suspension.suspendedUntil = newSuspendedUntil;
    suspension.history.push({
      action: 'extension',
      description: `Suspension extended: ${extensionReason}. New duration: ${duration}`,
      performedBy: new Types.ObjectId(current_user.userId._id),
      performedAt: extendedAt,
      reason: extensionReason,
      duration,
      data: {
        previousSuspendedUntil: suspension.suspendedUntil,
        extensionDate: extendedAt
      }
    });

    await suspension.save();

    // Update user's suspended date
    await User.findByIdAndUpdate(suspension.user, { suspendedAt: extendedAt });

    const formattedDate = formatDateWithFullMonth(newSuspendedUntil || extendedAt);
    const name = `${capitalizeName(focusedUser.surName ?? '')} ${capitalizeName(focusedUser.lastName ?? '')}`;

    // Send extension email
    await sendSuspensionEmail(
      'extension',
      name,
      extensionReason,
      category,
      formattedDate || "",
      focusedUser.email,
      'Account Suspension Extended',
      true
    );

    path && revalidatePath(path);
    return {
      success: true,
      message: 'Suspension successfully extended',
      status: 200,
      data: {
        suspendedUntil: newSuspendedUntil
      }
    };

  } catch (error) {
    console.error('Error extending suspension:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

// Approve or reject appeal (with automatic lift on approval)
export const handleAppeal = async (values: HandleAppealProps) => {
  const { suspensionId, appealId, decision, adminNotes, path } = values;

  try {
    await connectToMongoDB();

    const current_user = await getCurrentUser();

    if (!current_user) {
      return { success: false, message: 'You are not logged in', status: 403 };
    }

    const permissions = createServerPermissionService(current_user.role);

    if (!permissions.canManageUsers()) {
      return { success: false, message: 'You are not authorized to handle appeals', status: 403 };
    }

    const suspension = await Suspension.findOne({ _id: suspensionId, isActive: true });

    if (!suspension) {
      return { success: false, message: 'Active suspension not found', status: 404 };
    }

    // Check if current user is the one who performed the suspension
    if (!canModifySuspension(suspension, current_user)) {
      return { success: false, message: 'Only the admin who suspended this user can handle appeals', status: 403 };
    }

    const appealEntry = suspension.history.find((entry: any) => entry._id.toString() === appealId);

    if (!appealEntry || appealEntry.action !== 'appeal') {
      return { success: false, message: 'Appeal not found', status: 404 };
    }

    if (appealEntry.data?.processed) {
      return { success: false, message: 'This appeal has already been processed', status: 400 };
    }

    const processedAt = new Date();
    const user = await User.findById(suspension.user);
    if (!user) {
      return { success: false, message: 'User not found', status: 404 };
    }

    const name = `${capitalizeName(user.surName ?? '')} ${capitalizeName(user.lastName ?? '')}`;
    const currentDate = formatDateWithFullMonth(processedAt);

    if (decision === 'approve') {
      // APPROVE APPEAL + AUTOMATICALLY LIFT SUSPENSION
      suspension.isActive = false;
      suspension.suspendedUntil = undefined;

      suspension.history.push({
        action: 'appeal_approved',
        description: `Appeal approved and suspension lifted: ${adminNotes || 'Appeal granted'}`,
        performedBy: new Types.ObjectId(current_user.userId._id),
        performedAt: processedAt,
        reason: adminNotes || 'Appeal approved',
        data: {
          appealId: appealId,
          originalAppealReason: appealEntry.reason
        }
      });

      // Update user account
      await User.findByIdAndUpdate(suspension.user, {
        userAccountSuspended: false,
        suspensionReason: '',
        suspendedAt: undefined,
        suspendedBy: undefined
      });

      // Reactivate agent properties if applicable
      if (user.role === 'agent') {
        await Apartment.updateMany(
          { agent: user.agentId },
          { hideProperty: false }
        );
      }

      // Send appeal approved + lift email
      await sendSuspensionEmail(
        'appeal_approved',
        name,
        adminNotes || 'Your appeal has been approved and your suspension has been lifted',
        '',
        currentDate || "",
        user.email,
        'Appeal Approved - Suspension Lifted',
        false
      );

    } else {
      // REJECT APPEAL (suspension continues)
      suspension.history.push({
        action: 'appeal_rejected',
        description: `Appeal rejected: ${adminNotes || 'Appeal denied'}`,
        performedBy: new Types.ObjectId(current_user.userId._id),
        performedAt: processedAt,
        reason: adminNotes || 'Appeal rejected',
        data: {
          appealId: appealId,
          originalAppealReason: appealEntry.reason
        }
      });

      // Send appeal rejected email
      await sendSuspensionEmail(
        'appeal_rejected',
        name,
        adminNotes || 'Your appeal has been rejected. Your suspension remains active.',
        '',
        currentDate || "",
        user.email,
        'Appeal Rejected',
        false
      );
    }

    // Mark appeal as processed
    appealEntry.data = {
      ...appealEntry.data,
      processed: true,
      processedAt: processedAt,
      processedBy: current_user.userId._id,
      decision: decision
    };

    suspension.markModified('history');
    await suspension.save();

    revalidatePath(path || '/admin/suspensions');
    return {
      success: true,
      message: `Appeal ${decision} successfully${decision === 'approve' ? ' and suspension lifted' : ''}`,
      status: 200
    };

  } catch (error) {
    console.error('Error handling appeal:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

// Get user suspension history
export const getUserSuspensionHistory = async (userId: string) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to get user suspension history', status: 403 };
  }

  try {
    const suspensions = await Suspension.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('history.performedBy', 'username email')
      .exec();

    return { success: true, suspensions: JSON.parse(JSON.stringify(suspensions)) };

  } catch (error) {
    console.error('Error getting suspension history:', error);
    return { success: false, message: 'Failed to get suspension history', status: 500 };
  }
};

// Get user active suspension
export const getUserActiveSuspension = async (userId: string) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to get user active suspension', status: 403 };
  }

  try {
    const suspension = await Suspension.findOne({ user: userId, isActive: true })
      .populate('history.performedBy', 'username email')
      .exec();

    if (!suspension) {
      return { success: false, message: 'User is not suspended', status: 404 };
    }

    return JSON.parse(JSON.stringify(suspension));

  } catch (error) {
    console.error('Error getting active suspension:', error);
    return { success: false, message: 'Failed to get active suspension', status: 500 };
  }
};

// Check if user is suspended
export const isUserSuspended = async (userId: string) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to check user suspension status', status: 403 };
  }

  try {
    const suspension = await Suspension.findOne({ user: userId, isActive: true });

    return { success: true, isSuspended: !!suspension, status: 200 };

  } catch (error) {
    console.error('Error checking suspension status:', error);
    return { success: false, message: 'Failed to check suspension status', status: 500 };
  }
};

// Get suspension details
export const getSuspensionDetails = async (suspensionId: string) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to get suspension details', status: 403 };
  }

  try {
    const suspension = await Suspension.findById(suspensionId)
      .populate('history.performedBy', 'username email')
      .exec();

    if (!suspension) {
      return { success: false, message: 'Suspension not found', status: 404 };
    }

    return JSON.parse(JSON.stringify(suspension));

  } catch (error) {
    console.error('Error getting suspension details:', error);
    return { success: false, message: 'Failed to get suspension details', status: 500 };
  }
};

// Get all active suspensions
export const getAllActiveSuspensions = async () => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to get all active suspensions', status: 403 };
  }

  try {
    const suspensions = await Suspension.find({ isActive: true })
      .populate('user', 'username email surName lastName profilePicture role')
      .populate('history.performedBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();

    return JSON.parse(JSON.stringify(suspensions));

  } catch (error) {
    console.error('Error getting active suspensions:', error);
    return { success: false, message: 'Failed to get active suspensions', status: 500 };
  }
};

// Check and auto-lift expired suspensions (to be called by a cron job)
export const autoLiftExpiredSuspensions = async () => {
  try {
    await connectToMongoDB();
    
    const now = new Date();
    const expiredSuspensions = await Suspension.find({
      isActive: true,
      suspendedUntil: { $lte: now }
    })

    const results = [];

    for (const suspension of expiredSuspensions) {
      const user = await User.findById(suspension.user);
      try {
        suspension.isActive = false;
        suspension.history.push({
          action: 'auto_lift',
          description: 'Suspension automatically lifted due to expiration',
          performedBy: new Types.ObjectId('000000000000000000000000'), // System user
          performedAt: now,
          reason: 'Suspension period completed'
        });

        await suspension.save();

        // Update user account
        await User.findByIdAndUpdate(user?._id, {
          userAccountSuspended: false,
          suspensionReason: '',
          suspendedAt: undefined,
          suspendedBy: undefined
        });

        // Reactivate agent properties if applicable
        if (user?.role === 'agent') {
          await Apartment.updateMany(
            { agent: user?.agentId },
            { hideProperty: false }
          );
        }

        results.push({
          suspensionId: suspension._id,
          userId: user?._id,
          status: 'lifted'
        });

      } catch (error) {
        console.error(`Error auto-lifting suspension ${suspension._id}:`, error);
        results.push({
          suspensionId: suspension._id,
          userId: user?._id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: true,
      message: `Processed ${expiredSuspensions.length} expired suspensions`,
      data: results
    };

  } catch (error) {
    console.error('Error in auto-lift process:', error);
    return { success: false, message: 'Failed to process expired suspensions', status: 500 };
  }
};

// Add this function near your other suspension functions
export const suspendAdmin = async (values: SuspendAdminProps) => {
  const { adminId, category, reason, duration, path } = values;

  try {
    await connectToMongoDB();

    const current_user = await getCurrentUser();

    if (!current_user) {
      return { success: false, message: 'You are not logged in', status: 403 };
    }

    const permissions = createServerPermissionService(current_user.role);

    // Only superAdmins can suspend other admins
    if (!permissions.isSuperAdmin) {
      return { 
        success: false, 
        message: 'Only Super Admins can suspend other admin accounts', 
        status: 403 
      };
    }

    // Cannot suspend yourself
    if (current_user.userId._id.toString() === adminId) {
      return { 
        success: false, 
        message: 'You cannot suspend your own account', 
        status: 400 
      };
    }

    const adminToSuspend = await User.findById(adminId);

    if (!adminToSuspend) {
      return { 
        success: false, 
        message: 'Admin user not found', 
        status: 404 
      };
    }

    // Verify this is actually an admin user
    if (!['admin', 'superAdmin', 'creator'].includes(adminToSuspend.role)) {
      return { 
        success: false, 
        message: 'This user is not an admin. Use regular suspension instead.', 
        status: 400 
      };
    }

    // Cannot suspend superAdmins unless you're also a superAdmin
    // (already checked above, but extra safeguard)
    if (adminToSuspend.role === 'superAdmin' && current_user.role !== 'superAdmin') {
      return { 
        success: false, 
        message: 'Only Super Admins can suspend other Super Admins', 
        status: 403 
      };
    }

    // Enhanced check: Verify no active suspension exists
    const activeSuspension = await Suspension.findOne({ 
      user: adminId, 
      isActive: true 
    });

    if (activeSuspension) {
      return {
        success: false,
        message: 'Admin account is already suspended by another admin',
        status: 400
      };
    }

    if (adminToSuspend.userAccountSuspended) {
      return { 
        success: false, 
        message: 'Admin account is already suspended', 
        status: 400 
      };
    }

    // Start transaction for atomic operations
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const suspensionCount = await getSuspensionCount(adminId) + 1;
        const suspendedUntil = calculateSuspendedUntil(duration);
        const suspendedAt = new Date();
        const suspensionDuration = duration;

        const newSuspensionData = {
          user: adminToSuspend._id,
          isActive: true,
          suspendedUntil,
          history: [{
            action: 'suspension',
            description: `ADMIN SUSPENSION #${suspensionCount}: ${reason}`,
            performedBy: new Types.ObjectId(current_user.userId._id),
            performedAt: suspendedAt,
            reason,
            duration,
            data: { 
              category, 
              suspensionCount,
              adminType: adminToSuspend.role
            }
          }]
        };

        const suspension = new Suspension(newSuspensionData);
        await suspension.save({ session });

        const adminSuspensionUpdate = {
          userAccountSuspended: true,
          suspensionReason: reason,
          suspendedAt,
          suspendedBy: new Types.ObjectId(current_user.userId._id),
        };

        const suspensionUpdateData ={
          isActive: false,
          isSuspended: true,
          suspendedAt: Date.now(),
          suspendedBy: new Types.ObjectId(current_user.userId._id),
          suspensionDuration,
          suspensionReason: reason
        }

        await User.findByIdAndUpdate(adminId, adminSuspensionUpdate, { session });
        await Admin.findOneAndUpdate({userId: adminId}, suspensionUpdateData, { session })

        const formattedDate = formatDateWithFullMonth(suspendedAt);
        const name = `${capitalizeName(adminToSuspend.surName ?? '')} ${capitalizeName(adminToSuspend.lastName ?? '')}`;

        // Send admin-specific suspension email
        await sendSuspensionEmail(
          'suspension',
          name,
          reason,
          `Admin Suspension: ${category}`,
          formattedDate || " ",
          adminToSuspend.email,
          'ADMIN ACCOUNT SUSPENDED',
          false,
          'admin-support@yourdomain.com'
        );
      });

      path && revalidatePath(path);
      return { 
        success: true, 
        message: 'Admin account successfully suspended', 
        status: 200,
        data: {
          adminRole: adminToSuspend.role,
          suspendedBy: current_user.userId._id
        }
      };

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Error suspending admin:', error);
    return { 
      success: false, 
      message: 'Internal server error while suspending admin', 
      status: 500 
    };
  }
};
