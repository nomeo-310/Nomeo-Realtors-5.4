'use client'

import { location } from '@/assets/constants/locations';
import PropertyCard from '@/components/cards/property-card';
import PropertySkeletons from '@/components/skeletons/property-skeleton';
import CustomSelect from '@/components/ui/custom-select';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import Pagination from '@/components/ui/pagination';
import { apiRequestHandler } from '@/lib/apiRequestHandler';
import { parseRoomToiletCount } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';

interface User {
  _id: string;
  email: string;
  placeholderColor: string;
  lastName: string;
  profilePicture: string;
  surName: string;
}

interface Agent {
  _id: string;
  userId: User;
  licenseNumber: string;
}

interface ApartmentImages {
  _id: string;
  images: string[];
}

interface Property {
  _id: string;
  propertyTag: string;
  propertyTypeTag: string;
  propertyIdTag: string;
  city: string;
  state: string;
  propertyPrice: number;
  annualRent: number;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  squareFootage: number;
  apartmentImages: ApartmentImages;
  agent: Agent;
  facilityStatus: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProperties: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PropertyResponse {
  properties: Property[];
  pagination: Pagination;
}

const ForSaleClient = () => {
  const params = useSearchParams();

  const initialPage = params.get('page') ? Number(params.get('page')) : 1;
  const state = params.get('state') || '';
  const city = params.get('city') || '';
  const minPrice = params.get('minimumPrice') ? Number(params.get('minimumPrice')) : 0;
  const maxPrice = params.get('maximumPrice') ? Number(params.get('maximumPrice')) : 0;
  const rooms = params.get('numberOfRooms') ? Number(params.get('numberOfRooms')) : 0;
  const toilets = params.get('numberOfToilets') ? Number(params.get('numberOfToilets')) : 0;

  const [currentPage, setCurrentPage] = React.useState(initialPage);

  const queryParams = React.useMemo(() => {
    const searchParams = new URLSearchParams();
    if (state) searchParams.set('state', state);
    if (city) searchParams.set('city', city);
    if (minPrice > 0) searchParams.set('minimumPrice', String(minPrice));
    if (maxPrice > 0) searchParams.set('maximumPrice', String(maxPrice));
    if (rooms > 0) searchParams.set('numberOfRooms', String(rooms));
    if (toilets > 0) searchParams.set('numberOfToilets', String(toilets));
    if (currentPage > 1) searchParams.set('page', String(currentPage));
    return searchParams.toString();
  }, [state, city, minPrice, maxPrice, rooms, toilets, currentPage]);

  const hasFilters = state || city || minPrice > 0 || maxPrice > 0 || rooms > 0 || toilets > 0;

  const url = queryParams ? `/api/property/for-sale?${queryParams}` : `/api/property/for-sale`;
  const request = () => axios.get(url);

  const { data, status } = useQuery({
    queryKey: ['for-sale', queryParams],
    queryFn: () => apiRequestHandler(request),
    refetchOnWindowFocus: false,
  });

  const responseData = data?.data as PropertyResponse
  const allSale = responseData?.properties || [];
  const allSalePagination = responseData?.pagination || null;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const SearchForm = () => {
    const params = useSearchParams();
    const router = useRouter();

    const isLoading = false;
    

    const initialState = params.get('state') || '';
    const initialCity = params.get('city') || '';
    const initialMiniPrice = params.get('minimumAmount') ? Number(params.get('minimumAmount')) : 0;
    const initialMaxiPrice = params.get('maximumAmount') ? Number(params.get('maximumAmount')) : 0;
    const initialRooms = params.get('numberOfRooms') || '';
    const initialToilets = params.get('numberOfToilets') || '';

    const hasPartialSearch = !!initialState || !!initialCity || initialMiniPrice > 0 || initialMaxiPrice > 0;

    const states = location.map((item) => item.state);

    const [state, setState] = React.useState(initialState);
    const [city, setCity] = React.useState(initialCity);
    const [numberOfRooms, setNumberOfRooms] = React.useState(initialRooms); 
    const [numberOfToilets, setNumberOfToilets] = React.useState(initialToilets); 
    const [minimumPrice, setMinimumPrice] = React.useState(initialMiniPrice);
    const [maximumPrice, setMaximumPrice] = React.useState(initialMaxiPrice);

    React.useEffect(() => {
      setState(params.get('state') || '');
    }, [params.get('state')]);

    React.useEffect(() => {
      setCity(params.get('city') || '');
    }, [params.get('city')]);

    React.useEffect(() => {
      setNumberOfRooms(params.get('numberOfRooms') || '');
    }, [params.get('numberOfRooms')]);

    React.useEffect(() => {
      setNumberOfToilets(params.get('numberOfToilets') || '');
    }, [params.get('numberOfToilets')]);

    React.useEffect(() => {
      setMinimumPrice(params.get('minimumAmount') ? Number(params.get('minimumAmount')) : 0);
    }, [params.get('minimumAmount')]);

    React.useEffect(() => {
      setMaximumPrice(params.get('maximumAmount') ? Number(params.get('maximumAmount')) : 0);
    }, [params.get('maximumAmount')]);

    const lgas = location.find((item) => item.state === state);
    const lga = lgas ? lgas.lgas : [];

    const nairaSign:string = String.fromCodePoint(8358);

    const roomList = [
      'one bedroom',
      'two bedroom',
      'three bedroom',
      'four bedroom',
      'five bedroom',
    ];

    const toiletList = [
      'one toilet',
      'two toilets',
      'three toilets',
      'four toilets',
      'five toilets'
    ];

    const resetField = () => {
      setState('');
      setCity('');
      setNumberOfRooms('');
      setNumberOfToilets('');
      setMinimumPrice(0);
      setMaximumPrice(0);      
    };

    const updateSearchParams = () => {
      const searchParams = new URLSearchParams();

      
      if (state) searchParams.set('state', state);
      if (city) searchParams.set('city', city);
      if (minimumPrice > 0) searchParams.set('minimumPrice', String(minimumPrice));
      if (maximumPrice > 0) searchParams.set('maximumPrice', String(maximumPrice));
      
      
      const roomsCount = parseRoomToiletCount(numberOfRooms);
      const toiletsCount = parseRoomToiletCount(numberOfToilets);
      
      if (roomsCount > 0) searchParams.set('numberOfRooms', String(roomsCount));
      if (toiletsCount > 0) searchParams.set('numberOfToilets', String(toiletsCount));

      const queryString = searchParams.toString();
      const newUrl = `/for-rent${queryString ? `?${queryString}` : ''}`;

      resetField();
      router.push(newUrl);
    };

    const getFilledFieldsCount = () => {
      let count = 0;
      if (state) count++;
      if (city) count++;
      if (minimumPrice > 0) count++;
      if (maximumPrice > 0) count++;
      if (parseRoomToiletCount(numberOfRooms) > 0) count++;
      if (parseRoomToiletCount(numberOfToilets) > 0) count++;
      return count;
    };

    const handleSearch = () => {
      const filledCount = getFilledFieldsCount();
      
      if (filledCount < 2) {

        toast.error('Please fill at least 2 fields for better search results.');
        return;
      }

      updateSearchParams();
    };

    const handleClearAll = () => {
      resetField();
      router.push('/for-rent');
    };

  const shouldHideField = (fieldKey: string) => {
    if (!hasPartialSearch) return false;

    if (['state', 'city', 'minimumAmount', 'maximumAmount'].includes(fieldKey)) {
      return !!params.get(fieldKey as any);
    }

    return false;
  };

    return (
      <React.Fragment>
       <div className={`w-full transition-opacity duration-300 ${shouldHideField('state') ? 'opacity-50 pointer-events-none' : ''}`}>
          <CustomSelect
            placeholder="select state"
            data={states}
            value={state}
            onChange={setState}
            style="border-black/80"
          />
          {shouldHideField('state') && <p className="text-xs text-gray-500 mt-1">Locked from your initial search</p>}
        </div>
        <div className={`w-full transition-opacity duration-300 ${shouldHideField('city') ? 'opacity-50 pointer-events-none' : ''}`}>
          <CustomSelect
            placeholder="select city"
            data={lga}
            value={city}
            onChange={setCity}
            disabled={lga.length === 0 || shouldHideField('city')}
            style="border-black/80"
          />
          {shouldHideField('city') && <p className="text-xs text-gray-500 mt-1">Locked from your initial search</p>}
        </div>
        <div className={`w-full transition-opacity duration-300 ${shouldHideField('minimumRent') ? 'opacity-50 pointer-events-none' : ''}`}>
          <Input className='outline-none focus-within:ring-0 focus-visible:ring-0 focus:outline-0 text-sm h-10 dark:placeholder:text-white placeholder:text-black border-black/80'
            placeholder={`enter minimum price (${nairaSign})`}
            value={minimumPrice || ''}
            onChange={(evt) => setMinimumPrice(parseInt(evt.target.value) || 0)}
            disabled={shouldHideField('minimumAmount')}
          />
          {shouldHideField('minimumAmount') && <p className="text-xs text-gray-500 mt-1">Locked from your initial search</p>}
        </div>
        <div className={`w-full transition-opacity duration-300 ${shouldHideField('maximumRent') ? 'opacity-50 pointer-events-none' : ''}`}>
          <Input className='outline-none focus-within:ring-0 focus-visible:ring-0 focus:outline-0 text-sm h-10 dark:placeholder:text-white placeholder:text-black border-black/80'
            placeholder={`enter maximum price (${nairaSign})`}
            value={maximumPrice || ''}
            onChange={(evt) => setMaximumPrice(parseInt(evt.target.value) || 0)}
            disabled={shouldHideField('maximumAmount')}
          />
          {shouldHideField('maximumAmount') && <p className="text-xs text-gray-500 mt-1">Locked from your initial search</p>}
        </div>
        <div className="w-full">
          <CustomSelect
            placeholder="select rooms"
            data={roomList}
            value={numberOfRooms}
            onChange={setNumberOfRooms}
            style="border-black/80"
          />
        </div>
        <div className="w-full">
          <CustomSelect
            placeholder="select toilets"
            data={toiletList}
            value={numberOfToilets}
            onChange={setNumberOfToilets}
            style="border-black/80"
          />
        </div>
        <div className="mt-6 space-y-2">
          <LoadingButton 
            isLoading={isLoading} 
            disabled={isLoading || getFilledFieldsCount() < 2} 
            className='w-full rounded-lg bg-secondary-blue text-white text-sm lg:tex-base h-10' 
            onClick={handleSearch}
            label={hasPartialSearch ? 'Refine Search' : 'Search'}
            loadingLabel='Searching...'
          />
          <button 
            onClick={handleClearAll}
            className="w-full h-10 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            Clear All
          </button>
        </div>
      </React.Fragment>
    )
  };

  const AllSaleApartment = () => {

    if (status === 'pending') {
      return <PropertySkeletons use_three/>
    }

    if (status === 'error') {
      return <ErrorState message='Something went wrong!! Refresh page' />
    }

    if (status === 'success' && hasFilters && allSale.length === 0) {
      return <EmptyState message='No property for your search parameters. Clear and retry.' />
    }

    if (status === 'success' && allSale.length === 0) {
      return <EmptyState message='No property for sale at the moment' />
    }

    return (
      <div className='flex flex-col gap-10'>
        <div className="grid xl:grid-cols-3 xl:gap-3 md:grid-cols-2 md:gap-x-4 md:gap-y-6 lg:gap-y-4 grid-cols-1 gap-5">
          {allSale.map((property: Property) => (
            <PropertyCard
              key={property._id}
              propertyTag={property.propertyTag}
              propertyIdTag={property.propertyIdTag}
              city={property.city}
              state={property.state}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              mainImage={property.apartmentImages.images[0]}
              annualRent={property.annualRent}
              propertyPrice={property.propertyPrice}
              squareFootage={property.squareFootage}
              furnitureStatus={property.facilityStatus}
              placeholderColor={property.agent.userId.placeholderColor}
              email={property.agent.userId.email}
              profileImage={property.agent.userId.profilePicture}
            />
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={allSalePagination.totalPages} onPageChange={handlePageChange} />
      </div>
    )
  };

  return (
    <div className='pt-[60px] lg:pt-[70px] xl:px-16 md:px-10 px-6'>
      <div className="relative w-full xl:h-[450px] md:h-[350px] h-[250px] rounded-xl overflow-hidden mt-5">
        <div className='bg-black/20 absolute left-0 top-0 w-full h-full z-[400]'/>
        <Image src={'/images/sale_banner.jpg'} alt='about_banner' fill className='object-cover object-top'/>
        <div className='flex flex-col w-full absolute left-0 top-0 h-full text-white xl:p-12 md:p-10 p-6 justify-end z-[500]'>
          <h1 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand relative'>Apartments & Properties For Sale</h1>
        </div>
      </div>
      <div className='flex flex-col md:flex-row lg:gap-5 xl:gap-6 gap-4 md:py-10 lg:py-12 py-8'>
        <div className="top-[78px] h-full lg:w-[22%] xl:w-[20%] md:w-[30%] flex flex-col lg:gap-3 gap-2.5 md:sticky md:top-[78px]">
          <SearchForm/>
        </div>
        <div className='lg:w-[78%] md:w-[70%] xl:w-[80%] w-full'>
         <AllSaleApartment/>
        </div>
      </div>
    </div>
  )
}

export default ForSaleClient