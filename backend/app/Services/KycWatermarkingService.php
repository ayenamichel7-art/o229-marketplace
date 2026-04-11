<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class KycWatermarkingService
{
    /**
     * Apply a security watermark to an image file.
     * Supported formats: JPEG, PNG.
     */
    public function applyWatermark(string $path, string $disk = 'local'): bool
    {
        if (!extension_loaded('gd')) {
            Log::error('GD extension not loaded. Cannot apply watermark.');
            return false;
        }

        $fullPath = Storage::disk($disk)->path($path);
        $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));

        // On ne traite que les images (les PDF ne peuvent pas être traités par GD)
        if (!in_array($extension, ['jpg', 'jpeg', 'png'])) {
            return false;
        }

        try {
            // 🛡️ Sécurité : Créer une ressource image depuis le fichier
            $imageData = Storage::disk($disk)->get($path);
            $image = imagecreatefromstring($imageData);

            if (!$image) return false;

            // Définir la couleur du texte (Noir/Blanc transparent)
            $white = imagecolorallocatealpha($image, 255, 255, 255, 60);
            $black = imagecolorallocatealpha($image, 0, 0, 0, 40);

            $width = imagesx($image);
            $height = imagesy($image);
            $text = "O-229 MARKETPLACE - USAGE EXCLUSIF - KYC VERIFIED";

            // Appliquer le texte en diagonale
            for ($i = 0; $i < $height; $i += ($height / 5)) {
                for ($j = 0; $j < $width; $j += ($width / 2)) {
                    imagestring($image, 5, $j, $i, $text, $black);
                }
            }

            // 📤 Sauvegarder dans un buffer pour ne pas corrompre l'original en cas d'erreur
            ob_start();
            match ($extension) {
                'jpg', 'jpeg' => imagejpeg($image, null, 85),
                'png' => imagepng($image),
            };
            $finalContent = ob_get_clean();

            // Remplacer le fichier original par le contenu traité
            Storage::disk($disk)->put($path, $finalContent);

            // 🧹 Libération de la mémoire
            imagedestroy($image);

            return true;
        } catch (\Exception $e) {
            Log::error('Watermarking failed: ' . $e->getMessage());
            if (isset($image) && is_resource($image)) imagedestroy($image);
            return false;
        }

    }
}
