'use client'

import React from 'react'
import { 
  Mail, 
  Shield, 
  User, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  History, 
  IdCard, 
  Building,
  UserCheck,
  Lock,
  Unlock,
  Eye,
  FileText,
  Settings,
  Users,
  ShieldCheck,
  Verified,
  Search,
  Home,
  Newspaper,
  DollarSign,
  FileEdit,
  Layers,
  ChevronUp,
  ChevronDown,
  FileCheck,
  FileX,
  PenTool,
  Trash2,
  Send,
  Cpu,
  UserMinus,
  UserPlus,
  BellOff,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// TypeScript Interfaces
interface ProfileImage {
  public_id: string;
  secure_url: string;
}

interface UserId {
  _id: string;
  email: string;
  lastName: string;
  profileImage: ProfileImage;
  profilePicture: string;
  surName: string;
  bio?: string;
}

interface AdminHistory {
  role: string;
  changedAt: string;
  reason: string;
  changedBy: string;
  _id: string;
}

interface Admin {
  _id: string;
  userId: UserId;
  role: string;
  adminAccess: string;
  adminPermissions: string[];
  isActivated: boolean;
  activatedAt: string;
  passwordAdded: boolean;
  adminOnboarded: boolean;
  createdBy: string;
  adminHistory: AdminHistory[];
  createdAt: string;
  adminId: string;
  isActive: boolean;
}

interface AdminProfileProps {
  admin: Admin;
}

// Complete permission structure
const PERMISSION_GROUPS = [
  {
    category: 'Verifications',
    prefix: 'verifications',
    icon: Verified,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    permissions: [
      { name: 'verifications.view', description: 'View all verification requests' },
      { name: 'verifications.approve', description: 'Approve verification requests' },
      { name: 'verifications.reject', description: 'Reject verification requests' },
      { name: 'verifications.manage', description: 'Manage verification system settings' }
    ]
  },
  {
    category: 'Pending Items',
    prefix: 'pendings',
    icon: Clock,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    permissions: [
      { name: 'pendings.view', description: 'View all pending items' },
      { name: 'pendings.approve', description: 'Approve pending items' },
      { name: 'pendings.reject', description: 'Reject pending items' },
      { name: 'pendings.manage', description: 'Manage pending items system' }
    ]
  },
  {
    category: 'Inspections',
    prefix: 'inspections',
    icon: Search,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    permissions: [
      { name: 'inspections.view', description: 'View inspection reports' },
      { name: 'inspections.manage', description: 'Manage inspection system' }
    ]
  },
  {
    category: 'Transactions',
    prefix: 'transactions',
    icon: DollarSign,
    color: 'bg-green-50 border-green-200 text-green-700',
    permissions: [
      { name: 'transactions.view', description: 'View transaction history' },
      { name: 'transactions.manage', description: 'Manage transaction system' },
      { name: 'transactions.process', description: 'Process new transactions' }
    ]
  },
  {
    category: 'Apartments',
    prefix: 'apartments',
    icon: Home,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    permissions: [
      { name: 'apartments.view', description: 'View all apartment listings' },
      { name: 'apartments.delete', description: 'Delete apartment listings' },
      { name: 'apartments.manage', description: 'Manage apartment system' }
    ]
  },
  {
    category: 'Blogs',
    prefix: 'blogs',
    icon: FileEdit,
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    permissions: [
      { name: 'blogs.create', description: 'Create new blog posts' },
      { name: 'blogs.edit.own', description: 'Edit own blog posts' },
      { name: 'blogs.delete.own', description: 'Delete own blog posts' },
      { name: 'blogs.delete.all', description: 'Delete any blog post' },
      { name: 'blogs.view.all', description: 'View all blog posts' },
      { name: 'blogs.manage', description: 'Manage blog system' }
    ]
  },
  {
    category: 'Newsletters',
    prefix: 'newsletters',
    icon: Newspaper,
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    permissions: [
      { name: 'newsletters.view', description: 'View newsletter subscribers and history' },
      { name: 'newsletters.create', description: 'Create new newsletters' },
      { name: 'newsletters.send', description: 'Send newsletters to subscribers' },
      { name: 'newsletters.manage', description: 'Manage newsletter system' }
    ]
  },
  {
    category: 'App Settings',
    prefix: 'app_settings',
    icon: Settings,
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    permissions: [
      { name: 'app_settings.view', description: 'View application settings' },
      { name: 'app_settings.edit', description: 'Edit application settings' },
      { name: 'app_settings.manage', description: 'Manage all app configurations' }
    ]
  },
  {
    category: 'Users',
    prefix: 'users',
    icon: Users,
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    permissions: [
      { name: 'users.view', description: 'View user accounts' },
      { name: 'users.delete', description: 'Delete user accounts' },
      { name: 'users.manage', description: 'Manage user system and permissions' }
    ]
  },
  {
    category: 'Admins',
    prefix: 'admins',
    icon: ShieldCheck,
    color: 'bg-red-50 border-red-200 text-red-700',
    permissions: [
      { name: 'admins.view', description: 'View admin accounts' },
      { name: 'admins.create', description: 'Create new admin accounts' },
      { name: 'admins.edit', description: 'Edit admin accounts' },
      { name: 'admins.delete', description: 'Delete admin accounts' },
      { name: 'admins.manage', description: 'Manage admin system' },
      { name: 'admin.suspend', description: 'Suspend admin accounts temporarily' },
      { name: 'admin.deactivate', description: 'Deactivate admin accounts permanently' },
      { name: 'admin.reactivate', description: 'Reactivate deactivated admin accounts' }
    ]
  }
];

// Role descriptions
const ROLE_DESCRIPTIONS = {
  SUPERADMIN: 'Has complete control over the entire system including all administrative functions, user management, and system settings.',
  ADMIN: 'Has administrative access to manage users, verifications, inspections, and apartments with limited system settings access.',
  CREATOR: 'Can create and manage blog content, newsletters, and other creative content with limited administrative access.',
  MODERATOR: 'Can moderate content and manage user interactions with basic administrative privileges.'
};

// Permission icon mapping
const getPermissionIcon = (permission: string) => {
  const iconSize = "h-4 w-4";
  
  if (permission.includes('.view')) return <Eye className={iconSize} />;
  if (permission.includes('.approve')) return <FileCheck className={iconSize} />;
  if (permission.includes('.reject')) return <FileX className={iconSize} />;
  if (permission.includes('.create')) return <FileText className={iconSize} />;
  if (permission.includes('.edit')) return <PenTool className={iconSize} />;
  if (permission.includes('.delete')) return <Trash2 className={iconSize} />;
  if (permission.includes('.send')) return <Send className={iconSize} />;
  if (permission.includes('.process')) return <Cpu className={iconSize} />;
  if (permission.includes('.suspend')) return <BellOff className={iconSize} />;
  if (permission.includes('.deactivate')) return <UserMinus className={iconSize} />;
  if (permission.includes('.reactivate')) return <UserPlus className={iconSize} />;
  if (permission.includes('.manage')) return <Settings className={iconSize} />;
  
  return <Shield className={iconSize} />;
};

// Get permission action name
const getPermissionAction = (permission: string) => {
  const parts = permission.split('.');
  const action = parts[parts.length - 1];
  
  switch (action) {
    case 'view': return 'View';
    case 'approve': return 'Approve';
    case 'reject': return 'Reject';
    case 'create': return 'Create';
    case 'edit': return 'Edit';
    case 'delete': return 'Delete';
    case 'send': return 'Send';
    case 'process': return 'Process';
    case 'suspend': return 'Suspend';
    case 'deactivate': return 'Deactivate';
    case 'reactivate': return 'Reactivate';
    case 'manage': return 'Manage';
    default: return action.charAt(0).toUpperCase() + action.slice(1);
  }
};

const ActiveAdminClient: React.FC<AdminProfileProps> = ({ admin }) => {
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  const [imageError, setImageError] = React.useState(false);

  // Get profile image URL from userId
  const getProfileImageUrl = () => {
    // First check profilePicture
    if (admin.userId.profilePicture && 
        admin.userId.profilePicture !== '' && 
        admin.userId.profilePicture !== 'null') {
      return admin.userId.profilePicture;
    }
    
    // Then check profileImage.secure_url
    if (admin.userId.profileImage?.secure_url && 
        admin.userId.profileImage.secure_url !== '' && 
        admin.userId.profileImage.secure_url !== 'null') {
      return admin.userId.profileImage.secure_url;
    }
    
    // If neither exists, return null for placeholder
    return null;
  };

  // Get initials for placeholder
  const getInitials = () => {
    const { surName, lastName, email } = admin.userId;
    
    if (surName && lastName) {
      return `${surName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    if (surName) {
      return surName.charAt(0).toUpperCase();
    }
    
    if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    
    // Use first two letters of email
    const emailPrefix = email.split('@')[0];
    if (emailPrefix.length >= 2) {
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    
    return email.charAt(0).toUpperCase();
  };

  // Get placeholder background color
  const getPlaceholderBgColor = () => {
    const emailHash = admin.userId.email.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500',
      'bg-cyan-500', 'bg-violet-500'
    ];
    
    return colors[emailHash % colors.length];
  };

  const hasProfileImage = getProfileImageUrl() !== null;

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Check if category is expanded
  const isCategoryExpanded = (category: string) => expandedCategories.includes(category);

  // Get permissions for each category that the admin has
  const getAdminPermissionsByCategory = () => {
    return PERMISSION_GROUPS.map(group => ({
      ...group,
      adminPermissions: group.permissions.filter(p => 
        admin.adminPermissions.includes(p.name)
      ),
      totalPermissions: group.permissions.length,
      hasPermissions: group.permissions.some(p => 
        admin.adminPermissions.includes(p.name)
      ),
      hasAllPermissions: group.permissions.every(p => 
        admin.adminPermissions.includes(p.name)
      )
    })).filter(group => group.hasPermissions);
  };

  const adminPermissionsByCategory = getAdminPermissionsByCategory();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time since activation
  const getTimeSinceActivation = () => {
    if (!admin.isActivated || !admin.activatedAt) return 'Not activated';
    
    const activatedDate = new Date(admin.activatedAt);
    const now = new Date();
    const diffMs = now.getTime() - activatedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'MODERATOR':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'CREATOR':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get access level badge color
  const getAccessBadgeColor = (access: string) => {
    switch (access.toLowerCase()) {
      case 'full_access':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'limited_access':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'read_only':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get latest role change
  const getLatestRoleChange = () => {
    if (!admin.adminHistory || admin.adminHistory.length === 0) {
      return null;
    }
    
    // Sort by date descending and get the most recent
    const sortedHistory = [...admin.adminHistory].sort(
      (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );
    
    return sortedHistory[0];
  };

  // Calculate permission coverage percentage
  const calculatePermissionCoverage = () => {
    const allPermissions = PERMISSION_GROUPS.flatMap(group => group.permissions.map(p => p.name));
    const assignedPermissions = admin.adminPermissions.length;
    const totalPermissions = allPermissions.length;
    
    return Math.round((assignedPermissions / totalPermissions) * 100);
  };

  // Get role description
  const getRoleDescription = () => {
    return ROLE_DESCRIPTIONS[admin.role.toUpperCase() as keyof typeof ROLE_DESCRIPTIONS] || 
           'No description available for this role.';
  };

  // Show bio if it exists (read-only view)
  const showBio = admin.userId.bio && admin.role.toUpperCase() === 'CREATOR';

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Profile</h1>
          <p className="text-gray-600 mt-1 dark:text-white/80">Detailed information about the administrator</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={admin.isActive ? "default" : "secondary"}
            className={admin.isActive 
              ? "bg-green-100 text-green-800 hover:bg-green-100" 
              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }
          >
            {admin.isActive ? (
              <>
                <UserCheck className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
          
          <Badge className={getRoleBadgeColor(admin.role)}>
            <Shield className="h-3 w-3 mr-1" />
            {admin.role.replace(/([A-Z])/g, ' $1').trim()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image or Placeholder */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {hasProfileImage && !imageError ? (
                    <img
                      src={getProfileImageUrl()!}
                      alt={`${admin.userId.surName} ${admin.userId.lastName}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className={`${getPlaceholderBgColor()} w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                      <span className="text-4xl font-bold text-white">
                        {getInitials()}
                      </span>
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  <div className="absolute -bottom-2 -right-2">
                    {admin.isActivated ? (
                      <div className="bg-green-500 text-white p-1 rounded-full">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="bg-red-500 text-white p-1 rounded-full">
                        <XCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-semibold">
                    {admin.userId.surName} {admin.userId.lastName}
                  </h2>
                  <p className="text-gray-600 dark:text-white/80">Administrator</p>
                  {(!hasProfileImage || imageError) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Using placeholder avatar
                    </p>
                  )}
                </div>
              </div>

              {/* Bio Section for Creators (Read-only) */}
              {showBio && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700 dark:text-white/90">Bio</h3>
                  <div className="min-h-[80px] p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{admin.userId.bio}</p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 dark:text-white/90">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{admin.userId.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IdCard className="h-4 w-4 text-gray-400" />
                    <span>Admin ID: {admin.adminId.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>User ID: {admin.userId._id}</span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 dark:text-white/90">Account Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium dark:text-gray-700">Activated</span>
                    <span className={`text-lg font-semibold ${admin.isActivated ? 'text-green-600' : 'text-red-600'}`}>
                      {admin.isActivated ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium dark:text-gray-700">Onboarded</span>
                    <span className={`text-lg font-semibold ${admin.adminOnboarded ? 'text-green-600' : 'text-red-600'}`}>
                      {admin.adminOnboarded ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium dark:text-gray-700">Password</span>
                    <span className={`text-lg font-semibold ${admin.passwordAdded ? 'text-green-600' : 'text-red-600'}`}>
                      {admin.passwordAdded ? 'Set' : 'Not Set'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium dark:text-gray-700">Access Level</span>
                    <Badge className={getAccessBadgeColor(admin.adminAccess)}>
                      {admin.adminAccess.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-white/70">Created By</span>
                  <span className="text-sm font-medium">System Admin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-white/70">Account Created</span>
                  <span className="text-sm font-medium">{formatDate(admin.createdAt)}</span>
                </div>
                {admin.isActivated && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-white/70">Activated</span>
                    <span className="text-sm font-medium">{formatDate(admin.activatedAt)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-white/70">Active For</span>
                  <span className="text-sm font-medium">{getTimeSinceActivation()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details and History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Access & Permissions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Lock className="size-5" />
                Access & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-white/80 mb-2">Access Level</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getAccessBadgeColor(admin.adminAccess)}>
                        {admin.adminAccess === 'full_access' && <Unlock className="h-3 w-3 mr-1" />}
                        {admin.adminAccess === 'limited_access' && <Lock className="h-3 w-3 mr-1" />}
                        {admin.adminAccess.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-white/80 mb-2">Role Description</h4>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      {getRoleDescription()}
                    </p>
                  </div>
                  
                  {/* Permission Summary */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-700 dark:text-white/80 mb-3">Permission Summary</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg dark:text-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                          <Layers className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-sm">Total Assigned</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 ">{admin.adminPermissions.length}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {calculatePermissionCoverage()}% of all permissions
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg dark:text-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-sm">Permission Groups</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{adminPermissionsByCategory.length}</p>
                        <p className="text-xs text-gray-500 mt-1">of {PERMISSION_GROUPS.length} categories</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-white/80">Assigned Permissions</h4>
                      <p className="text-sm text-gray-500 dark:text-white/60">Click on categories to expand</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {adminPermissionsByCategory.length} Active Groups
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {adminPermissionsByCategory.length > 0 ? (
                      adminPermissionsByCategory.map((group) => {
                        const Icon = group.icon;
                        const isExpanded = isCategoryExpanded(group.category);
                        
                        return (
                          <div 
                            key={group.category} 
                            className={`border rounded-lg transition-all duration-200 ${group.color} ${isExpanded ? 'border-2' : ''}`}
                          >
                            <button
                              onClick={() => toggleCategory(group.category)}
                              className="w-full p-4 text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white rounded-lg">
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h5 className="font-semibold">{group.category}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {group.adminPermissions.length}/{group.totalPermissions}
                                      </Badge>
                                      {group.hasAllPermissions && (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Complete Access
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-gray-400">
                                  {isExpanded ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                            </button>
                            
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-2 border-t">
                                <div className="space-y-2">
                                  {group.adminPermissions.map((permission) => (
                                    <div key={permission.name} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                                      <div className="mt-1">
                                        {getPermissionIcon(permission.name)}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                          <span className="text-sm font-medium">
                                            {getPermissionAction(permission.name)}
                                          </span>
                                          <Badge variant="outline" className="text-xs bg-white">
                                            {permission.name.split('.')[0]}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                          {permission.description}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-white/60">
                        <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No permissions assigned to this role</p>
                        <p className="text-sm mt-1">Contact a Super Admin to assign permissions</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role History */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Role History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {admin.adminHistory.length > 0 ? (
                <div className="space-y-4">
                  {/* Current Role */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:text-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">Current Role</h3>
                      </div>
                      <Badge className={getRoleBadgeColor(admin.role)}>
                        {admin.role.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Assigned on {formatDate(admin.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {admin.adminOnboarded 
                        ? 'Administrator has completed onboarding process.' 
                        : 'Administrator onboarding is pending.'}
                    </p>
                  </div>

                  {/* Latest Change */}
                  {getLatestRoleChange() && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Latest Role Change</h3>
                        <span className="text-sm text-gray-500 dark:text-white/60">
                          {formatDate(getLatestRoleChange()!.changedAt)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-400 dark:text-white/60" />
                          <span className="text-sm">Role changed to: </span>
                          <Badge className={getRoleBadgeColor(getLatestRoleChange()!.role)}>
                            {getLatestRoleChange()!.role.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400 dark:text-white/60" />
                          <span className="text-sm">Changed by: System Admin</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mt-2 dark:text-white/80">Reason:</p>
                          <p className="text-sm text-gray-600 dark:text-white/80">{getLatestRoleChange()!.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Full History */}
                  <div>
                    <h3 className="font-semibold mb-3">Role History Timeline</h3>
                    <div className="space-y-3">
                      {admin.adminHistory.map((history, index) => (
                        <div key={history._id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                            {index < admin.adminHistory.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-300 mt-1" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Badge className={getRoleBadgeColor(history.role)}>
                                  {history.role.replace(/([A-Z])/g, ' $1').trim()}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-white/70">
                                {formatDate(history.changedAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-white/70">{history.reason}</p>
                            <p className="text-xs text-gray-400 mt-1 dark:text-white/50">
                              Changed by: {history.changedBy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-white/70">No role history available</p>
                  <p className="text-sm text-gray-500 mt-1 dark:text-white/60">
                    This administrator has not undergone any role changes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )}

  export default ActiveAdminClient;