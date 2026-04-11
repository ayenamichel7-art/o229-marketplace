<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Enums\Role;
use App\Notifications\NewUserRegistered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->input('role', 'client'),
            'phone' => $request->phone,
            'is_active' => false, // Require Admin Approval
        ]);

        // Alerter les admins sur Telegram
        $admins = User::where('role', Role::Admin)->get();
        foreach ($admins as $admin) {
            $admin->notify(new NewUserRegistered($user));
        }

        return response()->json([
            'message' => 'Inscription réussie. Votre compte est en attente de vérification par un administrateur. Vous serez notifié une fois validé.',
            'user' => new UserResource($user),
            'token' => null,
        ], 201);
    }

    /**
     * Login an existing user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        if (!$user->is_active) {
            $reason = $user->rejection_reason ? " Motif : {$user->rejection_reason}" : "";
            return response()->json([
                'message' => 'Votre compte est en attente d\'approbation ou a été désactivé.' . $reason,
            ], 403);
        }

        // Revoke all existing tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'user' => new UserResource($user->load('shop')),
            'token' => $token,
        ]);
    }

    /**
     * Logout the authenticated user.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('shop')),
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars');
            $user->avatar = $path;
        }

        $user->fill($request->only(['name', 'phone']));
        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user' => new UserResource($user),
        ]);
    }
}
