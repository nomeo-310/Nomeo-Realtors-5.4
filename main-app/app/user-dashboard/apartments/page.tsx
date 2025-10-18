import { getCurrentUser } from '@/actions/user-actions'
import UserApartmentClient from '@/components/pages/dashboard/user-apartment-client'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import React from 'react'
export const metadata: Metadata = {
  title: 'Apartments',
}

const Apartments = async () => {
  const current_user = await getCurrentUser();

  const adminRoles = ['creator', 'admin', 'superAdmin']

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'user') {
    if (adminRoles.includes(current_user.role)) {
      return notFound()
    } else {
      redirect('/agent-dashboard');
    }
  };
  return <UserApartmentClient user={current_user}/>
}

export default Apartments