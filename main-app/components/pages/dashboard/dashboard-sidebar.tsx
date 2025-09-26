"use client";

import React from "react";
import DashboardLink from "./dashboard-link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { user_nav_links, agent_nav_link, admin_nav_links } from "@/assets/texts/nav_lists";

export const UserDashBoardSideBar = ({
  isCollaborator,
}: {
  isCollaborator: boolean;
}) => {
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

  const filteredNavLinks = isCollaborator
    ? user_nav_links
    : user_nav_links.filter(
        (link) => link.text !== "Create Blog" && link.text !== "Blogs"
      );

  return (
    <div className="flex flex-col lg:gap-2 gap-3">
      {filteredNavLinks.map((link, index) => (
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

export const AgentDashBoardSideBar = ({
  isCollaborator,
  isPending,
}: {
  isCollaborator: boolean;
  isPending: boolean;
}) => {
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

  const restrictedLinks = [
    ...(!isCollaborator ? ["Create Blog", "Blogs"] : []),
    ...(isPending ? ["Add Apartments", "Apartments"] : []),
  ];

  const filteredNavLinks = agent_nav_link.filter(
    (link) => !restrictedLinks.includes(link.text)
  );

  return (
    <div className="flex flex-col lg:gap-2 gap-6">
      {filteredNavLinks.map((link, index) => (
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

export const AdminDashBoardSideBar = () => {
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
