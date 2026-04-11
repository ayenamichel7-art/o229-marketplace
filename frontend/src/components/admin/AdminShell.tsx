'use client';

import { AdminSidebar } from "./AdminSidebar";
import { Search, User, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { NotificationCenter } from "../vendor/NotificationCenter";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />
      
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Admin Header */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center flex-1">
             <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un vendeur, produit ou utilisateur..." 
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
             </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <NotificationCenter />
            <button className="p-2 text-slate-500 hover:text-primary transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
            
            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user?.name}</p>
                <p className="text-[11px] text-primary font-bold uppercase tracking-wider mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white ring-4 ring-slate-100">
                 <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
