'use client'

import React from "react";
import { cn } from "@/lib/utils";
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconSvgElement
  iconClassName?: string
  inputClassName?: string
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(({
  inputClassName, 
  iconClassName, 
  className, 
  type, 
  disabled, 
  icon: Icon, 
  ...props
}, ref) => {
  const [inputType, setInputType] = React.useState(type);
  const [isClient, setIsClient] = React.useState(false);

  // Ensure we're on client to avoid hydration mismatch
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const togglePasswordVisibility = () => {
    setInputType(prev => prev === 'password' ? 'text' : 'password');
  };

  // Use type for non-password inputs, inputType for password inputs
  const finalType = type === 'password' ? inputType : type;

  return (
    <div className={cn('w-full relative', className)}>
      <input 
        type={finalType}
        className={cn(
          'lg:h-12 h-11 rounded-lg bg-inherit w-full p-2.5 focus-visible:ring-0 focus-visible:ring-none focus-visible:ring-offset-0 outline-none lg:text-base text-sm',
          Icon ? 'pl-10' : '',
          type === 'password' ? 'pr-10' : '',
          inputClassName
        )} 
        disabled={disabled} 
        {...props} 
        ref={ref} 
        autoComplete="off"
      />
      
      {/* Left Icon */}
      {Icon && (
        <HugeiconsIcon 
          icon={Icon}  
          className={cn(
            'absolute left-2.5 top-1/2 -translate-y-1/2 size-5 md:size-6', 
            iconClassName
          )} 
        />
      )}
      
      {/* Password Toggle Button */}
      {type === 'password' && isClient && (
        <button 
          type="button" 
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className="absolute right-2.5 top-1/2 -translate-y-1/2"
          key={inputType} // Add key to prevent hydration issues
        >
          <HugeiconsIcon 
            icon={inputType === 'password' ? ViewIcon : ViewOffSlashIcon}
            className={cn(
              'cursor-pointer size-5 md:size-6',
              disabled && 'opacity-50 cursor-not-allowed',
              iconClassName
            )}
          />
        </button>
      )}
    </div>
  );
});

CustomInput.displayName = "CustomInput";

export default CustomInput;