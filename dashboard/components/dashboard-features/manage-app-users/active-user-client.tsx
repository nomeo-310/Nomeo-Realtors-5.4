'use client'

import React from 'react'
import UsersWrapper from './users-wrapper'
import { AdminDetailsProps, ExtendedUserProps } from '@/lib/types'
import { useFilterStore } from '@/hooks/usefilter-store'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { TableSkeleton } from '../table-skeleton'
import { MobileSkeleton } from '../mobile-table-skeleton'

interface ApiResponse {
  users: ExtendedUserProps[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const ActiveUserClient = ({user}:{user:AdminDetailsProps}) => {
  const { search, sortOrder } = useFilterStore();

  const [currentPage, setCurrentPage] = React.useState(1);
  
  const queryData = React.useMemo(() => ({
    queryText: search,
    sortOrder: sortOrder,
    page: currentPage
  }), [search, sortOrder, currentPage]);

  const fetchData = async (): Promise<ApiResponse> => {
    try {
      const response = await axios.post<ApiResponse>('/api/admin/users/active', queryData);

      if (response.status !== 200) {
        throw new Error(`API returned status: ${response.status}`);
      }

    return response.data;
    } catch (error:any) {
      const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
      throw new Error(errorMessage);
    }
  };

  const { data, status } = useQuery<ApiResponse>({
    queryKey: ['active-users', search, sortOrder, currentPage],
    queryFn: fetchData,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, sortOrder]);

  const tableHeader = ['s/n', 'username', 'surname', 'lastname', 'email',  'verification', 'city', 'state', 'date joined', 'action'];

  const LoadingState = () => {
    return (
      <>
        {/* Desktop Skeleton */}
        <div className="hidden md:block">
          <TableSkeleton rows={8} tableHeader={tableHeader} />
        </div>

        {/* Mobile Skeleton */}
        <div className='md:hidden'>
          <MobileSkeleton items={7} />
        </div>
      </>
    )
  }

  return (
    <UsersWrapper 
      user={user}
      placeholder='search active users...'
      searchDelay={400}
      namespace='active_users'
      maxWidth='max-w-4xl'
    >
      <LoadingState/>
    </UsersWrapper>
  )
};

export default ActiveUserClient