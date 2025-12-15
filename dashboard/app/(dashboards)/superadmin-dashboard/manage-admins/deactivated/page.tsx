import { getCurrentUser } from '@/actions/auth-actions';
import DeactivatedAdminsClient from '@/components/dashboard-features/manage-app-users/deactivated-admins-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Admins'
};

const DeactivatedAdmin = async() => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };

  return <DeactivatedAdminsClient user={user}/>
}

export default DeactivatedAdmin