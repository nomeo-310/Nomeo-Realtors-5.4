'use client'
import React from 'react'
import CustomSelect from "@/components/ui/custom-select";
import { Search01Icon } from '@hugeicons/core-free-icons';
import { Input } from "@/components/ui/input";
import { location } from '@/assets/constants/locations';
import { HugeiconsIcon } from '@hugeicons/react';

const HomeSearchBar = () => {
  const states = location.map((item) => item.state);
  const [selectedStates, setSelectedStates] = React.useState('');
  const lgas = location.find((item) => item.state === selectedStates);
  const lga = lgas ? lgas.lgas : [];
  const [selectedLga, setSelectedLga] = React.useState('');
  const [minimumRent, setMinimumRent] = React.useState(0);
  const [maximumRent, setMaximumRent] = React.useState(0);

  return (
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
            value={minimumRent || ''}
            onChange={(evt) => setMinimumRent(parseInt(evt.target.value) || 0)}
          />
        </div>
      </div>
      <div className="flex gap-1.5 flex-col">
        <p className="text-sm ml-2">Maximum amount in (&#x20A6;)</p>
        <div className="w-full">
          <Input className='outline-none focus-within:ring-0 focus-visible:ring-0 focus:outline-0 text-sm h-10 dark:placeholder:text-white placeholder:text-black border-black/80'
            placeholder='enter maximum amount'
            value={maximumRent || ''}
            onChange={(evt) => setMaximumRent(parseInt(evt.target.value) || 0)}
          />
        </div>
      </div>
      <div className="flex gap-1.5 flex-col">
        <p className="text-sm opacity-0">Label</p>
        <div className="w-full h-10 bg-secondary-blue text-white rounded-lg flex items-center justify-center gap-3 border-transparent">
          <HugeiconsIcon icon={Search01Icon}/>
          <p>Search</p>
        </div>
      </div>
    </div>
  )
}

export default HomeSearchBar