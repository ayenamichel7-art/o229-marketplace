"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Ticket, Plus, Trash2, Calendar, Hash, Percent, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "fixed",
    value: "",
    usage_limit: "",
    expires_at: ""
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["vendor-coupons"],
    queryFn: async () => {
      const res = await api.get("/vendor/coupons");
      return res.data;
    }
  });

  const addCoupon = useMutation({
    mutationFn: async (data: any) => {
      return await api.post("/vendor/coupons", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-coupons"] });
      setShowAddModal(false);
      setNewCoupon({ code: "", type: "fixed", value: "", usage_limit: "", expires_at: "" });
    }
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/vendor/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-coupons"] });
    }
  });

  if (isLoading) return <div className="p-10 flex justify-center"><span className="loading loading-spinner text-primary"></span></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center border-b border-base-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Ticket className="w-7 h-7 mr-3 text-secondary" />
            Coupons de réduction
          </h1>
          <p className="text-base-content/60 text-sm">Boostez vos ventes en proposant des codes promos.</p>
        </div>
        <button className="btn btn-secondary text-white shadow-lg" onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons && coupons.length > 0 ? coupons.map((coupon: any) => (
          <div key={coupon.id} className="bg-base-100 rounded-2xl border-2 border-dashed border-base-300 p-6 flex flex-col hover:border-secondary/40 transition-colors relative overflow-hidden group">
            {/* Coupon Visual Design */}
            <div className="flex justify-between items-start mb-4">
               <div>
                  <span className="text-sm font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full">
                    {coupon.code}
                  </span>
               </div>
               <button 
                 onClick={() => deleteCoupon.mutate(coupon.id)}
                 className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-error/10 rounded-full"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>

            <div className="flex items-end gap-2 mb-6">
               <span className="text-3xl font-black">
                 {coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
               </span>
               <span className="text-sm text-base-content/50 pb-1">de remise</span>
            </div>

            <div className="space-y-2 mt-auto">
               <div className="flex items-center text-xs text-base-content/60">
                  <Hash className="w-3 h-3 mr-2" />
                  {coupon.usage_limit ? `${coupon.usage_count} / ${coupon.usage_limit} utilisés` : `${coupon.usage_count} utilisés (Illimité)`}
               </div>
               {coupon.expires_at && (
                 <div className="flex items-center text-xs text-base-content/60">
                    <Clock className="w-3 h-3 mr-2" />
                    Expire le {new Date(coupon.expires_at).toLocaleDateString()}
                 </div>
               )}
            </div>

            {/* Decorative circles to mimic a real ticket */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-base-200 rounded-full border border-base-300"></div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-base-200 rounded-full border border-base-300"></div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-base-300 rounded-3xl">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-base-content/20" />
            <h3 className="text-xl font-bold">Aucun coupon actif</h3>
            <p className="text-base-content/50">C'est le moment idéal pour créer votre première offre promo !</p>
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-xl mb-6">Créer un nouveau coupon</h3>
            
            <form onSubmit={(e) => { e.preventDefault(); addCoupon.mutate(newCoupon); }} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Code Promo</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="SOLDES2024" 
                    className="input input-bordered w-full pr-12 font-mono uppercase tracking-widest"
                    value={newCoupon.code}
                    onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30"><Hash className="w-4 h-4" /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Type</span></label>
                  <select 
                    className="select select-bordered" 
                    value={newCoupon.type}
                    onChange={e => setNewCoupon({...newCoupon, type: e.target.value})}
                  >
                    <option value="fixed">Montant fixe (FCFA)</option>
                    <option value="percentage">Pourcentage (%)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Valeur</span></label>
                  <input 
                    type="number" 
                    placeholder={newCoupon.type === 'percentage' ? "10" : "5000"} 
                    className="input input-bordered" 
                    value={newCoupon.value}
                    onChange={e => setNewCoupon({...newCoupon, value: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Date d'expiration (Optionnel)</span></label>
                <input 
                  type="date" 
                  className="input input-bordered" 
                  value={newCoupon.expires_at}
                  onChange={e => setNewCoupon({...newCoupon, expires_at: e.target.value})}
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Limite d'utilisation (Optionnel)</span></label>
                <input 
                  type="number" 
                  placeholder="ex: 50" 
                  className="input input-bordered" 
                  value={newCoupon.usage_limit}
                  onChange={e => setNewCoupon({...newCoupon, usage_limit: e.target.value})}
                />
              </div>

              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-secondary text-white" disabled={addCoupon.isPending}>
                  {addCoupon.isPending ? <span className="loading loading-spinner text-xs"></span> : "Créer le coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
