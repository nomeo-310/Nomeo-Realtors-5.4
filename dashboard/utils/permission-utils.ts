// utils/permission-utils.ts
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'CREATOR' | 'USER';

// All Available Permissions
export const ADMIN_PERMISSIONS = [
  // ===== VERIFICATION PERMISSIONS =====
  'verifications.view',
  'verifications.approve',
  'verifications.reject', 
  'verifications.manage',

  // ===== INSPECTION PERMISSIONS =====
  'inspections.view',
  'inspections.manage',

 // ===== PENDINGS PERMISSIONS =====
  'pendings.view',
  'pendings.approve',
  'pendings.reject',
  'pendings.manage',

  // ===== TRANSACTION PERMISSIONS =====
  'transactions.view',
  'transactions.manage',
  'transactions.process',

  // ===== APARTMENT PERMISSIONS =====
  'apartments.view',
  'apartments.create',
  'apartments.edit',
  'apartments.delete',
  'apartments.manage',

  // ===== BLOG PERMISSIONS =====
  'blogs.view',
  'blogs.view.all',
  'blogs.create',
  'blogs.edit.own',
  'blogs.edit.all',
  'blogs.delete.own',
  'blogs.delete.all',
  'blogs.manage',

  // ===== NEWSLETTER PERMISSIONS =====
  'newsletters.view',
  'newsletters.create',
  'newsletters.send',
  'newsletters.manage',

  // ===== APP SETTINGS PERMISSIONS =====
  'app_settings.view',
  'app_settings.edit',
  'app_settings.manage',

  // ===== USER MANAGEMENT PERMISSIONS =====
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'users.manage',
  'user.suspend',
  'user.deactivate',
  'user.reactivate',

  // ===== ADMIN MANAGEMENT PERMISSIONS =====
  'admins.view',
  'admins.create',
  'admins.edit',
  'admins.delete',
  'admins.manage',
  'admin.suspend',
  'admin.deactivate',
  'admin.reactivate',

  // ===== SYSTEM PERMISSIONS =====
  'system.audit_logs',
  'system.backup',
  'system.restore',
  'system.maintenance'
];

// Role-based Permission Sets (Fixed and Complete)
export const ROLE_PERMISSIONS = {
  SUPERADMIN: [
    // All verification permissions
    'verifications.view',
    'verifications.approve',
    'verifications.reject',
    'verifications.manage',

    // All inspection permissions
    'inspections.view',
    'inspections.manage',

    // All pendings permissions
    'pendings.view',
    'pendings.approve',
    'pendings.manage',

    // All transaction permissions
    'transactions.view',
    'transactions.manage',
    'transactions.process',

    // All apartment permissions
    'apartments.view',
    'apartments.create',
    'apartments.edit',
    'apartments.delete',
    'apartments.manage',

    // All blog permissions
    'blogs.view',
    'blogs.view.all',
    'blogs.create',
    'blogs.edit.own',
    'blogs.edit.all',
    'blogs.delete.own',
    'blogs.delete.all',
    'blogs.manage',

    // All newsletter permissions
    'newsletters.view',
    'newsletters.create',
    'newsletters.send',
    'newsletters.manage',

    // All app settings permissions
    'app_settings.view',
    'app_settings.edit',
    'app_settings.manage',

    // All user management permissions
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.manage',
    'user.suspend',
    'user.deactivate',
    'user.reactivate',

    // All admin management permissions
    'admins.view',
    'admins.create',
    'admins.edit',
    'admins.delete',
    'admins.manage',
    'admin.suspend',
    'admin.deactivate',
    'admin.reactivate',

    // All system permissions
    'system.audit_logs',
    'system.backup',
    'system.restore',
    'system.maintenance'
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
    
    // Transaction permissions
    'transactions.view',
    'transactions.manage',
    'transactions.process',
    
    // Apartment permissions
    'apartments.view',
    'apartments.create',
    'apartments.edit',
    'apartments.delete',
    'apartments.manage',
    
    // Blog permissions (limited)
    'blogs.view',
    'blogs.view.all',
    'blogs.create',
    'blogs.edit.own',
    'blogs.delete.own',

    // Newsletter permissions (view only)
    'newsletters.view',

    // App settings permissions (view only)
    'app_settings.view',

    // User management permissions
    'users.view',
    'users.edit',
    'users.delete',
    'users.manage',
    'user.suspend',
    'user.deactivate',
    'user.reactivate',

    // Admin management (view only, no modifications)
    'admins.view'
  ],

  CREATOR: [
    // Blog permissions (full control)
    'blogs.view',
    'blogs.view.all',
    'blogs.create',
    'blogs.edit.own',
    'blogs.delete.own',
    'blogs.manage',
    
    // Newsletter permissions (full control)
    'newsletters.view',
    'newsletters.create',
    'newsletters.send',
    'newsletters.manage',

    // Limited apartment viewing
    'apartments.view'
  ],

  USER: [
    // Basic viewing permissions only
    'apartments.view',
    'blogs.view'
  ]
};

// Permission Check Functions
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// Generic Resource Permissions
export const canView = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.view`);
};

export const canManage = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.manage`);
};

export const canCreate = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.create`);
};

export const canEdit = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.edit`);
};

export const canDelete = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, `${resource}.delete`);
};

// Specific Resource Permissions
export const canViewVerifications = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'verifications.view');
};

export const canManageVerifications = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'verifications.manage');
};

export const canApproveVerifications = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'verifications.approve');
};

export const canViewPendings = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'pendings.view');
};

export const canManagePendings = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'pendings.manage');
};

export const canApprovePendings = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'pendings.approve');
};

export const canViewApartments = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'apartments.view');
};

export const canManageApartments = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'apartments.manage');
};

export const canViewUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'users.view');
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'users.manage');
};

export const canDeleteUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'users.delete');
};

export const canViewBlogs = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'blogs.view');
};

export const canManageBlogs = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'blogs.manage');
};

export const canViewNewsletters = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'newsletters.view');
};

export const canManageNewsletters = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'newsletters.manage');
};