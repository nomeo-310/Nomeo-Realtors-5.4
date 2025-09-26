import ClientsClient from '@/components/pages/dashboard/clients-client'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Clients'
};

const ClientsPage = () => {

  return (
    <ClientsClient/>
  )
}

export default ClientsPage