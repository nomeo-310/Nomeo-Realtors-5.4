'use client'

import PropertyCardWithAction from '@/components/cards/property-card-with-action';
import PropertySkeletons from '@/components/skeletons/property-skeleton'
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import InfiniteScrollClient from '@/components/ui/infinite-scroll-client';
import { propertyProps } from '@/lib/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import React from 'react'

const ApartmentClient = ({userId, agentId}:{userId: string; agentId: string;}) => {
  

  const fetchProperties = async ({pageParam}:{pageParam: number}) => {
    const response = await axios.post('/api/property/added-properties', { page: pageParam })

    if (response.status !== 200 ) {
      throw new Error('Something went wrong, try again later');
    }

    const data = response.data;
    return data
  };

  const {data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['all-added-properties'],
    queryFn: fetchProperties,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage
  });

  const properties:propertyProps[] = data?.pages.flatMap(page => page.properties) || [];

  const PropertyList = () => {

    if (status === 'pending') {
      return <PropertySkeletons/>
    };
  
    if (status === 'success' && !properties.length && !hasNextPage) {
      return <EmptyState message='You have not created properties yet' className='w-fit'/>;  
    };
  
    if (status === 'error') {
      return <ErrorState message='An error occur while loading your added properties.' className='w-fit'/>;
    };

    return (
      <React.Fragment>
        <InfiniteScrollClient onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
            { properties.map((item:propertyProps) => (
              <PropertyCardWithAction 
                {...item} 
                key={item._id} 
                mainImage={item.apartmentImages.images[0]}
                userId={userId}
                agentId={agentId}
              />
            ))}
          </div>
        </InfiniteScrollClient>
        { isFetchingNextPage && 
          <div className="w-full">
            <Loader2 className='mx-auto animate-spin my-3 size-5 lg:size-6'/>
          </div> }
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