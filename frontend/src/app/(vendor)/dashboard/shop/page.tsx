'use client';

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Store, 
  Save, 
  MapPin, 
  Phone, 
  Info, 
  CheckCircle2, 
  Loader2, 
  Camera,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopData {
  name: string;
  description: string;
  whatsapp_number: string;
  city: string;
  logo_url?: string;
}

export default function ShopSettingsPage() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  // Fetch current shop data
  const { data: shop, isLoading } = useQuery({
    queryKey: ['vendor-shop'],
    queryFn: async () => {
      const { data } = await api.get('/vendor/shop');
      return data.data;
    }
  });

  const [formData, setFormData] = useState<ShopData>({
    name: "",
    description: "",
    whatsapp_number: "",
    city: "Cotonou",
  });

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || "",
        description: shop.description || "",
        whatsapp_number: shop.whatsapp_number || "",
        city: shop.city || "Cotonou",
      });
    }
  }, [shop]);

  const updateShop = useMutation({
    mutationFn: (data: ShopData) => api.put('/vendor/shop', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-shop'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShop.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-96 w-full bg-muted rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ma Boutique</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configurez l'apparence et les coordonnées de votre point de vente.</p>
        </div>
        {success && (
          <div className="flex items-center space-x-2 text-whatsapp font-bold animate-in bounce-in duration-300">
            <CheckCircle2 className="w-5 h-5" />
            <span>Enregistré !</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Visual Identity Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glassmorphism rounded-3xl p-8 border border-border text-center relative overflow-hidden group">
             <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                   {shop?.logo_url ? (
                     <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                   ) : (
                     <Store className="w-12 h-12 text-muted-foreground opacity-20" />
                   )}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </button>
             </div>
             <h3 className="text-lg font-bold">{formData.name || "Ma Boutique"}</h3>
             <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Ville : {formData.city}</p>
             
             <div className="mt-8 pt-8 border-t border-border space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status du Store</span>
                  <span className="badge badge-success badge-sm text-white">Actif</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Identité vérifiée</span>
                  <span className={cn("font-bold", shop?.is_verified ? "text-whatsapp" : "text-amber-500")}>
                    {shop?.is_verified ? "OUI" : "EN ATTENTE"}
                  </span>
                </div>
             </div>
          </div>

          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
            <h4 className="text-sm font-bold flex items-center mb-3">
              <Info className="w-4 h-4 mr-2 text-primary" /> Astuce Pro
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Une boutique avec un logo et une description détaillée reçoit en moyenne 3x plus de clics WhatsApp qu'une boutique anonyme.
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-3xl p-8 border border-border shadow-sm space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center">
                   <Store className="w-4 h-4 mr-2 opacity-50" /> Nom de l'enseigne
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: Michel Electronics"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center">
                   <Phone className="w-4 h-4 mr-2 opacity-50" /> Numéro WhatsApp
                </label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                    className="w-full px-4 py-3 pl-12 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="229XXXXXXXX"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm border-r border-border pr-2">
                    🇧🇯
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center">
                 <LayoutGrid className="w-4 h-4 mr-2 opacity-50" /> Ville du commerce
              </label>
              <select 
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
              >
                <option value="Cotonou">Cotonou</option>
                <option value="Abomey-Calavi">Abomey-Calavi</option>
                <option value="Porto-Novo">Porto-Novo</option>
                <option value="Parakou">Parakou</option>
                <option value="Bohicon">Bohicon</option>
                <option value="Ouidah">Ouidah</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">À propos de votre boutique</label>
              <textarea 
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Décrivez ce que vous vendez, vos horaires ou vos zones de livraison..."
              />
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
               <button 
                type="submit" 
                disabled={updateShop.isPending}
                className="btn btn-primary px-8 text-white shadow-xl shadow-primary/20 rounded-2xl h-14"
               >
                 {updateShop.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                 Enregistrer les modifications
               </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
