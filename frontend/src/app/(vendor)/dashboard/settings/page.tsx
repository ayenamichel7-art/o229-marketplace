'use client';

import { useState } from "react";
import { api } from "@/lib/api";
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  UploadCloud, 
  Loader2, 
  FileText,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function VendorSettingsPage() {
  const user = useAuthStore(state => state.user);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("id_document", file);

    try {
      await api.post("/vendor/shop/kyc", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccess(true);
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi du document.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Paramètres Avancés</h1>
        <p className="text-muted-foreground mt-1">Gérez votre sécurité et la vérification de votre compte professionnel.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* KYC Section */}
        <div className="glassmorphism rounded-3xl border border-border overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-warning/20 via-transparent to-primary/20" />
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="space-y-2">
                <h2 className="text-xl font-bold flex items-center text-foreground">
                  <ShieldCheck className="w-6 h-6 mr-3 text-primary" />
                  Vérification d'Identité (KYC)
                </h2>
                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Le badge de <span className="text-primary font-semibold">Vendeur Vérifié</span> est le meilleur moyen d'augmenter vos ventes de 50%. 
                  Il confirme aux clients que vous êtes un commerçant légitime au Bénin.
                </p>
              </div>
              <div className="px-4 py-2 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-bold flex items-center whitespace-nowrap">
                 <AlertCircle className="w-4 h-4 mr-2" /> Statut : Non Vérifié
              </div>
            </div>

            {success && (
              <div className="mb-8 p-4 rounded-2xl bg-whatsapp/10 border border-whatsapp/20 flex items-center text-whatsapp animate-in bounce-in">
                <CheckCircle2 className="w-6 h-6 mr-3" />
                <div className="text-sm">
                  <p className="font-bold">Document envoyé avec succès !</p>
                  <p className="opacity-80">Notre équipe examinera votre dossier sous 24h à 48h ouvrables.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center text-destructive">
                <AlertCircle className="w-6 h-6 mr-3" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleKycSubmit} className="space-y-6">
              <div className="group relative border-2 border-dashed border-border rounded-3xl p-10 hover:border-primary/50 transition-all bg-surface/30 cursor-pointer flex flex-col items-center justify-center text-center">
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <UploadCloud className="w-8 h-8" />
                </div>
                
                {file ? (
                  <div className="flex items-center space-x-2 text-primary font-bold">
                    <FileText className="w-5 h-5" />
                    <span>{file.name}</span>
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-lg">Cliquez pour téléverser votre document</p>
                    <p className="text-sm text-muted-foreground mt-1">CIP, Carte d'Identité, Passeport ou IFU (Max 5MB)</p>
                  </>
                )}
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 flex items-start space-x-3">
                 <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Vos données sont cryptées et ne seront jamais partagées avec des tiers. 
                   Elles servent uniquement à la validation interne de votre compte professionnel.
                 </p>
              </div>

              <button 
                type="submit" 
                disabled={!file || isLoading}
                className="btn btn-primary w-full h-14 text-white text-lg font-bold shadow-xl shadow-primary/20 rounded-2xl group"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Valider mon identité</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Other Settings Mockup */}
        <div className="p-8 rounded-3xl border border-border bg-surface/50 opacity-50 grayscale pointer-events-none">
           <h3 className="text-lg font-bold mb-4">Fréquence des Notifications</h3>
           <p className="text-sm text-muted-foreground italic">Arrive bientôt : Recevez vos rapports de vente par email.</p>
        </div>

      </div>
    </div>
  );
}
