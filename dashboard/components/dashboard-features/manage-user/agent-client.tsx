import React from 'react'
import UsersWrapper from './users-wrapper'
import { AdminDetailsProps } from '@/lib/types'

const AgentClient = ({user}:{user:AdminDetailsProps}) => {
  return (
    <UsersWrapper user={user}>
      AgentClient
    </UsersWrapper>
  )
}

export default AgentClient