import React from 'react'
import NavigationClient from './navigation-client'
import { userProps } from '@/lib/types';
import { getCurrentUserDetails } from '@/actions/user-actions';

const Navigation = async () => {
  const user:userProps = await getCurrentUserDetails();

  return (
    <NavigationClient user={user}/>
  )
}

export default Navigation