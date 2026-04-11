"use client";

import { useEffect, useState } from "react";
import { initEcho } from "@/lib/echo";
import { useAuthStore } from "@/store/authStore";

/**
 * Hook to use Laravel Echo for real-time events.
 * Handles automatic connection/disconnection based on auth status.
 */
export function useRealTime() {
  const { token, user } = useAuthStore();
  const [echo, setEcho] = useState<any>(null);

  useEffect(() => {
    if (token) {
      const echoInstance = initEcho(token);
      setEcho(echoInstance);

      return () => {
        if (echoInstance) {
          echoInstance.disconnect();
        }
      };
    } else {
      setEcho(null);
    }
  }, [token]);

  return { echo, user };
}
