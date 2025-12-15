'use client'

import React from 'react'
import Modal from '../ui/modal'
import { useRouter } from 'next/navigation'
import { useAdminAppealModal, useAppealForm } from '@/hooks/general-store';

const AdminSuspendedModal = () => {
  const { isOpen, onClose } = useAdminAppealModal();
  const { appealType, roleType, getRoleTypeLabel } = useAppealForm();
  const router = useRouter();

  const isSuspension = appealType === 'suspension';
  const isDeactivation = appealType === 'deactivation';

  const handleAppeal = () => {
    onClose();
    router.push('/appeal');
  }

  const handleContactSupport = () => {
    onClose();
    router.push('/contact-admin-support');
  }

  const handleTryDifferentLogin = () => {
    onClose();
    router.push('/');
  }

  // Get title based on appeal type
  const getTitle = () => {
    const roleTitles = {
      admin: 'Admin Account',
      creator: 'Creator Account',
      superAdmin: 'Super Admin Account'
    };
    const roleText = roleTitles[roleType] || 'Admin Account';
    
    if (isSuspension) return `${roleText} Suspended`;
    if (isDeactivation) return `${roleText} Deactivated`;
    return `${roleText} Restricted`;
  }

  // Get description based on appeal type
  const getDescription = () => {
    const roleText = roleType === 'superAdmin' ? 'Super Admin' : 
                    roleType === 'creator' ? 'Creator' : 'Admin';
    
    if (isSuspension) {
      return `Your ${roleText} account has been temporarily suspended. This action restricts your administrative privileges. You can appeal this decision or contact admin support for assistance.`;
    }
    
    if (isDeactivation) {
      return `Your ${roleText} account has been deactivated. This action permanently disables your administrative access. You can appeal to reactivate your account or contact admin support for more information.`;
    }
    
    return `Your ${roleText} account access has been restricted. You can appeal this decision or contact admin support for assistance.`;
  }

  // Get support email based on role
  const getSupportEmail = () => {
    const emails = {
      admin: 'admin-support@olamax.com',
      creator: 'creator-support@olamax.com',
      superAdmin: 'superadmin-support@olamax.com'
    };
    return emails[roleType] || 'admin-support@olamax.com';
  }

  // Get button text based on appeal type
  const getAppealButtonText = () => {
    if (isSuspension) return 'Appeal Suspension';
    if (isDeactivation) return 'Appeal Deactivation';
    return 'Submit Appeal';
  }

  // Get contact support button text
  const getSupportButtonText = () => {
    if (isSuspension) return 'Contact Admin Support';
    if (isDeactivation) return 'Contact Admin Team';
    return 'Contact Support';
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      description={getDescription()}
      useCloseButton
      width="lg:w-[600px] xl:w-[650px] md:w-[550px]"
    >
      <div className="mt-6 lg:mt-8 w-full space-y-4">
        {/* Primary Action - Appeal */}
        <div className="space-y-2">
          <button
            type="button"
            className={`w-full py-3 px-6 rounded text-sm font-medium cursor-pointer transition-colors ${
              isSuspension
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
            onClick={handleAppeal}
          >
            {getAppealButtonText()}
          </button>
          <p className="text-xs text-gray-500 text-center px-2">
            {isSuspension 
              ? 'Submit a formal appeal to have your admin privileges reinstated'
              : 'Request account reactivation with detailed explanation'
            }
          </p>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className='flex-1 py-3 px-6 rounded border border-gray-300 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors'
            onClick={handleContactSupport}
          >
            {getSupportButtonText()}
          </button>
          <button
            type="button"
            className='flex-1 py-3 px-6 rounded bg-gray-800 text-white text-sm font-medium cursor-pointer hover:bg-gray-700 transition-colors'
            onClick={handleTryDifferentLogin}
          >
            Try Different Login
          </button>
        </div>

        {/* Information Panel */}
        <div className="pt-4 border-t border-gray-200">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Important:</span> {isSuspension 
                ? 'Suspended admin accounts cannot access the dashboard. Appeals are reviewed by the Super Admin team within 2-3 business days.'
                : 'Deactivated accounts require a formal reactivation request. The review process may take 3-5 business days.'
              }
            </p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-700">What happens next?</h5>
          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
            {isSuspension ? (
              <>
                <li>Appeal reviewed by Super Admin team</li>
                <li>Decision communicated via email within 2-3 business days</li>
                <li>Temporary suspension pending review outcome</li>
              </>
            ) : (
              <>
                <li>Reactivation request assessed by admin team</li>
                <li>Verification of corrective actions taken</li>
                <li>Final decision communicated within 3-5 business days</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default AdminSuspendedModal;