'use client'

import React from 'react'
import UsersWrapper from './users-wrapper'
import { AdminDetailsProps, ExtendedUserProps } from '@/lib/types'
import { useFilterStore } from '@/hooks/usefilter-store'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

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

const DeletedUserClient = ({user}:{user:AdminDetailsProps}) => {
  const { search, sortOrder } = useFilterStore();

  const [currentPage, setCurrentPage] = React.useState(1);
  
  const queryData = React.useMemo(() => ({
    queryText: search,
    sortOrder: sortOrder,
    page: currentPage
  }), [search, sortOrder, currentPage]);

  const fetchData = async (): Promise<ApiResponse> => {
    try {
      const response = await axios.post<ApiResponse>('/api/admin/users/deleted', queryData);

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
    queryKey: ['deleted-users', search, sortOrder, currentPage],
    queryFn: fetchData,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, sortOrder]);

  return (
    <UsersWrapper 
      user={user}
      placeholder='search deleted users...'
      searchDelay={400}
      namespace='deleted_users'
      maxWidth='max-w-4xl'
    >
      active user client
    </UsersWrapper>
  )
}

export default DeletedUserClient