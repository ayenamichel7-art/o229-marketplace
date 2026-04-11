"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// 🔐 Schéma de validation Zod
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    setError("");

    try {
      await api.get("/sanctum/csrf-cookie", { 
        baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:8000" 
      });
      const response = await api.post("/auth/login", data);
      
      setAuth(response.data.user, response.data.token);
      toast.success("Heureux de vous revoir !");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Identifiants incorrects ou compte non activé.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-base-200/30 px-4 py-10">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 -rotate-3">
              <LogIn className="w-7 h-7" />
            </div>
            <h2 className="card-title text-2xl font-bold">Heureux de vous revoir !</h2>
            <p className="text-base-content/60 text-sm mt-1">Accédez à votre espace O-229.</p>
          </div>

          {error && (
            <div className="alert alert-error text-sm rounded-xl mb-6 shadow-sm">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input 
                {...register("email")}
                type="email" 
                placeholder="nom@exemple.com" 
                className={`input input-bordered w-full focus:input-primary transition-all ${errors.email ? 'input-error' : ''}`} 
              />
              {errors.email && <span className="text-error text-xs mt-1 ml-1">{errors.email.message}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Mot de passe</span>
                <Link href="#" className="label-text-alt link link-primary font-medium">Oublié ?</Link>
              </label>
              <input 
                {...register("password")}
                type="password" 
                placeholder="••••••••" 
                className={`input input-bordered w-full focus:input-primary transition-all ${errors.password ? 'input-error' : ''}`} 
              />
              {errors.password && <span className="text-error text-xs mt-1 ml-1">{errors.password.message}</span>}
            </div>

            <div className="form-control mt-8">
              <button 
                type="submit" 
                className="btn btn-primary w-full text-white text-base shadow-lg shadow-primary/20 h-14 border-none"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : "Se connecter"}
              </button>
            </div>
          </form>

          <div className="divider text-sm text-base-content/30 my-6 text-xs uppercase tracking-widest font-bold">OU</div>

          <p className="text-center text-sm text-base-content/60">
            Pas encore de compte ? {" "}
            <Link href="/register" className="font-bold text-primary hover:underline underline-offset-4">
              Rejoindre la plateforme
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
