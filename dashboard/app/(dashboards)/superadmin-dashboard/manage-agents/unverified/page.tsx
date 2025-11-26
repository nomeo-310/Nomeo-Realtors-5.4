import { getCurrentUser } from '@/actions/auth-actions';
import UnverifiedAgentClient from '@/components/dashboard-features/manage-app-users/unverified-agents-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Agents'
};

const UnverifiedAgents = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <UnverifiedAgentClient user={user}/>;
}

export default UnverifiedAgents