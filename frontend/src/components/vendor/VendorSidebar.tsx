'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Package, 
  Settings, 
  Ticket, 
  Store, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { name: 'Vue d\'ensemble', icon: BarChart3, href: '/dashboard' },
  { name: 'Produits', icon: Package, href: '/dashboard/products' },
  { name: 'Coupons', icon: Ticket, href: '/dashboard/coupons' },
  { name: 'Ma Boutique', icon: Store, href: '/dashboard/shop' },
  { name: 'Support Admin', icon: MessageSquare, href: '/dashboard/support' },
  { name: 'Abonnement', icon: CreditCard, href: '/dashboard/pricing' },
  { name: 'Paramètres', icon: Settings, href: '/dashboard/settings' },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const clearAuth = useAuthStore(state => state.clearAuth);
  const user = useAuthStore(state => state.user);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-30 hidden lg:flex">
      {/* Logo Area */}
      <div className="p-6 border-b border-border mb-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
            O
          </div>
          <span className="text-lg font-bold tracking-tight">O-229 <span className="text-primary">Pro</span></span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 scrollbar-hide overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
            </Link>
          );
        })}

        {/* Upgrade Banner */}
        {user?.role === 'vendor' && (
          <div className="mt-10 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-primary/10 border border-primary/20 relative overflow-hidden group">
            <Sparkles className="absolute -top-1 -right-1 w-12 h-12 text-primary/10 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-primary mb-1">PLAN GRATUIT</p>
            <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
              Passez à la version Premium pour plus de visibilité.
            </p>
            <Link 
              href="/dashboard/pricing" 
              className="block w-full text-center py-2 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors border border-primary/20"
            >
              Upgrade Now
            </Link>
          </div>
        )}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/help" className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <HelpCircle className="w-5 h-5" />
          <span>Aide & Support</span>
        </Link>
        <button 
          onClick={clearAuth}
          className="flex items-center space-x-3 px-3 py-2 text-destructive hover:bg-destructive/10 w-full rounded-xl transition-colors text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
