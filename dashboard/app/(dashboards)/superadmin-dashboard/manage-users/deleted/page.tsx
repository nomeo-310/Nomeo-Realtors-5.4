import { getCurrentUser } from '@/actions/auth-actions';
import DeletedUserClient from '@/components/dashboard-features/manage-app-users/deleted-user-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Users'
};

const DeletedUsers = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <DeletedUserClient user={user}/>;
}

export default DeletedUsers