import { getCurrentUser } from '@/actions/auth-actions';
import { getSingleProperty } from '@/actions/resource-actions';
import SingleApartmentClient from '@/components/dashboard-features/single-apartment-client';
import { Metadata } from 'next'
import { notFound } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Apartment'
};

const SingleApartment = async ({params}:{params:{id:string}}) => {
  try {
    const [property, user] = await Promise.all([
      getSingleProperty(params.id),
      getCurrentUser(),
    ]);

    if (!property || !user) {
      return notFound();
    }

    return <SingleApartmentClient property={property} type='apartment-verification' user={user}/>
  } catch (error) {
    console.error('Error fetching data:', error);
    return notFound();
  }
}

export default SingleApartment