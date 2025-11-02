import { getCurrentUser } from '@/actions/user-actions';
import ClaimPaymentClient from '@/components/pages/transaction/claim-payment-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Transactions'
};

const ClaimPaymentPage = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'agent') {
    return notFound();
  };

  return <ClaimPaymentClient/>;
}

export default ClaimPaymentPage