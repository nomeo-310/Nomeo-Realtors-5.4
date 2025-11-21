// components/admin/delete-user-modal.tsx
"use client";

import React from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDeleteUserModal } from "@/hooks/general-store";

const DeleteUserModal = () => {
  const { onClose, isOpen, user } = useDeleteUserModal();

  const [currentStep, setCurrentStep] = React.useState<'confirmation' | 'deletion'>('confirmation');
  const [deleteReason, setDeleteReason] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [dataRetention, setDataRetention] = React.useState('anonymize');
  const [notifyUser, setNotifyUser] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Delete categories
  const deleteCategories = [
    { label: 'User Requested Account Deletion', value: 'user_requested' },
    { label: 'Inactive Account', value: 'inactive_account' },
    { label: 'Policy Violation', value: 'policy_violation' },
    { label: 'Fraudulent Activity', value: 'fraudulent_activity' },
    { label: 'Duplicate Account', value: 'duplicate_account' },
    { label: 'Legal Compliance', value: 'legal_compliance' },
    { label: 'Other', value: 'other' }
  ];

  // Data retention options
  const retentionOptions = [
    { label: 'Anonymize Data (Recommended)', value: 'anonymize' },
    { label: 'Permanently Delete All Data', value: 'permanent_delete' },
    { label: 'Retain Data for Legal Purposes', value: 'retain_legal' }
  ];

  // Initialize form
  React.useEffect(() => {
    if (user) {
      setCurrentStep('confirmation');
      setDeleteReason("");
      setSelectedCategory("");
      setDataRetention('anonymize');
      setNotifyUser(false);
    }
  }, [user]);

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
        'user_requested': 'Account deletion requested by user.',
        'inactive_account': 'Account has been inactive for an extended period.',
        'policy_violation': 'Violation of platform policies requiring account termination.',
        'fraudulent_activity': 'Engagement in fraudulent activities or scams.',
        'duplicate_account': 'Duplicate account identified for removal.',
        'legal_compliance': 'Required for legal compliance and regulatory reasons.'
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
      // API call to delete user
      console.log('Deleting user:', {
        userId: user.id,
        userType: user.userType,
        deleteReason,
        category: selectedCategory,
        dataRetention,
        notifyUser
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      alert(`User account deleted successfully! ${user.surName}'s account has been removed.`);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('confirmation');
    setDeleteReason("");
    setSelectedCategory("");
    setDataRetention('anonymize');
    setNotifyUser(false);
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
        'Permanent administrative account deletion',
        'All admin privileges permanently removed',
        'Cannot be recovered or restored',
        'All administrative actions logged for audit purposes',
        'Access logs and activity records retained based on policy'
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

  if (!user) return null;

  const displayName = `${user.surName || ''} ${user.lastName || ''}`.trim();
  const userTypeLabel = user.userType.charAt(0).toUpperCase() + user.userType.slice(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={currentStep === 'confirmation' ? 'Confirm Deletion' : `Delete ${userTypeLabel} Account`}
      width="lg:w-[600px] xl:w-[650px] md:w-[550px]"
      useCloseButton
      useSeparator
    >
      {currentStep === 'confirmation' ? (
        <div className="space-y-4">
          {/* User Information */}
          <div className="">
            <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 lg:p-4 p-3 rounded-lg">
              <p><span className="font-medium">Name:</span> {displayName}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Current Role:</span> <span className="capitalize font-semibold text-blue-600">{userTypeLabel}</span></p>
              {user.phoneNumber && (
                <p><span className="font-medium">Phone:</span> {user.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Delete Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                    Account deletion is PERMANENT and CANNOT BE UNDONE.
                  </p>
                  <p>
                    Deleting {displayName}'s account will permanently remove their presence from the platform.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {getDeleteImpact().map((impact, index) => (
                      <li key={index}>{impact}</li>
                    ))}
                  </ul>
                  <p className="text-xs font-medium mt-2">
                    This action is irreversible. Please ensure you have appropriate authorization and reason for deletion.
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
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Yes, Continue to Delete
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

          {/* Delete Category */}
          <div className="space-y-3">
            <Label htmlFor="delete-category" className="text-sm font-semibold text-gray-900">
              Deletion Category
            </Label>
            <CustomSelect
              placeholder="Select deletion category..."
              options={deleteCategories}
              value={selectedCategory}
              onChange={handleCategoryChange}
              style="border-gray-300 rounded-md"
              height="h-10"
              placeholderStyle="lg:text-sm text-sm"
              itemText="lg:text-sm text-sm"
            />
          </div>

          {/* Data Retention Policy */}
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

          {/* Delete Reason */}
          <div className="space-y-3">
            <Label htmlFor="delete-reason" className="text-sm font-semibold text-gray-900">
              Detailed Reason for Deletion
            </Label>
            <Textarea
              id="delete-reason"
              placeholder="Provide detailed explanation for deleting this user account. Include specific reasons and any relevant context..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              This reason will be permanently recorded in the audit logs for compliance purposes.
            </p>
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
            <div className="space-y-0.5">
              <Label htmlFor="notification-toggle" className="text-sm font-semibold text-gray-900">
                Send Notification
              </Label>
              <p className="text-xs text-gray-500">
                {notifyUser 
                  ? 'User will receive an email notification about account deletion'
                  : 'No notification will be sent to the user'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notification-toggle"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
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
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Confirm Permanent Delete
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