"use client";

import React from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSuspendUserModal } from "@/hooks/general-store";
import { usePathname } from "next/navigation";
import { suspendUser } from "@/actions/suspension-actions";
import { SuspensionCategory, SuspensionDuration } from "@/models/suspension";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { suspendAdmin } from "@/actions/admin-actions";
import { formatDateWithFullMonth } from "@/utils/formatDate";

// Define a type for the user object that could come from different sources
type SuspendedUser = {
  id: string | number;
  userType: string;
  email: string;
  // Regular user fields (may be undefined for admins)
  surName?: string;
  lastName?: string;
  firstName?: string;
  name?: string;
  fullName?: string;
  phoneNumber?: string;
  // Admin-specific fields (may be undefined for regular users)
  adminName?: string;
  adminId?: string;
  // Common fields that could exist on both
  username?: string;
  displayName?: string;
  profilePicture?: string;
  createdAt?: string;
};

const SuspendUserModal = () => {
  const { onClose, isOpen, user } = useSuspendUserModal();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = React.useState<'confirmation' | 'suspension'>('confirmation');
  const [suspensionReason, setSuspensionReason] = React.useState("");
  const [selectedDuration, setSelectedDuration] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [suspendedUntil, setSuspendedUntil] = React.useState<Date | null>(null);

  const path = usePathname();

  // Admin roles that should use handleSuspendAdmin
  const adminRoles = ['superadmin', 'admin', 'creator', 'compliance'];
  
  // Check if user is an admin type
  const isAdminUser = user?.userType ? adminRoles.includes(user.userType.toLowerCase()) : false;

  // Helper function to get user display name
  const getDisplayName = (user: SuspendedUser | null): string => {
    if (!user) return 'Unknown User';
    
    // Try different possible name fields in order of preference
    if (user.displayName) return user.displayName;
    if (user.fullName) return user.fullName;
    if (user.name) return user.name;
    
    // For regular users
    if (user.surName && user.lastName) return `${user.surName} ${user.lastName}`.trim();
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`.trim();
    if (user.surName) return user.surName;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    
    // For admins
    if (user.adminName) return user.adminName;
    if (user.username) return user.username;
    
    // Fallback to email username part
    if (user.email) {
      const emailParts = user.email.split('@');
      return emailParts[0] || 'User';
    }
    
    return 'Unknown User';
  };

  // Helper to get identifier for suspension (ID or email)
  const getUserIdentifier = (user: SuspendedUser): string => {
    if (isAdminUser && user.adminId) return user.adminId;
    if (user.id) return user.id.toString();
    return user.email;
  };

  // Suspension durations with time calculations
  const suspensionDurations = [
    { label: '24 Hours', value: '24_hours', hours: 24 },
    { label: '3 Days', value: '3_days', hours: 72 },
    { label: '7 Days', value: '7_days', hours: 168 },
    { label: '30 Days', value: '30_days', hours: 720 },
    { label: 'Indefinite', value: 'indefinite', hours: null } // null represents indefinite
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

  // Calculate suspended until date based on duration
  const calculateSuspendedUntil = (durationValue: string): Date | null => {
    const duration = suspensionDurations.find(d => d.value === durationValue);
    if (!duration) return null;

    if (duration.value === 'indefinite') {
      return null; // null represents indefinite suspension
    }

    if (duration.hours) {
      const until = new Date();
      until.setHours(until.getHours() + duration.hours);
      return until;
    }

    return null;
  };

  // Format date for display
  const formatSuspendedUntil = (date: Date | null): string => {
    if (!date) return 'Indefinite';

    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle duration change
  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration);
    const untilDate = calculateSuspendedUntil(duration);
    setSuspendedUntil(untilDate);
  };

  // Initialize form
  React.useEffect(() => {
    if (user) {
      setCurrentStep('confirmation');
      setSuspensionReason("");
      setSelectedDuration("");
      setSelectedCategory("");
      setSuspendedUntil(null);
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
    // Pre-fill reason based on category with concise content
    if (category && category !== 'other') {
      const predefinedReasons: Record<string, string> = {
        'policy_violation': 'Account suspended due to repeated violations of platform policies and terms of service. Multiple policy breaches confirmed that necessitate temporary suspension.',
        'suspicious_activity': 'Suspended due to unusual account activity indicating potential security risks. Temporary suspension allows for security review and identity verification.',
        'payment_issues': 'Account suspended due to unresolved payment matters and financial discrepancies. Suspension remains until financial issues are resolved.',
        'content_violation': 'Suspended for posting content that violates community standards. Multiple warnings were issued prior to this suspension.',
        'security_concerns': 'Suspended due to identified security risks requiring immediate attention. Account secured pending security verification.',
        'behavioral_issues': 'Account suspended due to behavioral violations and inappropriate conduct. Multiple community reports and warnings documented.'
      };
      setSuspensionReason(predefinedReasons[category] || '');
    } else if (category === 'other') {
      setSuspensionReason('');
    }
  };

  const handleSuspendRegularUser = async () => {
    if (!user || !suspensionReason.trim() || !selectedCategory || !selectedDuration) return;

    setIsSubmitting(true);
    try {
      const suspensionData = {
        userId: getUserIdentifier(user),
        reason: suspensionReason,
        category: selectedCategory as SuspensionCategory,
        duration: selectedDuration as SuspensionDuration,
        path
      };

      const response = await suspendUser(suspensionData);
      const untilText = suspendedUntil ? `until ${formatSuspendedUntil(suspendedUntil)}` : 'indefinitely';
      const displayName = getDisplayName(user);
      
      if (response.success) {
        toast.success(`User suspended successfully! ${displayName} has been suspended ${untilText}.`);
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['active-users'] });
        queryClient.invalidateQueries({ queryKey: ['suspended-users'] });
        queryClient.invalidateQueries({ queryKey: ['active-agents'] });
        queryClient.invalidateQueries({ queryKey: ['suspended-agents'] });
        
        onClose();
        resetForm();
      } else {
        toast.error(response.message || 'Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspendAdminUser = async () => {
    if (!user || !suspensionReason.trim() || !selectedCategory || !selectedDuration) return;

    setIsSubmitting(true);
    try {
      const suspensionData = {
        adminId: getUserIdentifier(user),
        reason: suspensionReason,
        category: selectedCategory as SuspensionCategory,
        duration: selectedDuration as SuspensionDuration,
        path
      };

      const response = await suspendAdmin(suspensionData);
      const untilText = suspendedUntil ? `until ${formatSuspendedUntil(suspendedUntil)}` : 'indefinitely';
      const displayName = getDisplayName(user);
      
      if (response.success) {
        toast.success(`Admin suspended successfully! ${displayName} has been suspended ${untilText}.`);
        
        // Invalidate admin-related queries
        queryClient.invalidateQueries({ queryKey: ['active-admins'] });
        queryClient.invalidateQueries({ queryKey: ['suspended-admins'] });
        queryClient.invalidateQueries({ queryKey: ['all-admins'] });
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['super-admins'] });
        
        onClose();
        resetForm();
      } else {
        toast.error(response.message || 'Failed to suspend admin');
      }
    } catch (error) {
      console.error('Error suspending admin:', error);
      toast.error('Failed to suspend admin. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSuspension = async () => {
    if (isAdminUser) {
      await handleSuspendAdminUser();
    } else {
      await handleSuspendRegularUser();
    }
  };

  const resetForm = () => {
    setCurrentStep('confirmation');
    setSuspensionReason("");
    setSelectedDuration("");
    setSelectedCategory("");
    setSuspendedUntil(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const getSuspensionImpact = () => {
    const userType = user?.userType?.toLowerCase() || 'user';
    const impacts = {
      user: [
        'Cannot log in to the application',
        'Cannot make transactions or payments',
        'Cannot access platform features',
        'Cannot contact support or other users',
        'All active sessions will be terminated'
      ],
      agent: [
        'Cannot access agent dashboard',
        'Cannot manage listings or properties',
        'Cannot communicate with clients',
        'Cannot process payments or transactions',
        'All active sessions will be terminated'
      ],
      superadmin: [
        'Cannot access admin dashboard',
        'Cannot manage users or system settings',
        'Cannot perform administrative actions',
        'Cannot access sensitive platform data',
        'All active sessions will be terminated'
      ],
      admin: [
        'Cannot access admin dashboard',
        'Cannot perform assigned administrative tasks',
        'Cannot manage user accounts or content',
        'Cannot access certain admin features',
        'All active sessions will be terminated'
      ],
      creator: [
        'Cannot access content creation tools',
        'Cannot publish or manage content',
        'Cannot access creator dashboard',
        'Cannot receive payments or analytics',
        'All active sessions will be terminated'
      ],
      compliance: [
        'Cannot access compliance dashboard',
        'Cannot review or approve transactions',
        'Cannot perform KYC/AML checks',
        'Cannot generate compliance reports',
        'All active sessions will be terminated'
      ]
    };

    // Return impacts based on user type, default to admin if admin role
    if (adminRoles.includes(userType)) {
      return impacts[userType as keyof typeof impacts] || impacts.admin;
    }
    
    return impacts[userType as keyof typeof impacts] || impacts.user;
  };

  if (!user) return null;

  const displayName = getDisplayName(user);
  const userType = user.userType?.toLowerCase() || 'user';
  
  // Format user type for display
  const formatUserType = (type: string) => {
    const typeMap: Record<string, string> = {
      'superadmin': 'Super Admin',
      'admin': 'Admin',
      'creator': 'Content Creator',
      'compliance': 'Compliance Officer',
      'agent': 'Agent',
      'user': 'User'
    };
    return typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Get additional user info for display
  const getUserInfoFields = () => {
    const fields = [];
    
    // Always show email
    fields.push({
      label: 'Email',
      value: user.email || 'No email provided',
      important: true
    });
    
    // Show phone number if available
    if (user.phoneNumber) {
      fields.push({
        label: 'Phone Number',
        value: user.phoneNumber
      });
    }
    
    // Show ID (different for admins vs regular users)
    if (isAdminUser && user.adminId) {
      fields.push({
        label: 'Admin ID',
        value: user.adminId.toLowerCase()
      });
    }
    
    // Show creation date if available
    if (user.createdAt) {
      fields.push({
        label: 'Account Created',
        value: formatDateWithFullMonth(new Date(user.createdAt).toLocaleDateString())
      });
    }
    
    return fields;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={currentStep === 'confirmation' ? 'Confirm Suspension' : `Suspend ${formatUserType(user.userType)}`}
      width="lg:w-[600px] xl:w-[650px] md:w-[550px]"
      useCloseButton
    >
      {currentStep === 'confirmation' ? (
        <div className="space-y-4">
          {/* User Information */}
          <div className="">
            <h4 className="font-semibold text-gray-900 mb-3">Account Information</h4>
            <div className="grid grid-cols-1 gap-3 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="font-semibold">{displayName}</span>
              </div>
              
              {/* Dynamic user info fields */}
              {getUserInfoFields().map((field, index) => (
                <div key={index} className="flex justify-between">
                  <span className="font-medium text-gray-600">{field.label}:</span>
                  <span className={field.important ? 'font-medium' : ''}>{field.value}</span>
                </div>
              ))}
              
              {isAdminUser && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Role Level:</span>
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {userType === 'superadmin' ? 'Highest Privilege' : 
                     userType === 'admin' ? 'Standard Admin' : 
                     userType === 'compliance' ? 'Compliance Officer' :
                     'Content Creator'}
                  </span>
                </div>
              )}
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
                  What does suspending this {formatUserType(user.userType).toLowerCase()} mean?
                </h4>
                <div className="text-sm text-amber-700 space-y-2">
                  <p>
                    Suspending {displayName} will temporarily restrict their account access.
                    {isAdminUser && ' As an admin user, this action requires careful consideration.'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {getSuspensionImpact().map((impact, index) => (
                      <li key={index}>{impact}</li>
                    ))}
                  </ul>
                  <p className="text-xs font-medium mt-2">
                    The account will be able to regain access after the suspension period ends or when manually reinstated.
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
        <div className="space-y-4">
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
              onChange={handleDurationChange}
              style="border-gray-300 rounded-md"
              height="h-10"
              placeholderStyle="lg:text-sm text-sm"
              itemText="lg:text-sm text-sm"
            />
            {suspendedUntil && (
              <p className="text-sm text-green-600 font-medium -mt-2">
                Account will be suspended until: {formatSuspendedUntil(suspendedUntil)}
              </p>
            )}
            {selectedDuration === 'indefinite' && (
              <p className="text-sm text-amber-600 font-medium -mt-2">
                Account will be suspended indefinitely until manually reinstated
              </p>
            )}
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
              placeholder={`Provide detailed explanation for suspending this ${formatUserType(user.userType).toLowerCase()}...`}
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              rows={4}
              className="resize-none text-sm leading-relaxed"
            />
            <p className="text-xs text-gray-500">
              The reason will be visible to the account holder if notifications are enabled. 
              {isAdminUser && ' Note: Suspending admin accounts may affect platform operations.'}
            </p>
          </div>

          {/* Admin Warning (if applicable) */}
          {isAdminUser && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-purple-700">
                  <span className="font-medium">Admin Account Warning:</span> Suspending an admin account may affect platform management. 
                  Ensure proper backup of responsibilities and notify other admins if necessary.
                </div>
              </div>
            </div>
          )}

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
              onClick={handleSubmitSuspension}
              disabled={!suspensionReason.trim() || !selectedCategory || !selectedDuration || isSubmitting}
              className={`px-4 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                isAdminUser ? 'bg-purple-600 hover:bg-purple-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isAdminUser ? 'Suspending Admin...' : 'Suspending...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {isAdminUser ? 'Confirm Admin Suspension' : 'Confirm Suspension'}
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