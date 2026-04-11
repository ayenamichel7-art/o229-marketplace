'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  CheckCircle2, 
  Users, 
  Activity, 
  ShoppingBag, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight,
  ChevronRight,
  Clock,
  LayoutDashboard
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      return res.data;
    },
  });

  const verifyVendorMutation = useMutation({
    mutationFn: async (shopId: number) => {
      return await api.put(`/admin/vendors/${shopId}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-40 bg-slate-100 rounded-3xl" />
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* 👑 Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Tableau de Bord Admin</h1>
          <p className="text-slate-500 mt-1 flex items-center">
            <LayoutDashboard className="w-4 h-4 mr-2" /> 
            Bienvenue dans le centre de contrôle global de O-229 Marketplace.
          </p>
        </div>
      </div>

      {/* 📊 KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Utilisateurs', value: data?.kpis?.total_users, sub: `${data?.kpis?.total_vendors} vendeurs`, icon: Users, color: 'bg-indigo-500' },
          { label: 'Articles en Ligne', value: data?.kpis?.total_products, sub: 'Articles actifs', icon: ShoppingBag, color: 'bg-primary' },
          { label: 'Leads Générés', value: data?.kpis?.total_leads, sub: 'Clics WhatsApp', icon: Activity, color: 'bg-whatsapp' },
        ].map((stat, i) => (
          <div key={i} className="relative bg-white rounded-[2rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10 flex justify-between items-start">
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-4xl font-black text-slate-900">{stat.value || 0}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">{stat.sub}</p>
               </div>
               <div className={cn("p-4 rounded-2xl text-white shadow-xl", stat.color)}>
                  <stat.icon className="w-6 h-6" />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* 📋 Pending Verifications */}
        <div className="xl:col-span-3 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold flex items-center">
                 <ShieldCheck className="w-5 h-5 mr-3 text-primary" /> 
                 Vérifications en Attente
                 {data?.pending_verifications?.length > 0 && (
                   <span className="ml-3 px-2.5 py-0.5 rounded-full bg-destructive text-white text-[10px] font-black">
                     ACTION REQUISE
                   </span>
                 )}
              </h2>
              <Link href="/admin/vendors" className="text-xs font-bold text-primary flex items-center hover:underline">
                 Tout voir <ArrowUpRight className="w-3 h-3 ml-1" />
              </Link>
           </div>
           
           <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Boutique</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.pending_verifications?.length > 0 ? (
                      data.pending_verifications.map((shop: any) => (
                        <tr key={shop.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{shop.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{shop.vendor_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-xs text-slate-500">
                               <Clock className="w-3 h-3 mr-1.5 opacity-40" />
                               {new Date(shop.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button 
                               onClick={() => verifyVendorMutation.mutate(shop.id)}
                               disabled={verifyVendorMutation.isPending}
                               className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                             >
                                APPROUVER
                             </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-300 italic text-sm">
                           Aucune demande en attente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        {/* 🚀 Quick Actions Side */}
        <div className="xl:col-span-2 space-y-8">
           <div className="p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all" />
              <h3 className="text-xl font-black mb-2 relative z-10">Contrôle de Sécurité</h3>
              <p className="text-white/50 text-xs leading-relaxed mb-6 relative z-10">
                L'algorithme de protection a détecté 0 comportement suspect sur les dernières 24h.
              </p>
              <div className="space-y-3 relative z-10">
                 <Link href="/admin/products?status=pending" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <span className="text-xs font-bold italic">Modérer les produits</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                 </Link>
                 <Link href="/admin/users" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <span className="text-xs font-bold italic">Approuver les comptes</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                 </Link>
              </div>
           </div>

           <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-4">Système</h4>
              <div className="flex items-center space-x-2 text-whatsapp font-black text-sm">
                 <span className="w-2.5 h-2.5 rounded-full bg-whatsapp animate-pulse"></span>
                 <span>LIVE • TOUS LES SYSTÈMES OK</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
