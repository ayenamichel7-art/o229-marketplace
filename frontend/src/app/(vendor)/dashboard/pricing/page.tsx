'use client';

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { 
  Check, 
  ShieldCheck, 
  Star, 
  Zap, 
  Clock, 
  CreditCard,
  Gift,
  ArrowRight,
  Loader2
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

interface Plan {
  id: number;
  name: string;
  price: string;
  duration_days: number;
  max_products: number;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/vendor/plans"),
      api.get("/vendor/subscription")
    ]).then(([plansRes, subRes]) => {
      setPlans(plansRes.data.data);
      setSubscription(subRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: number) => {
    setSubscribing(planId);
    try {
      const res = await api.post("/vendor/subscribe", { plan_id: planId });
      alert(res.data.message);
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse text-center">
        <div className="h-10 w-64 bg-slate-200 rounded-xl mx-auto" />
        <div className="h-96 w-full max-w-2xl bg-slate-100 rounded-[2.5rem] mx-auto" />
      </div>
    );
  }

  const premiumPlan = plans.find(p => p.price !== "0.00") || plans[0];
  const isTrialActive = subscription?.status === 'active' && subscription?.is_trial;
  const isExpired = subscription && new Date(subscription.expires_at) < new Date();

  return (
    <div className="p-6 md:p-8 space-y-12 animate-in fade-in duration-700">
      
      {/* 🚀 Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Un seul abonnement.<br/>
          <span className="text-primary">Tout illimité.</span>
        </h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
           Sur O-229 Marketplace, nous croyons en la simplicité. Profitez de toutes nos fonctionnalités professionnelles à un tarif fixe ultra-compétitif.
        </p>
      </div>

      {/* 🎁 Free Month Badge */}
      {!subscription && (
        <div className="flex justify-center">
           <div className="flex items-center space-x-3 px-6 py-3 bg-whatsapp/10 border border-whatsapp/20 rounded-full text-whatsapp font-black text-sm uppercase tracking-widest animate-bounce">
              <Gift className="w-5 h-5" />
              <span>Cadeau de bienvenue : 1 mois OFFERT !</span>
           </div>
        </div>
      )}

      {/* 💳 The Card */}
      <div className="max-w-xl mx-auto">
        <div className="relative group">
          {/* Background Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-2xl flex flex-col">
            
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-2xl font-black text-slate-900">{premiumPlan?.name}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Plan Pro Illimité</p>
               </div>
               <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                  <Zap className="w-8 h-8 fill-current" />
               </div>
            </div>

            <div className="mb-10">
               <div className="flex items-baseline">
                  <span className="text-6xl font-black text-slate-900 tracking-tighter">{formatPrice(premiumPlan?.price || 15000)}</span>
                  <span className="text-slate-400 font-bold text-lg ml-3">/ mois</span>
               </div>
               <p className="text-slate-500 font-medium mt-4 flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Pas d'engagement, résiliable à tout moment.
               </p>
            </div>

            <div className="space-y-5 mb-12">
               {[
                 "Produits illimités dans votre boutique",
                 "Badge 'Vendeur Vérifié' sur votre profil",
                 "Analyses IA & Conseils de performance",
                 "Support Admin prioritaire (Chat direct)",
                 "Statistiques détaillées des clics WhatsApp",
                 "Gestion avancée des coupons promo"
               ].map((feature, i) => (
                 <div key={i} className="flex items-center space-x-4">
                    <div className="w-6 h-6 rounded-full bg-whatsapp/10 flex items-center justify-center text-whatsapp flex-shrink-0">
                       <Check className="w-4 h-4 stroke-[4]" />
                    </div>
                    <span className="text-slate-700 font-bold text-sm tracking-tight">{feature}</span>
                 </div>
               ))}
            </div>

            {subscription ? (
              <div className="mt-auto space-y-4">
                 <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Votre situation actuelle</p>
                    <div className={cn("text-lg font-black", isExpired ? "text-destructive" : "text-whatsapp")}>
                       {isExpired ? "Abonnement Expiré ⛔" : `Actif jusqu'au ${new Date(subscription.expires_at).toLocaleDateString('fr-FR')}`}
                    </div>
                    {isTrialActive && <p className="text-[10px] text-primary font-bold mt-1">MOIS D'ESSAI GRATUIT EN COURS 🎁</p>}
                 </div>
                 
                 {(isExpired || isTrialActive) && (
                    <button 
                      onClick={() => handleSubscribe(premiumPlan.id)}
                      className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center space-x-3 group"
                    >
                      <span>Renouveler avec FedaPay</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                 )}
              </div>
            ) : (
              <button 
                onClick={() => handleSubscribe(premiumPlan.id)}
                className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center space-x-3 group"
              >
                <span>Démarrer mon mois d'essai</span>
                <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            )}

            <div className="mt-8 flex items-center justify-center space-x-4">
               <img src="https://fedapay.com/assets/img/logo.png" className="h-6 grayscale opacity-30" alt="FedaPay" />
               <div className="w-px h-6 bg-slate-200" />
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Paiements sécurisés au Bénin</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
