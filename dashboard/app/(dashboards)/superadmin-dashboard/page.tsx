import { getCurrentUser } from '@/actions/auth-actions'
import NotificationClient from '@/components/dashboard-features/notification/notification-client';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

const NotificationPage = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'superAdmin') {
    notFound();
  };

  return <NotificationClient user={current_user}/>
}

export default NotificationPage