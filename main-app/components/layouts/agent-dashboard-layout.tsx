import { LogOut } from "@/components/navigation/logout";
import { AgentDashBoardSideBar } from "@/components/pages/dashboard/dashboard-sidebar";
import { ThemeToggler } from "@/components/ui/theme-toggler";
import React from "react";
import BreadCrumbs from "./bread-crumbs";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/user-actions";
import { getAgentVerificationStatus } from "@/actions/agent-action";

const AgentDashboardLayout = async ({children,}: {children: React.ReactNode;}) => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('log-in')
  };

  const isAgent = current_user.role === 'agent' && current_user.agentId !== null && current_user.agentId !== undefined;

  let status;
  if (isAgent && current_user.agentId) {
    status = await getAgentVerificationStatus(current_user.agentId);
  }

  const isPending = status?.isPending ?? false;

  return (
    <div className='w-full min-h-screen flex flex-col'>
      {/* Fixed Header */}
      <header className='fixed left-0 top-0 w-full lg:h-[70px] h-[60px] lg:px-8 px-4 bg-white dark:bg-[#424242] z-[4000]'>
        <div className="w-full h-full md:border-b dark:border-b-0 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <ThemeToggler />
            <BreadCrumbs />
          </div>
          {current_user && <LogOut user={current_user} />}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 lg:pt-[70px] pt-[60px] lg:px-8 px-4">
        {/* Scrollable Sidebar */}
        <aside className="lg:w-[220px] md:w-[60px] w-[50px] sticky top-[70px] self-start max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="py-4 lg:py-6 lg:pr-4 pr-2">
            <AgentDashBoardSideBar 
              isCollaborator={current_user?.blogCollaborator} 
              isPending={isPending} 
              showSavedBlogs={current_user.showBookmarkedBlogs} 
              showSavedApartments={current_user.showBookmarkedApartments} 
              showLikedApartments={current_user.showLikedApartments} 
              showLikedBlogs={current_user.showLikedBlogs} 
            />
          </div>
        </aside>

        {/* Page Content */}
        <section className="flex-1 md:border-l dark:border-l-white/70 lg:pl-6 pl-3 lg:py-6 py-4 min-h-[calc(100vh-70px)] lg:pr-0 pr-2">
          {children}
        </section>
      </main>
    </div>
  );
};

export default AgentDashboardLayout;