import { getCurrentUser } from '@/actions/auth-actions';
import ActiveAgentClient from '@/components/dashboard-features/manage-app-users/active-agents-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Agents'
};

const AllAgents = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <ActiveAgentClient user={user}/>;
}

export default AllAgents