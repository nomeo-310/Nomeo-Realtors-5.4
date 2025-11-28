'use server'


import { revalidatePath } from "next/cache";
import User, { IUser } from "@/models/user";
import Notification from "@/models/notification";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { getCurrentUser } from "./auth-actions";
import Admin from "@/models/admin";
import { createServerPermissionService } from "@/utils/permission-service";
import { deleteCloudinaryImages } from "./delete-cloudinary-image";
import { AccountDeletionEmailTemplate } from "@/components/email-templates/account-deletion-email-template";
import { render } from "@react-email/components";
import { sendEmail } from "@/utils/send-email";
import { capitalizeName } from "@/utils/capitalizeName";
import Agent from "@/models/agent";
import { RevokeVerificationEmailTemplate } from "@/components/email-templates/revoke-verification-email-template";
import { RoleAssignmentEmailTemplate } from "@/components/email-templates/role-assignment-email-template";
import bcrypt from "bcryptjs";
import AdminSetupEmailTemplate from "@/components/email-templates/admin-setup-email-template";
import { generatePlaceholderColor } from "@/utils/generatePlaceholderColor";

interface agentDetails {
  agentId: string;
  path: string;
}

interface userDetails {
  userId: string;
  path: string;
  reason: string;
}

interface suspendAccountProps extends userDetails {
  category: string;
  suspendedAt: string;
  suspendedUntil: string;
}

interface AdminActionParams {
  adminId: string;
  path: string;
  reason?: string;
}

interface BulkUserDeleteParams {
  userIds: string[];
  path: string;
  reason: string;
}

export const sendAccountDeletionEmail = async (
  email: string, 
  deletionType: 'user' | 'admin_revert' | 'admin_complete', 
  reason: string,
  userName: string,
  previousRole?: string
) => {
  try {
    const templateType = deletionType === 'user' ? 'user_deletion' : deletionType === 'admin_revert' ? 'admin_deletion' : 'admin_complete_deletion';

    const emailTemplate = await render(
      AccountDeletionEmailTemplate({
        type: templateType,
        name: userName,
        reason: reason,
        previousRole: previousRole,
        contactEmail: "support@nomeorealtors.com"
      })
    );

    const getSubject = () => {
      switch (deletionType) {
        case 'user':
          return 'Account Permanently Deleted - Nomeo Realtors';
        case 'admin_revert':
          return 'Admin Privileges Removed - Nomeo Realtors';
        case 'admin_complete':
          return 'Admin Account Permanently Deleted - Nomeo Realtors';
        default:
          return 'Account Update - Nomeo Realtors';
      }
    };

    await sendEmail({ email, subject: getSubject(), html: emailTemplate });
    return true
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

export const sendVerificationRevokedEmail = async (
  email: string,
  userName: string,
  reason: string,
  userType: string
) => {
  try {
    const emailTemplate = await render(
      RevokeVerificationEmailTemplate({
        name: userName,
        reason:reason,
        userType: userType,
        contactEmail: "support@nomeorealtors.com"
      })
      
    );

    await sendEmail({email, subject: 'Account Verification Revoked - Nomeo Realtors', html: emailTemplate});
    return true
  } catch (error) {
    console.error('Error sending verification revoked email:', error);
    return false
  }
};

export const sendRoleChangeEmail = async (
  email: string,
  userName: string,
  previousRole: string,
  newRole: string,
  changedBy: string,
  isNewAdmin: boolean = false,
  accessId?: string,
  expiresAt?: number
) => {
  try {
    const emailTemplate = await render(
      RoleAssignmentEmailTemplate({
        name: userName,
        previousRole: previousRole,
        newRole: newRole,
        changedBy: changedBy,
        contactEmail: "support@nomeorealtors.com",
        isNewAdmin: isNewAdmin,
        accessId: accessId,
        expiresAt: expiresAt
      })
    );

    const getSubject = () => {
      if (isNewAdmin && accessId) {
        return `🎉 Welcome to Admin Team - Complete Your Setup - Nomeo Realtors`;
      } else if (['superAdmin', 'admin', 'creator'].includes(newRole)) {
        return `Administrative Access ${isNewAdmin ? 'Granted' : 'Updated'} - ${newRole === 'superAdmin' ? 'Super Administrator' : newRole === 'creator' ? 'Content Creator' : 'Administrator'} Role - Nomeo Realtors`;
      } else if (newRole === 'agent') {
        return 'Welcome to Agent Role! - Nomeo Realtors';
      } else {
        return 'Your Account Role Has Been Updated - Nomeo Realtors';
      }
    };

    await sendEmail({ email, subject: getSubject(), html: emailTemplate });
    return true;
  } catch (error) {
    console.error('Error sending role change email:', error);
    return false;
  }
};

export const sendAdminSetupEmail = async (
  email: string,
  userName: string,
  role: string,
  accessId: string,
  expiresAt: number,
  assignedBy: string
) => {
  try {
    const emailTemplate = await render(
      AdminSetupEmailTemplate({
        name: userName,
        role: role,
        accessId: accessId,
        expiresAt: expiresAt,
        assignedBy: assignedBy,
        contactEmail: "support@nomeorealtors.com"
      })
    );

    await sendEmail({ email, subject: `Welcome to Admin Team - Complete Your Setup (Access ID: ${accessId}) - Nomeo Realtors`, html: emailTemplate });
    return true;
  } catch (error) {
    console.error('Error sending admin setup email:', error);
    return false;
  }
};

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

const generateAccessId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#?!~%$';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const suspendAccount = async (values:suspendAccountProps) => {
  const { userId, path, reason, category, suspendedAt, suspendedUntil } = values;

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

  const updateData = { userAccountSuspended: true, suspensionReason: reason, suspendedAt: suspendedAt, suspendedBy: current_user.userId._id }

  try {
    const newSuspension = 
    await User.findByIdAndUpdate(userId, updateData);

    // Create notification for the suspended user
    const suspensionNotification = await Notification.create({
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
    .populate<{ userId: IUser }>({
      path:'userId',
      model: User,
    }).exec();
    
    if (!targetAdmin) {
      return { success: false, message: 'Admin account not found', status: 404 };
    };

    // Prevent self-deletion
    if (targetAdmin.userId._id.toString() === current_user.userId._id.toString()) {
      return { success: false, message: 'You cannot delete your own account', status: 400 };
    };

    // Store info for audit log before deletion
    const targetUserId = targetAdmin.userId._id;
    const targetUserEmail = targetAdmin.userId.email;
    const previousTargetRole = targetAdmin.userId.previousRole;
    const targetUserImage = targetAdmin.userId.profileImage;
    const targetUserName = capitalizeName(targetAdmin.userId.surName ?? '') + ' ' + capitalizeName(targetAdmin.userId.lastName ?? '');

    // Delete admin record
    await Admin.findByIdAndDelete(adminId);

    if (previousTargetRole) {
      // Scenario 1: Admin with previous role - revert to previous role
      await User.findByIdAndUpdate(targetUserId, {
        role: previousTargetRole,
        previousRole: null, // Clear previousRole since they're no longer an admin
        roleChangedAt: new Date(),
        roleChangedBy: current_user.userId._id
      });

      // Send revert email
      await sendAccountDeletionEmail(
        targetUserEmail, 
        'admin_revert', 
        reason || 'Admin privileges removed by super administrator',
        targetUserName || targetUserEmail.split('@')[0],
        previousTargetRole
      );
    } else {
      // Scenario 2: Direct admin without previous role - DELETE PERMANENTLY
      
      // First, delete associated notifications
      await Notification.deleteMany({ recipient: targetUserId });
      
      // Delete user account permanently
      await User.deleteOne({ _id: targetUserId });
      
      // Delete profile image from Cloudinary if it exists
      if (targetUserImage?.public_id) {
        await deleteCloudinaryImages(targetUserImage.public_id);
      }

      // Send permanent deletion email
      await sendAccountDeletionEmail(
        targetUserEmail, 
        'admin_complete', 
        reason || 'Admin account deleted by super administrator',
        targetUserName || targetUserEmail.split('@')[0]
      );
    }

    revalidatePath(path);
    
    // Return appropriate success message based on action
    if (previousTargetRole) {
      return { 
        success: true, 
        message: 'Admin privileges successfully removed and account reverted to regular user', 
        status: 200 
      };
    } else {
      return { 
        success: true, 
        message: 'Admin account permanently deleted', 
        status: 200 
      };
    }
  } catch (error) {
    console.error('Error deleting admin:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const deleteUser = async (values: userDetails) => {
  const { userId, path, reason } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  // Use permission service for authorization
  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to delete user accounts', status: 403 };
  }

  // Prevent users from deleting themselves
  if (current_user.userId._id.toString() === userId) {
    return { success: false, message: 'You cannot delete your own account', status: 400 };
  }

  try {
    const targetUser = await User.findById(userId);
    
    if (!targetUser) {
      return { success: false, message: 'User not found', status: 404 };
    }

    // Check if user is an admin (admin, superAdmin, creator)
    const adminRoles = ['admin', 'superAdmin', 'creator'];
    if (adminRoles.includes(targetUser.role)) {
      return { 
        success: false, 
        message: 'Cannot delete admin accounts. Use admin deletion instead.', 
        status: 400 
      };
    }

    // Store user info before deletion
    const targetUserEmail = targetUser.email;
    const targetUserImage = targetUser.profileImage;
    const targetUserName = capitalizeName(targetUser.surName ?? '') + ' ' + capitalizeName(targetUser.lastName ?? '');
    const userRole = targetUser.role; // 'user' or 'agent'

    // Check if user has an associated admin record and delete it
    const userAdminRecord = await Admin.findOne({ userId: userId });
    if (userAdminRecord) {
      await Admin.findByIdAndDelete(userAdminRecord._id);
    }

    // Delete user notifications
    await Notification.deleteMany({ recipient: userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Delete profile image from Cloudinary
    if (targetUserImage?.public_id) {
      await deleteCloudinaryImages(targetUserImage.public_id);
    }

    // Send deletion email
    await sendAccountDeletionEmail(
      targetUserEmail, 
      'user', 
      reason || 'Account deleted by administrator',
      targetUserName || targetUserEmail.split('@')[0],
      userRole // Pass the role for context in the email
    );

    revalidatePath(path);
    return { 
      success: true, 
      message: `${userRole === 'agent' ? 'Agent' : 'User'} account successfully deleted`, 
      status: 200 
    };
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const bulkDeleteUsers = async (values: BulkUserDeleteParams) => {
  const { userIds, path, reason } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to delete user accounts', status: 403 };
  }

  // Prevent users from deleting themselves
  if (userIds.includes(current_user.userId._id.toString())) {
    return { success: false, message: 'You cannot delete your own account', status: 400 };
  }

  try {
    const results = {
      successful: [] as string[],
      failed: [] as { userId: string; reason: string }[]
    };

    for (const userId of userIds) {
      try {
        const targetUser = await User.findById(userId);
        
        if (!targetUser) {
          results.failed.push({ userId, reason: 'User not found' });
          continue;
        }

        // Skip admin accounts
        const adminRoles = ['admin', 'superAdmin', 'creator'];
        if (adminRoles.includes(targetUser.role)) {
          results.failed.push({ userId, reason: 'Cannot delete admin accounts' });
          continue;
        }

        // Store user info
        const targetUserEmail = targetUser.email;
        const targetUserImage = targetUser.profileImage;
        const targetUserName = capitalizeName(targetUser.surName ?? '') + ' ' + capitalizeName(targetUser.lastName ?? '');

        // Delete associated admin record if exists
        await Admin.findOneAndDelete({ userId: userId });

        // Delete notifications
        await Notification.deleteMany({ recipient: userId });

        // Delete user
        await User.findByIdAndDelete(userId);

        // Delete Cloudinary image
        if (targetUserImage?.public_id) {
          await deleteCloudinaryImages(targetUserImage.public_id);
        }

        // Send email
        await sendAccountDeletionEmail(
          targetUserEmail, 
          'user', 
          reason || 'Account deleted by administrator',
          targetUserName || targetUserEmail.split('@')[0],
          targetUser.role
        );

        results.successful.push(userId);
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        results.failed.push({ userId, reason: 'Internal error during deletion' });
      }
    }

    revalidatePath(path);
    return { 
      success: true, 
      message: `Bulk deletion completed. Successful: ${results.successful.length}, Failed: ${results.failed.length}`,
      data: results,
      status: 200 
    };
  } catch (error) {
    console.error('Error in bulk user deletion:', error);
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

export const revokeValidation = async (values: userDetails) => {
  const { userId, path, reason } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to revoke user validation', status: 403 };
  }

  if (current_user.userId._id === userId) {
    return { success: false, message: 'You cannot revoke your account validation', status: 400 };
  }

  const focusedUser = await User.findById(userId);

  if (!focusedUser) {
    return { success: false, message: 'User cannot be found', status: 404 };
  }

  if (!focusedUser.profileCreated && !focusedUser.userOnboarded) {
    return { success: false, message: 'User verification has already been revoked', status: 400 };
  }

  const userEmail = focusedUser.email;
  const userName = capitalizeName(focusedUser.surName ?? '') + ' ' + capitalizeName(focusedUser.lastName ?? '');
  const userRole = focusedUser.role;

  try {
    if (focusedUser.profileImage?.public_id) {
      await deleteCloudinaryImages(focusedUser.profileImage.public_id);
    }

    await User.findByIdAndUpdate(userId,{
      profileCreated: false,
      userOnboarded: false,
      bio: '',
      phoneNumber: '',
      profileImage: null,
      profilePicture: null,
      city: '',
      state: '',
    })

    if (focusedUser.userIsAnAgent) {
      await Agent.findByIdAndUpdate(focusedUser.agentId, {
        officeAddress: '',
        officeNumber: '',
        agencyName: '',
        agencyWebsite: '',
        coverImage: null,
        coverPicture: null,
        verificationStatus: 'unverified',
        inspectionFeePerHour: 0,
      })
    }

    await sendVerificationRevokedEmail(
      userEmail,
      userName,
      reason,
      userRole
    );

    revalidatePath(path);
    return { 
      success: true, 
      message: 'User verification successfully revoked', 
      status: 200 
    };
  } catch (error) {
    console.error('Error revoking validation:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }

};

export const assignRoleToUser = async (values: { userId: string; newRole: string; path: string }) => {
  const { userId, newRole, path } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);
  
  // Check if the target user is an admin
  const existingAdmin = await Admin.findOne({ userId: userId });
  const isTargetUserAdmin = !!existingAdmin;

  // If target is admin, require admin management permissions
  if (isTargetUserAdmin && !permissions.canManageAdmins()) {
    return { success: false, message: 'You are not authorized to manage admin roles', status: 403 };
  }

  // If target is regular user, require user management permissions
  if (!isTargetUserAdmin && !permissions.canManageUsers()) {
    return { success: false, message: 'You are not authorized to assign roles', status: 403 };
  }

  // Prevent users from changing their own role
  if (current_user.userId._id.toString() === userId) {
    return { success: false, message: 'You cannot change your own role', status: 400 };
  }

  const targetUser = await User.findById(userId);

  if (!targetUser) {
    return { success: false, message: 'User not found', status: 404 };
  }

  if (!targetUser.userVerified) {
    return { success: false, message: 'The user is not verified'}
  }

  // Validate the new role
  const validRoles = ['user', 'agent', 'admin', 'superAdmin', 'creator'];
  if (!validRoles.includes(newRole)) {
    return { success: false, message: 'Invalid role specified', status: 400 };
  }

  // Prevent non-superAdmins from assigning admin roles
  const adminRoles = ['admin', 'superAdmin', 'creator'];
  if (adminRoles.includes(newRole) && !permissions.isSuperAdmin) {
    return { success: false, message: 'Only super administrators can assign admin roles', status: 403 };
  }

  // Store previous role for audit
  const previousRole = targetUser.role;
  const userName = capitalizeName(targetUser.surName ?? '') + ' ' + capitalizeName(targetUser.lastName ?? '');
  const userEmail = targetUser.email;

  // Declare accessId here so it's accessible in the success message
  let accessId: string | undefined;

  try {
    // Update user role
    await User.findByIdAndUpdate(userId, {
      role: newRole,
      previousRole: previousRole,
      roleChangedAt: new Date(),
      roleChangedBy: current_user.userId._id
    });

    // Handle admin record creation/deletion if role involves admin privileges
    if (adminRoles.includes(newRole)) {
      if (!existingAdmin) {
        // NEW ADMIN: Generate accessId with 24-hour expiry
        accessId = generateAccessId();
        const expiryHours = 24;
        const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);

        // Create new admin record with accessId
        await Admin.create({
          userId: userId,
          role: newRole,
          accessId: accessId,
          accessIdExpires: expiresAt,
          passwordAdded: false, // Password not set yet
          isActivated: false, // Not activated until setup complete
          activatedAt: null,
          activatedBy: null,
          adminOnboarded: false, // Setup not complete
          updatedAt: new Date(),
          updatedBy: current_user.userId._id,
          createdBy: current_user.userId._id,
          adminHistory: [{
            role: newRole,
            changedAt: new Date(),
            changedBy: current_user.userId._id,
            reason: 'Initial admin role assignment - setup pending'
          }]
        });

        // Send admin setup email using the new function
        await sendAdminSetupEmail(
          userEmail,
          userName,
          newRole,
          accessId,
          expiresAt,
          current_user.userId.email
        );

      } else {
        // EXISTING ADMIN PROMOTION: Update role without accessId flow
        // Add to admin history before updating the role
        const historyEntry = {
          role: existingAdmin.role, // Store the previous admin role
          changedAt: new Date(),
          changedBy: current_user.userId._id,
          reason: `Admin role changed from ${existingAdmin.role} to ${newRole}`
        };

        // Update existing admin record with history and tracking
        await Admin.findOneAndUpdate(
          { userId: userId }, 
          { 
            role: newRole,
            updatedAt: new Date(),
            updatedBy: current_user.userId._id,
            $push: { adminHistory: historyEntry }
          }
        );

        // Send role change notification email using the updated function
        await sendRoleChangeEmail(
          userEmail,
          userName,
          previousRole,
          newRole,
          current_user.userId.email,
          false // isNewAdmin = false for existing admin
        );
      }
    } else if (adminRoles.includes(previousRole) && !adminRoles.includes(newRole)) {
      // User was demoted from admin role - add final history entry and remove admin record
      if (existingAdmin) {
        // Add final history entry showing removal from admin role
        const historyEntry = {
          role: newRole,
          changedAt: new Date(),
          changedBy: current_user.userId._id,
          reason: `Demoted from ${existingAdmin.role} to ${newRole} - admin privileges removed`
        };

        await Admin.findOneAndUpdate(
          { userId: userId },
          { 
            $push: { adminHistory: historyEntry }
          }
        );
      }
      
      // Remove admin record after adding history
      await Admin.findOneAndDelete({ userId: userId });

      // Send demotion email
      await sendRoleChangeEmail(
        userEmail,
        userName,
        previousRole,
        newRole,
        current_user.userId.email,
        false // isNewAdmin = false for demotion
      );
    }

    // Create notification for the user (only for non-new-admin cases)
    if (existingAdmin || !adminRoles.includes(newRole)) {
      const roleChangeNotification = await Notification.create({
        type: 'role_change',
        title: 'Account Role Updated',
        content: `Your account role has been changed from ${previousRole} to ${newRole}.`,
        recipient: userId,
      });

      await User.findByIdAndUpdate(userId, {
        $push: { notifications: roleChangeNotification._id }
      });
    }

    revalidatePath(path);
    
    // Return appropriate success message based on context
    let successMessage;
    if (!existingAdmin && adminRoles.includes(newRole)) {
      successMessage = `New admin role assigned. Access ID (${accessId}) sent to user email. User must complete setup within 24 hours.`;
    } else if (isTargetUserAdmin) {
      successMessage = `Admin role successfully changed from ${previousRole} to ${newRole}`;
    } else {
      successMessage = `User role successfully changed from ${previousRole} to ${newRole}`;
    }
    
    return { 
      success: true, 
      message: successMessage,
      status: 200 
    };
  } catch (error) {
    console.error('Error assigning role to user:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const addAdmin = async (values: { 
  email: string; 
  role: string; 
  path: string;
}) => {
  const { email, role, path } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);

  // Validate permissions - only superAdmins can add admins
  if (!permissions.isSuperAdmin) {
    return { success: false, message: 'Only super administrators can add new admins', status: 403 };
  }

  // Validate the admin role
  const adminRoles = ['admin', 'superAdmin', 'creator'];
  if (!adminRoles.includes(role)) {
    return { success: false, message: 'Invalid admin role specified', status: 400 };
  }

  try {
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    let accessId: string | undefined;
    let targetUserId: string;

    if (existingUser) {
      // USER ALREADY EXISTS - Handle based on their current status
      targetUserId = existingUser._id.toString();

      // Check if user is already an admin
      const existingAdmin = await Admin.findOne({ userId: targetUserId });
      
      if (existingAdmin) {
        // USER IS ALREADY AN ADMIN
        return { 
          success: false, 
          message: `User with email ${email} is already an admin with role: ${existingAdmin.role}`,
          status: 400 
        };
      }

      // Check if user has an admin role but no admin record (inconsistent state)
      if (adminRoles.includes(existingUser.role)) {
        return { 
          success: false, 
          message: `User with email ${email} already has admin role but missing admin record. Please contact support.`,
          status: 400 
        };
      }

      // USER EXISTS BUT NOT ADMIN - Convert to admin
      const previousRole = existingUser.role;
      
      // Generate accessId for existing user
      accessId = generateAccessId();
      const expiryHours = 24;
      const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);

      // Update user role
      await User.findByIdAndUpdate(targetUserId, {
        role: role,
        previousRole: previousRole,
        roleChangedAt: new Date(),
        roleChangedBy: current_user.userId._id
      });

      // Create admin record
      await Admin.create({
        userId: existingUser._id,
        role: role,
        accessId: accessId,
        accessIdExpires: expiresAt,
        passwordAdded: false,
        isActivated: false,
        activatedAt: null,
        activatedBy: null,
        adminOnboarded: false,
        updatedAt: new Date(),
        updatedBy: current_user.userId._id,
        createdBy: current_user.userId._id,
        adminHistory: [{
          role: role,
          changedAt: new Date(),
          changedBy: current_user.userId._id,
          reason: 'Converted from existing user to admin - setup pending'
        }]
      });

      // Send admin setup email using the new function
      const userName = capitalizeName(existingUser.surName ?? '') + ' ' + capitalizeName(existingUser.lastName ?? '');
      await sendAdminSetupEmail(
        existingUser.email,
        userName,
        role,
        accessId,
        expiresAt,
        current_user.userId.email
      );

      // Create notification
      const roleChangeNotification = await Notification.create({
        type: 'role_change',
        title: 'Account Role Updated to Admin',
        content: `Your account has been upgraded to ${role} role. Check your email to complete admin setup.`,
        recipient: targetUserId,
      });

      await User.findByIdAndUpdate(targetUserId, {
        $push: { notifications: roleChangeNotification._id }
      });

    } else {
      // NEW USER - Create user and admin records
      
      // Generate temporary username from email
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;

      // Ensure unique username
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create new user with admin role
      const newUser = await User.create({
        email: email.toLowerCase(),
        username: username,
        role: role,
        userOnboarded: false,
        profileCreated: false,
        userVerified: false,
        placeholderColor: generatePlaceholderColor(),
        previousRole: 'user',
        roleChangedAt: new Date(),
        roleChangedBy: current_user.userId._id
      });

      targetUserId = newUser._id.toString();

      // Generate accessId for new user
      accessId = generateAccessId();
      const expiryHours = 24;
      const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);

      // Create admin record
      await Admin.create({
        userId: newUser._id,
        role: role,
        accessId: accessId,
        accessIdExpires: expiresAt,
        passwordAdded: false,
        isActivated: false,
        activatedAt: null,
        activatedBy: null,
        adminOnboarded: false,
        updatedAt: new Date(),
        updatedBy: current_user.userId._id,
        createdBy: current_user.userId._id,
        adminHistory: [{
          role: role,
          changedAt: new Date(),
          changedBy: current_user.userId._id,
          reason: 'New admin user created - setup pending'
        }]
      });

      // Send admin setup email using the new function
      await sendAdminSetupEmail(
        newUser.email,
        'New Admin', // Generic name since no personal info yet
        role,
        accessId,
        expiresAt,
        current_user.userId.email
      );
    }

    revalidatePath(path);

    return {
      success: true,
      message: `Admin successfully added. Access ID (${accessId}) sent to ${email}. User must complete setup within 24 hours.`,
      status: 200
    };

  } catch (error) {
    console.error('Error adding admin:', error);
    
    // Handle duplicate key errors
    if ((error as any).code === 11000) {
      return {
        success: false,
        message: 'User with this email or username already exists',
        status: 400
      };
    }

    return {
      success: false,
      message: 'Internal server error while adding admin',
      status: 500
    };
  }
};

