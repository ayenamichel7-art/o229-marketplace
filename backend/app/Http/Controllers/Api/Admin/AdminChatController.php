<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminChatController extends Controller
{
    /**
     * List all support conversations.
     */
    public function index(): JsonResponse
    {
        $conversations = Conversation::with(['user:id,name,avatar', 'latestMessage'])
            ->withCount(['messages as unread_count' => function($query) {
                $query->where('is_read', false)->where('sender_id', '!=', auth()->id());
            }])
            ->orderByDesc('last_message_at')
            ->paginate(50);

        return response()->json($conversations);
    }

    /**
     * Show a specific conversation with full history.
     */
    public function show(int $id): JsonResponse
    {
        $conversation = Conversation::with('user:id,name,avatar')->findOrFail($id);

        $messages = $conversation->messages()
            ->with('sender:id,name,avatar')
            ->oldest()
            ->get();

        // Mark messages as read by admin
        $conversation->messages()
            ->where('sender_id', '!=', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    /**
     * Reply to a vendor.
     */
    public function reply(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $conversation = Conversation::findOrFail($id);

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'content' => $request->content,
            'is_read' => false,
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Broadcast Real-time
        broadcast(new \App\Events\MessageSent($message->load('sender:id,name,avatar')))->toOthers();

        // 🛡️ Cerberus : Notification WhatsApp au vendeur
        $shop = $conversation->user->shop;
        if ($shop && $shop->whatsapp_number) {
            $msgPreview = strlen($request->content) > 50 ? substr($request->content, 0, 50) . "..." : $request->content;
            dispatch(new \App\Jobs\SendWhatsAppMessageJob(
                $shop->whatsapp_number,
                "📫 Nouveau message du Support O-229 :\n\n\"{$msgPreview}\"\n\nConnectez-vous à votre dashboard pour répondre."
            ));
        }

        return response()->json([
            'message' => 'Réponse envoyée.',
            'data' => $message->load('sender:id,name,avatar'),
        ], 201);
    }
}
