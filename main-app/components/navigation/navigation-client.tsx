'use client'

import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { EntranceStairsIcon, Menu02Icon, Cancel01Icon, Notification02Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import { togglePage, useOpenMobileMenu } from '@/hooks/general-store'
import { ThemeToggler } from '../ui/theme-toggler'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOutUser } from './logout'
import { userProps } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const NavigationClient = ({ user }: { user: userProps }) => {

  const pathname = usePathname();

  const acceptableRoles = ['user', 'agent']

  const getDashboardPath = () => {
    if (user.role === 'agent') {
      return '/agent-dashboard'
    } else {
      return '/user-dashboard'
    }
  };

  const fetchData = async () => {
    const response = await axios.get('/api/notification/counts')

    if (response.status !== 200) {
      throw new Error('Something went wrong, try again later')
    }

    const data = response.data as { count: number }
    return data
  };

  const { setPage } = togglePage();

  const { data } = useQuery({
    queryKey: ['unread-notification-count'],
    queryFn: fetchData,
    refetchInterval: 5000,
  })

  const MobileNav = () => {
    const { isOpen, onClose, onOpen } = useOpenMobileMenu()

    const MobileNavLink = ({ label, path, onClick }: { label: string; path: string, onClick?:() =>void }) => {
      return (
        <Link
          href={path}
          className={cn('text-black/60 dark:text-white relative group', pathname === path && 'font-semibold')}
          onClick={() => {onClick && onClick(); onClose();}}
        >
          {label}
          <span className={cn('absolute -left-1 -bottom-[1px] w-full group-hover:opacity-100 lg:block h-[0.85px] bg-black dark:bg-white/80 hidden', pathname === path ? 'opacity-100' : 'opacity-0')} />
        </Link>
      )
    }

    return (
      <React.Fragment>
        <div className="h-full w-full lg:hidden flex items-center justify-between z-[80000]">
          <button onClick={() => onOpen()}>
            <HugeiconsIcon icon={Menu02Icon} className="size-7" />
          </button>
          <div className="flex items-center gap-2 text-sm text-secondary-blue font-semibold">
            <HugeiconsIcon icon={EntranceStairsIcon} />
            Nomeo Realtors
          </div>
          {user ? (
            <div className="flex items-center gap-2 p-1 pl-2">
              {data && data.count > 0 && (
                <Link href={getDashboardPath()}>
                  <HugeiconsIcon icon={Notification02Icon} className="text-red-600 fill-red-600 fill" />
                </Link>
              )}
              <LogOutUser user={user} notification={!!(data && data.count > 0)} />
            </div>
          ) : (
            <Link href={'/log-in'} className="text-sm px-4 md:px-5 py-2 rounded-lg border border-transparent bg-secondary-blue text-white">
              Log In
            </Link>
          )}
        </div>
        {isOpen && (
          <div className="fixed left-0 top-0 bg-black/30 w-full h-full slide-in-left overflow-hidden z-[80000]" onClick={() => onClose()}>
            <div className={cn('right-0 top-0 absolute z-[80000] w-full bg-white dark:bg-[#424242] h-full')}>
              <div className="w-full h-full pb-8 pl-4">
                <div className="w-full h-[60px] flex items-center pr-4 justify-between">
                  <button onClick={() => onClose()}>
                    <HugeiconsIcon icon={Cancel01Icon} className="size-7" />
                  </button>
                  <ThemeToggler />
                </div>
                <nav className="flex gap-6 flex-col pt-6">
                  <MobileNavLink label="Home" path="/" />
                  <MobileNavLink label="About Us" path="/about" />
                  <MobileNavLink label="Blogs" path="/blogs" />
                  <MobileNavLink label="For Sale" path="/for-sale" />
                  <MobileNavLink label="For Rent" path="/for-rent" />
                  {user && acceptableRoles.includes(user.role) && <MobileNavLink label="Dashboard" path={getDashboardPath()} />}
                  <MobileNavLink label="Contact Us" path="/contact-us" onClick={() => setPage('contact')} />
                </nav>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    )
  }

  const DesktopNav = () => {
    const DesktopNavLink = ({ label, path, onClick }: { label: string; path: string, onClick?:() =>void; }) => {
      return (
        <Link href={path} className={cn('text-black/60 dark:text-white relative group hover:text-secondary-blue', pathname === path && 'font-semibold text-secondary-blue')} onClick={() => {onClick && onClick()}}>
          {label}
          <span className={cn('absolute -left-1 -bottom-[1px] w-full group-hover:opacity-100 lg:block h-[0.85px] bg-secondary-blue hidden dark:bg-white/80', pathname === path ? 'opacity-100' : 'opacity-0')} />
        </Link>
      )
    }

    return (
      <div className="w-full h-full lg:flex items-center justify-between px-3 hidden border-b dark:border-b-0">
        <nav className="flex items-center gap-6">
          <ThemeToggler />
          <DesktopNavLink label="Home" path="/" />
          <DesktopNavLink label="About Us" path="/about" />
          <DesktopNavLink label="Blogs" path="/blogs" />
          <DesktopNavLink label="For Sale" path="/for-sale" />
          <DesktopNavLink label="For Rent" path="/for-rent" />
          {user && acceptableRoles.includes(user.role) && <DesktopNavLink label="Dashboard" path={getDashboardPath()} />}
        </nav>
        <div className="flex items-center gap-2 text-secondary-blue dark:text-white font-semibold">
          <HugeiconsIcon icon={EntranceStairsIcon} />
          Nomeo Realtors
        </div>
        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 p-1 pl-2">
              {data && data.count > 0 && (
                <Link href={getDashboardPath()}>
                  <HugeiconsIcon icon={Notification02Icon} className="text-red-600 fill-red-600 fill" />
                </Link>
              )}
              <LogOutUser user={user} notification={!!(data && data.count > 0)} />
            </div>
          ) : (
            <Link href={'/log-in'} className="px-4 md:px-5 py-2 border border-transparent bg-secondary-blue text-white rounded-lg">
              Log In
            </Link>
          )}
          <DesktopNavLink label="Contact Us" path="/contact-us" onClick={() => setPage('contact')}/>
        </nav>
      </div>
    )
  }

  return (
    <div className="fixed left-0 top-0 w-full lg:h-[70px] h-[60px] lg:px-8 px-3 bg-white dark:bg-[#424242] z-[4000]">
      <DesktopNav />
      <MobileNav />
    </div>
  )
}

export default NavigationClient