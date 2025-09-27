import { getAgentVerificationStatus } from '@/actions/agent-action';
import { getCurrentUser } from '@/actions/user-actions';
import ApartmentClient from '@/components/pages/dashboard/apartment-client';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Apartments'
};

const Apartments = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  }

  if (current_user && !current_user.userIsAnAgent && !current_user.agentId) {
      redirect('/')
  }
    
  if (current_user.role !== 'agent') {
    if (current_user.role === 'user') {
      redirect('/user-dashboard');
    } else {
      redirect('/');
    }
  };

  let status;
  
  if (current_user.agentId) {
    status = await getAgentVerificationStatus(current_user.agentId);
  }

  const isPending = status?.isPending ? true : false;

  if (isPending) {
    redirect('/agent-dashboard')
  }

  return <ApartmentClient userId={current_user._id} agentId={current_user.agentId!}/>
}

export default Apartments