"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useAuth = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await api.get("/auth/user");
      return res.data;
    },
    retry: false, // Don't retry if not authenticated
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isVendor: user?.role === "vendor",
    isAdmin: user?.role === "admin",
  };
};
