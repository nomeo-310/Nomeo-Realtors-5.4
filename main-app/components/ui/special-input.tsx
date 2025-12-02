'use client'

import { cn } from "@/lib/utils";
import { ArrowUpRight03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import InputWithIcon from "./input-with-icon";
import React from "react";


interface specialInputProps {
  icon: IconSvgElement;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onClick: () => void;
  placeholder: string;
  label: string;
  type: string;
} 
    
const SpecialInput = ({icon:Icon, value, setValue, onClick, placeholder, label, type}:specialInputProps) => {

  return (
    <React.Fragment>
      <div className="w-full flex flex-col gap-1">
        <span className='text-sm font-medium'>{label}</span>
        <div className='flex gap-1.5'>
          <InputWithIcon
            icon={Icon}
            className='bg-[#d4d4d4] rounded-lg dark:bg-neutral-600'
            inputClassName={cn('rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 rounded-r-none')}
            placeholder={placeholder}
            value={value}
            type={type}
            onChange={(e) => {
              const raw = e.target.value;
                if (type === 'tel') {
                  const digitsOnly = raw.replace(/\D/g, "");
                  setValue(digitsOnly)
                } else {
                  setValue(raw);
                }
              }
            }
          onPaste={(e) => {
            if (type === "tel") {
              const pasted = e.clipboardData.getData("Text");
                if (/\D/.test(pasted)) {
                  e.preventDefault();
                }
              }
            }
          }
          />
          <button type="button" className='lg:h-12 h-11 aspect-square rounded-lg flex items-center justify-center bg-secondary-blue rounded-l-none text-white' onClick={onClick}>
            <HugeiconsIcon icon={ArrowUpRight03Icon} className='rotate-45'/>
          </button>
        </div>
      </div>
    </React.Fragment>
  )
};

export default SpecialInput