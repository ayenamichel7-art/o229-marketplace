<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PushSubscriptionController extends Controller
{
    /**
     * Store or update a push subscription.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|url|max:500',
            'keys.p256dh' => 'required',
            'keys.auth' => 'required',
        ]);

        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $request->endpoint],
            [
                'user_id' => Auth::id(),
                'public_key' => $request->input('keys.p256dh'),
                'auth_token' => $request->input('keys.auth'),
                'content_encoding' => $request->input('content_encoding', 'aesgcm'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Subscription saved successfully.',
            'data' => $subscription
        ]);
    }

    /**
     * Delete a push subscription (unsubscribe).
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate(['endpoint' => 'required|url']);

        PushSubscription::where('endpoint', $request->endpoint)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unsubscribed successfully.'
        ]);
    }
}
