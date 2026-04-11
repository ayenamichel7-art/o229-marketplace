'use client';

import Link from "next/link";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Globe, 
  Heart,
  TrendingUp,
  ShieldCheck,
  ShoppingBag
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="text-3xl font-black text-primary tracking-tighter">O-229</Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
              La marketplace leader au Bénin. Nous connectons acheteurs et vendeurs via WhatsApp pour une expérience locale, rapide et sécurisée.
            </p>
            <div className="flex items-center space-x-4">
               <a href="#" className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-primary transition-all"><Facebook className="w-5 h-5" /></a>
               <a href="#" className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-primary transition-all"><Instagram className="w-5 h-5" /></a>
               <a href="#" className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-primary transition-all"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Platform Column */}
          <div className="space-y-6">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Plateforme</h4>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">Produits</Link></li>
              <li><Link href="/shops" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">Boutiques</Link></li>
              <li><Link href="/categories" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">Catégories</Link></li>
              <li><Link href="/search" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">Rechercher</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-6">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Assistance</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">Nous contacter</Link></li>
              <li><Link href="/privacy" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">Confidentialité</Link></li>
              <li><Link href="/terms" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">Conditions d'usage</Link></li>
              <li><Link href="/faq" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">FAQ</Link></li>
            </ul>
          </div>

          {/* Growth Column */}
          <div className="bg-slate-50 rounded-3xl p-8 space-y-4">
             <div className="flex items-center space-x-3 text-primary">
                <TrendingUp className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">Expansion O-229</span>
             </div>
             <p className="text-slate-900 font-bold text-sm">Prêt à dominer le marché ?</p>
             <p className="text-slate-500 text-xs leading-relaxed">Nous boostons la visibilité de vos boutiques via les Ads TikTok & Google.</p>
             <Link href="/register" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Vendre ici <ShoppingBag className="w-3.5 h-3.5 ml-2" />
             </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <span>© {currentYear} O-229 MARKETPLACE BÉNIN</span>
              <span className="mx-3 opacity-20">•</span>
              <span className="flex items-center">PROPULSÉ AVEC <Heart className="w-3 h-3 mx-1 text-destructive fill-current" /> POUR LE BÉNIN</span>
           </div>
           
           <div className="flex items-center space-x-6">
              <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                 <ShieldCheck className="w-4 h-4 mr-2 text-whatsapp" />
                 <span>Transaction sécurisée</span>
              </div>
              <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                 <Globe className="w-4 h-4 mr-2 text-primary" />
                 <span>Disponible partout</span>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
}
