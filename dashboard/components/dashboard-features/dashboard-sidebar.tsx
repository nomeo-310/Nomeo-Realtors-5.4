'use client'

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { superadmin_nav_links, creator_nav_links, admin_nav_links } from "@/assets/constants/nav_lists";
import DashboardLink from "./dashboard-link";

const BASE_URL = "/api/admin/notification/counts";

// Custom hook for notification count
const useNotificationCount = () => {
  const fetchNotification = async () => {
    const response = await axios.get(BASE_URL);
    if (response.status !== 200) {
      throw new Error("Something went wrong, try again later");
    }
    return response.data as { count: number };
  };

  return useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: fetchNotification,
    refetchInterval: 5000,
  });
};

// Role-based sidebar component
interface RoleBasedSidebarProps {
  role: "admin" | "superAdmin" | "creator";
}

const RoleBasedSidebar: React.FC<RoleBasedSidebarProps> = ({ role }) => {
  const { data: notificationCount } = useNotificationCount();

  const getNavLinks = () => {
    switch (role) {
      case "superAdmin":
        return superadmin_nav_links;
      case "creator":
        return creator_nav_links;
      case "admin":
      default:
        return admin_nav_links;
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex flex-col lg:gap-2 gap-3">
      {navLinks.map((link, index) => (
        <DashboardLink
          currentPage={link.page}
          key={`${link.path}-${index}`}
          icon={link.icon}
          text={link.text}
          path={link.path}
          notification={
            link.text === "Notifications" ? notificationCount?.count || 0 : 0
          }
        />
      ))}
    </div>
  );
};

// Keep the existing exports for backward compatibility
const AdminDashBoardSideBar = () => <RoleBasedSidebar role="admin" />;
const SuperAdminDashBoardSideBar = () => <RoleBasedSidebar role="superAdmin" />;
const CreatorDashBoardSideBar = () => <RoleBasedSidebar role="creator" />;

export { AdminDashBoardSideBar, SuperAdminDashBoardSideBar, CreatorDashBoardSideBar, RoleBasedSidebar};