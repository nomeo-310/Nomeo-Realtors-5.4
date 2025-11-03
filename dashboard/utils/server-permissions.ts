// utils/server-permissions.ts
'use server';

import { createServerPermissionService } from "./permission-service";

/**
 * Check if user has permission to access verification data
 */
export const requireVerificationAccess = async (userRole: string): Promise<boolean> => {
  const permissions = createServerPermissionService(userRole);
  return permissions.canViewVerifications();
};

/**
 * Guard function for verification routes - throws error if no access
 */
export const guardVerificationAccess = async (userRole: string): Promise<void> => {
  const hasAccess = await requireVerificationAccess(userRole);
  if (!hasAccess) {
    throw new Error('You are not authorized to access verification data');
  }
};

/**
 * Generic guard function for any resource
 */
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

/**
 * Check if user can manage users
 */
export const canManageUsers = async (userRole: string): Promise<boolean> => {
  const permissions = createServerPermissionService(userRole);
  return permissions.canManageUsers();
};

/**
 * Check if user can delete users
 */
export const canDeleteUsers = async (userRole: string): Promise<boolean> => {
  const permissions = createServerPermissionService(userRole);
  return permissions.canDelete('users');
};

/**
 * Check if user is super admin
 */
export const isSuperAdmin = async (userRole: string): Promise<boolean> => {
  const permissions = createServerPermissionService(userRole);
  return permissions.isSuperAdmin;
};