'use client';

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Send, 
  User, 
  MessageSquare, 
  Loader2, 
  Clock, 
  Search,
  Filter,
  CheckCheck,
  Bell
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useRealTime } from "@/hooks/useRealTime";

export default function AdminSupportPage() {
  const queryClient = useQueryClient();
  const adminUser = useAuthStore(state => state.user);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { echo } = useRealTime();

  // 1. Fetch Conversations List
  const { data: convsData, isLoading: isLoadingConvs } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const res = await api.get("/admin/support");
      return res.data;
    },
  });

  // 2. Fetch Selected Conversation Messages
  const { data: chatData, isLoading: isLoadingChat } = useQuery({
    queryKey: ["admin-chat", selectedConvId],
    queryFn: async () => {
      if (!selectedConvId) return null;
      const res = await api.get(`/admin/support/${selectedConvId}`);
      return res.data;
    },
    enabled: !!selectedConvId,
  });

  // 📡 3. Real-time Inbox Listener (Updates sidebar)
  useEffect(() => {
    if (!echo || !adminUser) return;

    echo.private('admin.support')
      .listen('.message.sent', (e: any) => {
        // Update Conversations list cache
        queryClient.setQueryData(["admin-conversations"], (old: any) => {
          if (!old) return old;
          const conversations = [...old.data];
          const index = conversations.findIndex(c => c.id === e.message.conversation_id);
          
          if (index !== -1) {
            // Update existing conversation
            conversations[index] = {
              ...conversations[index],
              latest_message: e.message,
              last_message_at: e.message.created_at,
              unread_count: conversations[index].unread_count + (selectedConvId === e.message.conversation_id ? 0 : 1)
            };
            // Move to top
            const updated = conversations.splice(index, 1);
            conversations.unshift(updated[0]);
          } else {
             // Refresh list if new conversation or not found to be safe
             queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
          }

          return { ...old, data: conversations };
        });

        // 📡 4. Specific Chat Listener (If selected)
        if (selectedConvId === e.message.conversation_id) {
           queryClient.setQueryData(["admin-chat", selectedConvId], (old: any) => {
             if (!old) return old;
             if (old.messages.some((m: any) => m.id === e.message.id)) return old;
             return {
               ...old,
               messages: [...old.messages, e.message]
             };
           });
        }
      });

    return () => {
      echo.leave('admin.support');
    };
  }, [echo, adminUser, queryClient, selectedConvId]);

  const sendReply = useMutation({
    mutationFn: (text: string) => api.post(`/admin/support/${selectedConvId}/reply`, { content: text }),
    onSuccess: () => {
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["admin-chat", selectedConvId] });
      queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatData?.messages]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || sendReply.isPending) return;
    sendReply.mutate(replyContent);
  };

  const conversations = convsData?.data || [];
  const activeChatMessages = chatData?.messages || [];

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden animate-in fade-in duration-700">
      
      {/* 📥 Inbox Sidebar */}
      <div className="w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <h2 className="text-xl font-bold flex items-center">
            Messagerie <span className="ml-3 badge bg-primary text-white text-[10px] font-black border-none">{conversations.length}</span>
          </h2>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Filtrer par vendeur..." 
               className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
             />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
           {isLoadingConvs ? (
             <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-200" /></div>
           ) : conversations.map((conv: any) => (
             <button 
               key={conv.id}
               onClick={() => setSelectedConvId(conv.id)}
               className={cn(
                 "w-full p-6 text-left hover:bg-slate-50 transition-all border-l-4",
                 selectedConvId === conv.id ? "border-primary bg-primary/[0.02]" : "border-transparent"
               )}
             >
                <div className="flex justify-between items-start mb-1">
                   <p className="font-bold text-slate-900 text-sm truncate">{conv.user?.name}</p>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                     {new Date(conv.last_message_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                   </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                   <p className="text-xs text-slate-500 line-clamp-1 flex-1 font-medium">
                     {conv.latest_message?.content || "Démarrer la discussion"}
                   </p>
                   {conv.unread_count > 0 && (
                     <span className="w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                       {conv.unread_count}
                     </span>
                   )}
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* 💬 Chat Viewport */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {selectedConvId ? (
          <>
            {/* Active Conversation Header */}
            <div className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-8 flex items-center justify-between z-10">
               <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">
                     {chatData?.conversation?.user?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-none">{chatData?.conversation?.user?.name}</h3>
                    <p className="text-[10px] text-whatsapp font-bold uppercase tracking-widest mt-1">Boutique active</p>
                  </div>
               </div>
               <div className="flex items-center space-x-2">
                  <button className="p-2.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all"><Bell className="w-5 h-5" /></button>
                  <button className="p-2.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all"><MoreVertical className="w-5 h-5" /></button>
               </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col scroll-smooth"
            >
               {isLoadingChat ? (
                 <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-slate-200" /></div>
               ) : activeChatMessages.map((msg: any) => {
                 const isMe = msg.sender_id === adminUser?.id;
                 return (
                   <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("flex max-w-[70%] space-x-3", isMe ? "flex-row-reverse space-x-reverse" : "flex-row")}>
                        <div className="space-y-1">
                          <div className={cn(
                            "px-6 py-4 rounded-3xl text-sm border shadow-sm",
                            isMe 
                              ? "bg-primary text-white border-primary/20 rounded-tr-none" 
                              : "bg-white text-slate-800 border-slate-100 rounded-tl-none font-medium"
                          )}>
                            {msg.content}
                          </div>
                          <div className={cn("flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest", isMe ? "justify-end" : "justify-start")}>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {isMe && <CheckCheck className="ml-1.5 w-3 h-3 text-primary opacity-50" />}
                          </div>
                        </div>
                      </div>
                   </div>
                 );
               })}
            </div>

            {/* Reply Area */}
            <div className="p-8 bg-white border-t border-slate-100">
               <form onSubmit={handleReply} className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder={`Répondre à ${chatData?.conversation?.user?.name}...`} 
                    className="w-full pl-6 pr-20 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <button 
                   type="submit"
                   disabled={!replyContent.trim() || sendReply.isPending}
                   className="absolute right-3 p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                  >
                     {sendReply.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-6 px-10 text-center">
             <div className="w-24 h-24 rounded-[2rem] bg-white border border-slate-200 flex items-center justify-center shadow-xl shadow-slate-200/50">
               <MessageSquare className="w-10 h-10 text-slate-200" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Aucune conversation sélectionnée</h3>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                  Sélectionnez un vendeur dans la liste de gauche pour lire les messages et répondre aux demandes de support.
                </p>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}

const MoreVertical = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);
