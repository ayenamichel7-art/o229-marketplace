'use client';

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Send, 
  User, 
  MessageSquare, 
  Loader2, 
  Check, 
  ShieldCheck,
  Clock,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useRealTime } from "@/hooks/useRealTime";

export default function VendorSupportPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { echo } = useRealTime();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-support"],
    queryFn: async () => {
      const res = await api.get("/vendor/support");
      return res.data;
    },
    // Remplace le polling par un listener WebSocket ci-dessous
  });

  // 📡 Real-time Listener
  useEffect(() => {
    if (!echo || !user) return;

    const channel = echo.private(`support.${user.id}`)
      .listen('.message.sent', (e: any) => {
        // Optimistic cache update
        queryClient.setQueryData(["vendor-support"], (old: any) => {
          if (!old) return old;
          // Avoid duplicates if already added by mutation
          if (old.messages.some((m: any) => m.id === e.message.id)) return old;
          return {
            ...old,
            messages: [...old.messages, e.message]
          };
        });
      });

    return () => {
      echo.leave(`support.${user.id}`);
    };
  }, [echo, user, queryClient]);

  const sendMessage = useMutation({
    mutationFn: (text: string) => api.post("/vendor/support", { content: text }),
    onSuccess: (res) => {
      setContent("");
      // Update cache manually to avoid waiting for broadcast
      queryClient.setQueryData(["vendor-support"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, res.data.data]
        };
      });
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sendMessage.isPending) return;
    sendMessage.mutate(content);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg" />
        <div className="h-[500px] w-full bg-slate-100 rounded-[2rem]" />
      </div>
    );
  }

  const messages = data?.messages || [];

  return (
    <div className="p-6 md:p-8 flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center">
            Centre de Support <Sparkles className="w-6 h-6 ml-2 text-primary" />
          </h1>
          <p className="text-slate-500 mt-1 flex items-center text-sm font-medium">
             <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Chat direct avec l'administration O-229
          </p>
        </div>
        <div className="px-4 py-2 rounded-full bg-whatsapp/10 border border-whatsapp/20 text-whatsapp text-[10px] font-black uppercase tracking-widest flex items-center">
           <div className="w-2 h-2 rounded-full bg-whatsapp mr-2 animate-pulse"></div>
           Admin en ligne
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
        
        {/* Messages List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-slate-200" />
               </div>
               <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Démarrer une conversation</p>
               <p className="text-slate-500 text-xs max-w-xs">Posez vos questions sur la vérification, vos produits ou votre abonnement.</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn("flex max-w-[80%] md:max-w-[70%] space-x-3", isMe ? "flex-row-reverse space-x-reverse" : "flex-row")}>
                    <div className={cn("w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-[10px]", isMe ? "bg-slate-900 text-white" : "bg-primary text-white shadow-lg shadow-primary/20")}>
                       {isMe ? 'V' : 'A'}
                    </div>
                    <div className="space-y-1">
                      <div className={cn(
                        "px-6 py-4 rounded-[1.5rem] shadow-sm text-sm border",
                        isMe 
                          ? "bg-slate-900 text-white border-slate-800 rounded-tr-none" 
                          : "bg-slate-50 text-slate-800 border-slate-100 rounded-tl-none font-medium"
                      )}>
                        {msg.content}
                      </div>
                      <div className={cn("flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest", isMe ? "justify-end" : "justify-start")}>
                        <Clock className="w-3 h-3 mr-1 opacity-50" />
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (
                           <span className="ml-2">
                             {msg.is_read ? <Check className="w-3 h-3 text-whatsapp stroke-[4]" /> : <Check className="w-3 h-3 opacity-30" />}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <form onSubmit={handleSend} className="relative flex items-center">
             <input 
               type="text" 
               placeholder="Écrivez votre message à l'administration..." 
               className="w-full pl-6 pr-20 py-5 bg-white border border-slate-200 rounded-3xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
               value={content}
               onChange={(e) => setContent(e.target.value)}
             />
             <button 
              type="submit"
              disabled={!content.trim() || sendMessage.isPending}
              className="absolute right-3 p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
             >
                {sendMessage.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
             </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-4 font-bold uppercase tracking-widest">
             Réponse moyenne : moins de 2 heures
          </p>
        </div>

      </div>
    </div>
  );
}
