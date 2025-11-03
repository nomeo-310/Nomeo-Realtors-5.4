
import { getCurrentUser } from '@/actions/auth-actions';
import RentalVerificationClient from '@/components/dashboard-features/verifications/rental-verification-client'
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Verifications'
};

const RentalsVerifications = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <RentalVerificationClient user={user}/>
}

export default RentalsVerifications