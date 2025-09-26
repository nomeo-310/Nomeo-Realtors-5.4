import Image from 'next/image';
import React from 'react'
import { formatMoney } from '@/utils/formatMoney';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Bathtub01Icon, BedIcon, Cancel01Icon, CenterFocusIcon, Delete01Icon, Link05Icon, Location06Icon, Menu02Icon, PlusSignIcon, ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';

type propertyCardProps = {
  _id: string;
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
  facilityStatus: string;
  userId: string;
  agentId: string;
  hideProperty: boolean
}

const PropertyCardWithAdminClearance = (props:propertyCardProps) => {
  const {_id, propertyIdTag, propertyTag, city, state, bedrooms, bathrooms, squareFootage, mainImage, propertyPrice, annualRent, facilityStatus, userId, agentId, hideProperty } = props;

  const [showMenu, setShowMenu] = React.useState(false);

  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const triggerButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const openMenu = () => {
    setShowMenu((prev) => !prev)
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const openItem = () => {
    closeMenu();
  };

  // Close the menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node) && triggerButtonRef.current && !triggerButtonRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, menuRef, triggerButtonRef]);

  const PropertyAction = () => {
    return (
      <div className='absolute right-2 top-10 z-[400]  rounded-md flex flex-col bg-white p-1 dark:bg-[#424242]' ref={menuRef}>
        <Link href={`/apartment/${propertyIdTag}`} className='text-sm px-1 py-1 hover:bg-gray-200 dark:hover:text-black/50 rounded-md capitalize flex items-center gap-4' onClick={openItem}>
          <HugeiconsIcon icon={Link05Icon} className='size-4'/> view
        </Link>
        <button className='text-sm px-1 py-1 hover:bg-gray-200 dark:hover:text-black/50 rounded-md capitalize flex items-center gap-4' onClick={openItem}>
          <HugeiconsIcon icon={PlusSignIcon} className='size-4'/>
          Add to Feature
        </button>
        <button className='text-sm px-1 py-1 hover:bg-gray-200 dark:hover:text-black/50 rounded-md capitalize flex items-center gap-4' onClick={() => {}}>
          {hideProperty ? <HugeiconsIcon icon={ViewIcon} className='size-4'/> : <HugeiconsIcon icon={ViewOffSlashIcon} className='size-4'/>}
          {hideProperty ? 'unhide' : 'hide'}
        </button>
        <button className='text-sm px-1 py-1 hover:bg-gray-200 dark:hover:text-black/50 rounded-md capitalize flex items-center gap-4' onClick={() => {}}>
          <HugeiconsIcon icon={Cancel01Icon} className='size-4'/>
          { propertyTag === 'for-rent' ? 'cancel rentout' : 'cancel sale' }
        </button>
        <button className='text-sm px-1 py-1 hover:bg-gray-200 dark:hover:text-black/50 rounded-md capitalize flex items-center gap-4' onClick={() => {}}>
          <HugeiconsIcon icon={Delete01Icon} className='size-4'/>
          delete
        </button>
      </div>
    )
  }

  return (
    <div className='flex flex-col shadow-md rounded-xl overflow-hidden'>
      <div className='relative w-full h-[220px] overflow-hidden'>
        <div className="absolute left-0 top-0 w-full h-full bg-black/40 z-50"/>
        <Image src={mainImage} fill alt={propertyIdTag} priority className='w-full'/>
        <button className='absolute top-3 right-3 text-white z-[400]' onClick={openMenu} ref={triggerButtonRef}>
          <HugeiconsIcon icon={Menu02Icon}/>
        </button>
        { showMenu && <PropertyAction/> }
      </div>
      <div className='p-3 text-black/60 dark:text-white/80 dark:bg-[#424242]'>
        <div className="w-full flex md:justify-between md:items-center flex-col md:flex-row">
          <div className='flex items-center gap-1'>
            <HugeiconsIcon icon={Location06Icon} className='size-4'/>
            <p className='text-sm capitalize'>{city}, {state} state.</p>
          </div>
          { propertyTag === 'for-rent' ?
            <p className='font-medium text-black dark:text-white ml-auto md:ml-0'>
              &#x20A6;{formatMoney(annualRent)}/<span className='text-sm'>per annum</span>
            </p> : 
            <p className='font-medium text-black dark:text-white ml-auto md:ml-0'>
              &#x20A6;{formatMoney(propertyPrice)}
            </p>
          }
        </div>
        <div className="flex md:items-center md:justify-between flex-col md:flex-row  mt-2 pt-2 border-t dark:border-t-white/70">
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
          <p className='text-sm font-medium text-black dark:text-white capitalize ml-auto md:ml-0'>{facilityStatus}</p>
        </div>
      </div>
    </div>
  )
}

export default PropertyCardWithAdminClearance