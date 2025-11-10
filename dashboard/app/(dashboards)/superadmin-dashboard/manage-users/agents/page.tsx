import { getCurrentUser } from '@/actions/auth-actions';
import AgentClient from '@/components/dashboard-features/manage-user/agent-client';
import UserClient from '@/components/dashboard-features/manage-user/user-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Users & Agents'
};

const AllAgents = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <AgentClient user={user}/>;
}

export default AllAgents