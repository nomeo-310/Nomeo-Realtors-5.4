
export const ADMIN_PERMISSIONS = [
  // Verification Permissions
  'verifications.view',
  'verifications.approve',
  'verifications.reject',
  'verifications.manage',

  //Pending Permissions
  'pendings.view',
  'pendings.approve',
  'pendings.reject',
  'pendings.manage',
  
  // Inspection Permissions
  'inspections.view',
  'inspections.manage',

  // Transaction Permissions
  'transactions.view',
  'transactions.manage',
  'transactions.process',

  // Apartment Permissions
  'apartments.view',
  'apartments.delete',
  'apartments.manage',

  // Blog Permissions
  'blogs.create',
  'blogs.edit.own',
  'blogs.delete.own',
  'blogs.delete.all',
  'blogs.view.all',
  'blogs.manage',

  // Newsletter Permissions
  'newsletters.view',
  'newsletters.create',
  'newsletters.send',
  'newsletters.manage',

  // App Settings Permissions
  'app_settings.view',
  'app_settings.edit',
  'app_settings.manage',

  // User Management Permissions
  'users.view',
  'users.delete',
  'users.manage',

  // Admin Management Permissions
  'admins.view',
  'admins.create',
  'admins.edit',
  'admins.delete',
  'admins.manage',
  'admin.suspend', 
  'admin.deactivate',  
  'admin.reactivate',

  // Admin Management Permissions
  'admins.view',
  'admins.create',
  'admins.edit',
  'admins.delete',
  'admins.manage'
];

// Role-based Permission Sets
export const ROLE_PERMISSIONS = {
  SUPERADMIN: [...ADMIN_PERMISSIONS],

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