'use server'


import Agent from "@/models/agent";
import { revalidatePath } from "next/cache";
import User from "@/models/user";
import Notification from "@/models/notification";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { getCurrentUser } from "./auth-actions";
import Admin from "@/models/admin";
import { createServerPermissionService } from "@/utils/permission-service";

interface agentDetails {
  agentId: string;
  path: string;
}

interface rejectionDetails extends agentDetails {
  reason: string;
};

type userDetails = {
  userId: string;
  path: string;
  reason: string;
}

type imageProps = {
  public_id: string;
  secure_url: string;
};

interface AdminActionParams {
  adminId: string;
  path: string;
  reason?: string;
}

const validateSuperAdminAccess = async (): Promise<{ success: boolean; user?: any; message?: string; status?: number }> => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.isSuperAdmin) {
    return { success: false, message: 'Only super administrators can manage admin accounts', status: 403 };
  }

  return { success: true, user: current_user };
};

export const verifyAgent = async (values: agentDetails) => {
  const { agentId, path } = values;
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.canApproveVerifications()) {
    return { success: false,  message: 'You are not authorized to verify agents',  status: 403 };
  }

  const currentAgent = await Agent.findOne({ _id: agentId });

  if (!currentAgent) {
    return { success: false, message: 'Agent does not exist', status: 404 };
  }

  try {
    await Agent.findOneAndUpdate({ _id: agentId }, { verificationStatus: 'verified'});

    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your agency is verified',
      content: 'Your agency details have been verified. Now you can go ahead and create apartment for rent or sale and start getting clients through this app.',
      recipient: currentAgent.userId,
    });
    await newNotification.save();

    await User.findOneAndUpdate({ _id: currentAgent.userId }, { $push: { notifications: newNotification._id }});

    revalidatePath(path);
    return { success: true, message: 'Agent details verified', status: 200 };
  } catch (error) {
    console.error('Error verifying agent:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const rejectAgent = async (values: rejectionDetails) => {
  const { agentId, path, reason } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.canApproveVerifications()) {
    return { 
      success: false, 
      message: 'You are not authorized to reject agents', 
      status: 403 
    };
  }

  const currentAgent = await Agent.findById(agentId);

  if (!currentAgent) {
    return { success: false, message: 'Agent does not exist', status: 404 };
  }

  try {
    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your agency verification failed',
      content: `Your agency details verification failed. This is due to the reasons: ${reason}. Fix these issues as soon as possible so that you can start adding properties that clients can see.`,
      recipient: currentAgent.userId,
    });

    await User.findOneAndUpdate(
      { _id: currentAgent.userId }, 
      { $push: { notifications: newNotification._id } }
    );

    revalidatePath(path);
    return { success: true, message: 'Rejection notification sent to agent.', status: 200 };
  } catch (error) {
    console.error('Error rejecting agent:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const suspendAccount = async (values: userDetails) => {
  const { userId, path, reason } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  // Use permission service instead of hardcoding role check
  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to suspend user accounts', status: 403 };
  }

  // Prevent users from suspending themselves
  if (current_user.userId._id === userId) {
    return { success: false, message: 'You cannot suspend your own account', status: 400 };
  }

  const focusedUser = await User.findById(userId);

  if (!focusedUser) {
    return { success: false, message: 'User does not exist', status: 404 };
  }

  // Check if user is already suspended
  if (focusedUser.userAccountSuspended) {
    return { success: false, message: 'User account is already suspended', status: 400 };
  }

  // Prevent suspending other admins (optional security measure)
  if (['superAdmin', 'admin', 'creator'].includes(focusedUser.role) && !permissions.isSuperAdmin) {
    return { success: false, message: 'You cannot suspend other admin accounts', status: 403 };
  }

  const updateData = { userAccountSuspended: true, suspensionReason: reason, suspendedAt: new Date(), suspendedBy: current_user.userId._id }

  try {
    await User.findByIdAndUpdate(userId, updateData);

    // Create notification for the suspended user
    const suspensionNotification = await Notification.create({
      type: 'account_suspension',
      title: 'Account Suspended',
      content: reason ? `Your account has been suspended. Reason: ${reason}` : 'Your account has been suspended due to violation of our terms of service.',
      recipient: userId,
    });

    await User.findByIdAndUpdate(userId, { $push: { notifications: suspensionNotification._id }});

    revalidatePath(path);
    return { success: true, message: 'User account successfully suspended', status: 200 };
  } catch (error) {
    console.error('Error suspending account:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const suspendAdmin = async (values: AdminActionParams) => {
  const { adminId, path, reason } = values;

  await connectToMongoDB();

  const validation = await validateSuperAdminAccess();
  if (!validation.success) {
    return { success: false, message: validation.message, status: validation.status };
  }

  const current_user = validation.user;

  try {
    // Find the admin record
    const targetAdmin = await Admin.findById(adminId)
    
    if (!targetAdmin) {
      return { success: false, message: 'Admin account not found', status: 404 };
    }

    // Prevent self-suspension
    if (targetAdmin.userId.toString() === current_user.userId.toString()) {
      return { success: false, message: 'You cannot suspend your own account', status: 400 };
    }

    // Check if already suspended
    if (targetAdmin.isSuspended) {
      return { success: false, message: 'Admin account is already suspended', status: 400 };
    }

    const adminUpdateData = {isSuspended: true, suspensionReason: reason, suspendedAt: new Date(), suspendedBy: current_user.userId._id}

    // Update admin record
    await Admin.findByIdAndUpdate(adminId, adminUpdateData);

    const userUpdateData = {userAccountSuspended: true, suspensionReason: `Admin account suspension: ${reason}`, suspendedAt: new Date(), suspendedBy: current_user.userId._id}

    // Also update user account if needed
    await User.findByIdAndUpdate(targetAdmin.userId, userUpdateData);

    // Create notification
    const notification = await Notification.create({
      type: 'admin_suspension',
      title: 'Admin Account Suspended',
      content: reason ? `Your admin account has been suspended. Reason: ${reason}` : 'Your admin account has been suspended due to policy violations.',
      recipient: targetAdmin.userId,
    });

    await User.findByIdAndUpdate(targetAdmin.userId, {
      $push: { notifications: notification._id }
    });

    revalidatePath(path);
    return { success: true, message: 'Admin account successfully suspended', status: 200 };
  } catch (error) {
    console.error('Error suspending admin:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const deactivateAdmin = async (values: AdminActionParams) => {
  const { adminId, path, reason } = values;

  await connectToMongoDB();

  const validation = await validateSuperAdminAccess();
  if (!validation.success) {
    return { success: false, message: validation.message, status: validation.status };
  }

  const current_user = validation.user;

  try {
    const targetAdmin = await Admin.findById(adminId).populate('userId');
    
    if (!targetAdmin) {
      return { success: false, message: 'Admin account not found', status: 404 };
    }

    // Prevent self-deactivation
    if (targetAdmin.userId._id.toString() === current_user.userId._id.toString()) {
      return { success: false, message: 'You cannot deactivate your own account', status: 400 };
    }

    // Check if already deactivated
    if (!targetAdmin.isActivated) {
      return { success: false, message: 'Admin account is already deactivated', status: 400 };
    }

    const updateData = {isActivated: false, deactivatedAt: new Date(), deactivatedBy: current_user.userId._id, deactivationReason: reason}

    // Deactivate admin
    await Admin.findByIdAndUpdate(adminId, updateData);

    // Create notification
    const notification = await Notification.create({
      type: 'admin_deactivation',
      title: 'Admin Account Deactivated',
      content: reason ? `Your admin account has been deactivated. Reason: ${reason}` : 'Your admin account has been deactivated.',
      recipient: targetAdmin.userId,
    });

    await User.findByIdAndUpdate(targetAdmin.userId, {$push: { notifications: notification._id }});

    revalidatePath(path);
    return { success: true, message: 'Admin account successfully deactivated', status: 200 };
  } catch (error) {
    console.error('Error deactivating admin:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const deleteAdmin = async (values: AdminActionParams) => {
  const { adminId, path, reason } = values;

  await connectToMongoDB();

  const validation = await validateSuperAdminAccess();
  if (!validation.success) {
    return { success: false, message: validation.message, status: validation.status };
  }

  const current_user = validation.user;

  try {
    const targetAdmin = await Admin.findById(adminId)
    .populate({
      path:'userId',
      model: User,
      select: 'email'
    });
    
    if (!targetAdmin) {
      return { success: false, message: 'Admin account not found', status: 404 };
    }

    // Prevent self-deletion
    if (targetAdmin.userId._id.toString() === current_user.userId._id.toString()) {
      return { success: false, message: 'You cannot delete your own account', status: 400 };
    }

    // Store info for audit log before deletion
    const targetUserId = targetAdmin.userId._id;

    // Delete admin record
    await Admin.findByIdAndDelete(adminId);

    // Downgrade user role from admin to regular user
    await User.findByIdAndUpdate(targetUserId, {
      role: 'user',
      previousRole: targetAdmin.role, // Store previous role for history
      roleChangedAt: new Date(),
      roleChangedBy: current_user.userId._id
    });

    // Create notification
    const notification = await Notification.create({
      type: 'admin_deletion',
      title: 'Admin Privileges Removed',
      content: reason ? `Your admin privileges have been removed. Reason: ${reason}` : 'Your admin privileges have been removed.',
      recipient: targetUserId,
    });

    await User.findByIdAndUpdate(targetUserId, {
      $push: { notifications: notification._id }
    });

    revalidatePath(path);
    return { success: true, message: 'Admin account successfully deleted and privileges removed', status: 200 };
  } catch (error) {
    console.error('Error deleting admin:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const reactivateAdmin = async (values: Omit<AdminActionParams, 'reason'> & { reason?: string }) => {
  const { adminId, path, reason } = values;

  await connectToMongoDB();

  const validation = await validateSuperAdminAccess();
  if (!validation.success) {
    return { success: false, message: validation.message, status: validation.status };
  }

  const current_user = validation.user;

  try {
    const targetAdmin = await Admin.findById(adminId)
    
    if (!targetAdmin) {
      return { success: false, message: 'Admin account not found', status: 404 };
    }

    // Reactivate admin
    const updateData: any = {
      isActivated: true,
      isSuspended: false,
      reactivatedAt: new Date(),
      reactivatedBy: current_user.userId._id
    };

    if (reason) {
      updateData.reactivationReason = reason;
    }

    await Admin.findByIdAndUpdate(adminId, updateData);

    // Also reactivate user account if it was suspended
    await User.findByIdAndUpdate(targetAdmin.userId, {
      userAccountSuspended: false,
      reactivatedAt: new Date()
    });

    // Create notification
    const notification = await Notification.create({
      type: 'admin_reactivation',
      title: 'Admin Account Reactivated',
      content: 'Your admin account has been reactivated and all privileges restored.',
      recipient: targetAdmin.userId,
    });

    await User.findByIdAndUpdate(targetAdmin.userId, {$push: { notifications: notification._id }});

    revalidatePath(path);
    return { 
      success: true, 
      message: 'Admin account successfully reactivated', 
      status: 200 
    };
  } catch (error) {
    console.error('Error reactivating admin:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};
