"use client";

import React from "react";
import DashboardLink from "./dashboard-link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { user_nav_links, agent_nav_link, admin_nav_links } from "@/assets/texts/nav_lists";
import { useSearchParams } from "next/navigation";

interface DashboardSidebarProps {
  isCollaborator: boolean;
  showSavedBlogs: boolean;
  showLikedBlogs: boolean;
  showSavedApartments: boolean;
  showLikedApartments: boolean;
}

interface AgentDashboardSidebarProps extends DashboardSidebarProps {
  isPending: boolean;
}

export const UserDashBoardSideBar = ({
  isCollaborator,
  showSavedBlogs,
  showLikedBlogs,
  showSavedApartments,
  showLikedApartments,
}:DashboardSidebarProps) => {

  const searchParams = useSearchParams();

  const propertyId = searchParams.get('propertyId') || '';
  const agentUserId = searchParams.get('agentUserId') || '';

  const getDynamicPath = (linkText: string) => {
    if (linkText === "Saves") {
      if (showSavedBlogs && showSavedApartments) {
        return "/user-dashboard/saves/blogs";
      } else if (showSavedBlogs) {
        return "/user-dashboard/saves/blogs";
      } else if (showSavedApartments) {
        return "/user-dashboard/saves/apartments";
      }
    }
    
    if (linkText === "Likes") {
      if (showLikedBlogs && showLikedApartments) {
        return "/user-dashboard/likes/blogs";
      } else if (showLikedBlogs) {
        return "/user-dashboard/likes/blogs";
      } else if (showLikedApartments) {
        return "/user-dashboard/likes/apartments";
      }
    }

    if (linkText === 'Transactions') {
      if (propertyId && agentUserId) {
        return `/user-dashboard/transactions?propertyId=${propertyId}&agentUserId=${agentUserId}`;
      }
    }

    return user_nav_links.find(link => link.text === linkText)?.path || "";
  };

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
    ...((showSavedBlogs || showSavedApartments) ? [] : ["Saves"]),
    ...((showLikedBlogs || showLikedApartments) ? [] : ["Likes"]),
    ...(isCollaborator ? [] : ["Create Blog", "Blogs"]),
  ];

  const filteredNavLinks = user_nav_links
    .filter((link) => !restrictedLinks.includes(link.text))
    .map(link => ({
      ...link,
      path: getDynamicPath(link.text)
    })
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
  showSavedBlogs,
  showLikedBlogs,
  showSavedApartments,
  showLikedApartments,
}: AgentDashboardSidebarProps) => {

  const getDynamicPath = (linkText: string) => {
    if (linkText === "Saves") {
      if (showSavedBlogs && showSavedApartments) {
        return "/agent-dashboard/saves/blogs";
      } else if (showSavedBlogs) {
        return "/agent-dashboard/saves/blogs";
      } else if (showSavedApartments) {
        return "/agent-dashboard/saves/apartments";
      }
    }
    
    if (linkText === "Likes") {
      if (showLikedBlogs && showLikedApartments) {
        return "/agent-dashboard/likes/blogs";
      } else if (showLikedBlogs) {
        return "/agent-dashboard/likes/blogs";
      } else if (showLikedApartments) {
        return "/agent-dashboard/likes/apartments";
      }
    }

    return agent_nav_link.find(link => link.text === linkText)?.path || "";
  };

  const fetchNotification = async () => {
    const response = await axios.get("/api/notification/counts");

    if (response.status !== 200) {
      throw new Error("Something went wrong, try again later");
    }

    const data = response.data as { count: number };
    return data;
  };

  const fetchInspections = async () => {
    const response = await axios.get("/api/inspections/counts");

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

  const { data: inspectionCount } = useQuery({
    queryKey: ["inspection-count"],
    queryFn: fetchInspections,
    refetchInterval: 5000,
  });

  const restrictedLinks = [
    ...((showSavedBlogs || showSavedApartments) ? [] : ["Saves"]),
    ...((showLikedBlogs || showLikedApartments) ? [] : ["Likes"]),
    ...(isCollaborator ? [] : ["Create Blog", "Blogs"]),
    ...(isPending ? ["Add Apartments", "Apartments"] : []),
  ];

  const filteredNavLinks = agent_nav_link
    .filter((link) => !restrictedLinks.includes(link.text))
    .map(link => ({
      ...link,
      path: getDynamicPath(link.text)
    })
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
            link.text === "Notifications" ? notificationCount?.count || 0 : link.text === "Inspections" ? inspectionCount?.count || 0 : 0
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
