'use client';

import React from 'react';
import Modal from '../ui/modal';
import { useStartRentOutModal } from '@/hooks/general-store';
import InputWithIcon from '../ui/input-with-icon';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, UserAdd01Icon, User03Icon } from '@hugeicons/core-free-icons';
import Image from 'next/image';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ErrorState from '../ui/error-state';
import EmptyState from '../ui/empty-state';
import { initiateRentOut } from '@/actions/rentout-actions';
import { initiateSellOut } from '@/actions/sellout-actions';

type clientDetail = {
  _id: string;
  email: string;
  surName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string;
};

const StartRentOut = () => {
  const { isOpen, onClose } = useStartRentOutModal();
  const data = localStorage.getItem('rent-data');

  const modalData = (() => {
    try {
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to parse modal data:', error);
      return null;
    }
  })();

  const isRent = modalData?.propertyType === 'for-rent';
  const actionText = isRent ? 'rent out' : 'sell out';
  const title = modalData ? `Initiate ${isRent ? 'Apartment Rent-Out' : 'Property Sell-Out'}` : 'Initiate Property Action';
  const description = `Nice work agent! This step means you are ready to ${actionText} the property because the client is satisfied with the inspection`;

  const StartRentOutForm = () => {
    const [queryText, setQueryText] = React.useState('');
    const [hasSearched, setHasSearched] = React.useState(false);
    const [initiatingClientId, setInitiatingClientId] = React.useState<string | null>(null);

    const queryClient = useQueryClient();

    const fetchData = async (): Promise<clientDetail[]> => {
      const response = await axios.post('/api/user/search-users', { queryText: queryText,});

      if (response.status !== 200) {
        throw new Error('Something went wrong, try again later');
      }

      const data = response.data as clientDetail[];
      return data;
    };

    const { data, status, refetch } = useQuery<clientDetail[]>({
      queryKey: ['users', queryText],
      queryFn: fetchData,
      enabled: false, // We'll trigger manually
    });

    const searchedItems = data || [];

    const AddClientCard = ({ client }: { client: clientDetail }) => {

      const handleRentout = async () => {
        setInitiatingClientId(client._id);

        try {
          // Get and validate data from localStorage
          const storedData = localStorage.getItem('rent-data');
          if (!storedData) {
            toast.error('No rental data found');
            setInitiatingClientId(null);
            return;
          }

          const parsedData = JSON.parse(storedData);
          
          // Validate required fields
          if (!parsedData.userId || !parsedData.propertyId) {
            toast.error('Incomplete rental data');
            setInitiatingClientId(null);
            return;
          }

          const initiateData = {
            userId: client._id,
            email: client.email,
            agentId: parsedData.userId,
            agentUserId: parsedData.agentUserId,
            propertyIdTag: parsedData.propertyId,
            propertyTag: parsedData.propertyType,
          };

          // Determine which API to call
          let response;
          if (parsedData.propertyType === 'for-rent') {
            response = await initiateRentOut(initiateData);
          } else {
            response = await initiateSellOut(initiateData);
          }

          if (response.status === 200) {
            toast.success(response.message);
            localStorage.removeItem('rent-data');
            queryClient.invalidateQueries({ queryKey: ['added-properties'] });
            onClose();
          } else {
            toast.error(response.message || 'Operation failed');
          }
        } catch (error) {
          console.error('Rentout error:', error);
          toast.error(error instanceof SyntaxError 
            ? 'Invalid data format' 
            : 'Failed to initiate rent out'
          );
        } finally {
          setInitiatingClientId(null);
        }
      };

      const isInitiating = initiatingClientId === client._id;

      return (
        <div className="border-b last-of-type:border-b-0 px-1 py-2 flex gap-2 lg:items-center">
          <div className="relative size-9 lg:size-10 border rounded-full overflow-hidden flex items-center justify-center flex-none">
            <Image
              src={client.profilePicture || '/images/default_user.png'}
              alt={client.surName}
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col flex-1">
            <div className="text-sm">
              {client.surName} {client.lastName}
            </div>
            <div className="flex flex-col lg:flex-row lg:gap-3">
              <div className="text-sm">{client.email}</div>
              <div className="text-sm">{client.phoneNumber}</div>
            </div>
          </div>
          <div>
            <button
              disabled={isInitiating}
              onClick={handleRentout}
              type="button"
              className="flex items-center md:gap-2 text-sm border lg:px-3 lg:py-2 rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInitiating ? (
                <Loader2 className="size-5 animate-spin"/>
              ) : (
                <HugeiconsIcon icon={UserAdd01Icon} className="size-4 lg:size-5" />
              )}
              <span className="hidden md:block">
                {isInitiating ? 'Initiating...' : (isRent ? 'Initiate Rent Out': 'Initiate Sell Out')}
              </span>
              <span className="block md:hidden">
                {isInitiating ? 'Initiating' : 'Initiate'}
              </span>
            </button>
          </div>
        </div>
      );
    };

    const SearchedUsers = () => {
      // Don't show anything until user has searched
      if (!hasSearched) {
        return null;
      }

      if (status === 'pending') {
        return (
          <div className="w-full flex items-center justify-center py-5">
            <Loader2 className="animate-spin" />
          </div>
        );
      }

      if (status === 'error') {
        return (
          <div className="w-full flex items-center justify-center py-5">
            <ErrorState 
              message={`An error occurred while searching for "${queryText}"`} 
              className='w-fit'
            />
          </div>
        );
      }

      if (status === 'success' && searchedItems.length === 0) {
        return (
          <div className="w-full flex items-center py-5">
            <EmptyState 
              message={`No users found for "${queryText}"`} 
              className='w-fit'
            />
          </div>
        );
      }

      return (
        <div className="flex flex-col mt-3">
          {searchedItems.map((item: clientDetail) => (
            <AddClientCard key={item._id} client={item} />
          ))}
        </div>
      );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (queryText.trim() === '') return;
      
      setHasSearched(true);
      await refetch();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQueryText(e.target.value);
      // Reset search state if user clears the input
      if (e.target.value.trim() === '') {
        setHasSearched(false);
      }
    };

    return (
      <div className="w-full">
        <div className='md:text-sm text-xs text-red-600 font-semibold mb-4 lg:mb-5'>Inorder to initiate either sellout or rentout, input name of the client and press enter. Make sure it is the name of the user that inspected the property and actually wants it.</div>
        <form className="flex items-center gap-2 border rounded-lg" onSubmit={handleSubmit}>
          <InputWithIcon
            icon={User03Icon}
            placeholder="Search User Details"
            inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
            className="flex-1"
            value={queryText}
            onChange={handleInputChange}
          />
          <button 
            className="px-2.5" 
            type="submit"
            disabled={queryText.trim() === ''}
          >
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
      title={title}
      description={description}
      useCloseButton
      width="lg:w-[600px] xl:w-[700px] md:w-[550px]"
    >
      <StartRentOutForm />
    </Modal>
  );
};

export default StartRentOut;