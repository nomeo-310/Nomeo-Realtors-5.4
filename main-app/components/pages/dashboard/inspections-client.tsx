'use client'

import InspectionCard from '@/components/cards/inspection-card';
import NotificationsSkeleton from '@/components/skeletons/notifications-skeletons';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import InfiniteScrollClient from '@/components/ui/infinite-scroll-client';
import { Inspection } from '@/lib/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import React from 'react';

const InspectionsClient = () => {
  const fetchInspections = async ({pageParam}:{pageParam: number}) => {
    const response = await axios.post('/api/inspections/agent-inspections', { page: pageParam })

    if (response.status !== 200 ) {
      throw new Error('Something went wrong, try again later');
    }

    const data = response.data;
    return data
  };

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['all-agent-inspections'],
    queryFn: fetchInspections,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage
  });

  const inspections = data?.pages.flatMap((page) => page.inspections) ?? [];

  const InspectionList = () => {

    if (status === 'pending') {
      return <NotificationsSkeleton/>
    };
  
    if (status === 'success' && !inspections.length && !hasNextPage) {
      return <EmptyState message='No inspections right now.' className='w-full'/>;  
    };
  
    if (status === 'error') {
      return <ErrorState message='An error occur while loading your inspections.' className='w-full'/>;
    }


    return (
      <React.Fragment>
        <InfiniteScrollClient onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}>
          <div className="flex flex-col">
            { inspections.map((item:Inspection) => (
              <InspectionCard item={item} key={item._id}/>
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
    <div className='w-full lg:w-[80%] xl:w-[70%] md:w-[90%] h-full flex flex-col gap-6 md:gap-8 lg:gap-10 py-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Inspections</h2>
      </div>
      { inspections && inspections.length > 0  &&
        <div className='text-sm font-semibold text-red-600 space-y-2'>
          <div>
            <strong>INSPECTION STATUS:</strong> 
            <ul className="list-disc list-inside ml-2 font-normal">
              <li><strong>PENDING</strong> - Inspection has not taken place yet</li>
              <li><strong>COMPLETED</strong> - Inspection was successfully conducted</li>
              <li><strong>INCOMPLETE</strong> - Client never showed up for the inspection</li>
            </ul>
          </div>
          
          <div>
            <strong>CLIENT VERDICT:</strong>
            <ul className="list-disc list-inside ml-2 font-normal">
              <li><strong>PENDING</strong> - Client has not made a decision yet</li>
              <li><strong>ACCEPTED</strong> - Client has accepted the apartment or will settle for the property</li>
              <li><strong>REJECTED</strong> - Client has rejected the apartment or the property.</li>
            </ul>
          </div>
          
          <div className="font-normal">
            <strong>Important:</strong> Update both the inspection status and client verdict. 
            If an inspection is pending on an apartment, it cannot be booked by another user. 
            If the client rejects the apartment, the rent/sale process cannot be initiated.
          </div>
        </div>
      }
      <InspectionList/>
    </div>
  )
}

export default InspectionsClient