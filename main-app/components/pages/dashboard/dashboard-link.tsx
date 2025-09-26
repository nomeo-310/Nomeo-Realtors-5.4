"use client";

import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type dashboardLinkProps = {
  icon: any; // Hugeicons icon object
  text: string;
  path: string;
  notification: number;
  currentPage: string;
};

const DashboardLink = ({icon:Icon,text, path, notification, currentPage}: dashboardLinkProps) => {
  const pathname = usePathname();

  const agentTransactionBaseLink = "/agent-dashboard/transactions";
  const agentCreatedBlogsBaseLink = "/agent-dashboard/created-blogs";
  const agentCreateBlogBaseLink = "/agent-dashboard/create-blog";
  const verificationBaseLink = "/admin-dashboard/verifications";
  const adminTransactionBaseLink = "/admin-dashboard/transactions";
  const adminApartmentsBaseLink = "/admin-dashboard/apartments";
  const adminCreateBlogBaseLink = "/admin-dashboard/create-blog";
  const adminCreatedBlogsBaseLink = "/admin-dashboard/created-blogs";
  const adminBlogsBaseLink = "/admin-dashboard/all-blogs";
  const userCreatedBlogsBaseLink = "/user-dashboard/created-blogs";

  const baseLinks = [
    adminApartmentsBaseLink,
    adminTransactionBaseLink,
    adminCreateBlogBaseLink,
    adminCreatedBlogsBaseLink,
    verificationBaseLink,
    agentTransactionBaseLink,
    agentCreateBlogBaseLink,
    agentCreatedBlogsBaseLink,
    adminBlogsBaseLink,
    userCreatedBlogsBaseLink,
  ];

  const isBaseLinkActive = baseLinks.some(
    (link) => path === link && pathname.startsWith(link)
  );

  const isActive = isBaseLinkActive || pathname === path;

  return (
    <React.Fragment>
      <Link
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
            {notification && notification > 0 ? notification : ""}
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
            {notification && notification > 0 ? notification : ""}
          </span>
        )}
      </Link>
    </React.Fragment>
  );
};

export default DashboardLink;
