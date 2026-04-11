'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Store,
  MapPin,
  Eye,
  MessageSquare,
  ChevronRight,
  ArrowUpRight,
  User
} from "lucide-react";
import { useState } from "react";
import { formatPrice, cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", statusFilter],
    queryFn: async () => {
      const res = await api.get("/admin/products", { params: { status: statusFilter } });
      return res.data;
    },
  });

  const moderateProduct = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number, status: string, reason?: string }) => {
      return await api.put(`/admin/products/${id}/moderate`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setSelectedProductId(null);
      setRejectionReason("");
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-80 bg-slate-100 rounded-3xl" />
           ))}
        </div>
      </div>
    );
  }

  const products = data?.data || [];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Modération Produits</h1>
          <p className="text-slate-500 mt-1 flex items-center">
            {statusFilter === 'pending' ? (
              <Clock className="w-4 h-4 mr-2 text-amber-500" />
            ) : statusFilter === 'approved' ? (
              <CheckCircle className="w-4 h-4 mr-2 text-whatsapp" />
            ) : (
              <XCircle className="w-4 h-4 mr-2 text-destructive" />
            )}
            {products.length} articles trouvés sous le filtre actuel.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
           <button 
             onClick={() => setStatusFilter('pending')}
             className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", statusFilter === 'pending' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:bg-slate-50")}
           >
             En Attente
           </button>
           <button 
             onClick={() => setStatusFilter('approved')}
             className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", statusFilter === 'approved' ? "bg-whatsapp text-white shadow-lg shadow-whatsapp/20" : "text-slate-500 hover:bg-slate-50")}
           >
             Approuvés
           </button>
           <button 
             onClick={() => setStatusFilter('rejected')}
             className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", statusFilter === 'rejected' ? "bg-destructive text-white shadow-lg shadow-destructive/20" : "text-slate-500 hover:bg-slate-50")}
           >
             Rejetés
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {products.map((product: any) => (
          <div key={product.id} className="group relative bg-white rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:-translate-y-1">
            
            {/* Product Image Area */}
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
              {product.primary_image ? (
                <img src={product.primary_image.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <ShoppingBag className="w-12 h-12 mb-2 opacity-20" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Sans Image</span>
                </div>
              )}
              
              <div className="absolute top-4 right-4 group-hover:translate-x-0 translate-x-12 transition-transform">
                 <div className="badge badge-lg bg-white/90 backdrop-blur border-none shadow-xl font-black text-slate-900">
                    {formatPrice(product.price)}
                 </div>
              </div>
              
              <div className="absolute top-4 left-4">
                 <span className={cn(
                   "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg",
                   product.approval_status === 'pending' ? "bg-amber-500 text-white" : 
                   product.approval_status === 'approved' ? "bg-whatsapp text-white" : "bg-destructive text-white"
                 )}>
                   {product.approval_status}
                 </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 leading-snug line-clamp-2 min-h-[3rem]">{product.name}</h3>
                <div className="flex items-center text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                  <MapPin className="w-3 h-3 mr-1" /> {product.city} • ID #{product.id}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-colors group-hover:border-primary/20 group-hover:bg-primary/[0.02]">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-xs text-primary">
                  {product.shop?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{product.shop?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{product.shop?.user?.name}</p>
                </div>
              </div>

              {product.approval_status === 'rejected' && product.rejection_reason && (
                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-[11px] text-destructive leading-relaxed">
                   <strong className="block mb-1">MOTIF DU REFUS :</strong>
                   {product.rejection_reason}
                </div>
              )}
            </div>

            {/* Actions Area */}
            {product.approval_status === 'pending' && (
              <div className="p-4 border-t border-slate-50 flex space-x-3">
                <button 
                  onClick={() => moderateProduct.mutate({ id: product.id, status: 'approved' })}
                  disabled={moderateProduct.isPending}
                  className="flex-1 h-12 rounded-2xl bg-whatsapp/10 text-whatsapp font-black text-sm hover:bg-whatsapp hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-whatsapp/30 flex items-center justify-center"
                >
                  ACCEPTER
                </button>
                <button 
                  onClick={() => setSelectedProductId(product.id)}
                  disabled={moderateProduct.isPending}
                  className="flex-1 h-12 rounded-2xl bg-destructive/5 text-destructive font-black text-sm hover:bg-destructive hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-destructive/30 flex items-center justify-center"
                >
                  REJETER
                </button>
              </div>
            )}

            {/* Rejection Prompt */}
            {selectedProductId === product.id && (
              <div className="absolute inset-0 z-20 bg-white p-8 flex flex-col justify-center animate-in slide-in-from-bottom duration-300">
                <div className="mb-6 flex items-center space-x-3 text-destructive">
                   <AlertTriangle className="w-6 h-6" />
                   <h4 className="text-xl font-black">Refus de l'article</h4>
                </div>
                <textarea 
                  className="w-full h-32 p-4 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-destructive/20 transition-all outline-none resize-none mb-6"
                  placeholder="Expliquez au vendeur pourquoi son article est refusé..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <div className="flex space-x-3">
                   <button 
                     className="flex-1 h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors"
                     onClick={() => { setSelectedProductId(null); setRejectionReason(""); }}
                   >Annuler</button>
                   <button 
                     className="flex-2 h-12 bg-destructive text-white rounded-xl font-black text-sm shadow-xl shadow-destructive/20 disabled:opacity-50"
                     disabled={!rejectionReason || moderateProduct.isPending}
                     onClick={() => moderateProduct.mutate({ id: product.id, status: 'rejected', reason: rejectionReason })}
                   >CONFIRMER LE REJET</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-32 text-center text-slate-300">
             <ShoppingBag className="w-24 h-24 mx-auto mb-6 opacity-10" />
             <p className="font-bold uppercase tracking-widest text-sm">Tout est en ordre</p>
             <p className="text-xs mt-2">Aucun produit ne nécessite de modération pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
