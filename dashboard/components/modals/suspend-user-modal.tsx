// components/admin/suspend-user-modal.tsx
"use client";

import React from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSuspendUserModal } from "@/hooks/general-store";

const SuspendUserModal = () => {
  const { onClose, isOpen, user } = useSuspendUserModal();

  const [currentStep, setCurrentStep] = React.useState<'confirmation' | 'suspension'>('confirmation');
  const [suspensionReason, setSuspensionReason] = React.useState("");
  const [selectedDuration, setSelectedDuration] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [notifyUser, setNotifyUser] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Suspension durations
  const suspensionDurations = [
    { label: '24 Hours', value: '24_hours' },
    { label: '3 Days', value: '3_days' },
    { label: '7 Days', value: '7_days' },
    { label: '30 Days', value: '30_days' },
    { label: 'Indefinite', value: 'indefinite' },
    { label: 'Custom', value: 'custom' }
  ];

  // Suspension categories
  const suspensionCategories = [
    { label: 'Policy Violation', value: 'policy_violation' },
    { label: 'Suspicious Activity', value: 'suspicious_activity' },
    { label: 'Payment Issues', value: 'payment_issues' },
    { label: 'Content Violation', value: 'content_violation' },
    { label: 'Security Concerns', value: 'security_concerns' },
    { label: 'Behavioral Issues', value: 'behavioral_issues' },
    { label: 'Other', value: 'other' }
  ];

  // Initialize form
  React.useEffect(() => {
    if (user) {
      setCurrentStep('confirmation');
      setSuspensionReason("");
      setSelectedDuration("");
      setSelectedCategory("");
      setNotifyUser(true);
    }
  }, [user]);

  const handleConfirmSuspension = () => {
    setCurrentStep('suspension');
  };

  const handleBackToConfirmation = () => {
    setCurrentStep('confirmation');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Pre-fill reason based on category
    if (category && category !== 'other') {
      const predefinedReasons: Record<string, string> = {
        'policy_violation': 'Violation of platform policies and terms of service.',
        'suspicious_activity': 'Suspicious activity detected requiring temporary account suspension.',
        'payment_issues': 'Payment-related issues requiring account suspension.',
        'content_violation': 'Inappropriate or prohibited content posted by user.',
        'security_concerns': 'Security concerns identified requiring temporary suspension.',
        'behavioral_issues': 'Inappropriate behavior or conduct violations.'
      };
      setSuspensionReason(predefinedReasons[category] || '');
    } else if (category === 'other') {
      setSuspensionReason('');
    }
  };

  const handleSuspendUser = async () => {
    if (!user || !suspensionReason.trim() || !selectedCategory || !selectedDuration) return;

    setIsSubmitting(true);
    try {
      // API call to suspend user
      console.log('Suspending user:', {
        userId: user.id,
        userType: user.userType,
        suspensionReason,
        category: selectedCategory,
        duration: selectedDuration,
        notifyUser
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      alert(`User suspended successfully! ${user.surName} has been temporarily suspended.`);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('confirmation');
    setSuspensionReason("");
    setSelectedDuration("");
    setSelectedCategory("");
    setNotifyUser(true);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const getSuspensionImpact = () => {
    const userType = user?.userType || 'user';
    const impacts = {
      user: [
        'Cannot log in to the application',
        'Cannot make transactions or payments',
        'Cannot access property listings or features',
        'Cannot contact agents or landlords',
        'All active sessions will be terminated'
      ],
      agent: [
        'Cannot access agent dashboard',
        'Cannot manage properties or listings',
        'Cannot communicate with clients',
        'Cannot process payments or transactions',
        'All active sessions will be terminated'
      ],
      admin: [
        'Cannot access admin dashboard',
        'Cannot manage users or system settings',
        'Cannot perform administrative actions',
        'All active sessions will be terminated'
      ]
    };
    return impacts[userType as keyof typeof impacts] || impacts.user;
  };

  if (!user) return null;

  const displayName = `${user.surName || ''} ${user.lastName || ''}`.trim();
  const userTypeLabel = user.userType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={currentStep === 'confirmation' ? 'Confirm Suspension' : `Suspend ${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}`}
      width="lg:w-[600px] xl:w-[650px] md:w-[550px]"
      useCloseButton
      useSeparator
    >
      {currentStep === 'confirmation' ? (
        <div className="space-y-4">
          {/* User Information */}
          <div className="">
            <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
            <div className="grid grid-cols-1 gap-3 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Name:</span>
                <span>{displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Current Role:</span>
                <span className="capitalize font-semibold text-blue-600">{userTypeLabel}</span>
              </div>
            </div>
          </div>

          {/* Suspension Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">
                  What does suspending this {user.userType} mean?
                </h4>
                <div className="text-sm text-amber-700 space-y-2">
                  <p>
                    Suspending {displayName} will temporarily restrict their account access. 
                    This action is reversible and should be used for temporary restrictions.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {getSuspensionImpact().map((impact, index) => (
                      <li key={index}>{impact}</li>
                    ))}
                  </ul>
                  <p className="text-xs font-medium mt-2">
                    The user will be able to regain access after the suspension period ends or when manually reinstated.
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
              onClick={handleConfirmSuspension}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Yes, Continue to Suspend
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

          {/* Suspension Duration */}
          <div className="space-y-3">
            <Label htmlFor="suspension-duration" className="text-sm font-semibold text-gray-900">
              Suspension Duration
            </Label>
            <CustomSelect
              placeholder="Select suspension duration..."
              options={suspensionDurations}
              value={selectedDuration}
              onChange={setSelectedDuration}
              style="border-gray-300 rounded-md"
              height="h-10"
              placeholderStyle="lg:text-sm text-sm"
              itemText="lg:text-sm text-sm"
            />
          </div>

          {/* Suspension Category */}
          <div className="space-y-3">
            <Label htmlFor="suspension-category" className="text-sm font-semibold text-gray-900">
              Suspension Category
            </Label>
            <CustomSelect
              placeholder="Select suspension category..."
              options={suspensionCategories}
              value={selectedCategory}
              onChange={handleCategoryChange}
              style="border-gray-300 rounded-md"
              height="h-10"
              placeholderStyle="lg:text-sm text-sm"
              itemText="lg:text-sm text-sm"
            />
          </div>

          {/* Suspension Reason */}
          <div className="space-y-3">
            <Label htmlFor="suspension-reason" className="text-sm font-semibold text-gray-900">
              Detailed Reason for Suspension
            </Label>
            <Textarea
              id="suspension-reason"
              placeholder="Provide detailed explanation for suspending this user..."
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
            <div className="space-y-0.5">
              <Label htmlFor="notification-toggle" className="text-sm font-semibold text-gray-900">
                Notify User
              </Label>
              <p className="text-xs text-gray-500">
                {notifyUser 
                  ? 'User will be notified about suspension and duration'
                  : 'User will not be notified about suspension'
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
              onClick={handleSuspendUser}
              disabled={!suspensionReason.trim() || !selectedCategory || !selectedDuration || isSubmitting}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Suspending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Confirm Suspension
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SuspendUserModal;