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

    const getIsActive = (text: string, path: string, pathname: string) => {
    return React.useMemo(() => {
      if (pathname === path) return true;

      const routeConfig = {
        "Likes": "likes",
        "Saves": "saves", 
        "Transactions": "transactions",
        "Created Blogs": "created-blogs",
        "Blogs": "created-blogs",
        "Create Blog": "create-blog",
        "Apartments": "apartments"
      };

      const route = routeConfig[text as keyof typeof routeConfig];
      if (!route) return false;

      const routes = [
        `/agent-dashboard/${route}`,
        `/user-dashboard/${route}`,
      ];

      return routes.some(r => pathname.startsWith(r));
    }, [text, path, pathname]);
  };

  const isActive = getIsActive(text, path, pathname);

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