import React from 'react'
import AddApartmentClient from '@/components/pages/dashboard/add-apartment-client'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/user-actions'
import { getAgentVerificationStatus } from '@/actions/agent-action'

export const metadata: Metadata = {
  title: 'Add Apartments'
}

const AddApartments = async () => {
    const current_user = await getCurrentUser();
  
    if (!current_user) {
      redirect('/')
    };
  
    if (current_user.role !== 'agent') {
      redirect(`/${current_user.role}-dashboard`)
    };

    let status;
    if (current_user.agentId) {
      status = await getAgentVerificationStatus(current_user.agentId);
    }

    const isPending = status?.isPending ? true : false;

    if (isPending) {
      redirect('/agent-dashboard')
    }

  return (
    <AddApartmentClient/>
  )
}

export default AddApartments