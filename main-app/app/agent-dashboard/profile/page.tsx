import React from 'react'
import ProfileClient from '@/components/pages/dashboard/profile-client'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile'
};

const Profile = async () => {

  return <ProfileClient />
};

export default Profile