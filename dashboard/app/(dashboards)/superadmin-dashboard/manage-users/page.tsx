import { getCurrentUser } from '@/actions/auth-actions';
import ActiveUsersClient from '@/components/dashboard-features/manage-app-users/active-user-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Users'
};

const ActiveUsers = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <ActiveUsersClient user={user}/>;
}

export default ActiveUsers