// components/admin/revoke-verification-modal.tsx
"use client";

import React from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRevokeVerificationModal } from "@/hooks/general-store";

const RevokeVerificationModal = () => {
  const { onClose, isOpen, user } = useRevokeVerificationModal();

  const [revocationReason, setRevocationReason] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [notifyUser, setNotifyUser] = React.useState(true);

  // Revocation reason categories
  const revocationCategories = [
    { label: 'Suspicious Activity', value: 'suspicious_activity' },
    { label: 'Inconsistent Information', value: 'inconsistent_info' },
    { label: 'Document Verification Failed', value: 'document_failure' },
    { label: 'Security Concerns', value: 'security_concerns' },
    { label: 'Policy Violation', value: 'policy_violation' },
    { label: 'Data Accuracy Issues', value: 'data_accuracy' },
    { label: 'Other', value: 'other' }
  ];

  // Initialize form
  React.useEffect(() => {
    if (user) {
      setRevocationReason("");
      setSelectedCategory("");
      setNotifyUser(true);
    }
  }, [user]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Pre-fill reason based on category
    if (category && category !== 'other') {
      const predefinedReasons: Record<string, string> = {
        'suspicious_activity': 'Suspicious activity detected in account behavior and transactions.',
        'inconsistent_info': 'Inconsistencies found in provided personal information and documentation.',
        'document_failure': 'Submitted documents failed verification checks or appear to be invalid.',
        'security_concerns': 'Security concerns identified that require re-verification of identity.',
        'policy_violation': 'Violation of platform policies requiring re-verification.',
        'data_accuracy': 'Data accuracy issues identified in user profile information.'
      };
      setRevocationReason(predefinedReasons[category] || '');
    } else if (category === 'other') {
      setRevocationReason('');
    }
  };

  const handleRevokeVerification = async () => {
    if (!user || !revocationReason.trim() || !selectedCategory) return;

    setIsSubmitting(true);
    try {
      // API call to revoke verification
      console.log('Revoking verification:', {
        userId: user.id,
        userType: user.role,
        revocationReason,
        category: selectedCategory,
        notifyUser
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      alert(`Verification revoked successfully! ${user.surName} will need to complete verification again.`);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error revoking verification:', error);
      alert('Failed to revoke verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRevocationReason("");
    setSelectedCategory("");
    setNotifyUser(true);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      'suspicious_activity': 'Unusual login patterns, fraudulent transactions, or suspicious account behavior',
      'inconsistent_info': 'Mismatched personal details, address discrepancies, or conflicting documentation',
      'document_failure': 'Expired, invalid, or unverifiable identification documents submitted',
      'security_concerns': 'Potential security breaches, compromised credentials, or privacy concerns',
      'policy_violation': 'Violation of terms of service, community guidelines, or platform rules',
      'data_accuracy': 'Outdated information, incorrect details, or incomplete profile data',
      'other': 'Custom reason for verification revocation'
    };
    return descriptions[category] || '';
  };

  if (!user) return null;

  const displayName = `${user.surName || ''} ${user.lastName || ''}`.trim();
  const userTypeLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Revoke ${userTypeLabel} Verification`}
      width="lg:w-[600px] xl:w-[650px] md:w-[550px]"
      useCloseButton
      useSeparator
    >
      <div className="space-y-4">
        {/* User Information */}
        <div className="">
          <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 lg:p-4 p-3 rounded-lg">
            <p><span className="font-medium">Name:</span> {displayName}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">User Role:</span> {userTypeLabel}</p>
            <p><span className="font-medium">Verification Status:</span> <span className={`font-semibold ${
                user.isVerified ? 'text-green-600' : 'text-red-600'
              }`}>
                {user.isVerified ? 'Verified' : 'Not Verified'}
              </span></p>
          </div>
        </div>

        {/* Revocation Category */}
        <div className="space-y-3">
          <Label htmlFor="revocation-category" className="text-sm font-semibold text-gray-900">
            Revocation Category
          </Label>
          <CustomSelect
            placeholder="Select revocation reason category..."
            options={revocationCategories}
            value={selectedCategory}
            onChange={handleCategoryChange}
            style="border-gray-300 rounded-md"
            height="h-10"
            placeholderStyle="lg:text-sm text-sm"
            itemText="lg:text-sm text-sm"
          />
          {selectedCategory && (
            <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              <span className="font-medium">Category Description:</span> {getCategoryDescription(selectedCategory)}
            </p>
          )}
        </div>

        {/* Revocation Reason */}
        <div className="space-y-3">
          <Label htmlFor="revocation-reason" className="text-sm font-semibold text-gray-900">
            Detailed Reason for Revocation
          </Label>
          <Textarea
            id="revocation-reason"
            placeholder="Provide detailed explanation for revoking verification... Include specific details about suspicious activities, inconsistencies found, or policy violations observed."
            value={revocationReason}
            onChange={(e) => setRevocationReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            This reason will be recorded in the audit log and may be shared with the user if notification is enabled.
          </p>
        </div>

        {/* Notification Toggle */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
          <div className="space-y-0.5">
            <Label htmlFor="notification-toggle" className="text-sm font-semibold text-gray-900">
              Notify User
            </Label>
            <p className="text-xs text-gray-500">
              {notifyUser 
                ? 'User will be notified about verification revocation and re-verification requirements'
                : 'User will not be notified (use only for security-sensitive cases)'
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
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRevokeVerification}
            disabled={!revocationReason.trim() || !selectedCategory || isSubmitting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Revoking...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Revoke Verification
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RevokeVerificationModal;