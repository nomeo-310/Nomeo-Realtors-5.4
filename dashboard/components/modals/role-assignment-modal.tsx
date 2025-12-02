// components/admin/role-assignment-modal.tsx
"use client";

import React from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label";
import { useRoleAssignmentModal } from "@/hooks/general-store";
import { assignRoleToUser } from "@/actions/admin-actions";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const RoleAssignmentModal = () => {
  const { onClose, isOpen, user } = useRoleAssignmentModal();

  const [selectedRole, setSelectedRole] = React.useState("");
  const [isActive, setIsActive] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const path = usePathname();
  const queryClient = useQueryClient();

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
      const updateData = {
        userId: user.id,
        newRole: selectedRole,
        path
      };

      const result = await assignRoleToUser(updateData);

      if (result && result.status === 200) {
        toast.success(`Role updated successfully! ${user.surName} is now ${selectedRole}`)
        queryClient.invalidateQueries({queryKey: ['active-users']})
        queryClient.invalidateQueries({queryKey: ['active-agents']})
        queryClient.invalidateQueries({queryKey: ['active-admins']})
        onClose();
        resetForm();
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
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
            disabled
          />
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