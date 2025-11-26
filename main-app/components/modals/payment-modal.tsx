'use client'

import React, { useEffect, useState } from 'react'
import Modal from '../ui/modal'
import { useManualTransferModal, usePaymentModal } from '@/hooks/general-store'
import { toast } from 'sonner'
import { PaystackButton } from 'react-paystack';
import { usePathname, useSearchParams } from 'next/navigation'
import { initiateTransaction } from '@/actions/transaction-actions'
import { useDeleteNotification } from '@/hooks/use-delete-notification'

type referenceProps = {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
  redirecturl: string;
}

type transactionData = {
  email: string;
  amount: number;
  phone_number: string;
};

interface PaystackConfig {
  email: string;
  amount: number;
  publicKey: string;
  onSuccess: (reference: referenceProps) => void;
  onClose: () => void;
  onError: (error: unknown) => void;
  currency?: string;
  metadata?: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string | number;
    }> ;
  };
}

const PaymentModal = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isOpen, onClose } = usePaymentModal();

  // Read from localStorage synchronously on component mount
  const [transactionData, setTransactionData] = useState<transactionData | null>(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('transaction-data');
      if (data) {
        try {
          return JSON.parse(data);
        } catch (err) {
          console.error("Failed to parse transaction data", err);
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const propertyId = searchParams.get('propertyId');
  const agentUserId = searchParams.get('agentUserId');
  const notificationId = searchParams.get('notificationId');

  const public_key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const { mutate } = useDeleteNotification(notificationId ?? '', false);

  const { onOpen } = useManualTransferModal();

  // Reset transaction data when modal opens
  useEffect(() => {
    if (isOpen) {
      const data = localStorage.getItem('transaction-data');
      if (data) {
        try {
          setTransactionData(JSON.parse(data));
        } catch (err) {
          console.error("Failed to parse transaction data", err);
          setTransactionData(null);
        }
      } else {
        setTransactionData(null);
      }
    }
  }, [isOpen]);

  if (!public_key) {
    toast.error('PayStack public key is not set!!');
    return null;
  }

  const paystackConfig: PaystackConfig = {
    email: transactionData?.email || '',
    amount: (transactionData?.amount || 0) * 100,
    publicKey: public_key,
    currency: 'NGN',
    metadata: {
      custom_fields: [
        {
          display_name: 'Email',
          variable_name: 'email',
          value: transactionData?.email || ''
        },
        {
          display_name: 'Amount',
          variable_name: 'amount',
          value: transactionData?.amount || 0
        },
      ]
    },
    onSuccess: async (reference) => {
      if (reference && reference.status === 'success') {
        setIsLoading(true);
        try {
          const values = {
            createdAt: new Date(Date.now()).toISOString(),
            transactionId: reference.transaction,
            referenceId: reference.reference,
            transactionStatus: reference.status,
            currency: 'NGN',
            amount: transactionData?.amount || 0,
            propertyId: propertyId || '',
            agentUserId: agentUserId || '',
            paymentMethod: 'online_transfer',
            path: pathname
          };

          const response = await initiateTransaction({ values });
          if (response && response.status === 200) {
            localStorage.removeItem('transaction-data');
            mutate();
            toast.success('Transaction was successful!!');
            onClose();
          } else {
            toast.error(response.message);
          }
        } catch (error) {
          console.error('Transaction error:', error);
          toast.error('Transaction failed, try again later!!');
        } finally {
          setIsLoading(false);
        }
      }
    },
    onClose: () => {
      if (!isLoading) {
        toast.error('Transaction cancelled!!');
      }
    },
    onError: (error) => {

      toast.error('Transaction failed, try again later!!');
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title='Make Payment'
      description='Are you sure you want to proceed with the payment?'
      useCloseButton
      isOpen={isOpen}
      useSeparator
      onClose={onClose}
    >
      <div className="flex flex-col space-y-4 mt-5">
        {!transactionData ? (
          <div className="text-center py-4">
            <p>Loading payment information...</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              <p>Amount: <strong>₦{transactionData.amount.toLocaleString()}</strong></p>
              <p>Email: <strong>{transactionData.email}</strong></p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <PaystackButton
                text={isLoading ? 'Processing...' : 'Make Online Transfer'}
                className='py-2 px-4 rounded bg-secondary-blue text-white text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center'
                {...paystackConfig}
                disabled={isLoading}
              />
              <button
                type="button"
                className='py-2 px-4 rounded border dark:border-white/70 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed flex-1'
                onClick={() => { onOpen(); onClose(); }}
                disabled={isLoading}
              >
                Make Bank Transfer
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal;