'use client';

import React from 'react';
import Modal from '../ui/modal';
import { useStartRentOutModal } from '@/hooks/general-store';
import InputWithIcon from '../ui/input-with-icon';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, UserAdd01Icon, User03Icon } from '@hugeicons/core-free-icons';
import Image from 'next/image';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ErrorState from '../ui/error-state';
import EmptyState from '../ui/empty-state';
import { initiateRentOut } from '@/actions/rentout-actions';

type clientDetail = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string;
};

const StartRentOut = () => {
  const { isOpen, onClose } = useStartRentOutModal();

  const StartRentOutForm = () => {

    const AddClientCard = ({ client }: { client: clientDetail }) => {

      const data = localStorage.getItem('rent-data');

      const initiateData = {
        userId: client._id,
        email: client.email,
        agentId: data ? JSON.parse(data).userId : '',
        agentUserId: data ? JSON.parse(data).agentUserId : '',
        propertyIdTag: data ? JSON.parse(data).propertyId : '',
      };

      const handleRentout = async () => {
        await initiateRentOut(initiateData)
        .then((response) => {
          if (response.status === 200) {
            localStorage.removeItem('rent-data');
            toast.success(response.message);
            onClose();
          } else {
            toast.error(response.message);
          }
        })
      };

      return (
        <div className="border-b last-of-type:border-b-0 px-1 py-2 flex gap-2 lg:items-center">
          <div className="relative size-9 lg:size-10 border rounded-full overflow-hidden flex items-center justify-center flex-none">
            <Image
              src={client.profilePicture || '/images/default_user.png'}
              alt={client.firstName}
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col flex-1">
            <div className="text-sm">
              {client.firstName} {client.lastName}
            </div>
            <div className="flex flex-col lg:flex-row lg:gap-3">
              <div className="text-sm">{client.email}</div>
              <div className="text-sm">{client.phoneNumber}</div>
            </div>
          </div>
          <div>
            <button
              onClick={handleRentout}
              type="button"
              className="flex items-center md:gap-2 text-sm border lg:px-3 lg:py-2 rounded-lg p-2"
            >
              <HugeiconsIcon icon={UserAdd01Icon} className="size-4 lg:size-5" />
              <span className="hidden md:block">Rent Out</span>
            </button>
          </div>
        </div>
      );
    };

    const [queryText, setQueryText] = React.useState('');
    const [startSearch, setStartSearch] = React.useState(false);

    const fetchData = async (): Promise<clientDetail[]> => {
      const response = await axios.post('/api/user/search-users', {
        queryText: queryText,
      });

      if (response.status !== 200) {
        throw new Error('Something went wrong, try again later');
      }

      setStartSearch(false);
      const data = response.data as clientDetail[];
      return data;
    };

    const { data, status } = useQuery<clientDetail[]>({
      queryKey: ['users', queryText],
      queryFn: fetchData,
      enabled: startSearch && queryText.trim() !== '',
    });

    const searchedItems = data || [];

    const SearchedUsers = () => {

      if (status === 'pending' && startSearch) {
        return (
          <div className="w-full flex items-center justify-center py-5">
            <Loader2 className="animate-spin" />
          </div>
        );
      }

      if (status === 'error') {
        setQueryText('');
        
        return (
          <div className="w-full flex items-center justify-center py-5">
            <ErrorState message={`An error occurred while searching for "${queryText}"`} className='w-fit'/>
          </div>
        );
      }

      if (status === 'success' && searchedItems.length === 0) {
        setQueryText('');

        return (
          <div className="w-full flex items-center py-5">
            <EmptyState message={`No users found for "${queryText}"`} className='w-fit'/>
          </div>
        );
      }

      return (
        <div className="flex flex-col mt-3">
          { searchedItems && searchedItems.length > 0 && searchedItems.map((item: clientDetail) => (
              <AddClientCard key={item._id} client={item} />
            ))}
        </div>
      );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStartSearch(true);
    };

    return (
      <div className="w-full">
        <form className="flex items-center gap-2 border rounded-lg" onSubmit={handleSubmit}>
          <InputWithIcon
            icon={User03Icon}
            placeholder="Search User Details"
            inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
            className="flex-1"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          <button className="px-2.5" type="submit">
            <HugeiconsIcon icon={Search01Icon} className='md:size-6 size-5' />
          </button>
        </form>
        <SearchedUsers />
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Initiate Apartment Rent-Out"
      description="Nice work agent!. This step means you are ready to rent out the apartment because the client is satisfied with the inspection"
      useCloseButton
      width="lg:w-[600px] xl:w-[700px] md:w-[550px]"
    >
      <StartRentOutForm />
    </Modal>
  );
};

export default StartRentOut;