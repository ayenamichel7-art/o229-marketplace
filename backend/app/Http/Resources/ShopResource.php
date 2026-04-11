<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->logo ? asset('storage/' . $this->logo) : null,
            'banner' => $this->banner ? asset('storage/' . $this->banner) : null,
            'whatsapp_number' => $this->whatsapp_number,
            'city' => $this->city,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'is_verified' => $this->is_verified,
            'is_premium' => $this->isPremium(),
            'products_count' => $this->whenCounted('products'),
            'created_at' => $this->created_at->toISOString(),

            // Relations
            'user' => new UserResource($this->whenLoaded('user')),
            'products' => ProductResource::collection($this->whenLoaded('products')),
        ];
    }
}
