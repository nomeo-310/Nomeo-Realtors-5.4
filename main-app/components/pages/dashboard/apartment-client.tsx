'use client'


import PropertyCardWithAction from '@/components/cards/property-card-with-action';
import PropertySkeletons from '@/components/skeletons/property-skeleton'
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import Pagination from '@/components/ui/pagination';
import { apiRequestHandler } from '@/lib/apiRequestHandler';
import { PropertiesResponse, Property } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react'

const ApartmentClient = ({userId, agentId}:{userId: string; agentId: string;}) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  const requestProperties = () => axios.get(`/api/property/added-properties?page=${currentPage}`)

  const { data, status} = useQuery({
    queryKey: ['added-properties', currentPage],
    queryFn: () => apiRequestHandler(requestProperties),
    refetchOnWindowFocus: false,
  })

  const responseData = data?.data as PropertiesResponse;
  const properties = responseData?.properties || [];
  const pagination = responseData?.pagination || {};

  const PropertyList = () => {

    if (status === 'pending') {
      return (
        <React.Fragment>
          <div className='hidden lg:block'>
            <PropertySkeletons use_three/>
          </div>
          <div className='lg:hidden'>
            <PropertySkeletons/>
          </div>
        </React.Fragment>
      )
    };
  
    if (status === 'success' && !properties.length) {
      return <EmptyState message='You have not created properties yet' className='w-full'/>;  
    };
  
    if (status === 'error') {
      return <ErrorState message='An error occur while loading your added properties.' className='w-full'/>;
    };

    return (
      <React.Fragment>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
          { properties.map((item:Property) => (
            <PropertyCardWithAction 
              {...item} 
              key={item._id} 
              mainImage={item.apartmentImages.images[0]}
              userId={userId}
              agentId={agentId}
              availabilityStatus={item.availabilityStatus}
            />
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={setCurrentPage}/>
      </React.Fragment>
    )
  };


  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Apartments</h2>
      </div>
      <PropertyList/>
    </div>
  )
}

export default ApartmentClient