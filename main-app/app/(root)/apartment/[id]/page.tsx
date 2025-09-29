import { getSingleProperty } from '@/actions/property-actions';
import { getCurrentUserDetails } from '@/actions/user-actions';
import SingleApartmentClient from '@/components/pages/apartment/single-apartment-client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Apartment'
};

const SingleApartment = async ({params}:{params:{id:string}}) => {

  const [property, user] = await Promise.all([
    getSingleProperty(params.id),
    getCurrentUserDetails(),
  ]);

  if (!property) {
    return notFound();
  };

  return <SingleApartmentClient property={property} user={user}/>
}

export default SingleApartment