import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { Bathtub01Icon, BedIcon, CenterFocusIcon, Location06Icon } from '@hugeicons/core-free-icons';
import { formatMoney } from '@/utils/formatMoney';

type propertyCardProps = {
  propertyTag: string;
  propertyIdTag: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  mainImage: string;
  annualRent?: number;
  propertyPrice?: number;
  furnitureStatus: string;
}

const PropertyCard = (props:propertyCardProps) => {
  const {propertyIdTag, propertyTag, city, state, bedrooms, bathrooms, squareFootage, mainImage, furnitureStatus, propertyPrice, annualRent } = props;
  return (
    <Link href={`/apartment/${propertyIdTag}`} className='flex flex-col shadow-md rounded-xl overflow-hidden'>
      <div className='relative w-full h-[220px] overflow-hidden'>
        <span className='absolute top-3 left-3 rounded-lg bg-secondary-blue text-white px-3 py-2 text-sm z-[400]'>
          {propertyTag === 'for-rent' ? 'For Rent' : 'For Sale'}
        </span>
        <div className="absolute left-0 top-0 w-full h-full bg-black/40 z-50"/>
        <Image src={mainImage} fill alt={propertyIdTag} priority className='w-full'/>
      </div>
      <div className='p-3 text-black/60 dark:text-white/80 dark:bg-[#424242]'>
        <div className="w-full flex justify-between items-center">
          <div className='flex items-center gap-1'>
            <HugeiconsIcon icon={Location06Icon} className='size-4'/>
            <p className='text-sm capitalize'>{city}, {state} state.</p>
          </div>
          { propertyTag === 'for-rent' ?
            <p className='font-medium text-black dark:text-white'>
              &#x20A6;{formatMoney(annualRent)}/<span className='text-sm'>per annum</span>
            </p> : 
            <p className='font-medium text-black dark:text-white'>
              &#x20A6;{formatMoney(propertyPrice)}
            </p>
          }
        </div>
        <div className="flex items-center justify-between  mt-2 pt-2 border-t dark:border-t-white/70">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center text-sm">
              <HugeiconsIcon icon={BedIcon} className='size-4'/>
              {bedrooms}
            </div>
            <div className="flex gap-1 items-center text-sm">
              <HugeiconsIcon icon={Bathtub01Icon} className='size-4'/>
              {bathrooms}
            </div>
            <div className="flex gap-1 items-center text-sm">
              <HugeiconsIcon icon={CenterFocusIcon} className='size-4'/>
              {squareFootage} sqm
            </div>
          </div>
          <p className='text-sm font-medium text-black dark:text-white capitalize'>{furnitureStatus}</p>
        </div>
      </div>
    </Link>
  )
}

export default PropertyCard