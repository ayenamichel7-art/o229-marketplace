'use client';

import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  MessageCircle, 
  Clock,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    setTimeout(() => {
      alert("Message envoyé avec succès ! Nous vous recontacterons sous peu.");
      setSending(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🚀 Hero Header */}
        <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
             <Sparkles className="w-3 h-3 mr-2" /> Nous sommes à votre écoute
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Comment pouvons-nous<br/> 
            <span className="text-primary italic">vous aider ?</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Une question sur la plateforme, un besoin d'assistance technique ou une demande de partenariat ? Nos experts vous répondent.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* 📞 Contact Info Side */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl shadow-slate-200/50 space-y-10">
              
              <h2 className="text-2xl font-black text-slate-900">Coordonnées Directes</h2>

              <div className="space-y-6">
                {/* Phones */}
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Téléphones</p>
                    <div className="flex flex-col space-y-1">
                       <a href="tel:+2290146906352" className="text-lg font-bold text-slate-900 hover:text-primary transition-colors">01 46 90 63 52</a>
                       <a href="tel:+2290152944148" className="text-lg font-bold text-slate-900 hover:text-primary transition-colors">01 52 94 41 48</a>
                       <a href="tel:+2290151782839" className="text-lg font-bold text-slate-900 hover:text-primary transition-colors">01 51 78 28 39</a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Support</p>
                    <a href="mailto:ayenamichel7@gmail.com" className="text-lg font-bold text-slate-900 hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">
                      ayenamichel7@gmail.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Siège Social</p>
                    <p className="text-lg font-bold text-slate-900">Cotonou, Bénin</p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="pt-8 border-t border-slate-100">
                <div className="flex items-center space-x-4 text-whatsapp">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-bold uppercase tracking-widest italic">Ouvert : Lun - Ven • 08h - 18h</p>
                </div>
              </div>

            </div>

            {/* Assistance Badge */}
            <div className="p-8 rounded-[2rem] bg-slate-900 text-white flex items-center space-x-6 shadow-xl">
               <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white ring-8 ring-white/5">
                  <MessageCircle className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="font-black text-lg">Assistance Rapide ?</h4>
                  <p className="text-white/50 text-xs">Nos conseillers sont aussi disponibles sur WhatsApp pour une réponse immédiate.</p>
               </div>
            </div>
          </div>

          {/* 📝 Contact Form Side */}
          <div className="lg:col-span-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 md:p-14 shadow-2xl shadow-slate-200/50">
               <h2 className="text-3xl font-black text-slate-900 mb-8">Envoyez un message</h2>
               
               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                        placeholder="Ex: Jean Houndékon"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                       <input 
                        type="email" 
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                        placeholder="jean@exemple.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sujet</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                      placeholder="Comment pouvons-nous vous aider ?"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                      required
                      rows={6}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium resize-none"
                      placeholder="Décrivez votre demande en détail..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={sending}
                    className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
                  >
                    {sending ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>Envoyer le message</span>
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-slate-400">
                     <ShieldCheck className="w-4 h-4" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">Données protégées par le système O-229</p>
                  </div>
               </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
