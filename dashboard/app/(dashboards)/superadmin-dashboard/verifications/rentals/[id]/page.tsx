import { getSingleProperty } from '@/actions/resource-actions';
import SingleApartmentClient from '@/components/dashboard-features/verifications/single-apartment-client';
import { Metadata } from 'next'
import { notFound } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Apartment'
};

const SingleApartment = async ({params}:{params:{id:string}}) => {

  const property = await getSingleProperty(params.id);

  if (!property) {
    return notFound();
  };

  return <SingleApartmentClient property={property}/>
}

export default SingleApartment