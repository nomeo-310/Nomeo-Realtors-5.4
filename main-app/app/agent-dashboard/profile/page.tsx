import React from 'react'
import ProfileClient from '@/components/pages/dashboard/profile-client'
import { Metadata } from 'next';
import { getCurrentUser } from '@/actions/user-actions';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Profile'
};

const Profile = async () => {
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

  return <ProfileClient />
};

export default Profile