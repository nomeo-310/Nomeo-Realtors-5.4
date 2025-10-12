'use client'


import PropertyCard from '@/components/cards/property-card';
import PropertySkeletons from '@/components/skeletons/property-skeleton'
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import Pagination from '@/components/ui/pagination';
import { apiRequestHandler } from '@/lib/apiRequestHandler';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react'

interface User {
  _id: string;
  email: string;
  placeholderColor: string;
  lastName: string;
  profilePicture: string;
  surName: string;
}

interface Agent {
  _id: string;
  userId: User;
  licenseNumber: string;
}

interface ApartmentImages {
  _id: string;
  images: string[];
}

interface Property {
  _id: string;
  propertyTag: string;
  propertyTypeTag: string;
  propertyIdTag: string;
  city: string;
  state: string;
  propertyPrice: number;
  annualRent: number;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  squareFootage: number;
  apartmentImages: ApartmentImages;
  agent: Agent;
  facilityStatus: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProperties: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PropertyResponse {
  properties: Property[];
  pagination: Pagination;
}

const SavedApartmentsClient = () => {
  const [currentPage, setCurrentPage] = React.useState(1);

  const requestProperties = () => axios.get(`/api/property/bookmarked-properties?page=${currentPage}`)

  const { data, status} = useQuery({
    queryKey: ['added-properties', currentPage],
    queryFn: () => apiRequestHandler(requestProperties),
    refetchOnWindowFocus: false,
  })

  const responseData = data?.data as PropertyResponse;
  const properties = responseData?.properties || [];
  const pagination = responseData?.pagination || {};

  const PropertyList = () => {

    if (status === 'pending') {
      return <PropertySkeletons use_three/>
    };
  
    if (status === 'success' && !properties.length) {
      return (
        <div className="md:w-[65%] mx-auto py-12">
          <EmptyState message='You have no bookmarked properties' className='w-full'/>
        </div>
      ) 
    };
  
    if (status === 'error') {
      return (
        <div className="md:w-[65%] mx-auto py-12">
          <ErrorState message='Something went wrong' className='w-full'/>
        </div>
      )
    };

    return (
      <React.Fragment>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
          { properties.map((property:Property) => (
            <PropertyCard
              key={property._id}
              propertyTag={property.propertyTag}
              propertyIdTag={property.propertyIdTag}
              city={property.city}
              state={property.state}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              mainImage={property.apartmentImages.images[0]}
              annualRent={property.annualRent}
              propertyPrice={property.propertyPrice}
              squareFootage={property.squareFootage}
              furnitureStatus={property.facilityStatus}
              placeholderColor={property.agent.userId.placeholderColor}
              email={property.agent.userId.email}
              profileImage={property.agent.userId.profilePicture}
            />
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={setCurrentPage}/>
      </React.Fragment>
    )
  };


  return (
    <React.Fragment>
      <PropertyList/>
    </React.Fragment>
  )
}

export default SavedApartmentsClient