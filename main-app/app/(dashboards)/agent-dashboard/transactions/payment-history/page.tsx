import { getCurrentUser } from '@/actions/user-actions';
import PaymentHistoryClient from '@/components/pages/transaction/payment-history-client'
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Payment History'
};

const PaymentHistory = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'agent') {
    return notFound();
  };

  return <PaymentHistoryClient/>
}

export default PaymentHistory