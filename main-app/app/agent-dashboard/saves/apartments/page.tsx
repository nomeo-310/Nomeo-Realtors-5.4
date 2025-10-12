import { getCurrentUser } from '@/actions/user-actions';
import SavedApartmentsClient from '@/components/pages/apartment/saved-apartments-client';
import SavesLayout from '@/components/pages/blogs/saves-layout';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Saved Apartments'
};

const SavedApartments = async () => {
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

  if (current_user.role === 'agent' ) {
    if (!current_user.showBookmarkedApartments && !current_user.showBookmarkedBlogs) {
      return notFound();
    }
  }

  return (
    <SavesLayout user={current_user}>
      <SavedApartmentsClient/>
    </SavesLayout>
  )
}

export default SavedApartments