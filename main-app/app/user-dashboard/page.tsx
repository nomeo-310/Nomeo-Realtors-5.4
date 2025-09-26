import NotificationClient from '@/components/pages/dashboard/notification-client'
import { Metadata } from 'next'
import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/user-actions'

export const metadata: Metadata = {
  title: 'Notifications',
}

const NotificationsDashboard = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };
    
  return (
    <NotificationClient user={current_user}/>
  )
}

export default NotificationsDashboard;