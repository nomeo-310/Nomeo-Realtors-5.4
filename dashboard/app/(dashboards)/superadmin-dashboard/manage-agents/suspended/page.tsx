import { getCurrentUser } from '@/actions/auth-actions';
import SuspendedAgentClient from '@/components/dashboard-features/manage-app-users/suspended-agents-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Agents'
};

const SuspendedAgents = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <SuspendedAgentClient user={user}/>;
}

export default SuspendedAgents