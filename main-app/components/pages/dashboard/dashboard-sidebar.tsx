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
}: DashboardSidebarProps) => {

  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  const agentUserId = searchParams.get('agentUserId') || '';

  // Combine all data fetching into a single query
  const fetchDashboardData = async () => {
    try {
      const [notificationRes] = await Promise.all([
        axios.get("/api/notification/counts"),
        // Add other API calls here if needed in the future
      ]);

      return {
        notificationCount: notificationRes.data.count,
      };
    } catch (error) {
      throw new Error("Failed to load dashboard data");
    }
  };

  const { data: dashboardData } = useQuery({
    queryKey: ["user-dashboard-data"],
    queryFn: fetchDashboardData,
    refetchInterval: 15000, // Reduced frequency
    staleTime: 10000, // Cache for 10 seconds
  });

  // Memoize dynamic path generation
  const getDynamicPath = React.useCallback((linkText: string) => {
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
      // Return default transactions path if no query params
      return "/user-dashboard/transactions";
    }

    return user_nav_links.find(link => link.text === linkText)?.path || "";
  }, [showSavedBlogs, showSavedApartments, showLikedBlogs, showLikedApartments, propertyId, agentUserId]);

  // Memoize filtered navigation links
  const filteredNavLinks = React.useMemo(() => {
    const restrictedLinks = [
      ...((showSavedBlogs || showSavedApartments) ? [] : ["Saves"]),
      ...((showLikedBlogs || showLikedApartments) ? [] : ["Likes"]),
      ...(isCollaborator ? [] : ["Create Blog", "Blogs"]),
    ];

    return user_nav_links
      .filter((link) => !restrictedLinks.includes(link.text))
      .map(link => ({
        ...link,
        path: getDynamicPath(link.text)
      }));
  }, [showSavedBlogs, showSavedApartments, showLikedBlogs, showLikedApartments, isCollaborator, getDynamicPath]);

  return (
    <div className="flex flex-col lg:gap-2 gap-3">
      {filteredNavLinks.map((link) => (
        <DashboardLink
          currentPage={link.page}
          key={link.text} // Use text as key for better stability
          icon={link.icon}
          text={link.text}
          path={link.path}
          notification={
            link.text === "Notifications" ? dashboardData?.notificationCount || 0 : 0
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

  const fetchDashboardCounts = async () => {
    try {
      const [notificationRes, inspectionRes] = await Promise.all([
        axios.get("/api/notification/counts"),
        axios.get("/api/inspections/counts")
      ]);

      return {
        notificationCount: notificationRes.data.count,
        inspectionCount: inspectionRes.data.count
      };
    } catch (error) {
      throw new Error("Failed to load dashboard data");
    }
  };

  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: fetchDashboardCounts,
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const getDynamicPath = React.useCallback((linkText: string) => {
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
  }, [showSavedBlogs, showSavedApartments, showLikedBlogs, showLikedApartments]);

  const filteredNavLinks = React.useMemo(() => {
    const restrictedLinks = [
      ...((showSavedBlogs || showSavedApartments) ? [] : ["Saves"]),
      ...((showLikedBlogs || showLikedApartments) ? [] : ["Likes"]),
      ...(isCollaborator ? [] : ["Create Blog", "Blogs"]),
      ...(isPending ? ["Add Apartments", "Apartments"] : []),
    ];

    return agent_nav_link
      .filter((link) => !restrictedLinks.includes(link.text))
      .map(link => ({
        ...link,
        path: getDynamicPath(link.text)
      }));
  }, [showSavedBlogs, showSavedApartments, showLikedBlogs, showLikedApartments, isCollaborator, isPending, getDynamicPath]);

  return (
    <div className="flex flex-col lg:gap-2 gap-6">
      {filteredNavLinks.map((link, index) => (
        <DashboardLink
          currentPage={link.page}
          key={link.text} // Use text as key for better stability
          icon={link.icon}
          text={link.text}
          path={link.path}
          notification={
            link.text === "Notifications" ? counts?.notificationCount || 0 : 
            link.text === "Inspections" ? counts?.inspectionCount || 0 : 0
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
    refetchInterval: 15000,
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
