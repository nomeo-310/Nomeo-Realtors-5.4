import { getCurrentUser } from '@/actions/auth-actions';
import SuspendedAdminClient from '@/components/dashboard-features/manage-app-users/suspended-admins-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Admins'
};

const SuspendedAdmin = async() => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };

  return <SuspendedAdminClient user={user}/>
}

export default SuspendedAdmin