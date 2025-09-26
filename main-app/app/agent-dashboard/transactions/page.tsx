import ClaimPaymentClient from '@/components/pages/transaction/claim-payment-client';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Transactions'
};

const ClaimPaymentPage = () => {

  return <ClaimPaymentClient/>;
}

export default ClaimPaymentPage