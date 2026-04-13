"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { UploadCloud, CheckCircle2, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Product Data
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    city: "Cotonou",
    manage_stock: false,
    stock_quantity: "",
  });

  // Image handling
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Success state
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Fetch categories on mount
    api.get("/categories")
      .then(res => setCategories(res.data.data))
      .catch(err => console.error("Error fetching categories", err));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
      
      // Generate base64 previews (safer for CodeQL than blob URLs)
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id && categories.length > 0) {
      alert("Veuillez sélectionner une catégorie.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the Product
      const productResponse = await api.post("/vendor/products", formData);
      const newProductId = productResponse.data.id || productResponse.data.product?.id;

      // 2. Upload Images if any
      if (newProductId && selectedImages.length > 0) {
        // Upload images one by one or in batch depending on the backend expectation.
        // The Laravel route is: POST /vendor/products/{id}/images
        for (const file of selectedImages) {
          const imageForm = new FormData();
          imageForm.append("image", file);
          
          await api.post(`/vendor/products/${newProductId}/images`, imageForm, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);

    } catch (err: any) {
      console.error(err);
      alert("Une erreur est survenue lors de la création : " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-base-content mb-2">Produit publié !</h1>
        <p className="text-base-content/60 max-w-md">Vos clients peuvent désormais le commander directement sur votre numéro WhatsApp.</p>
        <p className="text-sm mt-4 text-base-content/40">Redirection vers votre tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8 border-b border-base-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Ajouter un produit</h1>
          <p className="text-sm text-base-content/60">Remplissez les détails pour mettre votre article en vente.</p>
        </div>
        <Link href="/dashboard" className="btn btn-ghost btn-sm">Annuler</Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Informations Générales</h2>
              
              <div className="form-control mb-4">
                <label className="label"><span className="label-text font-semibold">Titre de l'annonce</span></label>
                <input 
                  type="text" 
                  placeholder="ex: iPhone 13 Pro Max - Très bon état" 
                  className="input input-bordered w-full focus:input-primary" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Prix de vente (XOF)</span></label>
                  <label className="input input-bordered flex items-center gap-2 focus-within:outline-primary">
                    <input 
                      type="number" 
                      className="grow" 
                      placeholder="350000" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      required
                    />
                    <span className="font-bold text-base-content/50">FCFA</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Catégorie</span></label>
                  <select 
                    className="select select-bordered w-full focus:select-primary"
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                    required
                  >
                    <option value="" disabled>Sélectionner...</option>
                    {categories.length > 0 ? categories.map(cat => (
                       <option key={cat.id} value={cat.id}>{cat.name}</option>
                    )) : (
                      // Fallbacks if DB is empty
                      <>
                        <option value="1">Électronique</option>
                        <option value="2">Véhicules</option>
                        <option value="3">Immobilier</option>
                        <option value="4">Mode</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description détaillée</span>
                  <span className="label-text-alt text-base-content/50">L'IA lira ceci pour optimiser vos ventes</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-32 focus:textarea-primary" 
                  placeholder="Décrivez les atouts, l'état, et les garanties offertes avec cet article..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                ></textarea>
              </div>

               <div className="form-control mt-4">
                  <label className="label"><span className="label-text font-semibold">Ville de disponibilité</span></label>
                  <select 
                     className="select select-bordered w-full focus:select-primary"
                     value={formData.city}
                     onChange={e => setFormData({...formData, city: e.target.value})}
                   >
                     <option value="Cotonou">Cotonou</option>
                     <option value="Abomey-Calavi">Abomey-Calavi</option>
                     <option value="Porto-Novo">Porto-Novo</option>
                     <option value="Parakou">Parakou</option>
                     <option value="Bohicon">Bohicon</option>
                   </select>
               </div>

               <div className="divider my-8">Gestion des Stocks</div>

               <div className="form-control">
                 <label className="label cursor-pointer justify-start gap-4">
                   <input 
                     type="checkbox" 
                     className="checkbox checkbox-primary" 
                     checked={formData.manage_stock}
                     onChange={e => setFormData({...formData, manage_stock: e.target.checked})}
                   />
                   <span className="label-text font-semibold text-lg">Activer la gestion du stock</span>
                 </label>
               </div>

               {formData.manage_stock && (
                 <div className="form-control mt-4 animate-in slide-in-from-top-2">
                   <label className="label"><span className="label-text font-semibold">Quantité disponible</span></label>
                   <input 
                     type="number" 
                     placeholder="ex: 10" 
                     className="input input-bordered w-full focus:input-primary" 
                     value={formData.stock_quantity}
                     onChange={e => setFormData({...formData, stock_quantity: e.target.value})}
                     min="0"
                     required
                   />
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Image Upload */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-primary" /> Photos du produit
              </h2>
              
              <div className="form-control w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-base-300 hover:border-primary/50 hover:bg-primary/5 transition-colors rounded-xl cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <UploadCloud className="w-8 h-8 mb-2 text-base-content/40" />
                    <p className="text-sm font-semibold text-primary">Cliquez pour téléverser</p>
                    <p className="text-xs text-base-content/50 mt-1">Recommandé: 800x800px (1:1)</p>
                    <p className="text-xs text-base-content/50">PNG, JPG, WEBP (Max 2MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div className="bg-primary/5 text-primary border border-primary/20 mt-4 rounded-xl text-xs flex shadow-sm p-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-primary shrink-0 w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div className="flex flex-col ml-2">
                  <span className="font-bold">Règles Visuelles O-229 :</span>
                  <ul className="list-disc pl-3 mt-1 md:space-y-1 opacity-90">
                     <li>Des photos lumineuses boostent les ventes de 60%.</li>
                     <li>Bannissez les collages ou textes superposés.</li>
                     <li>Votre première image deviendra la couverture.</li>
                  </ul>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-base-200 aspect-square">
                      <img 
                        src={src} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 w-full bg-primary/90 text-xs text-white text-center py-1 font-semibold">
                          Principale
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full text-white btn-lg shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner"></span> : "Publier l'annonce maintenant"}
          </button>
        </div>

      </form>
    </div>
  );
}
