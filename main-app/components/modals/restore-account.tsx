'use client'

import React from 'react'
import Modal from '../ui/modal'
import { useRestoreAccountModal } from '@/hooks/general-store'
import { useRouter } from 'next/navigation'

const RestoreAccount = () => {
  const { isOpen, onClose, context } = useRestoreAccountModal();
  const router = useRouter();

  // Require explicit context - no fallbacks
  if (!context) {
    console.error('RestoreAccount modal requires context to be set');
    return null;
  }

  const isLoginContext = context.type === 'login';
  const isSignupContext = context.type === 'signup';
  const role = context.role || 'user'; // role is required for signup, optional for login

  const handleRestore = () => {
    console.log('Restoring account...');
    onClose();
    router.push('/restore-account');
  }

  const handleCreateNew = () => {
    onClose();
    if (isSignupContext) {
      // If signing up, proceed with new account creation for the specific role
      router.push(`/sign-up/${role}?action=create_new`);
    } else {
      // If logging in, redirect to appropriate signup based on context role
      router.push(`/sign-up/${role}`);
    }
  }

  const handleContinueLogin = () => {
    onClose();
    router.push('/log-in');
  }

  // Dynamic content based on context
  const getTitle = () => {
    if (isLoginContext) return 'Account Recovery Option';
    if (isSignupContext) return 'Email Already Exists';
    return 'Restore Account';
  }

  const getDescription = () => {
    const roleText = role === 'agent' ? 'agent' : 'user';
    
    if (isLoginContext) {
      return `We noticed this ${roleText} account was recently deleted. Since it's within the 30-day recovery period, you can restore your account with all data intact, or create a new one.`;
    }
    if (isSignupContext) {
      return `This email was previously used for a ${roleText} account that was deleted. You can restore your old account with all its data, or create a completely new ${roleText} account (this will permanently erase previous records).`;
    }
    return 'Good news! Since you deleted your account within the last 30 days, you can still recover everything.';
  }

  const getButtonConfig = () => {
    const roleText = role === 'agent' ? 'agent' : 'user';
    const capitalizedRole = roleText.charAt(0).toUpperCase() + roleText.slice(1);
    
    if (isLoginContext) {
      return {
        primary: { label: 'Restore Account', action: handleRestore },
        secondary: { label: `Create New ${capitalizedRole} Account`, action: handleCreateNew }
      };
    }
    if (isSignupContext) {
      return {
        primary: { label: `Create New ${capitalizedRole} Account`, action: handleCreateNew },
        secondary: { label: 'Restore Old Account', action: handleRestore }
      };
    }
    return {
      primary: { label: 'Restore Account', action: handleRestore },
      secondary: { label: 'Create New Account', action: handleCreateNew }
    };
  }

  const buttons = getButtonConfig();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      description={getDescription()}
      useCloseButton
      width="lg:w-[550px] xl:w-[600px] md:w-[500px]"
    >
      <div className="mt-5 lg:mt-10 xl:mt-12 w-full flex items-center justify-between lg:gap-8 gap-4 md:gap-6">
        <button
          type="button"
          className='py-3 px-6 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-1'
          onClick={buttons.secondary.action}
        >
          {buttons.secondary.label}
        </button>
        <button
          type="button"
          className='py-3 px-6 rounded bg-black text-white text-sm font-medium cursor-pointer hover:bg-gray-800 transition-colors flex-1'
          onClick={buttons.primary.action}
        >
          {buttons.primary.label}
        </button>
      </div>
      
      {/* Additional option for login context */}
      {isLoginContext && (
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
    </Modal>
  )
}

export default RestoreAccount