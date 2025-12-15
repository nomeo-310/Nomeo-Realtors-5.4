import { getCurrentUser } from '@/actions/auth-actions';
import { getSingleSuspendedAdmin} from '@/actions/resource-actions';
import SuspendedAdminClient from '@/components/dashboard-features/manage-app-users/suspended-admin-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Suspended Admin Details',
  description: 'View and manage suspended admin account details and appeals',
};


const SuspendedAdmin = async ({ params }: { params: { id: string } }) => {
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

    const suspensionDetails = await getSingleSuspendedAdmin(params.id);

    if (!suspensionDetails) {
      return notFound();
    }

    return <SuspendedAdminClient suspensionDetails={suspensionDetails} currentUser={user} />

  } catch (error) {
    console.error('Error loading suspended user page:', error);
    return notFound();
  }
}

export default SuspendedAdmin