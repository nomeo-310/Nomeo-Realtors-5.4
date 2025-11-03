
import { getCurrentUser } from '@/actions/auth-actions';
import AgentVerificationsClient from '@/components/dashboard-features/verifications/agent-verifications-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Verifications'
};

const Verifications = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <AgentVerificationsClient user={user}/>;
}

export default Verifications