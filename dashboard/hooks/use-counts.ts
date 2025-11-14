import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const NOTIFICATION_URL = "/api/admin/notification/counts";
const VERIFICATION_URL = "/api/admin/verifications/counts";
const PENDINGS_URL = "/api/admin/pendings/counts";

// Custom hook for notification count
const useNotificationCount = () => {
  const fetchNotification = async () => {
    const response = await axios.get(NOTIFICATION_URL);
    if (response.status !== 200) {
      throw new Error("Something went wrong, try again later");
    }
    return response.data as { count: number };
  };

  return useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: fetchNotification,
    refetchInterval: 15000,
  });
};

//Custom hook for verification count
const useVerificationCount = () => {
  const fetchVerification = async () => {
    const response = await axios.get(VERIFICATION_URL);
    if (response.status !== 200) {
      throw new Error("Something went wrong, try again later");
    }
    return response.data as { 
      unverifiedAgents: number; 
      unverifiedProperties: number; 
      totalUnverified: number;
    };
  };

  return useQuery({
    queryKey: ["unread-verification-count"],
    queryFn: fetchVerification,
    refetchInterval: 15000,
  });
};

//Custom hook for pendings count
const usePendingCount = () => {
  const fetchPending = async () => {
    const response = await axios.get(PENDINGS_URL);
    if (response.status !== 200) {
      throw new Error("Something went wrong, try again later");
    }
    return response.data as { 
      pendingRentals: number,
      pendingSales: number,
      totalPending: number
    };
  };

  return useQuery({
    queryKey: ["unread-pending-count"],
    queryFn: fetchPending,
    refetchInterval: 15000,
  });
};

export { useNotificationCount, useVerificationCount, usePendingCount };