'use client'

import React from 'react'
import Modal from '../ui/modal'
import { useRestoreAccountModal } from '@/hooks/general-store'
import { usePathname, useRouter } from 'next/navigation'
import { permanentDeleteAccount } from '@/actions/user-actions'
import { toast } from 'sonner'

const RestoreAccount = () => {
  const { isOpen, onClose, context } = useRestoreAccountModal();
  const router = useRouter();
  const pathname = usePathname();
  const [clearingDetails, setClearingDetails] = React.useState(false);

  const [restoreEmail, setRestoreEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('restoreEmail');
      setRestoreEmail(email);
      console.log('Restore Email from localStorage:', email);
    }
  }, []);

  // Require explicit context - no fallbacks
  if (!context) {
    console.error('RestoreAccount modal requires context to be set');
    return null;
  }

  const isLoginContext = context.type === 'login';
  const isSignupContext = context.type === 'signup';
  const role = context.role || 'user';

  // Get restoreEmail safely

  const handleRestore = () => {
    onClose();
    router.push('/restore-account');
  }

  const handleCreateNew = async () => {
    if (!restoreEmail) {
      console.error('No restore email found');
      return;
    }

    setClearingDetails(true);
    
    try {
      const result = await permanentDeleteAccount({ 
        email: restoreEmail, 
        path: pathname 
      });
      
      console.log('Permanent deletion result:', result);
      
      if (result?.success) {
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('restoreEmail');
        }
        toast.success('Previous account data cleared. Proceeding to create a new account.');
        onClose();
        router.push(`/sign-up/${role}`);
      } else {
        // Handle API error
        console.error('Permanent deletion failed:', result?.message);
        toast.error(result?.message || 'Failed to create new account. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleCreateNew:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setClearingDetails(false);
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
          className='py-3 px-6 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed'
          onClick={buttons.secondary.action}
          disabled={clearingDetails || !restoreEmail}
        >
          {clearingDetails ? 'Clearing old data...' : buttons.secondary.label}
        </button>
        <button
          type="button"
          className='py-3 px-6 rounded bg-secondary-blue text-white text-sm font-medium cursor-pointer hover:bg-secondary-blue/90 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed'
          onClick={buttons.primary.action}
          disabled={clearingDetails}
        >
          {buttons.primary.label}
        </button>
      </div>
      
      {/* Additional option for login context */}
      {isLoginContext && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <button
            type="button"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline disabled:opacity-50"
            onClick={handleContinueLogin}
            disabled={clearingDetails}
          >
            Try different login credentials
          </button>
        </div>
      )}
    </Modal>
  )
}

export default RestoreAccount