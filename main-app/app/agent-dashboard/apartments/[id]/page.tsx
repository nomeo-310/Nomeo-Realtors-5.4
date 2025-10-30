import { getCurrentUser } from '@/actions/user-actions';
import EditApartmentClient from '@/components/pages/dashboard/edit-apartment-client';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Edit Apartment'
};

const EditPage = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'agent') {
    return notFound();
  };
  return <EditApartmentClient/>
}

export default EditPage