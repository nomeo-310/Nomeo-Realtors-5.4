
import { getCurrentUser } from '@/actions/auth-actions';
import PendingRentalClient from '@/components/dashboard-features/pendings/pending-rental-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Pendings'
};

const PendingRentals = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <PendingRentalClient user={user}/>;
}

export default PendingRentals