'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  UserCheck, 
  UserMinus, 
  Search, 
  Filter, 
  Mail, 
  Shield, 
  Calendar,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", statusFilter],
    queryFn: async () => {
      const res = await api.get("/admin/users", { params: { status: statusFilter } });
      return res.data;
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number, reason?: string }) => {
      return await api.put(`/admin/users/${userId}/toggle-active`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUserId(null);
      setRejectionReason("");
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-xl" />
        <div className="h-[500px] w-full bg-slate-100 rounded-[2rem]" />
      </div>
    );
  }

  const users = data?.data || [];
  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Approbation Comptes</h1>
          <p className="text-slate-500 mt-1 flex items-center">
            <UserCheck className="w-4 h-4 mr-2 text-primary" /> 
            Validez l'accès des nouveaux utilisateurs (Clients & Vendeurs).
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
           <button 
             onClick={() => setStatusFilter('all')}
             className={cn("px-4 py-2 text-sm font-bold rounded-xl transition-all", statusFilter === 'all' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50")}
           >
             Tous
           </button>
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
             Actifs
           </button>
        </div>
      </div>

      {/* 🔍 Search Bar */}
      <div className="group relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher par nom d'utilisateur ou email..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📊 Modern Users Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Utilisateur</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Rôle</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Date d'inscription</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Statut</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200 uppercase">
                        {u.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">{u.name}</div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center">
                          <Mail className="w-3 h-3 mr-1" /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                      u.role === 'admin' ? "bg-slate-900 text-white" : 
                      u.role === 'vendor' ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                    )}>
                       <Shield className="w-3 h-3 mr-1" /> {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-slate-500 font-medium flex items-center">
                       <Calendar className="w-3.5 h-3.5 mr-2 opacity-30" />
                       {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {u.is_active ? (
                      <div className="flex items-center text-whatsapp font-bold text-[10px] uppercase tracking-widest">
                         <CheckCircle2 className="w-4 h-4 mr-2" />
                         ACTIF
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center text-amber-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">
                           <AlertCircle className="w-4 h-4 mr-2" />
                           EN ATTENTE
                        </div>
                        {u.rejection_reason && (
                          <span className="text-[10px] text-destructive italic mt-1 max-w-[120px] truncate" title={u.rejection_reason}>
                            Refusé : {u.rejection_reason}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    {selectedUserId === u.id ? (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white p-4 border border-slate-200 rounded-2xl shadow-2xl flex flex-col gap-3 w-72 animate-in zoom-in-95">
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Motif du blocage</p>
                        <textarea 
                          className="w-full h-20 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-destructive/10"
                          placeholder="Expliquez la raison..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <button className="flex-1 px-3 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setSelectedUserId(null)}>Annuler</button>
                          <button 
                            className="flex-1 px-3 py-2 bg-destructive text-white text-[10px] font-black rounded-lg shadow-lg shadow-destructive/20"
                            onClick={() => toggleStatus.mutate({ userId: u.id, reason: rejectionReason })}
                          >BLOQUER</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          if (u.is_active) {
                            setSelectedUserId(u.id);
                          } else {
                            toggleStatus.mutate({ userId: u.id });
                          }
                        }}
                        disabled={toggleStatus.isPending || u.role === 'admin'}
                        className={cn(
                          "px-6 py-2 rounded-xl text-[10px] font-black transition-all shadow-sm uppercase tracking-widest",
                          u.is_active 
                            ? "bg-slate-100 text-slate-500 hover:bg-destructive hover:text-white" 
                            : "bg-primary text-white hover:shadow-lg hover:shadow-primary/30"
                        )}
                      >
                        {u.is_active ? 'BLOQUER' : 'APPROUVER'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <XCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun utilisateur trouvé</p>
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
