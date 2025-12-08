"use client";

import React from "react";
import Modal from "../ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDeactivateUserModal } from "@/hooks/general-store";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { deactivateAdmin } from "@/actions/admin-actions";
import ScrollableWrapper from "../ui/scrollable-wrapper";

// Match your exact interfaces for admin only
interface UserInfo {
  _id: string;
  email: string;
  surName: string;
  lastName: string;
  firstName?: string;
  phoneNumber?: string;
}

export interface AdminListData {
  _id: string;
  userId: UserInfo;
  role: 'admin' | 'creator' | 'superAdmin';
  adminAccess: 'full_access' | 'limited_access' | 'no_access';
  adminOnboarded: boolean;
  createdAt: string | Date;
  adminId: string;
  isActive: boolean;
  isActivated?: boolean;
  isSuspended?: boolean;
  deactivated?: boolean;
  updatedAt?: string | Date;
}

const DeactivateUserModal = () => {
  const { onClose, isOpen, user } = useDeactivateUserModal();
  const queryClient = useQueryClient();

  const [deactivationReason, setDeactivationReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const path = usePathname();

  // Enhanced predefined reasons with more detail
  const predefinedReasons = [
    {
      id: 'inactivity',
      title: 'Account Inactivity',
      description: 'Account has shown no meaningful activity for an extended period of time, typically 90+ days without login or usage',
      short: 'Account inactivity for extended period'
    },
    {
      id: 'security',
      title: 'Security Concerns',
      description: 'Suspected account compromise, unauthorized access attempts, or security policy violations requiring immediate action',
      short: 'Security concerns or suspected compromise'
    },
    {
      id: 'user_request',
      title: 'User Request',
      description: 'Account holder has formally requested account deactivation or closure through support channels or account settings',
      short: 'User request for account deactivation'
    },
    {
      id: 'role_change',
      title: 'Role Change Required',
      description: 'User role or access permissions have changed, making current account level unnecessary or inappropriate',
      short: 'Role change or access no longer required'
    },
    {
      id: 'policy_violation',
      title: 'Policy Violations',
      description: 'Multiple violations of platform terms of service, community guidelines, or usage policies documented',
      short: 'Multiple policy violations'
    },
    {
      id: 'organizational',
      title: 'Organizational Changes',
      description: 'Company restructuring, team realignment, or departmental changes requiring account adjustments',
      short: 'Company restructuring or team changes'
    },
    {
      id: 'compliance',
      title: 'Compliance Requirements',
      description: 'Legal, regulatory, or data privacy compliance requirements necessitating account deactivation',
      short: 'Compliance with data privacy regulations'
    },
    {
      id: 'maintenance',
      title: 'System Maintenance',
      description: 'Platform cleanup, system optimization, or maintenance activities requiring temporary account deactivation',
      short: 'System maintenance or cleanup'
    },
    {
      id: 'performance',
      title: 'Performance Issues',
      description: 'Account-related performance problems, resource abuse, or system impact requiring intervention',
      short: 'Account performance or resource issues'
    },
    {
      id: 'duplicate',
      title: 'Duplicate Account',
      description: 'Multiple accounts detected for the same user, requiring consolidation or removal of duplicates',
      short: 'Duplicate account found'
    },
    {
      id: 'trial_expired',
      title: 'Trial Period Ended',
      description: 'Free trial or evaluation period has expired without conversion to paid account',
      short: 'Trial period expired without conversion'
    },
    {
      id: 'payment_issues',
      title: 'Payment Problems',
      description: 'Recurring payment failures, subscription issues, or billing problems unresolved after notifications',
      short: 'Unresolved payment or billing issues'
    },
    {
      id: 'behavior',
      title: 'Inappropriate Behavior',
      description: 'Unprofessional conduct, harassment, or behavior violating platform community standards',
      short: 'Inappropriate behavior or conduct'
    },
    {
      id: 'data_request',
      title: 'Data Management',
      description: 'Data retention policy enforcement, GDPR compliance, or user data management requirements',
      short: 'Data management or retention policy'
    }
  ];

  // Format user type for display
  const formatUserType = (role: 'admin' | 'creator' | 'superAdmin'): string => {
    switch (role) {
      case 'superAdmin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'creator': return 'Content Creator';
      default: return 'Admin';
    }
  };

  // Initialize form
  React.useEffect(() => {
    if (user) {
      setDeactivationReason("");
      setIsSubmitting(false);
    }
  }, [user]);

  const handleReasonClick = (reason: string) => {
    setDeactivationReason(reason);
  };

  const handleDeactivate = async () => {
    if (!user || !deactivationReason.trim()) return;

    setIsSubmitting(true);
    try {
      const deactivationData = {
        adminId: user._id,
        reason: deactivationReason,
        path
      };

      const response = await deactivateAdmin(deactivationData);
      
      if (response.success) {
        const displayName = `${user.userId.surName} ${user.userId.lastName}`.trim();
        const userType = formatUserType(user.role);
        
        toast.success(`${displayName} (${userType}) has been deactivated successfully.`);
        
        // Invalidate relevant admin queries
        queryClient.invalidateQueries({ queryKey: ['active-admins'] });
        queryClient.invalidateQueries({ queryKey: ['all-admins'] });
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        
        // Invalidate specific role queries
        if (user.role === 'superAdmin') {
          queryClient.invalidateQueries({ queryKey: ['super-admins'] });
        } else if (user.role === 'creator') {
          queryClient.invalidateQueries({ queryKey: ['content-creators'] });
        }
        
        onClose();
        resetForm();
      } else {
        toast.error(response.message || 'Failed to deactivate admin account');
      }
    } catch (error) {
      console.error('Error deactivating admin:', error);
      toast.error('Failed to deactivate admin account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDeactivationReason("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Check if account is already deactivated
  const isAlreadyDeactivated = React.useMemo(() => {
    if (!user) return false;
    return user.deactivated === true;
  }, [user]);

  // Check if account is suspended
  const isSuspended = React.useMemo(() => {
    if (!user) return false;
    return user.isSuspended === true;
  }, [user]);

  // Get admin access level
  const getAdminAccessLevel = (): string => {
    if (!user) return '';
    
    switch (user.adminAccess) {
      case 'full_access': return 'Full Access';
      case 'limited_access': return 'Limited Access';
      case 'no_access': return 'No Access';
      default: return user.adminAccess;
    }
  };

  // Get role-specific impacts - Top 4 for each role
  const getDeactivationImpact = () => {
    if (!user) return [];
    
    const impacts = {
      superAdmin: [
        'Cannot access system settings and configurations',
        'Cannot manage other admin accounts',
        'All active sessions will be terminated immediately',
        'Critical platform functions may be affected'
      ],
      admin: [
        'Cannot access admin dashboard and tools',
        'Cannot perform user management tasks',
        'Assigned responsibilities will need reassignment',
        'All active admin sessions will be terminated'
      ],
      creator: [
        'Cannot access content creation tools',
        'Cannot publish or manage existing content',
        'Revenue processing may be interrupted',
        'Scheduled content may not be published'
      ]
    };

    return impacts[user.role] || impacts.admin;
  };

  // Get role color and icon
  const getRoleStyle = () => {
    if (!user) return { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      border: 'border-gray-200',
      icon: '👤',
      color: 'gray'
    };
    
    switch (user.role) {
      case 'superAdmin':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-800', 
          border: 'border-red-200',
          icon: '👑',
          color: 'red'
        };
      case 'admin':
        return { 
          bg: 'bg-purple-100', 
          text: 'text-purple-800', 
          border: 'border-purple-200',
          icon: '🛡️',
          color: 'purple'
        };
      case 'creator':
        return { 
          bg: 'bg-green-100', 
          text: 'text-green-800', 
          border: 'border-green-200',
          icon: '✍️',
          color: 'green'
        };
      default:
        return { 
          bg: 'bg-gray-100', 
          text: 'text-gray-800', 
          border: 'border-gray-200',
          icon: '👤',
          color: 'gray'
        };
    }
  };

  if (!user) return null;

  const displayName = `${user.userId.surName} ${user.userId.lastName}`.trim();
  const userEmail = user.userId.email;
  const userType = formatUserType(user.role);
  const roleStyle = getRoleStyle();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Deactivate ${userType}`}
      width="lg:w-[650px] xl:w-[700px] md:w-[550px]"
      useCloseButton
    >
      <ScrollableWrapper>
        <div className="space-y-4">
          {/* Admin Information */}
          <div className={`${roleStyle.bg} ${roleStyle.border} border rounded-lg p-4`}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{displayName}</h4>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium w-fit shrink-0 ${roleStyle.bg} ${roleStyle.text} flex items-center gap-1`}>
                {userType}
              </span>
            </div>
          </div>

          {/* Deactivation Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-2">
                  Deactivation Impact Summary
                </h4>
                <ul className="text-sm text-amber-700 space-y-1.5">
                  {getDeactivationImpact().map((impact, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 text-amber-600 text-xs">•</span>
                      <span className="md:text-sm text-xs">{impact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Special Warning for Super Admin */}
          {user.role === 'superAdmin' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-red-700">
                  <h5 className="font-semibold mb-1 text-xs">Super Admin Warning</h5>
                  <p className="text-xs md:text-sm mb-2">Ensure another Super Admin remains active for platform management.</p>
                </div>
              </div>
            </div>
          )}

          {/* Deactivation Reason */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="deactivation-reason" className="text-sm font-semibold text-gray-900">
                Reason for Deactivation *
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Select a predefined reason or enter your own. This will be included in the deactivation email and audit log.
              </p>
            </div>
            
            {/* Enhanced Predefined Reasons */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Common deactivation reasons:</p>
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                {predefinedReasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => handleReasonClick(reason.short)}
                    className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                      deactivationReason === reason.short
                        ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                        : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900 text-sm mb-1">{reason.title}</h6>
                        <p className="text-xs text-gray-600">{reason.description}</p>
                      </div>
                      {deactivationReason === reason.short && (
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div className="mt-4">
              <Label htmlFor="custom-reason" className="text-sm font-medium text-gray-700 mb-2 block">
                Custom Reason
              </Label>
              <Textarea
                id="custom-reason"
                placeholder={`Enter a specific reason for deactivating ${displayName}...`}
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                rows={4}
                className="resize-none text-sm"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {deactivationReason.length} characters
                </p>
                {deactivationReason.length > 0 && deactivationReason.length < 20 && (
                  <p className="text-xs text-amber-600 font-medium">
                    Add more detail for clarity
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              onClick={handleDeactivate}
              disabled={!deactivationReason.trim() || isSubmitting || isAlreadyDeactivated}
              className={`px-4 py-2.5 text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                isAlreadyDeactivated ? 'bg-gray-500 hover:bg-gray-600' :
                user.role === 'superAdmin' ? 'bg-red-600 hover:bg-red-700' :
                user.role === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deactivating...
                </>
              ) : isAlreadyDeactivated ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Already Deactivated
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {user.role === 'superAdmin' ? 'Deactivate Super Admin' :
                  user.role === 'admin' ? 'Deactivate Admin' : 'Deactivate Content Creator'}
                </>
              )}
            </button>
          </div>
        </div>
      </ScrollableWrapper>
    </Modal>
  );
};

export default DeactivateUserModal;