import { getAgentVerificationStatus } from '@/actions/agent-action';
import { getCurrentUser } from '@/actions/user-actions';
import ClientsClient from '@/components/pages/dashboard/clients-client'
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Clients'
};

const ClientsPage = async () => {
  const current_user = await getCurrentUser();

  const adminRoles = ['creator', 'admin', 'superAdmin']

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'agent') {
    if (adminRoles.includes(current_user.role)) {
      return notFound()
    } else {
      redirect('/user-dashboard');
    }
  };

  return (
    <ClientsClient/>
  )
}

export default ClientsPage