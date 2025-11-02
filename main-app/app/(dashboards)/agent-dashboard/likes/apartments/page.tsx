import { getCurrentUser } from '@/actions/user-actions';
import LikedApartmentsClient from '@/components/pages/apartment/liked-apartments-client';
import LikesLayout from '@/components/pages/blogs/likes-layout';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Liked Apartments'
};

const LikedApartments = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'agent') {
    return notFound()
  };

  if (current_user.role === 'agent' ) {
    if (!current_user.showBookmarkedApartments && !current_user.showBookmarkedBlogs) {
      return notFound();
    }
  }

  return (
    <LikesLayout user={current_user}>
      <LikedApartmentsClient/>
    </LikesLayout>
  )
}

export default LikedApartments