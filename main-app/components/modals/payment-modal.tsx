'use client'

import React, { useEffect, useState } from 'react'
import Modal from '../ui/modal'
import { usePaymentModal } from '@/hooks/general-store'
import { toast } from 'sonner'
import { PaystackButton } from 'react-paystack';
import { usePathname, useSearchParams } from 'next/navigation'
import { initiateTransaction } from '@/actions/transaction-actions'

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

  const [transactionData, setTransactionData] = useState<transactionData | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('transaction-data');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setTransactionData(parsed);
        } catch (err) {
          console.error("Failed to parse transaction data", err);
        }
      }
    }
  }, []);

  const propertyId = searchParams.get('propertyId');
  const agentUserId = searchParams.get('agentUserId');
  const public_key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  if (!public_key) {
    toast.error('PayStack public key is not set!!');
  }

  if (!transactionData) return null; // Wait until localStorage is read

  const paystackConfig: PaystackConfig = {
    email: transactionData.email,
    amount: transactionData.amount * 100,
    publicKey: public_key || '',
    currency: 'NGN',
    metadata: {
      custom_fields: [
        {
          display_name: 'Email',
          variable_name: 'email',
          value: transactionData.email
        },
        {
          display_name: 'Amount',
          variable_name: 'amount',
          value: transactionData.amount
        },
      ]
    },
    onSuccess: async (reference) => {
      if (reference && reference.status === 'success') {
        const values = {
          createdAt: new Date(Date.now()).toISOString(),
          transactionId: reference.transaction,
          referenceId: reference.reference,
          transactionStatus: reference.status,
          currency: 'NGN',
          amount: transactionData.amount,
          type: 'rent-payment',
          propertyId: propertyId || '',
          agentUserId: agentUserId || '',
          path: pathname
        };

        await initiateTransaction({ values }).then((response) => {
          if (response && response.status === 200) {
            toast.success('Transaction was successful!!');
          } else {
            toast.error(response.message);
          }
        });
      }
    },
    onClose: () => {
      toast.error('Transaction cancelled!!');
    },
    onError: (error) => {
      console.log(error);
      toast.error('Transaction failed, try again later!!');
    }
  };

  return (
    <Modal
      title='Make Payment'
      description='Are you sure you want to proceed with the payment?'
      useCloseButton={false}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex items-center justify-between mt-5">
        <PaystackButton
          text='Make Payment'
          className='py-1.5 px-4 rounded-md bg-black text-white dark:bg-[#424242]'
          {...paystackConfig}
        />
        <button
          type="button"
          className='py-1.5 px-4 rounded-md border dark:border-white/70'
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;
