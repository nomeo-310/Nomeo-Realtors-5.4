import { getCurrentUser } from '@/actions/auth-actions';
import { getSingleActiveAgent } from '@/actions/resource-actions';
import ActiveAgentClient from '@/components/dashboard-features/manage-app-users/active-agent-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Active User Details',
  description: 'View and manage suspended user account details and appeals',
};


const ActiveAgent = async ({ params }: { params: { id: string } }) => {
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

    const activeUserDetails = await getSingleActiveAgent(params.id);

    if (!activeUserDetails) {
      return notFound();
    }

    return <ActiveAgentClient userDetails={activeUserDetails} />

  } catch (error) {
    console.error('Error loading active agent page:', error);
    return notFound();
  }
}

export default ActiveAgent