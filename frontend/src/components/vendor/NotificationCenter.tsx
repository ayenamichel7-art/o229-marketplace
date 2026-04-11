'use client';

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NotificationCenter() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/auth/user/notifications"); // We'll need this route
      return res.data;
    },
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: () => api.post("/auth/user/notifications/mark-as-read"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications?.filter((n: any) => !n.read_at).length || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'subscription_started': return <CheckCircle2 className="w-4 h-4 text-whatsapp" />;
      case 'subscription_expired': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'subscription_warning': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => {
            setIsOpen(!isOpen);
            if (unreadCount > 0) markAsRead.mutate();
        }}
        className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-all text-slate-500"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-40 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
               <h3 className="font-bold text-slate-900">Notifications</h3>
               <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications?.length > 0 ? (
                notifications.map((n: any) => (
                  <div key={n.id} className={cn("p-6 flex space-x-4 hover:bg-slate-50 transition-colors", !n.read_at && "bg-primary/[0.02]")}>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                      {getIcon(n.data.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900">{n.data.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{n.data.message}</p>
                      {n.data.action_url && (
                        <Link 
                          href={n.data.action_url} 
                          className="text-[10px] font-black text-primary uppercase tracking-widest block pt-2 hover:underline"
                          onClick={() => setIsOpen(false)}
                        >
                          Voir l'action
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-slate-300 italic text-sm">
                   Aucune notification pour le moment.
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest tracking-tighter">O-229 Alertes Système</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
