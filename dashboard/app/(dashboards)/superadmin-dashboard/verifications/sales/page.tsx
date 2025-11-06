import { getCurrentUser } from '@/actions/auth-actions';
import SalesVerificationClient from '@/components/dashboard-features/verifications/sales-verification-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Verifications'
};

const SalesVerifications = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <SalesVerificationClient user={user}/>
}

export default SalesVerifications