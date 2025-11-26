'use client'

import React from 'react'
import Modal from '../ui/modal'
import { useSuspendedAccountModal } from '@/hooks/general-store'
import { useRouter } from 'next/navigation'

const SuspendedAccount = () => {
  const { isOpen, onClose, context } = useSuspendedAccountModal();
  const router = useRouter();

  // Require explicit context
  if (!context) {
    console.error('SuspendedAccount modal requires context to be set');
    return null;
  }

  const isLoginContext = context.type === 'login';
  const isSignupContext = context.type === 'signup';
  const role = context.role || 'user';
  const suspensionReason = context.suspensionReason;

  const handleAppeal = () => {
    onClose();
    router.push('/appeal-suspension');
  }

  const handleContactSupport = () => {
    onClose();
    router.push('/contact-us');
  }

  const handleContinueLogin = () => {
    onClose();
    router.push('/log-in');
  }

  const handleCreateNew = () => {
    onClose();
    if (isSignupContext) {
      router.push(`/sign-up/${role}?action=create_new`);
    } else {
      router.push(`/sign-up/${role}`);
    }
  }

  // Dynamic content based on context
  const getTitle = () => {
    if (isLoginContext) return 'Account Suspended';
    if (isSignupContext) return 'Account Suspended';
    return 'Account Suspended';
  }

  const getDescription = () => {
    const roleText = role === 'agent' ? 'agent' : 'user';
    const baseMessage = `Your ${roleText} account has been suspended.`;
    
    if (suspensionReason) {
      return `${baseMessage} Reason: ${suspensionReason}. You can appeal this decision or contact support for more information.`;
    }
    
    return `${baseMessage} You can appeal this decision or contact support for more information.`;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      description={getDescription()}
      useCloseButton
      width="lg:w-[550px] xl:w-[600px] md:w-[500px]"
    >
      <div className="mt-5 lg:mt-10 xl:mt-12 w-full space-y-4">
        {/* Primary actions - Appeal and Support */}
        <div className="flex items-center justify-between lg:gap-8 gap-4 md:gap-6">
          <button
            type="button"
            className='py-3 px-6 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-1'
            onClick={handleContactSupport}
          >
            Contact Support
          </button>
          <button
            type="button"
            className='py-3 px-6 rounded bg-black text-white text-sm font-medium cursor-pointer hover:bg-gray-800 transition-colors flex-1'
            onClick={handleAppeal}
          >
            Appeal Suspension
          </button>
        </div>

        {/* Secondary option for signup context */}
        {isSignupContext && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              className="w-full py-3 px-6 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={handleCreateNew}
            >
              Create New {role.charAt(0).toUpperCase() + role.slice(1)} Account
            </button>
          </div>
        )}

        {/* Additional option for login context */}
        { isLoginContext && (
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
              onClick={handleContinueLogin}
            >
              Try different login credentials
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default SuspendedAccount