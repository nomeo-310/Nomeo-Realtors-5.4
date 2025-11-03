// hooks/usePermissions.ts
'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/actions/auth-actions';
import { AdminDetailsProps } from '@/lib/types';

export type Permission = string;
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'CREATOR';

// Your permissions structure
const ROLE_PERMISSIONS = {
  SUPERADMIN: [
    // SUPERADMIN has all permissions
    'verifications.view',
    'verifications.approve',
    'verifications.reject',
    'verifications.manage',
    'inspections.view',
    'inspections.manage',
    'apartments.view',
    'apartments.delete',
    'apartments.manage',
    'blogs.create',
    'blogs.edit.own',
    'blogs.delete.own',
    'users.view',
    'user.delete',
    'users.manage',
    'blogs.view.all',
    'blogs.manage',
    'newsletters.view',
    'newsletters.create',
    'newsletters.send',
    'newsletters.manage',
  ],

  ADMIN: [
    // Verification permissions
    'verifications.view',
    'verifications.approve',
    'verifications.reject',
    'verifications.manage',
    
    // Inspection permissions
    'inspections.view',
    'inspections.manage',
    
    // Apartment permissions
    'apartments.view',
    'apartments.delete',
    'apartments.manage',
    
    // Blog permissions
    'blogs.create',
    'blogs.edit.own',
    'blogs.delete.own',

    // User permissions
    'users.view',
    'user.delete',
    'users.manage',
  ],

  CREATOR: [
    // Blog permissions
    'blogs.create',
    'blogs.edit.own',
    'blogs.delete.own',
    'blogs.view.all',
    'blogs.manage',
    
    // Newsletter permissions
    'newsletters.view',
    'newsletters.create',
    'newsletters.send',
    'newsletters.manage',
  ]
};

// Utility functions
const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  if (userRole === 'SUPERADMIN') {
    return true;
  }

  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

const canView = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.view`) || 
         hasPermission(userRole, `${resource}.manage`);
};

const canManage = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.manage`);
};

const canCreate = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.create`) || 
         hasPermission(userRole, `${resource}.manage`);
};

const canEdit = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.edit`) || 
         hasPermission(userRole, `${resource}.edit.own`) ||
         hasPermission(userRole, `${resource}.manage`);
};

const canDelete = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.delete`) || 
         hasPermission(userRole, `${resource}.delete.own`) ||
         hasPermission(userRole, `${resource}.manage`);
};

// Specific permission checks for your app
const canViewVerifications = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'verifications.view') || 
         hasPermission(userRole, 'verifications.manage');
};

const canManageVerifications = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'verifications.manage');
};

const canApproveVerifications = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'verifications.approve') ||
         hasPermission(userRole, 'verifications.manage');
};

const canViewApartments = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'apartments.view') || 
         hasPermission(userRole, 'apartments.manage');
};

const canManageApartments = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'apartments.manage');
};

const canViewUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'users.view') || 
         hasPermission(userRole, 'users.manage');
};

const canManageUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'users.manage');
};

const canViewBlogs = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'blogs.view') || 
         hasPermission(userRole, 'blogs.view.all') ||
         hasPermission(userRole, 'blogs.manage');
};

const canManageBlogs = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'blogs.manage');
};

const canViewNewsletters = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'newsletters.view') || 
         hasPermission(userRole, 'newsletters.manage');
};

const canManageNewsletters = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'newsletters.manage');
};

// Main hook
export const usePermissions = () => {
  const [user, setUser] = useState<AdminDetailsProps | null | undefined>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser || null);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Convert role to uppercase for our permission system
  const userRole = user?.role ? user.role.toUpperCase() as UserRole : null;

  return {
    // Basic permission checks
    hasPermission: (permission: Permission) => userRole ? hasPermission(userRole, permission) : false,
    
    // Generic resource checks
    canView: (resource: string) => userRole ? canView(userRole, resource) : false,
    canManage: (resource: string) => userRole ? canManage(userRole, resource) : false,
    canCreate: (resource: string) => userRole ? canCreate(userRole, resource) : false,
    canEdit: (resource: string) => userRole ? canEdit(userRole, resource) : false,
    canDelete: (resource: string) => userRole ? canDelete(userRole, resource) : false,
    
    // Specific resource checks (for common resources in your app)
    canViewVerifications: userRole ? canViewVerifications(userRole) : false,
    canManageVerifications: userRole ? canManageVerifications(userRole) : false,
    canApproveVerifications: userRole ? canApproveVerifications(userRole) : false,
    
    canViewApartments: userRole ? canViewApartments(userRole) : false,
    canManageApartments: userRole ? canManageApartments(userRole) : false,
    
    canViewUsers: userRole ? canViewUsers(userRole) : false,
    canManageUsers: userRole ? canManageUsers(userRole) : false,
    
    canViewBlogs: userRole ? canViewBlogs(userRole) : false,
    canManageBlogs: userRole ? canManageBlogs(userRole) : false,
    
    canViewNewsletters: userRole ? canViewNewsletters(userRole) : false,
    canManageNewsletters: userRole ? canManageNewsletters(userRole) : false,
    
    // User role info
    userRole,
    isSuperAdmin: userRole === 'SUPERADMIN',
    isAdmin: userRole === 'ADMIN',
    isCreator: userRole === 'CREATOR',
    isAuthenticated: !!user,
    
    // User data
    user,
    
    // Loading state
    loading,
  };
};