// utils/server-permissions.ts
'use server';

import { createServerPermissionService } from "./permission-service";

// ===== VERIFICATION GUARDS =====
export const requireVerificationAccess = async (userRole: string): Promise<boolean> => {
  const permissions = createServerPermissionService(userRole);
  return permissions.canViewVerifications();
};

export const guardVerificationAccess = async (userRole: string): Promise<void> => {
  const hasAccess = await requireVerificationAccess(userRole);
  if (!hasAccess) {
    throw new Error('You are not authorized to access verification data');
  }
};

export const guardVerificationManagement = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canManageVerifications()) {
    throw new Error('You are not authorized to manage verifications');
  }
};

export const guardVerificationApproval = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canApproveVerifications()) {
    throw new Error('You are not authorized to approve verifications');
  }
};

// ===== INSPECTION GUARDS =====
export const guardInspectionAccess = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canView('inspections')) {
    throw new Error('You are not authorized to view inspections');
  }
};

export const guardInspectionManagement = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canManage('inspections')) {
    throw new Error('You are not authorized to manage inspections');
  }
};

// ===== TRANSACTION GUARDS =====
export const guardTransactionAccess = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canView('transactions')) {
    throw new Error('You are not authorized to view transactions');
  }
};

export const guardTransactionManagement = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canManage('transactions')) {
    throw new Error('You are not authorized to manage transactions');
  }
};

export const guardTransactionProcessing = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.hasPermission('transactions.process')) {
    throw new Error('You are not authorized to process transactions');
  }
};

// ===== APARTMENT GUARDS =====
export const guardApartmentAccess = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canViewApartments()) {
    throw new Error('You are not authorized to view apartments');
  }
};

export const guardApartmentManagement = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canManageApartments()) {
    throw new Error('You are not authorized to manage apartments');
  }
};

export const guardApartmentDeletion = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canDelete('apartments')) {
    throw new Error('You are not authorized to delete apartments');
  }
};

// ===== BLOG GUARDS =====
export const guardBlogAccess = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canViewBlogs()) {
    throw new Error('You are not authorized to view blogs');
  }
};

export const guardBlogManagement = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canManageBlogs()) {
    throw new Error('You are not authorized to manage blogs');
  }
};

export const guardBlogCreation = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canCreate('blogs')) {
    throw new Error('You are not authorized to create blogs');
  }
};

// ===== NEWSLETTER GUARDS =====
export const guardNewsletterAccess = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canViewNewsletters()) {
    throw new Error('You are not authorized to view newsletters');
  }
};

export const guardNewsletterManagement = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canManageNewsletters()) {
    throw new Error('You are not authorized to manage newsletters');
  }
};

export const guardNewsletterSending = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.hasPermission('newsletters.send')) {
    throw new Error('You are not authorized to send newsletters');
  }
};

// ===== USER MANAGEMENT GUARDS =====
export const guardUserAccess = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canViewUsers()) {
    throw new Error('You are not authorized to view users');
  }
};

export const guardUserManagement = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canManageUsers()) {
    throw new Error('You are not authorized to manage users');
  }
};

export const guardUserDeletion = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.canDeleteUsers()) {
    throw new Error('You are not authorized to delete users');
  }
};

// ===== ADMIN MANAGEMENT GUARDS =====
export const guardAdminAccess = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.hasPermission('admins.view')) {
    throw new Error('You are not authorized to view admins');
  }
};

export const guardAdminManagement = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.hasPermission('admins.manage')) {
    throw new Error('You are not authorized to manage admins');
  }
};

export const guardAdminCreation = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.hasPermission('admins.create')) {
    throw new Error('You are not authorized to create admins');
  }
};

export const guardAdminDeletion = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.hasPermission('admins.delete')) {
    throw new Error('You are not authorized to delete admins');
  }
};

// ===== APP SETTINGS GUARDS =====
export const guardAppSettingsAccess = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.hasPermission('app_settings.view')) {
    throw new Error('You are not authorized to view app settings');
  }
};

export const guardAppSettingsManagement = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.hasPermission('app_settings.manage')) {
    throw new Error('You are not authorized to manage app settings');
  }
};

export const guardAppSettingsEdit = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.hasPermission('app_settings.edit')) {
    throw new Error('You are not authorized to edit app settings');
  }
};

// ===== GENERIC GUARDS =====
export const guardResourceAccess = async (
  userRole: string, 
  resource: string, 
  action: 'view' | 'manage' | 'create' | 'edit' | 'delete' = 'view'
): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  
  let hasAccess = false;
  switch (action) {
    case 'view':
      hasAccess = permissions.canView(resource);
      break;
    case 'manage':
      hasAccess = permissions.canManage(resource);
      break;
    case 'create':
      hasAccess = permissions.canCreate(resource);
      break;
    case 'edit':
      hasAccess = permissions.canEdit(resource);
      break;
    case 'delete':
      hasAccess = permissions.canDelete(resource);
      break;
    default:
      hasAccess = permissions.canView(resource);
  }

  if (!hasAccess) {
    throw new Error(`You are not authorized to ${action} ${resource}`);
  }
};

// ===== ROLE CHECKS =====
export const isSuperAdmin = async (userRole: string): Promise<boolean> => {
  const permissions = createServerPermissionService(userRole);
  return permissions.isSuperAdmin;
};

export const isAdmin = async (userRole: string): Promise<boolean> => {
  const permissions = createServerPermissionService(userRole);
  return permissions.isAdmin;
};

export const isCreator = async (userRole: string): Promise<boolean> => {
  const permissions = createServerPermissionService(userRole);
  return permissions.isCreator;
};

// ===== COMPOSITE GUARDS =====
export const guardSuperAdmin = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.isSuperAdmin) {
    throw new Error('This action requires super admin privileges');
  }
};

export const guardAdminOrHigher = async (userRole: string): Promise<void> => {
  const permissions = createServerPermissionService(userRole);
  if (!permissions.isSuperAdmin && !permissions.isAdmin) {
    throw new Error('This action requires admin privileges or higher');
  }
};