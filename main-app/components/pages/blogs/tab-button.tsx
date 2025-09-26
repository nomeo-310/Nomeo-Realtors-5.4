'use client'

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

type buttonProps = {
  tab: string; 
  counts: number
  label: string;
  className?: string;
};

const TabButton = ({className, tab, counts, label}:buttonProps) => {
  const pathname = usePathname();

  return (
    <Link className={cn("cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-xs lg:text-sm uppercase flex items-center justify-center gap-4", tab === pathname ? 'border-b-2 border-secondary-blue font-semibold': 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70', className)} href={tab}>
      {label} { counts > 0 && <span className='tabular-nums text-sm bg-red-500 text-white size-6 rounded-full flex items-center justify-center'>{counts}</span>}
    </Link>
  )
};

export default TabButton;