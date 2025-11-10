
import { getCurrentUser } from '@/actions/auth-actions';
import UserClient from '@/components/dashboard-features/manage-user/user-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Users & Agents'
};

const AllUsers = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <UserClient user={user}/>;
}

export default AllUsers