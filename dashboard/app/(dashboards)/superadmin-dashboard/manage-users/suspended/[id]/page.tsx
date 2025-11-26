import { getCurrentUser } from '@/actions/auth-actions';
import { getSingleSuspendedUser } from '@/actions/resource-actions';
import SuspendedUserClient from '@/components/dashboard-features/manage-app-users/suspended-user-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Suspended User Details - Admin Dashboard',
  description: 'View and manage suspended user account details and appeals',
};


const SuspendedUser = async ({ params }: { params: { id: string } }) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect('/login');
    }

    if (user.role !== 'superAdmin' && user.role !== 'admin') {
      return notFound();
    }

    if (!params.id || params.id.length < 10) {
      return notFound();
    }

    const suspensionDetails = await getSingleSuspendedUser(params.id);

    if (!suspensionDetails) {
      return notFound();
    }

    return <SuspendedUserClient suspensionDetails={suspensionDetails} currentUser={user} />

  } catch (error) {
    console.error('Error loading suspended user page:', error);
    return notFound();
  }
}

export default SuspendedUser