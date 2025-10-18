import { useContactAgentModal, useRentExtensionModal } from '@/hooks/general-store';
import { ClientProps } from '@/lib/types';
import React from 'react'
import { CountdownTimer } from './count-down-timer';
import { HugeiconsIcon } from '@hugeicons/react';
import { Bathtub01Icon, BedIcon, Location06Icon, MapsLocation01Icon, PlazaIcon, Toilet01Icon, User03Icon } from '@hugeicons/core-free-icons';

const AgentCard = ({client}:{client:ClientProps}) => {
  const { property } = client;

  const extensionModalProps = useRentExtensionModal();
  const contactModalProps = useContactAgentModal();

  const openExtensionModal = () => {
    extensionModalProps.setDetails(client);
    extensionModalProps.onOpen();
  };

  const openContactModal = () => {
    contactModalProps.setDetails(client);
    contactModalProps.onOpen();
  }

  return (
    <div className='w-full border-b dark:border-b-white/70 last:border-b-0 flex gap-3 flex-col py-3'>
      <div className="flex md:flex-row flex-col md:items-center gap-3 md:gap-0">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col gap-3">
            <div>
              <p className='lg:text-sm text-xs uppercase font-semibold mb-2'>{property.title}</p>
              <div className="flex gap-2 mb-2">
                <HugeiconsIcon icon={MapsLocation01Icon} className='size-5'/>
                <p className='lg:text-sm text-xs uppercase font-semibold'>{property.address}</p>
              </div>
              <div className="flex gap-2 w-full text-gray-600 flex-wrap">
                <div className="inline-flex items-center gap-2 border px-2 py-0.5 rounded-full">
                  <HugeiconsIcon icon={BedIcon} className='size-5'/>
                  <p className='text-sm font-medium'>{property.bedrooms} Bedrooms</p>
                </div>
                <div className="inline-flex items-center gap-2 border px-2 py-0.5 rounded-full">
                  <HugeiconsIcon icon={Bathtub01Icon} className='size-5'/>
                  <p className='text-sm font-medium'>{property.bathrooms} Bathrooms</p>
                </div>
                <div className="inline-flex items-center gap-2 border px-2 py-0.5 rounded-full">
                  <HugeiconsIcon icon={Toilet01Icon} className='size-5'/>
                  <p className='text-sm font-medium'>{property.toilets} Toilets</p>
                </div>
              </div>
              <div className='mt-2 flex flex-col gap-1'>
                <p className='text-sm font-medium'>Annual Rent: <span className='text-gray-600'>${property.annualRent}</span></p>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={User03Icon} className='size-5'/>
                  <p className='text-sm font-medium'>{property.agent.userId.surName} {property.agent.userId.lastName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={PlazaIcon} className='size-5'/>
                  <p className='text-sm font-medium'>{property.agent.agencyName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Location06Icon} className='size-5'/>
                  <p className='text-sm font-medium'>{property.agent.officeAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className='md:hidden'/>
        <CountdownTimer
          isUser 
          dateString={client.startDate}
          onOpenReminder={openExtensionModal}
          onOpenContact={openContactModal}
        />
      </div>
    </div>
  )
};

export default AgentCard