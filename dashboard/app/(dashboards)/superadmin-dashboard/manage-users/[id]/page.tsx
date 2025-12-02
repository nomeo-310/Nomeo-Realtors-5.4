import { getCurrentUser } from '@/actions/auth-actions';
import { getSingleActiveUser } from '@/actions/resource-actions';
import ActiveUserClient from '@/components/dashboard-features/manage-app-users/active-user-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Active User Details',
  description: 'View and manage suspended user account details and appeals',
};


const ActiveUser = async ({ params }: { params: { id: string } }) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect('/');
    }

    if (user.role !== 'superAdmin' && user.role !== 'admin') {
      return notFound();
    }

    if (!params.id || params.id.length < 10) {
      return notFound();
    }

    const activeUserDetails = await getSingleActiveUser(params.id);

    if (!activeUserDetails) {
      return notFound();
    }

    return <ActiveUserClient userDetails={activeUserDetails} />

  } catch (error) {
    console.error('Error loading suspended user page:', error);
    return notFound();
  }
}

export default ActiveUser