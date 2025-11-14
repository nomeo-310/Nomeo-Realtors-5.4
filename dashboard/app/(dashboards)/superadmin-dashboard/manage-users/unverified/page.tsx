import { getCurrentUser } from '@/actions/auth-actions';
import UnverifiedUserClient from '@/components/dashboard-features/manage-app-users/unverified-user-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Users'
};

const UnverifiedUsers = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <UnverifiedUserClient user={user}/>;
}

export default UnverifiedUsers