import { api } from "./api";

export const logErrorToBackend = async (error: Error, componentStack?: string) => {
  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_DEBUG_LOGS) {
    console.error("Local Error (not sent to backend):", error);
    return;
  }

  try {
    await api.post("/public/log-error", {
      message: error.message,
      stack: error.stack,
      url: typeof window !== "undefined" ? window.location.href : "server-side",
      component: componentStack || "Global",
    });
  } catch (err) {
    // Fail silently to avoid infinite loops if the logger itself fails
    console.error("Failed to log error to backend", err);
  }
};
