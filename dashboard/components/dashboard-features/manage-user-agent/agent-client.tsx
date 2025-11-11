import React from 'react'
import { AdminDetailsProps } from '@/lib/types'
import AgentsWrapper from './agents-wrapper'

const AgentClient = ({user}:{user:AdminDetailsProps}) => {
  return (
    <AgentsWrapper user={user}>
      AgentClient
    </AgentsWrapper>
  )
}

export default AgentClient