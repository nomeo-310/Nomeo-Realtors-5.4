import React from 'react'
import NotificationClient from '@/components/pages/dashboard/notification-client'
import { Metadata } from 'next'
import { getCurrentUserDetails } from '@/actions/user-actions'

export const metadata: Metadata = {
  title: 'Notifications'
}

const AgentDashboard = async () => {
  const current_user = await getCurrentUserDetails();
 
  return <NotificationClient user={current_user}/>
}

export default AgentDashboard