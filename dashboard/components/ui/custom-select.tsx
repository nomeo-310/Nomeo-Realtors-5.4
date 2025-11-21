// 

// components/ui/custom-select.tsx
"use client"

import React from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Props = {
  data?: string[] // For simple string arrays
  options?: { label: string; value: string }[] // For object arrays
  placeholder: string
  value: string
  onChange: (value: string) => void;
  height?: string;
  disabled?: boolean;
  style?: string;
  placeholderStyle?: string;
  itemText?: string;
}

const CustomSelect = ({
  height, 
  data, 
  options, 
  placeholder, 
  value, 
  onChange, 
  disabled, 
  style, 
  placeholderStyle, 
  itemText
}: Props) => {
  
  // Use options if provided, otherwise use data
  const items = options || (data ? data.map(item => ({ label: item, value: item })) : [])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full text-sm lg:text-base bg-inherit rounded-lg ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-none focus:ring-offset-0 ", placeholderStyle, height ? height : 'h-10', style)} disabled={disabled}>
        <SelectValue placeholder={placeholder} className={cn("capitalize text-sm lg:text-base text-black/60", placeholderStyle)}/>
      </SelectTrigger>
      <SelectContent className="rounded z-[80000000]">
        <SelectGroup className="z-[800]">
          {items && items.length > 0 && items.map((item, index: number) => (
            <SelectItem 
              value={item.value} 
              className={cn("text-sm lg:text-base rounded", itemText)} 
              key={index}
            >
              {item.label.split('-').join(' ')}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default CustomSelect;