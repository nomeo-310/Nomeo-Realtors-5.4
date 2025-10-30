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

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'agent') {
    return notFound();
  };

  return (
    <ClientsClient user={current_user}/>
  )
}

export default ClientsPage