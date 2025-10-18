import { useContactUserModal, useRenewalReminderModal } from '@/hooks/general-store';
import { ClientProps } from '@/lib/types';
import Image from 'next/image'
import React from 'react'
import { CountdownTimer } from './count-down-timer';

const ClientCard = ({client}:{client:ClientProps}) => {
  const { user } = client;

  const reminderModalProps = useRenewalReminderModal();
  const contactModalProps = useContactUserModal();

  const openReminderModal = () => {
    reminderModalProps.setDetails(client);
    reminderModalProps.onOpen();
  };

  const openContactModal = () => {
    contactModalProps.setDetails(client);
    contactModalProps.onOpen();
  }

  return (
    <div className='w-full border-b dark:border-b-white/70 last:border-b-0 flex gap-3 flex-col py-3'>
      <div className="flex md:flex-row flex-col md:items-center gap-3 md:gap-0">
        <div className="flex items-center gap-3 flex-1">
          <div className="size-[90px] md:size-[100px] rounded-full relative overflow-hidden">
            <Image src={user.profilePicture} alt='client_image' className='rounded-full object-cover' fill priority />
          </div>
          <div>
            <p className='lg:text-sm text-xs uppercase font-semibold'>{user.surName} {user.lastName}</p>
            <p className='text-sm font-medium'>{user.username}</p>
            <p className='text-sm font-medium'>{user.phoneNumber}, {user.additionalPhoneNumber}</p>
            <p className='text-sm font-medium'>{user.email}</p>
          </div>
        </div>
        <CountdownTimer
          isUser={false} 
          dateString={client.startDate}
          onOpenReminder={openReminderModal}
          onOpenContact={openContactModal}
        />
      </div>
    </div>
  )
};

export default ClientCard