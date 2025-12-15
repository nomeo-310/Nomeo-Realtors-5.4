"use client";

import React from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDeleteUserModal } from "@/hooks/general-store";
import { deleteUser, deleteAdmin } from "@/actions/admin-actions";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const DeleteUserModal = () => {
  const { onClose, isOpen, user } = useDeleteUserModal();
  const path = usePathname();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = React.useState<'confirmation' | 'deletion'>('confirmation');
  const [deleteReason, setDeleteReason] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [dataRetention, setDataRetention] = React.useState('anonymize');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deletionType, setDeletionType] = React.useState<'remove_privileges' | 'permanent_delete'>('remove_privileges');

  // Check if user is an admin
  const isAdminUser = user?.userType && ['admin', 'creator', 'superAdmin'].includes(user.userType);

  // Delete categories for regular users
  const userDeleteCategories = [
    { label: 'User Requested Account Deletion', value: 'user_requested' },
    { label: 'Inactive Account', value: 'inactive_account' },
    { label: 'Policy Violation', value: 'policy_violation' },
    { label: 'Fraudulent Activity', value: 'fraudulent_activity' },
    { label: 'Duplicate Account', value: 'duplicate_account' },
    { label: 'Legal Compliance', value: 'legal_compliance' },
    { label: 'Other', value: 'other' }
  ];

  // Delete categories for admins
  const adminDeleteCategories = [
    { label: 'Role Privilege Misuse', value: 'privilege_misuse' },
    { label: 'Policy Violation', value: 'policy_violation' },
    { label: 'Security Breach', value: 'security_breach' },
    { label: 'Inactivity', value: 'inactivity' },
    { label: 'Role Downgrade Request', value: 'role_downgrade' },
    { label: 'Organizational Restructuring', value: 'org_restructuring' },
    { label: 'Other', value: 'other' }
  ];

  const deleteCategories = isAdminUser ? adminDeleteCategories : userDeleteCategories;

  // Data retention options
  const retentionOptions = [
    { label: 'Anonymize Data (Recommended)', value: 'anonymize' },
    { label: 'Permanently Delete All Data', value: 'permanent_delete' },
    { label: 'Retain Data for Legal Purposes', value: 'retain_legal' }
  ];

  // Admin deletion type options
  const adminDeletionTypes = [
    { label: 'Remove Admin Privileges (Revert to User)', value: 'remove_privileges' },
    { label: 'Permanently Delete Entire Account', value: 'permanent_delete' }
  ];

  // Initialize form
  React.useEffect(() => {
    if (user) {
      setCurrentStep('confirmation');
      setDeleteReason("");
      setSelectedCategory("");
      setDataRetention('anonymize');
      // Default to remove privileges for admins
      if (isAdminUser) {
        setDeletionType('remove_privileges');
      }
    }
  }, [user, isAdminUser]);

  const handleConfirmDelete = () => {
    setCurrentStep('deletion');
  };

  const handleBackToConfirmation = () => {
    setCurrentStep('confirmation');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Pre-fill reason based on category
    if (category && category !== 'other') {
      const predefinedReasons: Record<string, string> = {
        // User reasons
        'user_requested': 'Account deletion requested by user.',
        'inactive_account': 'Account has been inactive for an extended period.',
        'policy_violation': 'Violation of platform policies requiring account termination.',
        'fraudulent_activity': 'Engagement in fraudulent activities or scams.',
        'duplicate_account': 'Duplicate account identified for removal.',
        'legal_compliance': 'Required for legal compliance and regulatory reasons.',
        // Admin reasons
        'privilege_misuse': 'Misuse of administrative privileges.',
        'security_breach': 'Security protocol violation or breach.',
        'inactivity': 'Admin account has been inactive for extended period.',
        'role_downgrade': 'Administrative role downgrade requested.',
        'org_restructuring': 'Organizational restructuring requiring role changes.'
      };
      setDeleteReason(predefinedReasons[category] || '');
    } else if (category === 'other') {
      setDeleteReason('');
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !deleteReason.trim() || !selectedCategory) return;

    setIsSubmitting(true);
    try {
      if (isAdminUser) {
        // Handle admin deletion
        const deleteData = {
          adminId: user.id,
          reason: `${selectedCategory}: ${deleteReason}`,
          path: path,
        };
        const result = await deleteAdmin(deleteData);

        if (result && result.success) {
          toast.success(result.message);
          queryClient.invalidateQueries({ queryKey: ['active-users'] });
          queryClient.invalidateQueries({ queryKey: ['admin-list'] });
          queryClient.invalidateQueries({ queryKey: ['admin-details'] });
          onClose();
          resetForm();
        } else {
          toast.error(result?.message || 'Failed to delete admin. Please try again.');
        }
      } else {
        // Handle regular user deletion
        const deleteData = {
          userId: user.id,
          reason: deleteReason,
          path: path,
        };
        const result = await deleteUser(deleteData);

        if (result && result.success) {
          toast.success(result.message);
          queryClient.invalidateQueries({ queryKey: ['active-users'] });
          onClose();
          resetForm();
        } else {
          toast.error(result?.message || 'Failed to delete user. Please try again.');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(`Failed to delete ${isAdminUser ? 'admin' : 'user'} account. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('confirmation');
    setDeleteReason("");
    setSelectedCategory("");
    setDataRetention('anonymize');
    setDeletionType('remove_privileges');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const getDeleteImpact = () => {
    const userType = user?.userType || 'user';
    const impacts = {
      user: [
        'Permanent account deletion',
        'All personal data will be processed according to retention policy',
        'Cannot be recovered or restored',
        'All active sessions immediately terminated',
        'Transaction history and activity records will be handled based on retention choice'
      ],
      agent: [
        'Permanent agent account deletion',
        'All property listings will be removed or transferred',
        'Client relationships will be terminated',
        'Cannot be recovered or restored',
        'All commission and payment records handled based on retention choice'
      ],
      admin: [
        'Admin privileges will be permanently removed',
        'Access to admin dashboard immediately revoked',
        'User account will be reverted to regular user role',
        'All admin-specific data and permissions removed',
        'Cannot be recovered or restored without Super Admin intervention'
      ],
      creator: [
        'Creator privileges will be permanently removed',
        'Access to creator dashboard immediately revoked',
        'User account will be reverted to regular user role',
        'All creator-specific data and permissions removed',
        'Content creation capabilities revoked'
      ],
      superAdmin: [
        'Super Admin privileges will be permanently removed',
        'Access to super admin dashboard immediately revoked',
        'User account will be reverted to regular user role',
        'All super admin privileges and permissions removed',
        'Cannot delete other Super Admin accounts'
      ]
    };
    return impacts[userType as keyof typeof impacts] || impacts.user;
  };

  const getDataRetentionDescription = (option: string) => {
    const descriptions = {
      'anonymize': 'Personal identifiers removed but activity data retained in anonymized form for analytics',
      'permanent_delete': 'All user data completely erased from the system (irreversible)',
      'retain_legal': 'All data retained for legal and compliance purposes as required by law'
    };
    return descriptions[option as keyof typeof descriptions] || '';
  };

  const getAdminDeletionDescription = () => {
    if (deletionType === 'remove_privileges') {
      return `This will remove ${displayName}'s admin privileges and revert their account to a regular user. They will lose access to the admin dashboard but can still use the platform as a regular user.`;
    } else {
      return `This will permanently delete ${displayName}'s entire account from the system. All user data, activity history, and account information will be completely erased. This action is irreversible.`;
    }
  };

  if (!user) return null;

  const displayName = `${user.surName || ''} ${user.lastName || ''}`.trim();
  const userTypeLabel = user.userType.charAt(0).toUpperCase() + user.userType.slice(1);
  const modalTitle = currentStep === 'confirmation' 
    ? `Confirm ${isAdminUser ? 'Admin ' : ''}Deletion` 
    : `${isAdminUser ? 'Manage Admin Account' : `Delete ${userTypeLabel} Account`}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      width="lg:w-[600px] xl:w-[650px] md:w-[550px]"
      useCloseButton
    >
      {currentStep === 'confirmation' ? (
        <div className="space-y-4">
          {/* User Information */}
          <div className="">
            <h4 className="font-semibold text-gray-900 mb-3">Account Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 lg:p-4 p-3 rounded-lg">
              <p><span className="font-medium">Name:</span> {displayName}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p>
                <span className="font-medium">Current Role:</span> 
                <span className={`ml-1 capitalize font-semibold ${
                  isAdminUser ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {userTypeLabel}
                </span>
                {isAdminUser && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                    Admin Account
                  </span>
                )}
              </p>
              {user.phoneNumber && (
                <p><span className="font-medium">Phone:</span> {user.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Admin-specific warning if applicable */}
          {isAdminUser && user.userType === 'superAdmin' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                    Super Admin Account Warning
                  </h4>
                  <p className="text-sm text-yellow-700">
                    This is a Super Admin account. Deleting this account requires careful consideration as it has the highest level of system access. Ensure you have proper authorization and a valid reason for this action.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Delete Warning */}
          <div className={`border rounded-lg p-4 ${
            isAdminUser ? 'bg-red-50 border-red-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-2">
                  What does deleting this {user.userType} account mean?
                </h4>
                <div className="text-sm text-red-700 space-y-2">
                  <p className="font-semibold">
                    {isAdminUser 
                      ? 'Admin privilege removal is PERMANENT and requires careful consideration.'
                      : 'Account deletion is PERMANENT and CANNOT BE UNDONE.'
                    }
                  </p>
                  <p>
                    {isAdminUser
                      ? `Managing ${displayName}'s admin account will permanently affect their system privileges.`
                      : `Deleting ${displayName}'s account will permanently remove their presence from the platform.`
                    }
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {getDeleteImpact().map((impact, index) => (
                      <li key={index}>{impact}</li>
                    ))}
                  </ul>
                  <p className="text-xs font-medium mt-2">
                    {isAdminUser
                      ? 'This action requires Super Admin authorization. Ensure you have proper justification and documentation.'
                      : 'This action is irreversible. Please ensure you have appropriate authorization and reason for deletion.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              No, Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className={`px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium flex items-center gap-2 ${
                isAdminUser ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {isAdminUser ? 'Manage Admin Account' : 'Yes, Continue to Delete'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={handleBackToConfirmation}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Confirmation
          </button>

          {/* Admin-specific deletion type selection */}
          {isAdminUser && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">
                Admin Account Action
              </Label>
              <div className="space-y-3">
                {adminDeletionTypes.map((type) => (
                  <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deletionType"
                      value={type.value}
                      checked={deletionType === type.value}
                      onChange={(e) => setDeletionType(e.target.value as 'remove_privileges' | 'permanent_delete')}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {type.value === 'remove_privileges' 
                          ? 'Remove admin access but keep user account active'
                          : 'Completely delete the user account from the system'
                        }
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {getAdminDeletionDescription()}
              </p>
            </div>
          )}

          {/* Delete Category */}
          <div className="space-y-3">
            <Label htmlFor="delete-category" className="text-sm font-semibold text-gray-900">
              {isAdminUser ? 'Action Category' : 'Deletion Category'}
            </Label>
            <CustomSelect
              placeholder={`Select ${isAdminUser ? 'action' : 'deletion'} category...`}
              options={deleteCategories}
              value={selectedCategory}
              onChange={handleCategoryChange}
              style="border-gray-300 rounded-md"
              height="h-10"
              placeholderStyle="lg:text-sm text-sm"
              itemText="lg:text-sm text-sm"
            />
          </div>

          {/* Data Retention Policy (only for regular users or permanent delete) */}
          {(!isAdminUser || deletionType === 'permanent_delete') && (
            <div className="space-y-3">
              <Label htmlFor="data-retention" className="text-sm font-semibold text-gray-900">
                Data Retention Policy
              </Label>
              <CustomSelect
                placeholder="Select data retention option..."
                options={retentionOptions}
                value={dataRetention}
                onChange={setDataRetention}
                style="border-gray-300 rounded-md"
                height="h-10"
                placeholderStyle="lg:text-sm text-sm"
                itemText="lg:text-sm text-sm"
              />
              {dataRetention && (
                <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <span className="font-medium">Policy Description:</span> {getDataRetentionDescription(dataRetention)}
                </p>
              )}
            </div>
          )}

          {/* Delete Reason */}
          <div className="space-y-3">
            <Label htmlFor="delete-reason" className="text-sm font-semibold text-gray-900">
              Detailed Reason for {isAdminUser ? 'Action' : 'Deletion'}
            </Label>
            <Textarea
              id="delete-reason"
              placeholder={`Provide detailed explanation for ${isAdminUser 
                ? deletionType === 'remove_privileges' 
                  ? 'removing admin privileges' 
                  : 'deleting this admin account'
                : 'deleting this user account'
              }. Include specific reasons and any relevant context...`}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              This reason will be permanently recorded in the audit logs for compliance purposes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={handleBackToConfirmation}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={!deleteReason.trim() || !selectedCategory || isSubmitting}
              className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                isAdminUser ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isAdminUser ? 'Processing...' : 'Deleting...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {isAdminUser 
                    ? deletionType === 'remove_privileges' 
                      ? 'Confirm Remove Privileges' 
                      : 'Confirm Permanent Delete'
                    : 'Confirm Permanent Delete'
                  }
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DeleteUserModal;