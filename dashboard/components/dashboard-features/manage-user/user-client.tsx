import React from 'react'
import UsersWrapper from './users-wrapper'
import { AdminDetailsProps } from '@/lib/types'

const UserClient = ({user}:{user:AdminDetailsProps}) => {
  return (
    <UsersWrapper user={user}>
      UserClient
    </UsersWrapper>
  )
}

export default UserClient