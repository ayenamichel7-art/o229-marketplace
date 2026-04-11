'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatPrice, cn } from "@/lib/utils";

export default function VendorProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-products"],
    queryFn: async () => {
      const res = await api.get("/vendor/products");
      return res.data;
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => api.delete(`/vendor/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor-products"] }),
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const products = data?.data || [];
  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Mes Produits</h1>
          <p className="text-slate-500 mt-1 flex items-center">
            <Package className="w-4 h-4 mr-2 text-primary" /> 
            Gérez votre catalogue et suivez l'état de modération.
          </p>
        </div>
        <Link href="/dashboard/products/new" className="btn btn-primary text-white shadow-xl shadow-primary/20 h-12 px-6 rounded-2xl">
          <Plus className="w-5 h-5 mr-2" /> Ajouter un produit
        </Link>
      </div>

      {/* Info Alert about Moderation */}
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start space-x-3">
         <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
         <div className="text-sm text-slate-600">
            <p className="font-bold text-primary">Nouveau système de modération</p>
            <p>Par mesure de sécurité, tout nouveau produit ou modification d'un produit existant doit être <strong>validé par un administrateur</strong> avant d'être visible publiquement sur O-229.</p>
         </div>
      </div>

      {/* Filters & Search */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-all" />
        <input 
          type="text" 
          placeholder="Rechercher dans mes produits..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Table/List */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Produit</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Prix</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">État Visibilité</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Stats</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product: any) => (
                <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 group-hover:border-primary/30 transition-all">
                        {product.primary_image ? (
                          <img src={product.primary_image.url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate max-w-[200px]">{product.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{product.category?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-black text-slate-900">{formatPrice(product.price)}</span>
                  </td>
                  <td className="px-6 py-5">
                    {product.approval_status === 'pending' ? (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-tighter animate-pulse">
                        <Clock className="w-3 h-3 mr-1.5" /> En Modération
                      </div>
                    ) : product.approval_status === 'approved' ? (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-whatsapp/5 text-whatsapp border border-whatsapp/10 text-[10px] font-black uppercase tracking-tighter">
                        <CheckCircle2 className="w-3 h-3 mr-1.5" /> Public
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-destructive/5 text-destructive border border-destructive/10 text-[10px] font-black uppercase tracking-tighter">
                          <XCircle className="w-3 h-3 mr-1.5" /> Refusé
                        </div>
                        {product.rejection_reason && (
                           <span className="text-[9px] text-destructive/60 mt-1 max-w-[120px] truncate" title={product.rejection_reason}>
                             {product.rejection_reason}
                           </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 font-mono text-xs text-slate-500">
                     {product.views_count} vues • {product.whatsapp_clicks_count} clics
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                       <Link href={`/dashboard/products/${product.id}`} className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                          <Edit className="w-5 h-5" />
                       </Link>
                       <button 
                        onClick={() => { if(confirm('Supprimer ce produit ?')) deleteProduct.mutate(product.id) }}
                        className="p-2.5 text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                       >
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center">
                       <Package className="w-16 h-16 text-slate-200 mb-4" />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun produit</p>
                       <Link href="/dashboard/products/new" className="text-primary text-xs font-bold mt-2 hover:underline">
                         Ajoutez votre premier article
                       </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
