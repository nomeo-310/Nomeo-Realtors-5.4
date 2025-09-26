import { getSingleProperty } from '@/actions/property-actions';
import { getCurrentUserDetails } from '@/actions/user-actions';
import SingleApartmentClient from '@/components/pages/apartment/single-apartment-client'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Apartment'
};

const SingleApartment = async ({params}:{params:{id:string}}) => {

  const property = await getSingleProperty(params.id);
  const user = await getCurrentUserDetails();

  return <SingleApartmentClient property={property ?? {}} user={user}/>
}

export default SingleApartment