"use client";

import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type dashboardLinkProps = {
  icon: any;
  text: string;
  path: string;
  notification: number;
  currentPage?: string;
};

const DashboardLink = ({ icon: Icon, text, path, notification }: dashboardLinkProps) => {
  const pathname = usePathname();

  const getIsActive = () => {
    if (pathname === path) return true;

    if (text === "Verifications") {
      const superAdminBaseLink = "/superadmin-dashboard/verifications";
      const adminBaseLink = "/admin-dashboard/verifications";
      const creatorBaseLink = "/creator-dashboard/verifications";
      return pathname.startsWith(superAdminBaseLink) || pathname.startsWith(adminBaseLink) || pathname.startsWith(creatorBaseLink) ;
    }

    if (text === "Pendings") {
      const superAdminBaseLink = "/superadmin-dashboard/pendings";
      const adminBaseLink = "/admin-dashboard/pendings";
      const creatorBaseLink = "/creator-dashboard/pendings";
      return pathname.startsWith(superAdminBaseLink) || pathname.startsWith(adminBaseLink) || pathname.startsWith(creatorBaseLink) ;
    }

    if (text === "Transactions") {
      const superAdminBaseLink = "/superadmin-dashboard/transactions";
      const adminBaseLink = "/admin-dashboard/transactions";
      const creatorBaseLink = "/creator-dashboard/transactions";
      return pathname.startsWith(superAdminBaseLink) || pathname.startsWith(adminBaseLink) || pathname.startsWith(creatorBaseLink) ;
    }

    if (text === "Created Blogs" || text === "Blogs") {
      const superAdminBaseLink = "/superadmin-dashboard/created-blogs";
      const adminBaseLink = "/admin-dashboard/created-blogs";
      const creatorBaseLink = "/creator-dashboard/created-blogs";
      return pathname.startsWith(superAdminBaseLink) || pathname.startsWith(adminBaseLink) || pathname.startsWith(creatorBaseLink) ;
    }
    
    if (text === "Create Blog") {
      const superAdminBaseLink = "/superadmin-dashboard/create-blog";
      const adminBaseLink = "/admin-dashboard/create-blog";
      const creatorBaseLink = "/creator-dashboard/create-blog";
      return pathname.startsWith(superAdminBaseLink) || pathname.startsWith(adminBaseLink) || pathname.startsWith(creatorBaseLink) ;
    }

    return false;
  };

  const isActive = getIsActive();

  return (
    <React.Fragment>
      <Link
        prefetch
        href={path}
        className={cn(
          "group hidden lg:py-3 w-full lg:flex items-center lg:gap-2 rounded-r-lg lg:pl-3 hover:bg-secondary-blue/30 dark:hover:bg-secondary-blue hover:rounded-lg",
          isActive &&
            "border-primary-blue dark:bg-secondary-blue bg-secondary-blue/30 border-l-[4px] hover:rounded-l-none"
        )}
      >
        <HugeiconsIcon icon={Icon} className={cn("size-6")} />
        <h3
          className={cn(
            "hidden lg:block text-black/60 dark:text-white/80 dark:group-hover:text-white",
            isActive && "font-semibold text-[#424242] dark:text-white"
          )}
        >
          {text}
        </h3>
        {notification > 0 && (
          <span
            className={cn(
              "size-6 rounded-full tabular-nums bg-red-500 text-white flex items-center justify-center text-sm ml-3"
            )}
          >
            {notification}
          </span>
        )}
      </Link>
      <Link
        href={path}
        className={cn(
          "relative aspect-square flex lg:hidden rounded-lg lg:pl-3 hover:bg-secondary-blue/30 dark:hover:bg-secondary-blue hover:rounded-lg items-center justify-center",
          isActive && "dark:bg-secondary-blue bg-secondary-blue/30"
        )}
      >
        <HugeiconsIcon icon={Icon} className={cn("size-6")} />
        <h3 className="hidden lg:block">{text}</h3>
        {notification > 0 && (
          <span className="absolute right-1.5 top-1 size-4 rounded-full tabular-nums bg-red-500 text-white flex items-center justify-center text-xs">
            {notification}
          </span>
        )}
      </Link>
    </React.Fragment>
  );
};

export default DashboardLink;