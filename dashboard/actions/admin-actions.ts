'use server'


import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
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
import AdminSetupEmailTemplate from "@/components/email-templates/admin-setup-email-template";
import { generatePlaceholderColor } from "@/utils/generatePlaceholderColor";
import { UserMessageEmailTemplate } from "@/components/email-templates/user-message-email-template";
import { VerificationReminderEmailTemplate } from "@/components/email-templates/verification-reminder-email-template";
import { DeletionReminderEmailTemplate } from "@/components/email-templates/delete-reminder-email-template";
import { AdminDeactivationEmailTemplate } from "@/components/email-templates/admin-deactivation-email-template";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

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
  userId?: string;
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

export const sendUserMessageEmail = async (emailData: {
  to: string;
  subject: string;
  message: string;
  userName: string;
  userType: string;
  isUrgent: boolean;
  senderName: string;
}) => {
  try {
    const emailTemplate = await render(
      UserMessageEmailTemplate({
        userName: emailData.userName,
        subject: emailData.subject,
        message: emailData.message,
        senderName: emailData.senderName,
        isUrgent: emailData.isUrgent,
        userType: emailData.userType
      })
    );

    await sendEmail({ 
      email: emailData.to, 
      subject: emailData.subject, 
      html: emailTemplate 
    });
    
    return { success: true, message: 'Email sent successfully', status: 200 };
  } catch (error) {
    console.error('Error sending user message email:', error);
    return { success: false, message: 'Failed to send email', status: 500 };
  }
};

export const sendVerificationReminderEmail = async (emailData: {
  to: string;
  subject: string;
  message: string;
  userName: string;
  userType: string;
  reminderType: string;
  includeVerificationLink: boolean;
}) => {
  try {
    const emailTemplate = await render(
      VerificationReminderEmailTemplate({
        userName: emailData.userName,
        userType: emailData.userType,
        subject: emailData.subject,
        message: emailData.message,
        reminderType: emailData.reminderType,
        includeVerificationLink: emailData.includeVerificationLink
      })
    );

    await sendEmail({ 
      email: emailData.to, 
      subject: emailData.subject, 
      html: emailTemplate 
    });
    
    return { success: true, message: 'Verification reminder sent successfully' };
  } catch (error) {
    console.error('Error sending verification reminder email:', error);
    return { success: false, message: 'Failed to send verification reminder' };
  }
};

export const sendDeletionReminderEmail = async (emailData: {
  to: string;
  subject: string; // Still needed for sendEmail function
  message: string;
  userName: string;
  userType: string;
  includeRecoveryLink: boolean;
  deletionDate: string;
  daysRemaining: number;
  isUrgent: boolean;
  registrationDate?: string;
}) => {
  try {
    const emailTemplate = await render(
      DeletionReminderEmailTemplate({
        userName: emailData.userName,
        userType: emailData.userType,
        message: emailData.message,
        includeRecoveryLink: emailData.includeRecoveryLink,
        deletionDate: emailData.deletionDate,
        daysRemaining: emailData.daysRemaining,
        isUrgent: emailData.isUrgent,
        registrationDate: emailData.registrationDate
      })
    );

    await sendEmail({ 
      email: emailData.to, 
      subject: emailData.subject,
      html: emailTemplate 
    });
    
    return { success: true, message: 'Deletion reminder sent successfully' };
  } catch (error) {
    console.error('Error sending deletion reminder email:', error);
    return { success: false, message: 'Failed to send deletion reminder' };
  }
};

export const sendAdminDeactivationEmail = async (emailData: {
  to: string;
  name: string;
  adminRole: string;
  type: 'deactivation' | 'reactivation' | 'permanent_deletion';
  reason: string;
  deactivationDate?: string;
  deactivatedBy?: string;
  isPermanent?: boolean;
  reactivationDate?: string;
  appealDeadline?: string;
}) => {
  try {
    const subject = getEmailSubject(emailData.type, emailData.isPermanent);
    
    const emailTemplate = await render(
      AdminDeactivationEmailTemplate({
        type: emailData.type,
        name: emailData.name,
        adminRole: emailData.adminRole,
        reason: emailData.reason,
        deactivationDate: emailData.deactivationDate,
        deactivatedBy: emailData.deactivatedBy,
        isPermanent: emailData.isPermanent,
        reactivationDate: emailData.reactivationDate,
        appealDeadline: emailData.appealDeadline
      })
    );

    await sendEmail({ 
      email: emailData.to, 
      subject: subject,
      html: emailTemplate 
    });
    
    return { success: true, message: 'Admin deactivation email sent successfully' };
  } catch (error) {
    console.error('Error sending admin deactivation email:', error);
    return { success: false, message: 'Failed to send admin deactivation email' };
  }
};

const getEmailSubject = (type: string, isPermanent?: boolean) => {
  switch (type) {
    case 'deactivation':
      return isPermanent 
        ? 'Important: Your Nomeo Realtors Admin Account Has Been Permanently Deactivated'
        : 'Important: Your Nomeo Realtors Admin Account Has Been Temporarily Deactivated';
    case 'reactivation':
      return 'Good News: Your Nomeo Realtors Admin Account Has Been Reactivated';
    case 'permanent_deletion':
      return 'Important: Your Nomeo Realtors Admin Account Has Been Permanently Deleted';
    default:
      return 'Account Status Update - Nomeo Realtors';
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

export const suspendAccount = async (values: suspendAccountProps) => {
  await connectToMongoDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, path, reason, category, suspendedAt, suspendedUntil } = values;

    const current_user = await getCurrentUser();

    if (!current_user) {
      await session.abortTransaction();
      return createErrorResponse('You are not logged in', 401);
    }

    const permissions = createServerPermissionService(current_user.role);
    
    if (!permissions.canManageUsers()) {
      await session.abortTransaction();
      return createErrorResponse('You are not authorized to suspend user accounts', 403);
    }

    // Prevent self-suspension
    if (current_user.userId._id.toString() === userId) {
      await session.abortTransaction();
      return createErrorResponse('You cannot suspend your own account', 400);
    }

    const focusedUser = await User.findById(userId).session(session);

    if (!focusedUser) {
      await session.abortTransaction();
      return createErrorResponse('User does not exist', 404);
    }

    // Check if already suspended
    if (focusedUser.userAccountSuspended) {
      await session.abortTransaction();
      return createErrorResponse('User account is already suspended', 400);
    }

    // Prevent suspending other admins
    if (['superAdmin', 'admin', 'creator'].includes(focusedUser.role) && !permissions.isSuperAdmin) {
      await session.abortTransaction();
      return createErrorResponse('You cannot suspend other admin accounts', 403);
    }

    const updateData = { 
      userAccountSuspended: true, 
      suspensionReason: reason, 
      suspendedAt: suspendedAt, 
      suspendedBy: current_user.userId._id 
    };

    // Update user in transaction
    await User.findByIdAndUpdate(userId, updateData, { session, new: false });

    // Create notification in transaction
    const [suspensionNotification] = await Notification.create([{
      title: 'Account Suspended',
      content: reason ? `Your account has been suspended. Reason: ${reason}` : 'Your account has been suspended due to violation of our terms of service.',
      recipient: userId,
      createdBy: current_user.userId._id
    }], { session });

    // Add notification to user
    await User.findByIdAndUpdate(userId, 
      { $push: { notifications: suspensionNotification._id }},
      { session, new: false }
    );

    await session.commitTransaction();
    revalidatePath(path);
    
    return createSuccessResponse('User account successfully suspended', 200);
  } catch (error) {
    await session.abortTransaction();
    console.error('Error suspending account:', error);
    return createErrorResponse('Failed to suspend account', 500);
  } finally {
    await session.endSession();
  }
};

export const suspendAdmin = async (values: AdminActionParams) => {
  await connectToMongoDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { adminId, path, reason } = values;

    const validation = await validateSuperAdminAccess();
    if (!validation.success) {
      await session.abortTransaction();
      return createErrorResponse(validation.message || "", validation.status || 403);
    }

    const current_user = validation.user;

    // Find the admin record with session
    const targetAdmin = await Admin.findById(adminId).session(session);
    
    if (!targetAdmin) {
      await session.abortTransaction();
      return createErrorResponse('Admin account not found', 404);
    }

    // Prevent self-suspension
    if (targetAdmin.userId.toString() === current_user.userId._id.toString()) {
      await session.abortTransaction();
      return createErrorResponse('You cannot suspend your own account', 400);
    }

    // Check if already suspended
    if (targetAdmin.isSuspended) {
      await session.abortTransaction();
      return createErrorResponse('Admin account is already suspended', 400);
    }

    const adminUpdateData = {
      isSuspended: true, 
      suspensionReason: reason, 
      suspendedAt: new Date(), 
      suspendedBy: current_user.userId._id
    };

    const userUpdateData = {
      userAccountSuspended: true, 
      suspensionReason: `Admin account suspension: ${reason}`, 
      suspendedAt: new Date(), 
      suspendedBy: current_user.userId._id
    };

    // Update both records in transaction
    await Promise.all([
      Admin.findByIdAndUpdate(adminId, adminUpdateData, { session, new: false }),
      User.findByIdAndUpdate(targetAdmin.userId, userUpdateData, { session, new: false })
    ]);

    // Create notification in transaction
    const [notification] = await Notification.create([{
      type: 'admin_suspension',
      title: 'Admin Account Suspended',
      content: reason ? `Your admin account has been suspended. Reason: ${reason}` : 'Your admin account has been suspended due to policy violations.',
      recipient: targetAdmin.userId,
      createdBy: current_user.userId._id
    }], { session });

    await User.findByIdAndUpdate(targetAdmin.userId, {
      $push: { notifications: notification._id }
    }, { session, new: false });

    await session.commitTransaction();
    revalidatePath(path);
    
    return createSuccessResponse('Admin account successfully suspended', 200);
  } catch (error) {
    await session.abortTransaction();
    console.error('Error suspending admin:', error);
    return createErrorResponse('Failed to suspend admin account', 500);
  } finally {
    await session.endSession();
  }
};

export const deactivateAdmin = async (values: AdminActionParams) => {
  await connectToMongoDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { adminId, path, reason } = values;

    const validation = await validateSuperAdminAccess();
    if (!validation.success) {
      await session.abortTransaction();
      return createErrorResponse(validation.message || "", validation.status || 403);
    }

    const current_user = validation.user;

    const targetAdmin = await Admin.findById(adminId).session(session);
    
    if (!targetAdmin) {
      await session.abortTransaction();
      return createErrorResponse('Admin account not found', 404);
    }

    // Prevent self-deactivation
    if (targetAdmin.userId._id.toString() === current_user.userId._id.toString()) {
      await session.abortTransaction();
      return createErrorResponse('You cannot deactivate your own account', 400);
    }

    // Check if already deactivated
    if (!targetAdmin.isActivated) {
      await session.abortTransaction();
      return createErrorResponse('Admin account is already deactivated', 400);
    }

    const targetAdminUserDetail = await User.findById(targetAdmin.userId).session(session);

    if (!targetAdminUserDetail) {
      await session.abortTransaction();
      return createErrorResponse('User details not available', 404);
    }

    const updateData = {
      isActive: false,
      deactivated: true,
      deactivatedAt: new Date(), 
      deactivatedBy: current_user.userId._id, 
      deactivationReason: reason
    };

    // Deactivate admin in transaction
    await Admin.findByIdAndUpdate(adminId, updateData, { session, new: false });

    // Get deactivated by user's name
    const deactivatedByUser = await User.findById(current_user.userId._id)
      .select('surName lastName')
      .session(session);
    
    const deactivatedByName = deactivatedByUser 
      ? `${deactivatedByUser.surName} ${deactivatedByUser.lastName}`
      : 'System Administrator';

    // Format date for email
    const formattedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Send email (outside transaction since it's external)
    const emailResult = await sendAdminDeactivationEmail({
      to: targetAdminUserDetail.email,
      name: `${targetAdminUserDetail.surName} ${targetAdminUserDetail.lastName}`,
      adminRole: targetAdmin.role,
      type: 'deactivation',
      reason: reason || 'Account review required',
      deactivationDate: formattedDate,
      deactivatedBy: deactivatedByName,
      isPermanent: false,
    });

    if (!emailResult.success) {
      // Fallback notification inside transaction
      await Notification.create([{
        type: 'admin_deactivation',
        title: 'Admin Account Deactivated',
        content: reason ? `Your admin account has been deactivated. Reason: ${reason}` : 'Your admin account has been deactivated.',
        recipient: targetAdmin.userId._id,
        createdBy: current_user.userId._id
      }], { session });
    }

    await session.commitTransaction();
    revalidatePath(path);
    
    return createSuccessResponse(
      `Admin account successfully deactivated${emailResult.success ? ' and email sent' : ''}`, 
      200
    );
  } catch (error) {
    await session.abortTransaction();
    console.error('Error deactivating admin:', error);
    return createErrorResponse('Failed to deactivate admin account', 500);
  } finally {
    await session.endSession();
  }
};

export const deactivateUser = async (values: {userId: string, reason: string, path: string}) => {
  const { userId, reason, path } = values
}

export const deleteAdmin = async (values: AdminActionParams) => {
  await connectToMongoDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { adminId, path, reason } = values;

    const validation = await validateSuperAdminAccess();
    if (!validation.success) {
      await session.abortTransaction();
      return createErrorResponse(validation.message || "", validation.status || 403);
    }

    const current_user = validation.user;

    const targetAdmin = await Admin.findById(adminId)
      .populate<{ userId: IUser }>({
        path: 'userId',
        model: User,
      })
      .session(session);
    
    if (!targetAdmin) {
      await session.abortTransaction();
      return createErrorResponse('Admin account not found', 404);
    }

    // Prevent self-deletion
    if (targetAdmin.userId._id.toString() === current_user.userId._id.toString()) {
      await session.abortTransaction();
      return createErrorResponse('You cannot delete your own account', 400);
    }

    // Store info for audit log
    const targetUserId = targetAdmin.userId._id;
    const targetUserEmail = targetAdmin.userId.email;
    const previousTargetRole = targetAdmin.userId.previousRole;
    const targetUserImage = targetAdmin.userId.profileImage;
    const targetUserName = capitalizeName(targetAdmin.userId.surName ?? '') + ' ' + capitalizeName(targetAdmin.userId.lastName ?? '');

    // Delete admin record in transaction
    await Admin.findByIdAndDelete(adminId, { session });

    if (previousTargetRole) {
      // Scenario 1: Revert to previous role
      await User.findByIdAndUpdate(targetUserId, {
        role: previousTargetRole,
        previousRole: null,
        roleChangedAt: new Date(),
        roleChangedBy: current_user.userId._id
      }, { session, new: false });

      // Send email (outside transaction)
      await sendAccountDeletionEmail(
        targetUserEmail, 
        'admin_revert', 
        reason || 'Admin privileges removed by super administrator',
        targetUserName || targetUserEmail.split('@')[0],
        previousTargetRole
      );

      await session.commitTransaction();
      revalidatePath(path);
      
      return createSuccessResponse( 'Admin privileges successfully removed and account reverted to regular user', 200 );
    } else {
      // Scenario 2: Permanent deletion
      // Delete notifications in transaction
      await Notification.deleteMany({ recipient: targetUserId }, { session });
      
      // Delete user account in transaction
      await User.deleteOne({ _id: targetUserId }, { session });

      await session.commitTransaction();
      
      // External operations (outside transaction)
      if (targetUserImage?.public_id) {
        await deleteCloudinaryImages(targetUserImage.public_id);
      }

      await sendAccountDeletionEmail(
        targetUserEmail, 
        'admin_complete', 
        reason || 'Admin account deleted by super administrator',
        targetUserName || targetUserEmail.split('@')[0]
      );

      revalidatePath(path);
      return createSuccessResponse('Admin account permanently deleted', 200);
    }
  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting admin:', error);
    return createErrorResponse('Failed to delete admin account', 500);
  } finally {
    await session.endSession();
  }
};

export const deleteUser = async (values: userDetails) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToMongoDB();
    const { userId, path, reason } = values;

    const current_user = await getCurrentUser();

    if (!current_user) {
      await session.abortTransaction();
      return createErrorResponse('You are not logged in', 401);
    }

    const permissions = createServerPermissionService(current_user.role);
    
    if (!permissions.canManageUsers()) {
      await session.abortTransaction();
      return createErrorResponse('You are not authorized to delete user accounts', 403);
    }

    // Prevent self-deletion
    if (current_user.userId._id.toString() === userId) {
      await session.abortTransaction();
      return createErrorResponse('You cannot delete your own account', 400);
    }

    const targetUser = await User.findById(userId).session(session);
    
    if (!targetUser) {
      await session.abortTransaction();
      return createErrorResponse('User not found', 404);
    }

    // Check if user is an admin
    const adminRoles = ['admin', 'superAdmin', 'creator'];
    if (adminRoles.includes(targetUser.role)) {
      await session.abortTransaction();
      return createErrorResponse('Cannot delete admin accounts. Use admin deletion instead.', 400);
    }

    // Store user info
    const targetUserEmail = targetUser.email;
    const targetUserImage = targetUser.profileImage;
    const targetUserName = capitalizeName(targetUser.surName ?? '') + ' ' + capitalizeName(targetUser.lastName ?? '');
    const userRole = targetUser.role;

    // Delete associated admin record if exists
    await Admin.findOneAndDelete({ userId: userId }, { session });

    // Delete notifications
    await Notification.deleteMany({ recipient: userId }, { session });

    // Delete user account
    await User.findByIdAndDelete(userId, { session });

    await session.commitTransaction();
    
    // External operations (outside transaction)
    if (targetUserImage?.public_id) {
      await deleteCloudinaryImages(targetUserImage.public_id);
    }

    await sendAccountDeletionEmail(
      targetUserEmail, 
      'user', 
      reason || 'Account deleted by administrator',
      targetUserName || targetUserEmail.split('@')[0],
      userRole
    );

    revalidatePath(path);
    return createSuccessResponse(`${userRole === 'agent' ? 'Agent' : 'User'} account successfully deleted`, 200);
  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting user account:', error);
    return createErrorResponse('Failed to delete user account', 500);
  } finally {
    await session.endSession();
  }
};

export const bulkDeleteUsers = async (values: BulkUserDeleteParams) => {
  await connectToMongoDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userIds, path, reason } = values;

    const current_user = await getCurrentUser();

    if (!current_user) {
      await session.abortTransaction();
      return createErrorResponse('You are not logged in', 401);
    }

    const permissions = createServerPermissionService(current_user.role);
    
    if (!permissions.canManageUsers()) {
      await session.abortTransaction();
      return createErrorResponse('You are not authorized to delete user accounts', 403);
    }

    // Prevent self-deletion
    if (userIds.includes(current_user.userId._id.toString())) {
      await session.abortTransaction();
      return createErrorResponse('You cannot delete your own account', 400);
    }

    const results = {
      successful: [] as string[],
      failed: [] as { userId: string; reason: string }[]
    };

    const adminRoles = ['admin', 'superAdmin', 'creator'];
    const emailsToNotify: Array<{email: string, name: string, role: string}> = [];
    const imagesToDelete: string[] = [];

    // First pass: validate all users
    for (const userId of userIds) {
      try {
        const targetUser = await User.findById(userId).session(session);
        
        if (!targetUser) {
          results.failed.push({ userId, reason: 'User not found' });
          continue;
        }

        // Skip admin accounts
        if (adminRoles.includes(targetUser.role)) {
          results.failed.push({ userId, reason: 'Cannot delete admin accounts' });
          continue;
        }

        // Store info for later processing
        emailsToNotify.push({
          email: targetUser.email,
          name: capitalizeName(targetUser.surName ?? '') + ' ' + capitalizeName(targetUser.lastName ?? ''),
          role: targetUser.role
        });

        if (targetUser.profileImage?.public_id) {
          imagesToDelete.push(targetUser.profileImage.public_id);
        }

        results.successful.push(userId);
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        results.failed.push({ userId, reason: 'Validation error' });
      }
    }

    // If all validations passed, perform deletions
    if (results.successful.length > 0) {
      // Delete all admin records in bulk
      await Admin.deleteMany({ userId: { $in: results.successful }}, { session });

      // Delete all notifications in bulk
      await Notification.deleteMany({ recipient: { $in: results.successful } }, { session });

      // Delete all users in bulk
      await User.deleteMany({ _id: { $in: results.successful }}, { session });

      await session.commitTransaction();

      // External operations (outside transaction)
      if (imagesToDelete.length > 0) {
        await Promise.all(imagesToDelete.map(imageUrl => deleteCloudinaryImages(imageUrl)));
      }

      // Send emails (outside transaction)
      for (const emailData of emailsToNotify) {
        await sendAccountDeletionEmail(
          emailData.email, 
          'user', 
          reason || 'Account deleted by administrator',
          emailData.name || emailData.email.split('@')[0],
          emailData.role
        );
      }
    } else {
      await session.abortTransaction();
    }

    revalidatePath(path);
    return createSuccessResponse(`Bulk deletion completed. Successful: ${results.successful.length}, Failed: ${results.failed.length}`, 200,
      { results },
    );
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in bulk user deletion:', error);
    return createErrorResponse('Failed to delete users', 500);
  } finally {
    await session.endSession();
  }
};

export const reactivateAdmin = async (values: AdminActionParams) => {
  await connectToMongoDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { adminId, path, reason } = values;

    const validation = await validateSuperAdminAccess();
    if (!validation.success) {
      await session.abortTransaction();
      return createErrorResponse(validation.message || "", validation.status || 403);
    }

    const current_user = validation.user;

    const targetAdmin = await Admin.findById(adminId).session(session);
    
    if (!targetAdmin) {
      await session.abortTransaction();
      return createErrorResponse('Admin account not found', 404);
    }

    // Check if already activated
    if (targetAdmin.isActivated) {
      await session.abortTransaction();
      return createErrorResponse('Admin account is already activated', 400);
    }

    const targetAdminUserDetail = await User.findById(targetAdmin.userId).session(session);

    if (!targetAdminUserDetail) {
      await session.abortTransaction();
      return createErrorResponse('User details not available', 404);
    }

    const updateData = {
      isActivated: true,
      deactivated: false,
      reactivatedAt: new Date(), 
      reactivatedBy: current_user.userId._id, 
      reactivationReason: reason,
      deactivationReason: null
    };

    // Reactivate admin in transaction
    await Admin.findByIdAndUpdate(adminId, updateData, { session, new: false });

    // Format date for email
    const formattedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Send email (outside transaction)
    const emailResult = await sendAdminDeactivationEmail({
      to: targetAdminUserDetail.email,
      name: `${targetAdminUserDetail.surName} ${targetAdminUserDetail.lastName}`,
      adminRole: targetAdmin.role,
      type: 'reactivation',
      reason: reason || 'Account review completed',
      deactivationDate: formattedDate,
      deactivatedBy: `${current_user.firstName} ${current_user.lastName}`
    });

    if (!emailResult.success) {
      // Fallback notification inside transaction
      await Notification.create([{
        type: 'admin_reactivation',
        title: 'Admin Account Reactivated',
        content: 'Your admin account has been reactivated.',
        recipient: targetAdmin.userId._id,
        createdBy: current_user.userId._id
      }], { session });
    }

    await session.commitTransaction();
    revalidatePath(path);
    
    return createSuccessResponse(`Admin account successfully reactivated${emailResult.success ? ' and email sent' : ''}`, 200);
  } catch (error) {
    await session.abortTransaction();
    console.error('Error reactivating admin:', error);
    return createErrorResponse('Failed to reactivate admin account', 500);
  } finally {
    await session.endSession();
  }
};

export const revokeValidation = async (values: userDetails) => {
  await connectToMongoDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, path, reason } = values;
    const current_user = await getCurrentUser();

    if (!current_user) {
      await session.abortTransaction();
      return createErrorResponse('You are not logged in', 401);
    }

    const permissions = createServerPermissionService(current_user.role);
    
    if (!permissions.canManageUsers()) {
      await session.abortTransaction();
      return createErrorResponse('You are not authorized to revoke user validation', 403);
    }

    if (current_user.userId._id.toString() === userId) {
      await session.abortTransaction();
      return createErrorResponse('You cannot revoke your account validation', 400);
    }

    const focusedUser = await User.findById(userId).session(session);

    if (!focusedUser) {
      await session.abortTransaction();
      return createErrorResponse('User cannot be found', 404);
    }

    if (!focusedUser.profileCreated && !focusedUser.userOnboarded && !focusedUser.userVerified) {
      await session.abortTransaction();
      return createErrorResponse('User verification has already been revoked', 400);
    }

    const userEmail = focusedUser.email;
    const userName = capitalizeName(focusedUser.surName ?? '') + ' ' + 
                     capitalizeName(focusedUser.lastName ?? '');
    const userRole = focusedUser.role;

    // Store image for deletion (outside transaction)
    const imagePublicId = focusedUser.profileImage?.public_id;

    // Update user in transaction
    await User.findByIdAndUpdate(userId, {
      profileCreated: false,
      userOnboarded: false,
      bio: '',
      phoneNumber: '',
      profileImage: null,
      profilePicture: null,
      city: '',
      state: '',
      userVerified: false
    }, { session, new: false });

    // Update agent if exists
    if (focusedUser.userIsAnAgent && focusedUser.agentId) {
      await Agent.findByIdAndUpdate(focusedUser.agentId, {
        officeAddress: '',
        officeNumber: '',
        agencyName: '',
        agencyWebsite: '',
        coverImage: null,
        coverPicture: null,
        verificationStatus: 'unverified',
        inspectionFeePerHour: 0,
      }, { session, new: false });
    }

    await session.commitTransaction();
    
    // External operations (outside transaction)
    if (imagePublicId) {
      await deleteCloudinaryImages(imagePublicId);
    }

    await sendVerificationRevokedEmail(
      userEmail,
      userName,
      reason,
      userRole
    );

    revalidatePath(path);
    return createSuccessResponse('User verification successfully revoked', 200);
  } catch (error) {
    await session.abortTransaction();
    console.error('Error revoking validation:', error);
    return createErrorResponse('Failed to revoke validation', 500);
  } finally {
    await session.endSession();
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

export const createAdmin = async (values: { email: string; role: string; path: string }) => {
  let session;

  try {
    await connectToMongoDB();

    session = await mongoose.startSession();
    session.startTransaction();

    const { email, role, path } = values;

    const current_user = await getCurrentUser();

    if (!current_user) {
      await session.abortTransaction();
      return createErrorResponse('You are not logged in', 401);
    }

    const permissions = createServerPermissionService(current_user.role);

    // Validate permissions - only superAdmins can add admins
    if (!permissions.isSuperAdmin) {
      await session.abortTransaction();
      return createErrorResponse('Only super administrators can add new admins', 403 );
    }

    // Validate the admin role
    const adminRoles = ['admin', 'superAdmin', 'creator'];
    if (!adminRoles.includes(role)) {
      await session.abortTransaction();
      return createErrorResponse('Invalid admin role specified', 400 );
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    .session(session);

    let accessId: string | undefined;
    let targetUserId: string;

    if (existingUser) {
      targetUserId = existingUser._id.toString();

      // Check if user is already an admin
      const existingAdmin = await Admin.findOne({ userId: targetUserId })
      .session(session);
      
      if (existingAdmin) {
        await session.abortTransaction();
        return createErrorResponse(`User with email ${email} is already an admin with role: ${existingAdmin.role}`, 400);
      }

      // Check if user already has admin role without admin record (inconsistent state)
      if (adminRoles.includes(existingUser.role)) {
        await session.abortTransaction();
        return createErrorResponse(`User with email ${email} already has admin role but missing admin record. Please contact support.`, 400);
      }

      // Store previous role for notification
      const previousRole = existingUser.role;
      
      // Generate accessId
      accessId = generateAccessId();
      const expiryHours = 24;
      const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);

      // Update user role in transaction
      const userUpdateData = {
        role: role,
        previousRole: previousRole,
        roleChangedAt: new Date(),
        roleChangedBy: current_user.userId._id
      };

      await User.findByIdAndUpdate(targetUserId, userUpdateData , { session, new: false });

      // Create admin record in transaction
      await Admin.create([{
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
      }], { session });

      // Send admin setup email
      const userName = capitalizeName(existingUser.surName ?? '') + ' ' + capitalizeName(existingUser.lastName ?? '');
      const emailSent = await sendAdminSetupEmail(
        existingUser.email,
        userName,
        role,
        accessId,
        expiresAt,
        current_user.userId.email
      );

      // Create notification
      const roleChangeNotification = await Notification.create([{
        type: 'role_change',
        title: 'Account Role Updated to Admin',
        content: `Your account has been upgraded to ${role} role. Check your email to complete admin setup.`,
        recipient: targetUserId,
        createdBy: current_user.userId._id
      }], { session });

      await User.findByIdAndUpdate( targetUserId, { $push: { notifications: roleChangeNotification[0]._id }},
        { session, new: false }
      );

    } else {
      // NEW USER - Create user and admin records
      
      // Generate unique username
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;

      // Check for existing username with session
      while (await User.findOne({ username }).session(session)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create new user with admin role in transaction
      const newUsers = await User.create([{
        email: email.toLowerCase(),
        username: username,
        role: role,
        userOnboarded: false,
        profileCreated: false,
        userVerified: false,
        placeholderColor: generatePlaceholderColor(),
        createdAt: new Date(),
        updatedAt: new Date()
      }], { session });

      const newUser = newUsers[0];
      targetUserId = newUser._id.toString();

      // Generate accessId
      accessId = generateAccessId();
      const expiryHours = 24;
      const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);

      // Create admin record in transaction
      await Admin.create([{
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
      }], { session });

      // Send admin setup email
      await sendAdminSetupEmail(
        newUser.email,
        'New Admin',
        role,
        accessId,
        expiresAt,
        current_user.userId.email
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    
    // Revalidate path outside transaction
    revalidatePath(path);

    return {
      success: true,
      message: `Admin successfully added. Access ID sent to ${email}. User must complete setup within 24 hours.`,
      data: {
        email: email,
        userId: targetUserId,
        accessIdProvided: !!accessId,
        // Only include accessId in development
        ...(process.env.NODE_ENV === 'development' && accessId ? { accessId } : {})
      },
      status: 200
    };

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    
    console.error('Error adding admin:', error)

    return createErrorResponse('Failed to add admin account')
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

export const activateAdmin = async (values: {email: string, accessId: string}) => {
  
  let session;
  try {
    await connectToMongoDB();
    
    // Start session AFTER connecting to MongoDB
    session = await mongoose.startSession();
    session.startTransaction();
    
    const { email, accessId } = values;

    // Validation
    if (!email?.trim() || !accessId?.trim()) {
      await session.abortTransaction();
      await session.endSession();
      return {
        success: false, 
        message: 'Email and access ID are required', 
        status: 400
      };
    }

    // Find user
    const userDetail = await User.findOne({ 
      email: email.trim().toLowerCase() 
    }).session(session);
    
    if (!userDetail) {
      console.log('User not found for email:', email);
      await session.abortTransaction();
      await session.endSession();
      return {
        success: false, 
        message: 'User not found', 
        status: 404
      };
    }

    // Find admin details
    const adminDetails = await Admin.findOne({ 
      userId: userDetail._id 
    }).session(session);
    
    if (!adminDetails) {
      await session.abortTransaction();
      await session.endSession();
      return {
        success: false, 
        message: 'Admin record not found for this user', 
        status: 404
      };
    }

    // Check if already activated
    if (adminDetails.isActivated) {
      console.log('Admin already activated');
      await session.abortTransaction();
      await session.endSession();
      return {
        success: false, 
        message: 'Admin account is already activated', 
        status: 409
      };
    }

    // Validate access ID
    if (!adminDetails.accessId) {
      console.log('Access ID missing from admin record');
      await session.abortTransaction();
      await session.endSession();
      return {
        success: false, 
        message: 'Access ID not found or already used', 
        status: 410
      };
    }

    const trimmedAccessId = accessId.trim();
    if (adminDetails.accessId !== trimmedAccessId) {
      console.log('Access ID mismatch:', {
        provided: trimmedAccessId,
        stored: adminDetails.accessId
      });
      await session.abortTransaction();
      await session.endSession();
      return {
        success: false, 
        message: 'Invalid access ID', 
        status: 403
      };
    }

    // Check expiration
    const now = Date.now();
    if (adminDetails.accessIdExpires && now > adminDetails.accessIdExpires) {
      console.log('Access ID expired:', {
        expires: adminDetails.accessIdExpires,
        now: now,
        expired: now > adminDetails.accessIdExpires
      });
      await session.abortTransaction();
      await session.endSession();
      return {
        success: false, 
        message: 'Access ID has expired', 
        status: 410
      };
    }

    console.log('Performing updates...');
    
    // Perform updates in transaction
    await User.findOneAndUpdate(
      { _id: userDetail._id },
      { 
        userVerified: true,
        updatedAt: new Date()
      },
      { session, new: false }
    );

    await Admin.findOneAndUpdate(
      { _id: adminDetails._id },
      { 
        accessId: undefined, 
        accessIdExpires: undefined,
        isActivated: true, 
        activatedAt: new Date(), 
        activatedBy: adminDetails.userId,
        updatedAt: new Date()
      },
      { session, new: false }
    );

    // Commit transaction
    await session.commitTransaction();
    
    return {
      success: true, 
      message: 'Admin account activated successfully', 
      status: 200,
      data: {
        userId: userDetail._id,
        adminId: adminDetails._id,
        email: userDetail.email,
        activatedAt: new Date()
      }
    };

  } catch (error) {
    console.error('Error in activateAdmin:', error);
    
    // Only abort if session exists
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
    }
    
    return {
      success: false,
      message: 'Failed to activate admin account',
      status: 500
    };
  } finally {
    // Only end session if it exists
    if (session) {
      try {
        await session.endSession();
        console.log('Session ended');
      } catch (endError) {
        console.error('Error ending session:', endError);
      }
    }
  }
};

export const requestNewAccessId = async (values: { email: string }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToMongoDB();
    const { email } = values;

    // Validation
    if (!email?.trim()) {
      await session.abortTransaction();
      return {
        success: false,
        message: 'Email is required',
        status: 400
      };
    }

    // Find user
    const userDetail = await User.findOne({ email: email.trim().toLowerCase() })
    .session(session);

    if (!userDetail) {
      await session.abortTransaction();
      return {
        success: false,
        message: 'User not found',
        status: 404
      };
    }

    // Check if user has admin role
    const adminRoles = ['admin', 'superAdmin', 'creator'];
    if (!adminRoles.includes(userDetail.role)) {
      await session.abortTransaction();
      return {
        success: false,
        message: 'Only admin users can request new access IDs',
        status: 403
      };
    }

    // Find admin details
    const adminDetails = await Admin.findOne({ userId: userDetail._id })
    .session(session);

    if (!adminDetails) {
      await session.abortTransaction();
      return {
        success: false,
        message: 'Admin record not found for this user',
        status: 404
      };
    }

    // Check if admin is already activated
    if (adminDetails.isActivated) {
      await session.abortTransaction();
      return {
        success: false,
        message: 'Admin account is already activated. No access ID needed.',
        status: 400
      };
    }

    // Check if there's an existing unexpired access ID
    const now = Date.now();
    if (adminDetails.accessId && adminDetails.accessIdExpires && now < adminDetails.accessIdExpires) {
      await session.abortTransaction();
      return {
        success: false,
        message: 'You already have a valid access ID. Please check your email.',
        status: 400
      };
    }

    // Generate new access ID
    const accessId = generateAccessId();
    const expiryHours = 24;
    const expiresAt = now + (expiryHours * 60 * 60 * 1000);

    // Update admin record with new access ID
    await Admin.findOneAndUpdate({ _id: adminDetails._id },
      {
        accessId: accessId,
        accessIdExpires: expiresAt,
        lastAccessIdRequest: new Date(),
        updatedAt: new Date()
      },
      { session, new: true }
    );

    // Get user's name for email
    const userName = capitalizeName(userDetail.surName || '') + ' ' + capitalizeName(userDetail.lastName || '') || 'Admin User';

    // Get super admin who created the account for attribution
    const createdByUser = adminDetails.createdBy ? await User.findById(adminDetails.createdBy).select('email').lean() : null;

    // Send new access ID email
    const emailSent = await sendAdminSetupEmail(
      userDetail.email,
      userName,
      adminDetails.role,
      accessId,
      expiresAt,
      createdByUser?.email || 'system@nomeorealtors.com'
    );

    if (!emailSent) {
      console.warn('Failed to send access ID email to:', userDetail.email);
    }

    // Commit transaction
    await session.commitTransaction();

    return {
      success: true,
      message: 'New access ID generated successfully. Please check your email.',
      status: 200
    };

  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    
    console.error('Error requesting new access ID:', error);

    return {
      success: false,
      message: 'Failed to generate new access ID',
      status: 500
    };
  } finally {
    await session.endSession();
  }
};

export const createPassword = async (values: {email: string, password: string}) => {
  let session;

  try {
    await connectToMongoDB();
    session = await mongoose.startSession();
    session.startTransaction();

    const { email, password } = values;

    // Input validation
    if (!email?.trim() || !password?.trim()) {
      await session.abortTransaction();
      await session.endSession();
      return createErrorResponse('Email and password are required', 400);
    }

    // Find user
    const userDetails = await User.findOne({ 
      email: email.trim().toLowerCase() 
    }).session(session);

    if (!userDetails) {
      await session.abortTransaction();
      await session.endSession();
      return createErrorResponse('User not found', 404);
    }

    // Find admin
    const adminDetails = await Admin.findOne({ 
      userId: userDetails._id 
    }).session(session);

    if (!adminDetails) {
      await session.abortTransaction();
      await session.endSession();
      return createErrorResponse('Admin account not found', 404);
    }

    // Check if admin is activated
    if (!adminDetails.isActivated) {
      await session.abortTransaction();
      await session.endSession();
      return createErrorResponse('Admin account not activated. Please complete activation first.', 403);
    }

    // Check if password already exists
    if (adminDetails.passwordAdded) {
      await session.abortTransaction();
      await session.endSession();
      return createErrorResponse('Password already set. Use password reset if you forgot it.', 400);
    }

    // IMPORTANT: Let the schema pre-save hook handle password hashing
    adminDetails.password = password;
    adminDetails.passwordAdded = true;
    adminDetails.isActive = true;
    await adminDetails.save({ session });

    // Update User - The pre-save hook will hash the password
    userDetails.password = password;
    await userDetails.save({ session });

    // Commit transaction
    await session.commitTransaction();

    const returnData = {email: userDetails.email, passwordSetAt: new Date()}
    return createSuccessResponse('Password successfully set', 200, returnData);

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    
    console.error('Error creating password:', error);
    
    return createErrorResponse('Failed to set password');
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


