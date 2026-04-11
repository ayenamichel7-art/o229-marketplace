"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StarRating } from "./StarRating";
import { MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

interface ReviewFormProps {
  shopSlug: string;
}

export function ReviewForm({ shopSlug }: ReviewFormProps) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submitReview = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/shops/${shopSlug}/reviews`, { rating, comment });
      return res.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setRating(0);
      setComment("");
      // Refetch reviews
      queryClient.invalidateQueries({ queryKey: ["shop-reviews", shopSlug] });
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating === 0) {
      setError("Veuillez sélectionner une note étoilée.");
      return;
    }
    submitReview.mutate();
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-base-200/50 p-6 rounded-xl border border-base-200 text-center">
        <MessageSquarePlus className="w-8 h-8 mx-auto mb-3 text-base-content/40" />
        <h3 className="font-semibold text-lg mb-2">Donnez votre avis</h3>
        <p className="text-sm text-base-content/60 mb-4">
          Vous devez être connecté pour partager votre expérience avec cette boutique.
        </p>
        <Link href="/login" className="btn btn-outline btn-primary btn-sm">
          Se connecter
        </Link>
      </div>
    );
  }

  // Si le vendeur tente de noter sa propre boutique
  if (user?.role === "vendor") {
      return null;
  }

  return (
    <div className="bg-base-100 p-6 rounded-xl border border-base-200 shadow-sm">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <MessageSquarePlus className="w-5 h-5 mr-2 text-primary" />
        Évaluer cette boutique
      </h3>

      {success && (
        <div className="alert alert-success text-sm mb-4">
          Votre avis a été publié avec succès ! Merci pour votre retour.
        </div>
      )}

      {error && (
        <div className="alert alert-error text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
           <label className="block text-sm font-semibold mb-2">Votre NoteGlobale</label>
           <StarRating 
             rating={rating} 
             interactive={true} 
             onRate={(val) => setRating(val)} 
             size="lg" 
           />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Votre Expérience</label>
          <textarea 
            className="textarea textarea-bordered w-full focus:textarea-primary h-24" 
            placeholder="Comment s'est passé votre achat ? Recommandez-vous ce vendeur ?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            minLength={5}
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={submitReview.isPending || rating === 0 || comment.length < 5}
          className="btn btn-primary w-full text-white"
        >
          {submitReview.isPending ? <span className="loading loading-spinner"></span> : "Publier mon avis"}
        </button>
      </form>
    </div>
  );
}
