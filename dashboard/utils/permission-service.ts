// lib/permission-service.ts
import { 
  UserRole, 
  canViewVerifications, 
  canManageVerifications, 
  canApproveVerifications,
  canViewApartments,
  canManageApartments,
  canViewUsers,
  canManageUsers,
  canViewBlogs,
  canManageBlogs,
  canViewNewsletters,
  canManageNewsletters,
  canView,
  canManage,
  canCreate,
  canEdit,
  canDelete,
  hasPermission
} from '@/utils/permission-utils';

export class ServerPermissionService {
  constructor(private userRole: UserRole) {}

  // Basic permission checks
  hasPermission(permission: string): boolean {
    return hasPermission(this.userRole, permission);
  }

  // Generic resource checks
  canView(resource: string): boolean {
    return canView(this.userRole, resource);
  }

  canManage(resource: string): boolean {
    return canManage(this.userRole, resource);
  }

  canCreate(resource: string): boolean {
    return canCreate(this.userRole, resource);
  }

  canEdit(resource: string): boolean {
    return canEdit(this.userRole, resource);
  }

  canDelete(resource: string): boolean {
    return canDelete(this.userRole, resource);
  }

  // Verification permissions
  canViewVerifications(): boolean {
    return canViewVerifications(this.userRole);
  }

  canManageVerifications(): boolean {
    return canManageVerifications(this.userRole);
  }

  canApproveVerifications(): boolean {
    return canApproveVerifications(this.userRole);
  }

  // Apartment permissions
  canViewApartments(): boolean {
    return canViewApartments(this.userRole);
  }

  canManageApartments(): boolean {
    return canManageApartments(this.userRole);
  }

  // User permissions
  canViewUsers(): boolean {
    return canViewUsers(this.userRole);
  }

  canManageUsers(): boolean {
    return canManageUsers(this.userRole);
  }

  canDeleteUsers(): boolean {
    // Use the generic canDelete method since canDeleteUsers doesn't exist
    return this.canDelete('users');
  }

  // Blog permissions
  canViewBlogs(): boolean {
    return canViewBlogs(this.userRole);
  }

  canManageBlogs(): boolean {
    return canManageBlogs(this.userRole);
  }

  // Newsletter permissions
  canViewNewsletters(): boolean {
    return canViewNewsletters(this.userRole);
  }

  canManageNewsletters(): boolean {
    return canManageNewsletters(this.userRole);
  }

  // System permissions
  canViewAuditLogs(): boolean {
    return this.hasPermission('system.audit_logs');
  }

  canManageSystem(): boolean {
    return this.hasPermission('system.maintenance');
  }

  // User role checks
  get isSuperAdmin(): boolean {
    return this.userRole === 'SUPERADMIN';
  }

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  get isCreator(): boolean {
    return this.userRole === 'CREATOR';
  }

  get isUser(): boolean {
    return this.userRole === 'USER';
  }
}

export const createServerPermissionService = (role: string): ServerPermissionService => {
  return new ServerPermissionService(role.toUpperCase() as UserRole);
};