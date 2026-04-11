'use client';

import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  Share2, 
  Settings,
  Target,
  Users,
  LineChart
} from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* 🛡️ Header */}
        <div className="text-center space-y-6 mb-20">
           <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
              <ShieldCheck className="w-10 h-10" />
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Politique de Confidentialité</h1>
           <p className="text-slate-500 font-medium">Dernière mise à jour : 10 Avril 2026</p>
        </div>

        {/* 📣 Ad & Growth Strategy Section */}
        <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 transition-all opacity-50" />
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-primary/20">
                 <Target className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black italic">Engagement de Visibilité O-229</h2>
                 <p className="text-white/60 text-sm leading-relaxed">
                   Notre mission est de propulser vos produits vers une audience massive. Pour cela, nous utilisons les technologies de ciblage les plus avancées (Google Ads, Facebook Ads, TikTok Ads) afin de générer un trafic qualifié et constant vers vos boutiques.
                 </p>
              </div>
           </div>
        </div>

        {/* 📝 Content Sections */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-14 shadow-xl space-y-16">
          
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center">
              <Database className="w-6 h-6 mr-4 text-primary" /> 1. Quelles données collectons-nous ?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Pour assurer le bon fonctionnement de la plateforme et optimiser la visibilité de vos boutiques, nous collectons :
            </p>
            <ul className="grid md:grid-cols-2 gap-4">
              {[
                "Informations de profil (nom, emailvendeur, etc.)",
                "Données de navigation (pages vues, clics)",
                "Statistiques WhatsApp (clics sur vos produits)",
                "Identifiants techniques (Cookies, Pixels Ads)"
              ].map((item, i) => (
                <li key={i} className="flex items-center p-4 bg-slate-50 rounded-xl text-sm font-bold text-slate-700">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3" /> {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center">
              <LineChart className="w-6 h-6 mr-4 text-primary" /> 2. Pourquoi utilisons-nous vos données ?
            </h3>
            <p className="text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-6">
              "Maximiser les ventes est notre priorité absolue."
            </p>
            <div className="grid gap-6">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0"><Target className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Publicité Ciblée & Remarketing</h4>
                    <p className="text-sm text-slate-500">Nous utilisons vos données pour recibler les clients potentiels sur Facebook, TikTok et Google qui ont montré un intérêt pour vos produits.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Analyse d'Audience</h4>
                    <p className="text-sm text-slate-500">Comprendre le comportement des acheteurs pour améliorer l'ergonomie de vos boutiques et augmenter le taux de conversion.</p>
                  </div>
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center">
              <Share2 className="w-6 h-6 mr-4 text-primary" /> 3. Partage des informations
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Nous ne vendons JAMAIS vos données personnelles à des tiers. Cependant, des données anonymisées sont partagées avec nos partenaires publicitaires (Facebook Business Suite, Google Analytics, ByteDance) pour diffuser vos annonces auprès de la bonne audience au Bénin et à l'international.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center">
              <Lock className="w-6 h-6 mr-4 text-primary" /> 4. Sécurité de vos informations
            </h3>
            <p className="text-slate-600 leading-relaxed">
              O-229 utilise des protocoles de sécurité de pointe (SSL, Chiffrement des mots de passe) pour protéger l'intégrité de vos informations et celles de vos clients.
            </p>
          </section>

        </div>

        {/* ✉️ Footer Contact */}
        <div className="text-center pt-10">
           <p className="text-slate-400 text-sm">
             Des questions ? Contactez notre responsable de la protection des données à <a href="mailto:privacy@o229.com" className="text-primary font-bold hover:underline">privacy@o229.com</a>
           </p>
        </div>

      </div>
    </div>
  );
}
