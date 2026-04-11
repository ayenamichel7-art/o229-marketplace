import Link from "next/link";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/hooks/useAuth";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { SearchBar } from "@/components/search/SearchBar";

export function Header() {
  const { user, isAuthenticated, isVendor } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl text-primary">
              O-229
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/products"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              Produits
            </Link>
            <Link
              href="/shops"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              Boutiques
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              Contact
            </Link>
          </nav>
        </div>
        
        {/* Mobile Nav Toggle */}
        <button className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 mr-2 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </button>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none hidden md:block">
            <SearchBar className="md:w-[300px] lg:w-[400px]" isHero={false} />
          </div>
          
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 ml-4">
                {isVendor && <NotificationBell userId={user.id} />}
                
                <Link href="/dashboard" className="btn btn-sm btn-ghost flex items-center space-x-2">
                   <div className="avatar placeholder">
                     <div className="bg-primary text-primary-foreground rounded-full w-8">
                       <span className="text-xs uppercase">{user.name.substring(0, 2)}</span>
                     </div>
                   </div>
                   <span className="hidden md:inline-block font-semibold">{user.name}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link href="/login" className="btn btn-sm btn-ghost hidden sm:inline-flex">
                  Connexion
                </Link>
                <Link href="/register" className="btn btn-sm btn-primary text-white shadow-sm hover:shadow-md">
                  Vendre
                </Link>
              </div>
            )}

          </nav>
        </div>
      </div>
    </header>
  );
}
