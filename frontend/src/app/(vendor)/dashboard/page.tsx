'use client';

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { KpiCards } from "@/components/vendor/KpiCards";
import { InsightList } from "@/components/vendor/InsightList";
import { 
  ShoppingBag, 
  TrendingUp, 
  ArrowUpRight, 
  Package, 
  Plus, 
  Zap,
  Clock,
  ExternalLink,
  Sparkles,
  Ticket,
  FileDown
} from "lucide-react";
import Link from "next/link";
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-hot-toast";

export default function VendorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/vendor/dashboard");
      return data;
    },
  });

  const handleDownloadReport = async () => {
    try {
      toast.loading("Génération du rapport...", { id: "report" });
      const response = await api.get("/vendor/analytics/report", { 
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rapport_O229_${new Date().toLocaleDateString()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Rapport téléchargé !", { id: "report" });
    } catch (error) {
      console.error(error);
      toast.error("Échec de la génération.", { id: "report" });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-muted rounded-2xl" />
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 👑 Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Vue d'Ensemble</h1>
          <p className="text-muted-foreground mt-1 flex items-center">
            <Clock className="w-4 h-4 mr-1 ml-0.5" /> Dernières 24 heures : +12 nouvelles vues
          </p>
        </div>
        <div className="flex items-center space-x-3">
           <button 
             onClick={handleDownloadReport}
             className="btn btn-ghost border-border bg-surface hover:bg-muted text-foreground"
           >
             <FileDown className="w-4 h-4 mr-1.5" /> Télécharger mon bilan PDF
           </button>
           <Link href="/dashboard/products" className="btn btn-ghost border-border bg-surface hover:bg-muted text-foreground">
             Gérer mes produits
           </Link>
           <Link href="/dashboard/products/new" className="btn btn-primary text-white shadow-lg shadow-primary/20">
             <Plus className="w-4 h-4 mr-1.5" /> Ajouter un produit
           </Link>
        </div>
      </div>

      {/* 📊 KPI Dashboard Overlay */}
      <KpiCards kpis={data.kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* 📈 Main Performance Area */}
        <div className="xl:col-span-8 space-y-8">
          
          <div className="glassmorphism rounded-3xl p-6 md:p-8 border border-border shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <TrendingUp className="w-64 h-64 rotate-12" />
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                   <Zap className="w-5 h-5" />
                 </div>
                 <h3 className="text-xl font-bold">Courbe de Performance</h3>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span>Vues</span>
                <span className="flex items-center ml-4"><span className="w-2 h-2 rounded-full bg-whatsapp mr-2"></span>Contacts</span>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart_data}>
                  <defs>
                    <linearGradient id="chartViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="date_label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'currentColor', opacity: 0.5, fontSize: 12}}
                    dy={10}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.5, fontSize: 12}} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--surface))', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#chartViews)" 
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_clicks" 
                    stroke="hsl(142 71% 45%)" 
                    strokeWidth={4} 
                    fill="transparent"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold flex items-center">
               <ShoppingBag className="w-5 h-5 mr-2 text-primary" /> Vos meilleurs produits
             </h3>
             <Link href="/dashboard/products" className="text-sm font-semibold text-primary flex items-center hover:underline">
               Tout voir <ExternalLink className="w-3 h-3 ml-1" />
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.top_products.map((product: any) => (
              <div key={product.id} className="p-4 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all group flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden">
                  {product.image ? (
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.views} vues • {product.leads} contacts</p>
                  <p className="text-primary font-bold mt-1">{product.price}</p>
                </div>
                <div className="flex flex-col items-end">
                   <div className="p-2 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                     <ArrowUpRight className="w-4 h-4" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 💡 Sidebar Area (Insights & Meta) */}
        <div className="xl:col-span-4 space-y-8">
           <div className="glassmorphism rounded-3xl p-6 border border-border relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
             <div className="relative z-10">
                <h3 className="text-lg font-bold flex items-center mb-6">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" /> Conseils de l'IA O-229
                </h3>
                <InsightList />
             </div>
           </div>

           <div className="p-6 rounded-3xl bg-secondary/10 border border-secondary/20 relative group cursor-pointer overflow-hidden">
             <div className="absolute right-0 bottom-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <Ticket className="w-24 h-24" />
             </div>
             <h4 className="font-bold text-secondary mb-2">Lancez une promo</h4>
             <p className="text-xs text-muted-foreground mb-4">
               Les coupons de réduction augmentent les contacts WhatsApp de 40% en moyenne au Bénin.
             </p>
             <Link href="/dashboard/coupons" className="text-xs font-bold text-secondary flex items-center">
               Créer un coupon <ArrowUpRight className="w-3 h-3 ml-1" />
             </Link>
           </div>
        </div>

      </div>
    </div>
  );
}
