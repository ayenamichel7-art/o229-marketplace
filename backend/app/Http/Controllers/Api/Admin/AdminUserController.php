<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all users
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'all');
        $query = User::query();

        if ($status === 'pending') {
            $query->where('is_active', false);
        } elseif ($status === 'approved') {
            $query->where('is_active', true);
        }

        $users = $query->latest()->paginate(20);
        return response()->json(
            UserResource::collection($users)->response()->getData(true)
        );
    }

    /**
     * Toggle User Approval Status (Active/Inactive)
     */
    public function toggleActive(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Prevent admin from deactivating themselves
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas modifier votre propre statut.'], 403);
        }

        $user->is_active = !$user->is_active;
        
        if (!$user->is_active) {
            $user->rejection_reason = $request->input('reason');
        } else {
            $user->rejection_reason = null; // Clear reason if approved
        }

        $user->save();

        // Notify User
        $user->notify(new \App\Notifications\AccountStatusUpdated($user));

        $action = $user->is_active ? 'activé' : 'désactivé';

        return response()->json([
            'message' => "Le compte {$user->name} a été {$action}.",
            'is_active' => $user->is_active,
            'rejection_reason' => $user->rejection_reason
        ]);
    }
}
