'use client'

import React from "react";
import { cn } from "@/lib/utils";
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

interface customInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconSvgElement
  iconClassName?: string
  inputClassName?:string
}

const CustomInput = React.forwardRef<HTMLInputElement, customInputProps>(({inputClassName, iconClassName, className, type, disabled, icon:Icon, ...props}, ref) => {
  const [inputType, setInputType] = React.useState('password');


  return (
    <div className={cn('w-full relative', className)}>
      <input type={ type === 'password' ? inputType : type } className={cn('lg:h-12 h-11 rounded-lg bg-inherit w-full p-2.5 focus-visible:ring-0 focus-visible:ring-none focus-visible:ring-offset-0 outline-none lg:text-base text-sm', Icon ? 'pl-10' : '', inputClassName)} disabled={disabled} {...props} ref={ref} autoComplete="off"/>
      {Icon && <HugeiconsIcon icon={Icon}  className={cn('absolute left-2.5 top-1/2 -translate-y-1/2 size-5 md:size-6', iconClassName)} />}
      { type === 'password' && 
        <React.Fragment>
          { inputType === 'password' ? (
            <button type="button" onClick={() => setInputType('text')}>
              <HugeiconsIcon icon={ViewIcon} className={cn('cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 md:size-6 size-5', iconClassName)}/>
            </button>
          ) : (
            <button type="button" onClick={() => setInputType('password')}>
              <HugeiconsIcon icon={ViewOffSlashIcon} className={cn('cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 size-5 md:size-6', iconClassName)}/>
            </button>
          )}
        </React.Fragment>
      }
    </div>
  )
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;