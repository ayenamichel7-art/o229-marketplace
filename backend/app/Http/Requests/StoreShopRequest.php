<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isVendor();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'whatsapp_number' => ['required', 'string', 'max:20'],
            'city' => ['required', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'banner' => ['nullable', 'image', 'max:4096'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la boutique est obligatoire.',
            'whatsapp_number.required' => 'Le numéro WhatsApp est obligatoire.',
            'city.required' => 'La ville est obligatoire.',
            'logo.max' => 'Le logo ne doit pas dépasser 2 Mo.',
            'banner.max' => 'La bannière ne doit pas dépasser 4 Mo.',
        ];
    }
}
