<?php

namespace App\Services;

use App\Models\Insight;
use App\Models\Product;
use Illuminate\Support\Carbon;

class InsightGeneratorService
{
    /**
     * Analyse en profondeur les performances et la qualité d'un produit 
     * en générant des conseils façon "Système Expert".
     */
    public function generateForProduct(Product $product): void
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);
        $shopId = $product->shop_id;

        // Fetch analytics for the last 7 days
        $analytics = $product->analytics()
            ->where('date', '>=', $sevenDaysAgo)
            ->get();

        $totalViews = $analytics->sum('views');
        $totalClicks = $analytics->sum('whatsapp_clicks');
        $conversionRate = $totalViews > 0 ? ($totalClicks / $totalViews) * 100 : 0;

        // ---------------------------------------------------------
        // 1. ANALYSE DU PRIX V/S CONCURRENCE (Market Pricing)
        // ---------------------------------------------------------
        // 🔥 Optimisation PERFORMANCE : On cache la moyenne de la catégorie pendant 1 heure
        $cacheKey = "category_avg_price_{$product->category_id}";
        $averageCategoryPrice = Cache::remember($cacheKey, 3600, function () use ($product) {
            return Product::where('category_id', $product->category_id)
                ->where('status', 'active')
                ->where('id', '!=', $product->id)
                ->avg('price') ?? 0;
        });

        if ($averageCategoryPrice > 0 && $product->price > ($averageCategoryPrice * 1.3) && $totalClicks < 2 && $totalViews > 10) {
            $this->createInsight(
                $shopId,
                $product->id,
                'warning',
                "Attention 🚨, '{$product->name}' est 30% plus cher que la moyenne de sa catégorie. Comme il a eu peu de contacts WhatsApp récemment, envisagez une petite promotion."
            );
        }

        // ---------------------------------------------------------
        // 2. ANALYSE SEO ET FICHE PRODUIT (Quality Check)
        // ---------------------------------------------------------
        // 🧪 Correction : Utilisation de mb_strlen pour supporter les Emojis et accents
        $descLength = mb_strlen(strip_tags($product->description ?? ''), 'UTF-8');
        if ($descLength < 50 && $totalViews < 20) {
            $this->createInsight(
                $shopId,
                $product->id,
                'suggestion',
                "Votre description pour '{$product->name}' est très courte. ✍️ Les clients Béninois aiment les détails (État, marque, garantie). Ajoutez du texte pour apparaître plus haut lors des recherches."
            );
        }

        if (!$product->primaryImage()->exists() && $totalViews > 0) {
            $this->createInsight(
                $shopId,
                $product->id,
                'warning',
                "🖼️ '{$product->name}' n'a pas d'image principale ! C'est le frein numéro 1 pour la vente en ligne. Prenez une belle photo avec votre téléphone à la lumière du jour."
            );
        }

        // ---------------------------------------------------------
        // 3. ANALYSE STATISTIQUE COMPORTEMENTALE (Bounce Rate)
        // ---------------------------------------------------------
        if ($totalViews > 50 && $totalClicks === 0) {
            $this->createInsight(
                $shopId,
                $product->id,
                'warning',
                "Beaucoup de curieux 👀 ({$totalViews} vues) mais aucun client ne clique sur WhatsApp. Il manque un déclencheur déclic (Image floue ? Prix manquant ?)."
            );
        }

        // ---------------------------------------------------------
        // 4. MOTIVATION ET GAMIFICATION (Milestones)
        // ---------------------------------------------------------
        $allTimeViews = $product->views_count;
        if ($allTimeViews > 80 && $allTimeViews < 100) {
            $this->createInsight(
                $shopId,
                $product->id,
                'suggestion',
                "🔥 Vous y êtes presque ! '{$product->name}' va bientôt atteindre les 100 vues. Partagez le lien en Statut WhatsApp dès aujourd'hui pour franchir ce cap."
            );
        }

        if ($totalClicks > 15 && $conversionRate > 10) {
            $this->createInsight(
                $shopId,
                $product->id,
                'success',
                "💎 Excellent produit ! '{$product->name}' transforme plus de 10% de ses vues en contacts WhatsApp. Pensez à augmenter votre stock car ce produit plaît beaucoup."
            );
        }

        // ---------------------------------------------------------
        // 5. INACTIVITÉ SEVÈRE
        // ---------------------------------------------------------
        if ($totalViews === 0 && $product->status === 'active' && $product->created_at <= clone($sevenDaysAgo)->subDays(3)) {
            $this->createInsight(
                $shopId,
                $product->id,
                'suggestion',
                "Zéro vue détectée pour '{$product->name}' cette semaine. 💡 Astuce de pro : Renommez le produit avec des mots plus courants que les gens recherchent vraiment."
            );
        }
    }

    /**
     * Crée et sauvegarde le conseil si un conseil similaire n'a pas été envoyé récemment.
     */
    private function createInsight(int $shopId, int $productId, string $type, string $message): void
    {
        // On évite de spammer le même message. On bloque les messages du même type pour les 3 derniers jours.
        $threeDaysAgo = Carbon::now()->subDays(3);
        $existsRecently = Insight::where('product_id', $productId)
            ->where('type', $type)
            ->where('created_at', '>=', $threeDaysAgo)
            ->exists();

        if (!$existsRecently) {
            Insight::create([
                'shop_id' => $shopId,
                'product_id' => $productId,
                'type' => $type,
                'message' => $message,
                'is_read' => false,
            ]);
        }
    }
}
