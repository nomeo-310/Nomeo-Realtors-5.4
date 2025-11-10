
import { getCurrentUser } from '@/actions/auth-actions';
import PendingSalesClient from '@/components/dashboard-features/pendings/pending-sales-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Pendings'
};

const PendingSales = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <PendingSalesClient user={user}/>;
}

export default PendingSales