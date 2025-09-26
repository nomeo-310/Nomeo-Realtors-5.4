'use client'

import React from 'react'
import Modal from '../ui/modal'
import { useDeletePropertiesModal } from '@/hooks/general-store'
import { userDetails } from '@/lib/types'
import InputWithIcon from '../ui/input-with-icon'
import { Mail01Icon } from '@hugeicons/core-free-icons';
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { LoadingButton } from '../ui/loading-button'
import { deleteAllApartments } from '@/actions/property-actions'

const DeleteProperty = ({user}:{user:userDetails}) => {
  const { isOpen, onClose } = useDeletePropertiesModal();
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
    const [accountEmail, setAccountEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const deleteAllProperties = async() => {
      const values = { email: accountEmail, path: pathname };

      setIsLoading(true);
      await deleteAllApartments(values).then((response) => {

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
      <div className='mt-5'>
        <InputWithIcon
          icon={Mail01Icon}
          type='email'
          className='bg-[#d4d4d4] rounded-lg dark:bg-[#424242]'
          placeholder={'Enter your email address'}
          inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
          value={accountEmail}
          onChange={(e) => setAccountEmail(e.target.value)}
        />
        <div className="mt-5 w-full flex items-center justify-between">
          <button type="button" className='py-2 px-4 rounded-full border-black/50 border dark:border-white/70 text-sm' onClick={() => {setLevel('initiate'); onClose();}}>Cancel</button>
          <LoadingButton
            label='Delete Properties'
            loadingLabel='Deleting Properties...'
            onClick={() =>deleteAllProperties()}
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
      onClose={() => {setLevel('initiate'); onClose();}}
      title={level === 'initiate' ? 'Delete Properties' : 'Confirm Deletion'}
      description={level === 'initiate' ? 'Are you sure you want to delete all uploaded properties? This means you will loose all your data and this action cannot be reversed.' : 'To continue with this process, add ypur email address'}
      useCloseButton
      width="lg:w-[550px] xl:w-[550px] md:w-[500px]"
    >
      {level === 'initiate' ? <Initiate/> : <Start/>}
    </Modal>
  )
}

export default DeleteProperty