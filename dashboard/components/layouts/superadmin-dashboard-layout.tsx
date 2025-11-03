import { HugeiconsIcon } from '@hugeicons/react'
import { EntranceStairsIcon } from '@hugeicons/core-free-icons'
import { ThemeToggler } from '@/components/ui/theme-toggler'
import React from 'react'
import { ImageAvatar } from '../ui/image-avatar'
import { SuperAdminDashBoardSideBar } from '../dashboard-features/dashboard-sidebar'
import BreadCrumbs from '../ui/bread-crumbs'

const SuperAdminDashboardLayout = async ({children}:{children:React.ReactNode}) => {
  return (
    <div className='w-full min-h-screen flex flex-col'>
      {/* Fixed Header */}
      <header className='fixed left-0 top-0 w-full lg:h-[70px] h-[60px] lg:px-8 px-4 bg-white dark:bg-[#424242] z-[4000]'>
        <div className="w-full h-full border-b dark:border-b-0 flex items-center justify-between px-3">
          <div className="flex items-center gap-5">
            <ThemeToggler/>
            <BreadCrumbs/>
          </div>
          <div className="md:flex items-center gap-2 hidden">
            <HugeiconsIcon icon={EntranceStairsIcon} className='size-5 md:size-6'/>
            <p className='text-sm md:text-base font-semibold'>Nomeo Realtors Dashboard</p>
          </div>
          <ImageAvatar username='onome_310'/>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 lg:pt-[70px] pt-[60px] lg:px-8 px-4">
        {/* Scrollable Sidebar */}
        <aside className="lg:w-[220px] md:w-[60px] w-[50px] sticky top-[70px] self-start max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="py-4 lg:py-6 lg:pr-4 pr-2">
            <SuperAdminDashBoardSideBar/>
          </div>
        </aside>

        {/* Page Content */}
        <section className="flex-1 border-l dark:border-l-white/70 lg:pl-6 pl-3 lg:py-6 py-4 min-h-[calc(100vh-70px)] lg:pr-0 pr-2">
          {children}
        </section>
      </main>
    </div>
  )
}

export default SuperAdminDashboardLayout