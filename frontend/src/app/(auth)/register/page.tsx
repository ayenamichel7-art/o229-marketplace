"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// 🛍️ Schéma de validation Zod
const registerSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  password_confirmation: z.string(),
  role: z.enum(["client", "vendor"]),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "client",
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterValues) => {
    setLoading(true);
    setError(null);

    try {
      await api.get("/sanctum/csrf-cookie", { 
        baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:8000" 
      });
      await api.post("/auth/register", data);
      setRegistered(true);
      toast.success("Inscription validée ! Bienvenue chez O-229.");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur lors de l'inscription.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-base-200/30 px-4 py-10">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          {registered ? (
            <div className="text-center py-10 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Inscription Réussie !</h2>
              <p className="text-base-content/70 mb-8 px-4 leading-relaxed">
                Votre compte a été créé avec succès. Pour assurer la sécurité de la plateforme, 
                <span className="font-bold text-base-content ml-1">un administrateur doit maintenant valider votre inscription.</span>
              </p>
              <div className="bg-base-200 p-4 rounded-xl text-sm mb-8 italic text-base-content/60">
                Vous recevrez une notification par email dès que votre compte sera activé.
              </div>
              <Link href="/login" className="btn btn-primary w-full text-white shadow-lg shadow-primary/20">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-4 rotate-3">
                  <UserPlus className="w-7 h-7" />
                </div>
                <h2 className="card-title text-2xl font-bold">Créer un compte</h2>
                <p className="text-base-content/60 text-sm mt-1">Rejoignez la communauté O-229 Marketplace.</p>
              </div>

              {error && (
                <div className="alert alert-error text-sm rounded-xl mb-6 shadow-sm">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Account Type Tabs */}
                <div className="tabs tabs-boxed bg-base-200 p-1 rounded-xl w-full flex mb-6">
                  <button 
                    type="button"
                    className={`tab flex-1 rounded-lg transition-all ${selectedRole === 'client' ? 'tab-active font-bold bg-base-100 shadow-sm text-primary' : 'text-base-content/50'}`}
                    onClick={() => setValue("role", "client")}
                  >
                    Je suis Client
                  </button>
                  <button 
                    type="button"
                    className={`tab flex-1 rounded-lg transition-all ${selectedRole === 'vendor' ? 'tab-active font-bold bg-secondary text-white shadow-sm' : 'text-base-content/50'}`}
                    onClick={() => setValue("role", "vendor")}
                  >
                    Je suis Vendeur
                  </button>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nom complet</span>
                  </label>
                  <input 
                    {...register("name")}
                    type="text" 
                    placeholder="Ex: Jean Dupont" 
                    className={`input input-bordered w-full focus:input-secondary ${errors.name ? 'input-error' : ''}`} 
                  />
                  {errors.name && <span className="text-error text-xs mt-1 ml-1">{errors.name.message}</span>}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email professionnel</span>
                  </label>
                  <input 
                    {...register("email")}
                    type="email" 
                    placeholder="jean@exemple.com" 
                    className={`input input-bordered w-full focus:input-secondary ${errors.email ? 'input-error' : ''}`} 
                  />
                  {errors.email && <span className="text-error text-xs mt-1 ml-1">{errors.email.message}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Mot de passe</span>
                    </label>
                    <input 
                      {...register("password")}
                      type="password" 
                      placeholder="••••••••" 
                      className={`input input-bordered w-full focus:input-secondary ${errors.password ? 'input-error' : ''}`} 
                    />
                    {errors.password && <span className="text-error text-xs mt-1 ml-1">{errors.password.message}</span>}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Confirmation</span>
                    </label>
                    <input 
                      {...register("password_confirmation")}
                      type="password" 
                      placeholder="••••••••" 
                      className={`input input-bordered w-full focus:input-secondary ${errors.password_confirmation ? 'input-error' : ''}`} 
                    />
                    {errors.password_confirmation && <span className="text-error text-xs mt-1 ml-1">{errors.password_confirmation.message}</span>}
                  </div>
                </div>

                <div className="form-control mt-8">
                  <button 
                    type="submit" 
                    className={`btn w-full text-base border-none text-white shadow-lg transition-all h-14 ${selectedRole === 'vendor' ? 'bg-secondary hover:bg-secondary/90 shadow-secondary/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      selectedRole === 'vendor' ? "Ouvrir ma Boutique" : "Créer mon Compte"
                    )}
                  </button>
                </div>
              </form>

              <p className="text-center text-sm text-base-content/60 mt-6 pt-4 border-t border-base-200">
                Vous avez déjà un compte ? {" "}
                <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
