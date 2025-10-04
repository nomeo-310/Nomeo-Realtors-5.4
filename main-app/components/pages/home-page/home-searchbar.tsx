'use client'
import React from 'react'
import CustomSelect from "@/components/ui/custom-select";
import { Search01Icon } from '@hugeicons/core-free-icons';
import { Input } from "@/components/ui/input";
import { location } from '@/assets/constants/locations';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const HomeSearchBar = () => {
  const states = location.map((item) => item.state);
  const [apartmentType, setApartmentType] = React.useState<"for-rent" | "for-sale">("for-rent");

  const [selectedStates, setSelectedStates] = React.useState('');
  const lgas = location.find((item) => item.state === selectedStates);
  const lga = lgas ? lgas.lgas : [];
  const [selectedLga, setSelectedLga] = React.useState('');
  const [minimumAmount, setMinimumAmount] = React.useState(0);
  const [maximumAmount, setMaximumAmount] = React.useState(0);

  const router = useRouter();

  const resetField = () => {
    setSelectedStates('');
    setSelectedLga('');
    setMinimumAmount(0);
    setMaximumAmount(0);
  }


  const handleSearch = () => {
    if (!selectedStates || !selectedLga || minimumAmount === 0 || maximumAmount === 0) {
      toast.error("Please fill all fields");
      return;
    };

    let newUrl;

    if (apartmentType === 'for-rent') {
      newUrl = `/for-rent?state=${selectedStates}&city=${selectedLga}&minimumAmount=${minimumAmount}&maximumAmount=${maximumAmount}`
    } else {
      newUrl = `/for-sale?state=${selectedStates}&city=${selectedLga}&minimumAmount=${minimumAmount}&maximumAmount=${maximumAmount}`
    }

    resetField()
    router.push(newUrl);
  };

  return (
    <div className='w-full'>
      <div className="h-9 lg:h-10 w-full mb-2 flex items-center gap-5">
        <button className={cn("h-full rounded-lg lg:w-[150px] w-[100px] flex items-center justify-center cursor-pointer text-sm lg:text-base", apartmentType === 'for-rent' ? 'bg-secondary-blue text-white' : 'bg-white dark:bg-[#424242]')} onClick={() => setApartmentType('for-rent')}>For Rent</button>
        <button className={cn("h-full rounded-lg lg:w-[150px] w-[100px] flex items-center justify-center cursor-pointer text-sm lg:text-base", apartmentType === 'for-sale' ? 'bg-secondary-blue text-white' : 'bg-white dark:bg-[#424242]')} onClick={() => setApartmentType('for-sale')}>For Sale</button>
      </div>
      <div className="w-full lg:h-24 h-auto lg:bg-white bg-white/70 dark:bg-[#424242]/70 lg:dark:bg-[#424242] rounded-xl p-4 grid lg:grid-cols-5 md:grid-cols-4 grid-cols-1 lg:gap-4 gap-2">
        <div className="flex gap-1.5 flex-col">
          <p className="text-sm ml-2">Select State</p>
          <div className="w-full">
            <CustomSelect
              placeholder="select state of intention"
              data={states}
              value={selectedStates}
              onChange={setSelectedStates}
              style="border-black/80"
            />
          </div>
        </div>
        <div className="flex gap-1.5 flex-col">
          <p className="text-sm ml-2">Select State</p>
          <div className="w-full">
            <CustomSelect
              placeholder="select LGA of intention"
              data={lga}
              value={selectedLga}
              onChange={setSelectedLga}
              disabled={lga.length === 0}
              style="border-black/80"
            />
          </div>
        </div>
        <div className="flex gap-1.5 flex-col">
          <p className="text-sm ml-2">Minimum amount in (&#x20A6;)</p>
          <div className="w-full">
            <Input className='outline-none focus-within:ring-0 focus-visible:ring-0 focus:outline-0 text-sm h-10 dark:placeholder:text-white placeholder:text-black border-black/80'
              placeholder='enter minimum amount'
              value={minimumAmount || ''}
              onChange={(evt) => setMinimumAmount(parseInt(evt.target.value) || 0)}
            />
          </div>
        </div>
        <div className="flex gap-1.5 flex-col">
          <p className="text-sm ml-2">Maximum amount in (&#x20A6;)</p>
          <div className="w-full">
            <Input className='outline-none focus-within:ring-0 focus-visible:ring-0 focus:outline-0 text-sm h-10 dark:placeholder:text-white placeholder:text-black border-black/80'
              placeholder='enter maximum amount'
              value={maximumAmount || ''}
              onChange={(evt) => setMaximumAmount(parseInt(evt.target.value) || 0)}
            />
          </div>
        </div>
        <div className="flex gap-1.5 md:gap-0 lg:gap-1.5 flex-col">
          <p className="text-sm lg:block hidden opacity-0">Label</p>
          <button className="text-sm lg:text-base w-full h-10 bg-secondary-blue text-white rounded-lg flex items-center justify-center gap-3 border-transparent cursor-pointer" onClick={handleSearch}>
            <HugeiconsIcon icon={Search01Icon} className='size-5 lg:size-6'/>
            Search
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeSearchBar