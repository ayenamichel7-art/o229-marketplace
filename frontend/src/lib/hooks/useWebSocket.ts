"use client";

import { useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally for Laravel Echo
if (typeof window !== "undefined") {
  (window as any).Pusher = Pusher;
}

export const useWebSocket = (userId?: number) => {
  const [echo, setEcho] = useState<Echo | null>(null);

  useEffect(() => {
    // We only initialize if we are in the browser
    if (typeof window !== "undefined") {
      const echoInstance = new Echo({
        broadcaster: "reverb",
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
        enabledTransports: ["ws", "wss"],
      });

      setEcho(echoInstance);

      return () => {
        echoInstance.disconnect();
      };
    }
  }, []);

  return echo;
};
