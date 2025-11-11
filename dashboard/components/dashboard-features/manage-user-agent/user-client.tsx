'use client'

import React from 'react'
import UsersWrapper from './users-wrapper'
import { AdminDetailsProps } from '@/lib/types'
import UserFilters from './user-filter'

const UserClient = ({user}:{user:AdminDetailsProps}) => {
  const [filters, setFilters] = React.useState({ search: '', sort: 'desc' as 'asc' | 'desc'});

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  };
  
  return (
    <UsersWrapper user={user}>
      <UserFilters onFiltersChange={handleFiltersChange}/>
    </UsersWrapper>
  )
}

export default UserClient