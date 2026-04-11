import { VendorSidebar } from "./VendorSidebar";
import { User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { NotificationCenter } from "./NotificationCenter";

export function VendorShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);

  return (
    <div className="flex min-h-screen bg-background">
      <VendorSidebar />
      
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Top Header for Mobile & User Nav */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="lg:hidden text-lg font-bold">O-229 Pro</div>
          <div className="hidden lg:block text-sm text-muted-foreground italic">
            "Le succès appartient à ceux qui se lèvent tôt." 🇧🇯
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground uppercase">{user?.role === 'vendor' ? 'Vendeur Pro' : 'Administrateur'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <User className="w-5 h-5 text-muted-foreground" />
               )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
