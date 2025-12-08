'use client';

import React, { useState, useEffect } from "react";
import Modal from "../ui/modal";
import CustomSelect from "../ui/custom-select";
import { Label } from "@/components/ui/label";
import { useCreateAdminModal } from "@/hooks/general-store";
import { toast } from "sonner";
import { createAdmin } from "@/actions/admin-actions";
import { usePathname } from "next/navigation";

const CreateAdminModal = () => {
  const { onClose, isOpen } = useCreateAdminModal();
  const path = usePathname();

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [isCreating, setIsCreating] = useState(false);

  // Role options
  const roleOptions = [
    { label: "Admin", value: "admin" },
    { label: "Super Admin", value: "superAdmin" },
    { label: "Creator", value: "creator" }
  ];

  // Role descriptions
  const roleDescriptions = {
    admin: {
      title: "Admin Role",
      permissions: [
        "Manage user accounts",
        "Moderate content",
        "View analytics",
        "Access admin dashboard"
      ],
      restrictions: [
        "Cannot modify system settings",
        "Cannot manage other admins"
      ]
    },
    superAdmin: {
      title: "Super Admin Role",
      permissions: [
        "All admin permissions",
        "Manage other admins",
        "System configuration",
        "Database access",
        "Full platform control"
      ],
      restrictions: []
    },
    creator: {
      title: "Creator Role",
      permissions: [
        "Create and edit content",
        "Upload media files",
        "Schedule publications",
        "Manage own content"
      ],
      restrictions: [
        "Cannot manage users",
        "Limited admin access",
        "Cannot view all analytics"
      ]
    }
  };

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleCreateAdmin = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    if (!email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsCreating(true);

    try {
      console.log(selectedRole)
      const result = await createAdmin({
        email,
        role: selectedRole,
        path
      });

      if (result.success) {
        toast.success("Admin created successfully!");
        onClose();
        resetForm();
      } else {
        toast.error(result.message || "Failed to create admin");
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error("An error occurred while creating admin");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setSelectedRole("admin");
    setIsCreating(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const currentRoleDescription = roleDescriptions[selectedRole as keyof typeof roleDescriptions];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Admin"
      width="lg:w-[650px] xl:w-[700px] md:w-[550px]"
      useCloseButton
      description="Invite someone to join as an administrator"
    >
      <div className="space-y-4">
        {/* Email Input */}
        <div className="space-y-1">
          <Label htmlFor="admin-email" className="text-sm font-semibold text-gray-900">
            Email Address *
          </Label>
          <input
            id="admin-email"
            type="email"
            placeholder="Enter email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-0 outline-none focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500">
            The user will receive an invitation to join as admin
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-1">
          <Label htmlFor="admin-role" className="text-sm font-semibold text-gray-900">
            Select Role *
          </Label>
          <CustomSelect
            placeholder="Select a role..."
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
            style="border-gray-300 rounded-md"
            height="h-10"
            placeholderStyle="lg:text-sm text-sm"
            itemText="lg:text-sm text-sm"
          />
        </div>

        {/* Role Description */}
        {currentRoleDescription && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">
              {currentRoleDescription.title}
            </h4>
            
            <div className="space-y-3">
              {currentRoleDescription.permissions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-2">Permissions:</h5>
                  <ul className="space-y-1">
                    {currentRoleDescription.permissions.map((permission, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentRoleDescription.restrictions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Restrictions:</h5>
                  <ul className="space-y-1">
                    {currentRoleDescription.restrictions.map((restriction, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                        </svg>
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateAdmin}
            disabled={!email || !selectedRole || isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Admin'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateAdminModal;