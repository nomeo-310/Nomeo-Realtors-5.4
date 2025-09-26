import EditApartmentClient from '@/components/pages/dashboard/edit-apartment-client';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Edit Apartment'
};

const EditPage = () => {
  return <EditApartmentClient/>
}

export default EditPage