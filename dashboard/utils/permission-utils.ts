// utils/permission-utils.ts
export type Permission = string;
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'CREATOR';

// Your permissions structure
export const ROLE_PERMISSIONS = {
  SUPERADMIN: [
    'verifications.view', 'verifications.approve', 'verifications.reject', 'verifications.manage',
    'inspections.view', 'inspections.manage', 'apartments.view', 'apartments.delete', 'apartments.manage',
    'blogs.create', 'blogs.edit.own', 'blogs.delete.own', 'users.view', 'user.delete', 'users.manage',
    'blogs.view.all', 'blogs.manage', 'newsletters.view', 'newsletters.create', 'newsletters.send', 'newsletters.manage',
  ],
  ADMIN: [
    'verifications.view', 'verifications.approve', 'verifications.reject', 'verifications.manage',
    'inspections.view', 'inspections.manage', 'apartments.view', 'apartments.delete', 'apartments.manage',
    'blogs.create', 'blogs.edit.own', 'blogs.delete.own', 'users.view', 'user.delete', 'users.manage',
  ],
  CREATOR: [
    'blogs.create', 'blogs.edit.own', 'blogs.delete.own', 'blogs.view.all', 'blogs.manage',
    'newsletters.view', 'newsletters.create', 'newsletters.send', 'newsletters.manage',
  ]
};

// Core permission functions
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  if (userRole === 'SUPERADMIN') return true;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

export const canView = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.view`) || hasPermission(userRole, `${resource}.manage`);
};

export const canManage = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.manage`);
};

export const canCreate = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.create`) || hasPermission(userRole, `${resource}.manage`);
};

// ADD THESE MISSING FUNCTIONS:
export const canEdit = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.edit`) || 
         hasPermission(userRole, `${resource}.edit.own`) ||
         hasPermission(userRole, `${resource}.manage`);
};

export const canDelete = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.delete`) || 
         hasPermission(userRole, `${resource}.delete.own`) ||
         hasPermission(userRole, `${resource}.manage`);
};

// Specific permission checks
export const canViewVerifications = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'verifications.view') || hasPermission(userRole, 'verifications.manage');
};

export const canManageVerifications = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'verifications.manage');
};

export const canApproveVerifications = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'verifications.approve') || hasPermission(userRole, 'verifications.manage');
};

export const canViewApartments = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'apartments.view') || hasPermission(userRole, 'apartments.manage');
};

export const canManageApartments = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'apartments.manage');
};

export const canViewUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'users.view') || hasPermission(userRole, 'users.manage');
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'users.manage');
};

export const canViewBlogs = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'blogs.view') || hasPermission(userRole, 'blogs.view.all') || hasPermission(userRole, 'blogs.manage');
};

export const canManageBlogs = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'blogs.manage');
};

export const canViewNewsletters = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'newsletters.view') || hasPermission(userRole, 'newsletters.manage');
};

export const canManageNewsletters = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'newsletters.manage');
};

// Main hook that works with any user object
interface User {
  role: 'superAdmin' | 'admin' | 'creator' | 'user' | 'agent';
  id: string;
  email: string;
  name: string;
}

export const usePermissionsWithUser = (user: User | null) => {
  const userRole = user?.role ? user.role.toUpperCase() as UserRole : null;

  return {
    // Basic permission checks
    hasPermission: (permission: Permission) => userRole ? hasPermission(userRole, permission) : false,
    
    // Generic resource checks
    canView: (resource: string) => userRole ? canView(userRole, resource) : false,
    canManage: (resource: string) => userRole ? canManage(userRole, resource) : false,
    canCreate: (resource: string) => userRole ? canCreate(userRole, resource) : false,
    canEdit: (resource: string) => userRole ? canEdit(userRole, resource) : false, // Now this will work
    canDelete: (resource: string) => userRole ? canDelete(userRole, resource) : false, // Now this will work
    
    // Specific resource checks
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
    user,
  };
};