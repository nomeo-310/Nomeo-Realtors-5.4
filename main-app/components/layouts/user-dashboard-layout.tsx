import { LogOut } from '@/components/navigation/logout'
import { UserDashBoardSideBar } from '@/components/pages/dashboard/dashboard-sidebar'
import { HugeiconsIcon } from '@hugeicons/react'
import { EntranceStairsIcon } from '@hugeicons/core-free-icons'
import { ThemeToggler } from '@/components/ui/theme-toggler'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import { getCurrentUser } from '@/actions/user-actions'

const UserDashboardLayout = async ({children}:{children:React.ReactNode}) => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('log-in')
  };

  return (
    <div className='w-full'>
      <div className='fixed left-0 top-0 w-full lg:h-[70px] h-[60px] lg:px-8 px-4 bg-white dark:bg-[#424242] z-[4000]'>
        <div className="w-full h-full border-b dark:border-b-0 flex items-center justify-between px-3">
          <div className="flex items-center gap-5">
            <ThemeToggler/>
            <Link href={'/'} className="flex items-center gap-2">
              <HugeiconsIcon icon={EntranceStairsIcon} className='size-5 md:size-6'/>
              <p className='text-sm md:text-base'>Nomeo Realtors</p>
            </Link>
          </div>
          {current_user && <LogOut user={current_user}/>}
        </div>
      </div>
      <div className="w-full flex lg:px-8 px-4">
        <div className="lg:w-[220px] md:w-[60px] w-[50px] sticky lg:top-[70px] top-[60px] h-full py-4 lg:py-6 lg:pr-6 pr-3 md:pr-4">
          <UserDashBoardSideBar isCollaborator={current_user?.blogCollaborator}/>
        </div>
        <div className="flex-1 min-h-screen lg:pt-[70px] pt-[60px] border-l dark:border-l-white/70 pl-3 lg:pl-6 lg:py-5 md:pl-4 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default UserDashboardLayout