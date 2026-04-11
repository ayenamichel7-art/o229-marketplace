"use client";

import { useEffect } from "react";
import { logErrorToBackend } from "@/lib/logger";

/**
 * SystemMonitor handles global error catching for the entire application.
 * It reports unhandled exceptions and promise rejections to the backend.
 */
export function SystemMonitor() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logErrorToBackend(event.error || new Error(event.message), "Global Window Error");
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(JSON.stringify(event.reason));
      
      logErrorToBackend(error, "Unhandled Promise Rejection");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null; // Silent component
}
