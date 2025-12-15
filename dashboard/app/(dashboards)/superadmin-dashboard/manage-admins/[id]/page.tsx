import { getCurrentUser } from '@/actions/auth-actions';
import { getSingleActiveAdmin, getSingleActiveAgent } from '@/actions/resource-actions';
import ActiveAdminClient from '@/components/dashboard-features/manage-app-users/active-admin-client';
import ActiveAgentClient from '@/components/dashboard-features/manage-app-users/active-agent-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Admin Details',
  description: 'View and manage suspended admin account details and appeals',
};


const ActiveAdmin = async ({ params }: { params: { id: string } }) => {
  console.log(params.id);

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

    const activeUserDetails = await getSingleActiveAdmin(params.id);

    if (!activeUserDetails) {
      return notFound();
    }

    return <ActiveAdminClient admin={activeUserDetails} />

  } catch (error) {
    console.error('Error loading admin page:', error);
    return notFound();
  }
}

export default ActiveAdmin