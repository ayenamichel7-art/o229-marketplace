'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  Mail, 
  Trash2, 
  ExternalLink, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminVendorsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vendors", filter],
    queryFn: async () => {
      const res = await api.get("/admin/vendors");
      return res.data;
    },
  });

  const toggleVerification = useMutation({
    mutationFn: async (shopId: number) => {
      return await api.put(`/admin/vendors/${shopId}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-xl" />
        <div className="h-[600px] w-full bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  const shops = data?.data || [];
  const filteredShops = shops.filter((shop: any) => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (shop.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" ? true : 
                          filter === "verified" ? shop.is_verified === 1 : 
                          shop.is_verified === 0;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* 🚀 Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Vérification KYC</h1>
          <p className="text-slate-500 mt-1 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> 
            {shops.filter((s:any) => !s.is_verified).length} dossiers en attente de certification.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
           <button 
             onClick={() => setFilter('all')}
             className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", filter === 'all' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50")}
           >
             Tous
           </button>
           <button 
             onClick={() => setFilter('pending')}
             className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", filter === 'pending' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50")}
           >
             En Attente
           </button>
           <button 
             onClick={() => setFilter('verified')}
             className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", filter === 'verified' ? "bg-whatsapp text-white shadow-lg shadow-whatsapp/20" : "text-slate-500 hover:bg-slate-50")}
           >
             Vérifiés
           </button>
        </div>
      </div>

      {/* 🔍 Toolbar */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher par nom de boutique, propriétaire ou email..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📊 Modern Data Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Vendeur</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Contact</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Ville</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Statut</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredShops.map((shop: any) => (
                <tr key={shop.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 group-hover:border-primary/30 group-hover:bg-white transition-all">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">{shop.name}</div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center">
                          <User className="w-3 h-3 mr-1" /> {shop.user?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-slate-700">{shop.whatsapp_number}</div>
                    <div className="text-xs text-slate-400 flex items-center mt-1">
                       <Mail className="w-3 h-3 mr-1" /> {shop.user?.email}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {shop.city}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                    {shop.is_verified ? (
                      <div className="flex items-center text-whatsapp font-bold text-xs uppercase tracking-wider">
                         <div className="w-2 h-2 rounded-full bg-whatsapp mr-2"></div>
                         Vérifié
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-500 font-bold text-xs uppercase tracking-wider">
                         <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div>
                         En attente
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                       {shop.kyc_document ? (
                         <a 
                          href={shop.kyc_document} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Voir le document KYC"
                         >
                           <Eye className="w-5 h-5" />
                         </a>
                       ) : (
                         <div className="p-2 text-slate-200" title="Pas de KYC">
                            <Eye className="w-5 h-5" />
                         </div>
                       )}
                       
                       <button 
                        onClick={() => toggleVerification.mutate(shop.id)}
                        disabled={toggleVerification.isPending}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm",
                          shop.is_verified 
                            ? "bg-slate-100 text-slate-600 hover:bg-destructive hover:text-white" 
                            : "bg-primary text-white hover:shadow-lg hover:shadow-primary/30"
                        )}
                       >
                         {toggleVerification.isPending ? "..." : (shop.is_verified ? "Révoquer" : "Approuver")}
                       </button>

                       <button className="p-2 text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredShops.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                       <ShieldAlert className="w-16 h-16 text-slate-200 mb-4" />
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Aucun vendeur trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50 px-8 py-5 flex items-center justify-between border-t border-slate-100">
           <div className="text-xs text-slate-500 font-medium italic">
             Mise à jour automatique par le système KYC Pro.
           </div>
           <div className="flex items-center space-x-4">
              <span className="text-xs text-slate-400">{filteredShops.length} boutiques affichées</span>
           </div>
        </div>
      </div>

    </div>
  );
}
