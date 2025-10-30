'use client'

import React from 'react'
import { Inspection } from '@/lib/types';
import { nairaSign } from '@/lib/utils';
import {  Calendar03Icon, Link05Icon, Mail01Icon, MapsIcon, SmartPhone01Icon, Timer01Icon, User03Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import Link from 'next/link';
import CustomSelect from '@/components/ui/custom-select';
import { useToggleInspectionStatus } from '@/hooks/use-toggle-inspection-status';
import { usePathname } from 'next/navigation';
import { useToggleInspectionVerdict } from '@/hooks/use-toggle-inspection-verdict';
import { useStartRentOutModal } from '@/hooks/general-store';


  const InspectionCard = ({item}:{item:Inspection}) => {

    const path = usePathname();
    const { onOpen } = useStartRentOutModal();

    const { mutate: toggleStatus } = useToggleInspectionStatus();
    const { mutate: toggleVerdict } = useToggleInspectionVerdict();

    const handleStatusChange = (newStatus: string) => {
      toggleStatus({
        id: item._id,
        status: newStatus,
        path: path
      });
    }

    const handleVerdictChange = (newVerdict: string) => {
      toggleVerdict({
        id: item._id,
        verdict: newVerdict,
        path: path
      });
    };

    const initiateRentOut = () => {
      const rentOutData = {
        userId: item.agent._id,
        agentUserId: item.agent.userId._id,
        propertyId: item.apartment.propertyIdTag,
        propertyType: item.apartment.propertyTag
      }

      localStorage.setItem('rent-data', JSON.stringify(rentOutData))
      onOpen();
    };

    return (
      <div className='border-b dark:border-b-white/70 last:border-b-0 py-2 lg:py-3'>
        <div className="flex items-center gap-3 text-sm font-semibold mb-2"><HugeiconsIcon icon={Calendar03Icon} className='size-5'/>{item.date}</div>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-2 lg:gap-3">
          <div className='w-full flex flex-col gap-1.5 items-start'>
            <div className="w-fit text-sm font-semibold">Client Details</div>
            <div className='flex items-center gap-3 text-sm lg:text-base'>
              <div className="rounded-lg flex items-center relative size-12 lg:size-16">
                <Image src={item.user.profilePicture} className='w-full h-full rounded-lg' fill alt={'user_profile_pix'} />
              </div>
              <div className="flex flex-col">
                <div className="font-semibold flex items-center gap-2"><HugeiconsIcon icon={User03Icon} className='size-4 md:size-5'/>{item.user.surName} {item.user.lastName}</div>
                <div className="text-sm flex items-center gap-2"><HugeiconsIcon icon={Mail01Icon} className='size-4 md:size-5'/>{item.user.email}</div>
                <div className="text-sm flex items-center gap-2"><HugeiconsIcon icon={SmartPhone01Icon} className='size-4 md:size-5'/>{item.user.phoneNumber}</div>
              </div>
            </div>
          </div>
          <div className='w-full flex flex-col gap-1.5 items-start'>
            <div className="w-fit text-sm font-semibold">{item.apartment.propertyTag === 'for-rent' ? 'Apartment Details' : 'Property Details'}</div>
            <div className='flex flex-col'>
              <div className='flex items-center gap-3 text-sm lg:text-base'>
                <HugeiconsIcon icon={MapsIcon} className='md:size-5 size-4'/>
                {item.apartment.address}, {item.apartment.state}.
              </div>
              <div className='flex items-center gap-3 text-sm lg:text-base'>
                <HugeiconsIcon icon={Wallet01Icon} className='size-4 md:size-5'/>
                {nairaSign}{item.apartment.propertyTag === 'for-rent' ? item.apartment.annualRent.toLocaleString() : item.apartment.propertyPrice.toLocaleString()}
                {item.apartment.propertyTag === 'for-rent' && <span className='text-xs lg:text-sm -ml-2'>per annum</span>}
              </div>
              <Link href={`/apartment/${item.apartment.propertyIdTag}`} className='text-sm text-secondary-blue hover:underline flex items-center gap-3'>
                <HugeiconsIcon icon={Link05Icon} className='size-4 md:size-5'/>
                View full {item.apartment.propertyTag === 'for-rent' ? 'apartment' : 'property' } details
              </Link>
            </div>
          </div>
        </div>
        {!(item.verdict === 'accepted' && item.status === 'completed') ? (
          <div className="mt-3 flex items-center gap-3">
            <div className="w-1/2 md:w-52 flex flex-col gap-1">
              <p className='lg:text-sm text-xs font-semibold'>Inspection Status</p>
              <CustomSelect
                style='w-full rounded-md'
                placeholder='Select status'
                value={item.status}
                onChange={(value) => handleStatusChange(value)}
                data={['pending', 'completed', 'uncompleted']}
              />
            </div>
            <div className="w-1/2 md:w-52 flex flex-col gap-1">
              <p className='lg:text-sm text-xs font-semibold'>Final Client Verdict</p>
              <CustomSelect
                style='w-full rounded-md'
                placeholder='Select verdicts'
                value={item.verdict}
                onChange={(value) => handleVerdictChange(value)}
                data={['pending', 'accepted', 'rejected']}
              />
            </div>
          </div>) : (
            <div className="mt-3 flex items-center justify-end w-full">
              <button className='flex items-center gap-3 px-3 py-1.5 border rounded-md text-sm lg:text-base text-white bg-secondary-blue border-secondary-blue' onClick={initiateRentOut}>
                <HugeiconsIcon icon={Timer01Icon} className='size-4 lg:size-5'/>
                Initiate {item.apartment.propertyTag === 'for-rent' ? 'Rent-Out' : 'Sell-Out'}
              </button>
            </div>
          )
        }
      </div>
    )
  }

export default InspectionCard