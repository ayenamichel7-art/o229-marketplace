'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  ShieldCheck, 
  Settings,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const adminMenuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Messagerie Support', icon: MessageSquare, href: '/admin/support' },
  { name: 'Approbation Comptes', icon: Users, href: '/admin/users' },
  { name: 'Vérification KYC', icon: ShieldCheck, href: '/admin/vendors' },
  { name: 'Modération Produits', icon: ShoppingBag, href: '/admin/products' },
  { name: 'Paramètres Système', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const clearAuth = useAuthStore(state => state.clearAuth);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-30 hidden lg:flex">
      {/* Admin Logo */}
      <div className="p-6 border-b border-white/10 mb-4 bg-slate-950/50">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            A
          </div>
          <span className="text-lg font-bold tracking-tight">O-229 <span className="text-primary">Admin</span></span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-[2px] mb-4 px-3 mt-4">
          Administration
        </div>
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/40 group-hover:text-primary")} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-6 mt-auto">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
           <p className="text-[10px] text-white/40 uppercase mb-2">État Système</p>
           <div className="flex items-center text-xs font-bold text-whatsapp">
              <span className="w-2 h-2 rounded-full bg-whatsapp mr-2 animate-pulse"></span>
              Tous les services OK
           </div>
        </div>
        <button 
          onClick={clearAuth}
          className="flex items-center space-x-3 px-3 py-2 text-white/60 hover:text-destructive w-full rounded-xl transition-colors text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Quitter le Panel</span>
        </button>
      </div>
    </aside>
  );
}
