import { getCurrentUser } from '@/actions/auth-actions';
import UnverifiedUsersClient from '@/components/dashboard-features/manage-app-users/unverified-users-client';
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
  
  return <UnverifiedUsersClient user={user}/>;
}

export default UnverifiedUsers