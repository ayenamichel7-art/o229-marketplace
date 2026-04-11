"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useWebSocket } from "@/lib/hooks/useWebSocket";

export function NotificationBell({ userId }: { userId: number }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const echo = useWebSocket();

  useEffect(() => {
    if (echo && userId) {
      // Laravel broadcasts to a private channel: private-App.Models.User.{id}
      const channel = echo.private(`App.Models.User.${userId}`);
      
      // Example: We listen for "NewLeadReceived" Event
      channel.listen("NewLeadReceived", (e: any) => {
        setHasUnread(true);
        setNotifications((prev) => [e, ...prev]);
        
        // DaisyUI/HTML5 Notification Toast (or sound) could be triggered here
        const audio = new Audio('/notification-sound.mp3'); // Optional sound
        audio.play().catch(() => {});
      });

      return () => {
        echo.leave(`App.Models.User.${userId}`);
      };
    }
  }, [echo, userId]);

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle relative">
        <Bell className="w-5 h-5 text-base-content/80" />
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full animate-ping"></span>
        )}
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full"></span>
        )}
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-72 mt-4 border border-base-200">
        <li className="menu-title px-4 py-2 border-b border-base-200 pb-2">Notifications</li>
        
        {notifications.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-base-content/50">Aucune nouvelle notification</li>
        ) : (
          notifications.map((notif, idx) => (
            <li key={idx}>
              <a className="flex flex-col items-start gap-1 p-3">
                <span className="font-semibold text-sm">Nouveau Client WhatsApp !</span>
                <span className="text-xs text-base-content/60">Quelqu'un est intéressé par votre produit.</span>
              </a>
            </li>
          ))
        )}
        
        {notifications.length > 0 && (
          <li className="border-t border-base-200 mt-2">
            <a 
              className="justify-center text-primary font-medium text-sm py-3"
              onClick={() => { setHasUnread(false); setNotifications([]); }}
            >
              Marquer comme lues
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
