"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { superadmin_nav_links, creator_nav_links, admin_nav_links } from "@/assets/constants/nav_lists";
import DashboardLink from "./dashboard-link";


const AdminDashBoardSideBar = () => {
  const fetchNotification = async () => {
    const response = await axios.get("/api/notification/counts");

    if (response.status !== 200) {
      throw new Error("Something went wrong, try again later");
    }

    const data = response.data as { count: number };
    return data;
  };

  const { data: notificationCount } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: fetchNotification,
    refetchInterval: 5000,
  });

  return (
    <div className="flex flex-col lg:gap-2 gap-3">
      {admin_nav_links.map((link, index) => (
        <DashboardLink
          currentPage={link.page}
          key={index}
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

const SuperAdminDashBoardSideBar = () => {
  const fetchNotification = async () => {
    const response = await axios.get("/api/notification/counts");

    if (response.status !== 200) {
      throw new Error("Something went wrong, try again later");
    }

    const data = response.data as { count: number };
    return data;
  };

  const { data: notificationCount } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: fetchNotification,
    refetchInterval: 5000,
  });

  return (
    <div className="flex flex-col lg:gap-2 gap-3">
      {superadmin_nav_links.map((link, index) => (
        <DashboardLink
          currentPage={link.page}
          key={index}
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

const CreatorDashBoardSideBar = () => {
  const fetchNotification = async () => {
    const response = await axios.get("/api/notification/counts");

    if (response.status !== 200) {
      throw new Error("Something went wrong, try again later");
    }

    const data = response.data as { count: number };
    return data;
  };

  const { data: notificationCount } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: fetchNotification,
    refetchInterval: 5000,
  });

  return (
    <div className="flex flex-col lg:gap-2 gap-3">
      {creator_nav_links.map((link, index) => (
        <DashboardLink
          currentPage={link.page}
          key={index}
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

export { AdminDashBoardSideBar, SuperAdminDashBoardSideBar, CreatorDashBoardSideBar}