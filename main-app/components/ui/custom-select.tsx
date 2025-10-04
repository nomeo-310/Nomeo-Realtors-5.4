'use client'

import React from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Props = {
  data: string[]
  placeholder: string
  value:string
  onChange: (value:string) => void;
  height?: string;
  disabled?:boolean;
  style?:string;
  placeholderStyle?: string;
}

const CustomSelect = ({height, data, placeholder, value, onChange, disabled, style, placeholderStyle}:Props) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full text-sm lg:text-base bg-inherit rounded-lg ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-none focus:ring-offset-0 ", height ? height : 'h-10', style)} disabled={disabled}>
        <SelectValue placeholder={placeholder} className={cn("capitalize text-sm lg:text-base text-black/60", placeholderStyle && placeholderStyle)}/>
      </SelectTrigger>
      <SelectContent className="rounded">
        <SelectGroup className="z-[800]">
          {data && data.length > 0 && data.map((item:string, index:number) => (
            <SelectItem value={item} className="text-sm lg:text-base rounded" key={index}>{item.split('-').join(' ')}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default CustomSelect;