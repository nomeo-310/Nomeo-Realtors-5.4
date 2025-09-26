'use client'

import ProfileSkeletons from '@/components/skeletons/profile-skeleton'
import ErrorState from '@/components/ui/error-state'
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { User03Icon, PlazaIcon, EditUser02Icon, Mail01Icon, IdIcon, Location06Icon, MapsIcon, SmartPhone01Icon, SecurityCheckIcon, UserCheck02Icon, TelephoneIcon  } from '@hugeicons/core-free-icons';
import { userProfile } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProfileClient = () => {

  const fetchData = async () => {
    const response = await axios.get('/api/user/profile');
  
    if (response.status !== 200) {
      throw new Error('Something went wrong, try again later');
    }
  
    const data = response.data as userProfile;
    return data;
  };

  const { data:profile, status } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchData,
  });

  const ProfileItem = ({icon:Icon, text, textStyle}:{icon:IconSvgElement, text:string, textStyle?:string}) => {
    return (
      <div className='flex items-center gap-2 text-black/50 dark:text-white/70 ml-1'>
        <HugeiconsIcon icon={Icon} className='lg:size-6 size-5 dark:text-white text-black'/>
        <p className={cn('text-sm lg:text-base font-medium', textStyle)}>{text}</p>
      </div>
    )
  };

  const ProfileContent = () => {
    if (status === 'pending') {
      return <ProfileSkeletons/>;
    };

    if (status === 'error') {
      return <ErrorState className='w-full' message='Error occured while loading your profile. Please refresh the page.'/>
    };

    return (
      <AnimatePresence>
        <motion.div className='flex flex-col md:gap-6 lg:gap-8 gap-4' initial = {{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}>
          <div className="flex items-center gap-4">
            <h2 className='lg:text-sm text-xs font-semibold'>PERSONAL DETAILS</h2>
            <hr className='flex-1 dark:border-white/70'/>
          </div>
          <div className="flex gap-4 md:gap-6  lg:gap-8 flex-col md:flex-row">
            <div className="md:size-44 lg:size-48 xl:size-52 size-36 relative rounded-full overflow-hidden mx-auto md:mx-0">
              <div className="absolute w-full h-full bg-black/30 z-[100]"/>
              <Image src={profile?.profilePicture || '/default_user.png'} alt='profile_picture' fill priority  className='object-cover object-center'/>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <h2 className='lg:text-sm text-xs font-semibold mb-1'>BASIC DETAILS</h2>
                <ProfileItem icon={User03Icon} text={`${profile?.surName} ${profile?.lastName}`}/>
                <ProfileItem icon={SmartPhone01Icon} text={`${profile?.phoneNumber} , ${profile?.additionalPhoneNumber}`}/>
                <ProfileItem icon={Mail01Icon} text={profile?.email || ''}/>
                <ProfileItem icon={Location06Icon} text={`${profile?.city}, ${profile?.state}`}/>
                <ProfileItem icon={UserCheck02Icon} text={profile?.userVerified ? 'User Details Verified' : 'User Details Unverified'}/>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className='lg:text-sm text-xs font-semibold mb-1'>AGENCY DETAILS</h2>
                <ProfileItem icon={IdIcon} text={profile?.agentId.licenseNumber || ''} textStyle='capitalize'/>
                <ProfileItem icon={PlazaIcon} text={profile?.agentId.agencyName || ''}/>
                <ProfileItem icon={TelephoneIcon} text={profile?.agentId.officeNumber || ''}/>
                <ProfileItem icon={MapsIcon} text={profile?.agentId.officeAddress || ''} textStyle='capitalize'/>
                <ProfileItem icon={SecurityCheckIcon} text={profile?.agentId.verificationStatus || 'Unverified'} textStyle='capitalize'/>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div className='flex flex-col md:gap-6 lg:gap-8 gap-4' initial = {{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.0 }}>
          <div className="flex items-center gap-4">
            <h2 className='lg:text-sm text-xs font-semibold'>PERSONAL BIO</h2>
            <hr className='flex-1 dark:border-white/70'/>
          </div>
          <p className='text-sm lg:text-base text-black/50 dark:text-white/70 text-justify'>{profile?.bio}</p>
        </motion.div>
        <motion.div className="flex items-center gap-3" initial = {{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }}>
          <hr className='flex-1 dark:border-white/70'/>
          <h2 className='text-sm'><span className='font-semibold lg:text-sm text-xs'>JOINED:</span> {formatDate(profile?.agentId.createdAt || '')}</h2>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className='w-full lg:w-[80%] xl:w-[70%] md:w-[80%] h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Profile</h2>
        <Link href={'./settings'} type="button" className='text-sm py-1.5 lg:py-2 px-4 bg-black dark:bg-[#424242] text-white rounded-lg flex items-center gap-2'>
          <HugeiconsIcon icon={EditUser02Icon} className='md:size-5 size-4'/>
          Edit Profile
        </Link>
      </div>
      <ProfileContent/>
    </div>
  )
}

export default ProfileClient