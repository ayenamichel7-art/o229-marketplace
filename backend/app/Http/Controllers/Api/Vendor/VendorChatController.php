<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Enums\Role;
use App\Notifications\NewSupportMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorChatController extends Controller
{
    /**
     * Get or create the support conversation and its messages.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $conversation = Conversation::firstOrCreate(
            ['user_id' => $user->id],
            ['last_message_at' => now()]
        );

        $messages = $conversation->messages()
            ->with('sender:id,name,avatar')
            ->oldest()
            ->get();

        // Mark admin messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message to administration.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $user = $request->user();
        
        $conversation = Conversation::where('user_id', $user->id)->firstOrFail();

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'content' => $request->content,
            'is_read' => false,
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Broadcast Real-time
        broadcast(new \App\Events\MessageSent($message->load('sender:id,name,avatar')))->toOthers();

        // Alerter les admins sur Telegram
        $admins = User::where('role', Role::Admin)->get();
        foreach ($admins as $admin) {
            $admin->notify(new NewSupportMessage($message));            
        }

        return response()->json([
            'message' => 'Message envoyé.',
            'data' => $message->load('sender:id,name,avatar'),
        ], 201);
    }
}
