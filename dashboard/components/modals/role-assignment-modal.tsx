// components/admin/role-assignment-modal.tsx
"use client";

import React from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Switch } from "@/components/ui/switch"; // shadcn/ui switch
import { Label } from "@/components/ui/label";
import { useRoleAssignmentModal } from "@/hooks/general-store";

const RoleAssignmentModal = () => {
  const { onClose, isOpen, user } = useRoleAssignmentModal();

  const [selectedRole, setSelectedRole] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Available roles for assignment
  const availableRoles = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'superAdmin' },
    { label: 'Creator', value: 'creator' }
  ];

  // Initialize form with user data
  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.currentRole);
      setIsActive(user.isActive);
    }
  }, [user]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const handleActivationToggle = (checked: boolean) => {
    setIsActive(checked);
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;

    setIsSubmitting(true);
    try {
      // Here you would make your API call to update the user's role
      console.log('Updating user:', {
        userId: user.id,
        newRole: selectedRole,
        isActive: isActive
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - close modal and show success message
      alert(`Role updated successfully! ${user.surName} is now ${selectedRole}`);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedRole("");
    setIsActive(true);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Get role description
  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'user':
        return 'Standard user with basic access rights to the main web application';
      case 'admin':
        return 'Administrative access to manage users and content in admin dashboard';
      case 'superAdmin':
        return 'Full system access including user management, system settings, and administrative controls';
      case 'creator':
        return 'Content creation and management privileges with limited administrative access';
      default:
        return 'Standard user access to main web application';
    }
  };

  // Warning for admin roles
  const showAdminWarning = selectedRole === 'admin' || selectedRole === 'superAdmin';

  if (!user) return null;

  const displayName = `${user.surName || ''} ${user.lastName || ''}`.trim();
  const currentRoleLabel = availableRoles.find(role => role.value === user.currentRole)?.label || user.currentRole;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign User Role"
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
            <p><span className="font-medium text-wrap">Email:</span> {user.email}</p>
            {user.phoneNumber && (
              <p><span className="font-medium">Phone:</span> {user.phoneNumber}</p>
            )}
            <p><span className="font-medium">Current Role:</span> <span className="capitalize font-semibold text-blue-600">{currentRoleLabel}</span></p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <Label htmlFor="role-select" className="text-sm font-semibold text-gray-900">
            Assign New Role
          </Label>
          <CustomSelect
            placeholder="Select user role..."
            options={availableRoles}
            value={selectedRole}
            onChange={handleRoleChange}
            style="border-gray-300 rounded-md"
            height="h-10"
            placeholderStyle="lg:text-sm text-sm"
            itemText="lg:text-sm text-sm"
          />
          {selectedRole && (
            <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              <span className="font-medium">Role Description:</span> {getRoleDescription(selectedRole)}
            </p>
          )}
        </div>

        {/* Activation Toggle */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
          <div className="space-y-0.5">
            <Label htmlFor="activation-toggle" className="text-sm font-semibold text-gray-900">
              Account Status
            </Label>
            <p className="text-xs text-gray-500">
              {isActive ? 'Account is active and accessible' : 'Account is deactivated and cannot access the system'}
            </p>
          </div>
          <Switch
            id="activation-toggle"
            checked={isActive}
            onCheckedChange={handleActivationToggle}
          />
        </div>

        {/* Admin Role Warning */}
        {showAdminWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-800 mb-1">
                  Important: Admin Role Assignment
                </h4>
                <div className="text-sm text-amber-700 space-y-1">
                  <p className="font-medium">When assigned an admin role, this user will:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Gain access to the admin dashboard and lose access to the main web app dashboard</li>
                    <li>Have elevated permissions for user management and system configuration</li>
                    <li>Be able to modify user roles, access sensitive data, and manage system settings</li>
                    <li>No longer see or use regular user features in the main application</li>
                  </ul>
                  <p className="text-xs font-medium mt-2">
                    Please ensure this is the intended access level for this user.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Role Warning */}
        {selectedRole === 'user' && user.currentRole !== 'user' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-800 mb-1">
                  User Role Assignment
                </h4>
                <p className="text-sm text-blue-700">
                  This user will regain access to the main web application dashboard and lose administrative privileges.
                </p>
              </div>
            </div>
          </div>
        )}

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
            onClick={handleAssignRole}
            disabled={!selectedRole || isSubmitting || selectedRole === user.currentRole}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating Role...
              </>
            ) : (
              'Assign Role'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RoleAssignmentModal;