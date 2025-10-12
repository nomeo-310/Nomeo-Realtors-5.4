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
    <React.Fragment>
      <div className="w-full">
        <div className="fixed left-0 top-0 w-full lg:h-[70px] h-[60px] lg:px-8 px-4 bg-white dark:bg-[#424242] z-[4000]">
          <div className="w-full h-full md:border-b dark:border-b-0 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <ThemeToggler />
              <BreadCrumbs />
            </div>
            {current_user && <LogOut user={current_user} />}
          </div>
        </div>
        <div className="w-full flex lg:px-8 px-4">
          <div className="lg:w-[220px] md:w-[60px] w-[50px] sticky lg:top-[70px] top-[60px] h-full py-4 lg:py-5 lg:pr-6 pr-3 md:pr-4">
            <AgentDashBoardSideBar isCollaborator={current_user?.blogCollaborator} isPending={isPending} showSavedBlogs={current_user.showBookmarkedBlogs} showSavedApartments={current_user.showBookmarkedApartments} showLikedApartments={current_user.showLikedApartments} showLikedBlogs={current_user.showLikedBlogs} />
          </div>
          <div className="flex-1 min-h-screen lg:pt-[90px] pt-[76px] md:border-l dark:border-l-white/70 pl-3 lg:pl-6 lg:py-5 md:pl-4 py-4">
            {children}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AgentDashboardLayout;
