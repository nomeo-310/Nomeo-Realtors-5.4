'use client';

import React, { useState } from 'react';
import Modal from '../ui/modal';
import { useManualTransferModal } from '@/hooks/general-store';
import { CheckIcon, CopyIcon, InfoIcon, FileTextIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { generateUID } from '@/lib/utils';
import { initiateTransaction } from '@/actions/transaction-actions';
import { useDeleteNotification } from '@/hooks/use-delete-notification';

type transactionData = {
  email: string;
  amount: number;
  phone_number: string;
};

const ManualTransferModal = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { isOpen, onClose } = useManualTransferModal();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<transactionData | null>(null);
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
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
  const notificationId =  searchParams.get('notificationId');

  const { mutate } = useDeleteNotification(notificationId??'', false);

  // You can make these props or fetch from your API/context
  const paymentDetails = {
    companyName: "Nomeo Realtors Inc.",
    accountName: "Nomeo Realtors Inc.",
    accountNumber: "00545321043",
    bankName: "Guaranteed Trust Bank",
    totalAmount: transactionData?.amount ?? 0,
    propertyIdTag: propertyId,
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const uniqueId = generateUID();

  const handlePaymentConfirmation = async () => {
    const values = {
      createdAt: new Date(Date.now()).toISOString(),
      transactionId: uniqueId,
      referenceId: uniqueId,
      transactionStatus: 'pending',
      currency: 'NGN',
      amount: transactionData?.amount || 0,
      propertyId: propertyId || '',
      agentUserId: agentUserId || '',
      paymentMethod: 'bank_transfer',
      path: pathname
    };

    setLoading(true);

    try {
      const response = await initiateTransaction({values})
      if (response && response.status === 200) {
        toast.success('Transaction initiated successfully. Await confirmation.');
        localStorage.removeItem('transaction-data');
        mutate();
        setTimeout(() => {
          onClose();
          router.push('/user-dashboard/transactions');
        }, 3000);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to initiate transaction');
    } finally{
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Make Bank Transfer"
      isOpen={isOpen}
      onClose={onClose}
      useCloseButton
      width="max-w-xl"
    >
      <div className="space-y-4 mt-4">
        {/* Important Instructions */}
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <InfoIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-red-800 mb-2">Important Instructions</h3>
          </div>
            <div className="flex-1">
              <div className="text-xs md:text-sm text-red-700 space-y-1.5">
                <p> - Use <strong className='uppercase'>{paymentDetails.propertyIdTag}</strong> as your narration</p>
                <p> - Forward yor payment reciept to <strong>support@nomeorealtorsinc.com</strong></p>
                <div> - Payment will be verified within the maximum of 24 hours</div>
                <div> - Transfer the exact amount shown below</div>
              </div>
            </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3">
          {/* Account Name - With border and gray background */}
          <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Account Name:</label>
              <span className="text-sm lg:text-base font-semibold text-gray-900 flex-1">{paymentDetails.accountName}</span>
            </div>
            <button
              onClick={() => copyToClipboard(paymentDetails.accountName, 'Account Name')}
              className="h-8 w-8 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all duration-300 flex items-center justify-center flex-none"
            >
              {copiedField === 'Account Name' ? (
                <div className="animate-pulse">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <CopyIcon className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Account Number - With border and gray background */}
          <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Account Number:</label>
              <span className="text-sm lg:text-base font-mono font-bold text-gray-900 tracking-wider flex-1">{paymentDetails.accountNumber}</span>
            </div>
            <button
              onClick={() => copyToClipboard(paymentDetails.accountNumber, 'Account Number')}
              className="h-8 w-8 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all duration-300 flex items-center justify-center flex-none"
            >
              {copiedField === 'Account Number' ? (
                <div className="animate-pulse">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <CopyIcon className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Bank Name - With border and gray background */}
          <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Bank Name:</label>
              <span className="text-sm lg:text-base font-semibold text-gray-900 flex-1">{paymentDetails.bankName}</span>
            </div>
            <button
              onClick={() => copyToClipboard(paymentDetails.bankName, 'Bank Name')}
              className="h-8 w-8 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all duration-300 flex items-center justify-center flex-none"
            >
              {copiedField === 'Bank Name' ? (
                <div className="animate-pulse">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <CopyIcon className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Total Amount - With border and green background */}
        <div className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <p className="text-xs text-green-600 font-medium">Total Amount:</p>
            <p className="text-xl font-bold text-green-700">
              {formatAmount(paymentDetails.totalAmount)}
            </p>
          </div>
        </div>

        {/* Receipt Reminder */}
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
          <FileTextIcon className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-xs text-red-700">
            <strong>Remember:</strong> Use <strong className='uppercase'>{paymentDetails.propertyIdTag}</strong> as your narration
          </p>
        </div>

        {/* Payment Confirmation Button */}
        <button
          disabled={loading}
          onClick={handlePaymentConfirmation}
          className="w-full h-10 text-sm lg:text-base bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className='size-4 animate-spin'/> : <CheckIcon className="size-4"/>}
          {loading ? 'Initiating Transaction' : 'I Have Made Payment'}
        </button>

        {/* Support Info */}
        <div className="text-center pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Need help? Contact support at support@{paymentDetails.companyName.toLowerCase().replace(/\s+/g, '')}.com
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ManualTransferModal;