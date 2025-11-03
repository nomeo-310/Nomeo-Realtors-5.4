
import { getCurrentUser } from '@/actions/auth-actions';
import ApartmentVerificationClient from '@/components/dashboard-features/verifications/apartment-verification-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Verifications'
};


const ApartmentVerification = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };

  return <ApartmentVerificationClient user={user}/>
}

export default ApartmentVerification;