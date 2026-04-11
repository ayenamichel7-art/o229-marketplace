'use client';

import { useEffect } from 'react';
import echo from '@/lib/echo';
import { toast } from 'sonner';
import { Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export function RealTimeListener() {
  useEffect(() => {
    if (!echo) return;

    const channel = echo.channel('public-notifications');

    channel.listen('RealTimeNotification', (e: any) => {
      console.log('RealTimeNotification Received:', e);
      
      const { message, type } = e;

      switch (type) {
        case 'success':
          toast.success(message, { icon: <CheckCircle className="h-5 w-5 text-success" /> });
          break;
        case 'warning':
          toast.warning(message, { icon: <AlertTriangle className="h-5 w-5 text-warning" /> });
          break;
        case 'error':
          toast.error(message);
          break;
        default:
          toast.info(message, { icon: <Bell className="h-5 w-5 text-info" /> });
      }
    });

    return () => {
      echo.leaveChannel('public-notifications');
    };
  }, []);

  return null;
}
