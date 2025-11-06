'use client'

import React from 'react'
import { ImageAvatar } from '../ui/image-avatar'
import { AdminDetailsProps } from '@/lib/types'
import { HugeiconsIcon } from '@hugeicons/react'
import { Logout01Icon } from '@hugeicons/core-free-icons'
import { signOut } from "next-auth/react";

const LogoutButton = ({current_user}:{current_user:AdminDetailsProps | undefined}) => {
  return (
    <div className='flex items-center gap-5'>
      <ImageAvatar username={current_user?.userId.surName} image={current_user?.userId.profilePicture} color={current_user?.userId.placeholderColor}/>
      <button className='size-9 lg:size-10' onClick={() =>signOut()}>
        <HugeiconsIcon icon={Logout01Icon} className='lg:size-7 size-6'/>
      </button>
    </div> 
  )
}

export default LogoutButton