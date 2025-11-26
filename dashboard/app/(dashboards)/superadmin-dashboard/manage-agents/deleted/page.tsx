import { getCurrentUser } from '@/actions/auth-actions';
import DeletedAgentClient from '@/components/dashboard-features/manage-app-users/deleted-agents-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Agents'
};

const DeletedAgents = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'superAdmin') {
    return notFound();
  };
  
  return <DeletedAgentClient user={user}/>;
}

export default DeletedAgents