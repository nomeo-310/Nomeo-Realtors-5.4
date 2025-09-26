'use client'

import React from 'react'
import Modal from '../ui/modal'
import { useTransferAccountModal } from '@/hooks/general-store'
import InputWithIcon from '../ui/input-with-icon'
import { Mail01Icon } from '@hugeicons/core-free-icons'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { LoadingButton } from '../ui/loading-button'
import { transferAccount } from '@/actions/user-actions'

const TransferAccount = () => {
  const { isOpen, onClose } = useTransferAccountModal();
  const [level, setLevel] = React.useState<'initiate' | 'start'>('initiate');

  const pathname = usePathname();

  const Initiate = () => {
    return (
      <div className="mt-5 w-full flex items-center justify-between">
        <button type="button" className='py-2 px-4 rounded-full border-black/50 border dark:border-white/70 text-sm cursor-pointer' onClick={onClose}>Cancel</button>
        <button type="button" className='py-2 px-4 rounded-full bg-black text-white text-sm border-black border cursor-pointer' onClick={() => setLevel('start')}>Proceed</button>
      </div>
    )
  };

    const Start = () => {
      const [oldEmail, setOldEmail] = React.useState('');
      const [newEmail, setNewEmail] = React.useState('');
      const [isLoading, setIsLoading] = React.useState(false);
  
      const transferAgentAccount = async() => {
        const values = { oldEmail: oldEmail, newEmail: newEmail, path: pathname };
  
        setIsLoading(true);
        await transferAccount(values).then((response) => {
  
          if (response && response.status === 200) {
            toast.success(response.message);
            onClose();
          };
          if (response && response.status !== 200) {
            toast.error(response.message)
          };
        }).catch((error) => {
          console.log(error);
          toast.error('Something went wrong, try again later')
        }).finally(() => setIsLoading(false))
      };
  
      return (
        <div className='mt-5 flex flex-col gap-3'>
          <InputWithIcon
            icon={Mail01Icon}
            type='email'
            className='bg-[#d4d4d4] rounded-lg dark:bg-[#424242]'
            placeholder={'Enter your own email address'}
            inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
            value={oldEmail}
            onChange={(e) => setOldEmail(e.target.value)}
          />
          <InputWithIcon
            icon={Mail01Icon}
            type='email'
            className='bg-[#d4d4d4] rounded-lg dark:bg-[#424242]'
            placeholder={'Enter new account email address'}
            inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <div className="mt-5 w-full flex items-center justify-between">
            <button type="button" className='py-2 px-4 rounded-full border-black/50 border dark:border-white/70 text-sm' onClick={() => {setLevel('initiate'); onClose();}}>Cancel</button>
            <LoadingButton
              label='Transfer Account'
              loadingLabel='Transferring Account...'
              onClick={() =>transferAgentAccount()}
              isLoading={isLoading}
              className='py-2 px-4 rounded-full bg-black text-white text-sm border-black border'
              type='button'
            />
          </div>
        </div>
      )
    }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={level === 'initiate' ? 'Transfer Account' : 'Transfer Confirmation'}
      description={level === 'initiate' ? 'Are you sure you want to transfer this account? This means you will loose data and information but will be transferred to the new account' : ''}
      useCloseButton
      width="lg:w-[550px] xl:w-[550px] md:w-[500px]"
    >
      { level === 'initiate' ? <Initiate/> : <Start/> }
    </Modal>
  )
}

export default TransferAccount