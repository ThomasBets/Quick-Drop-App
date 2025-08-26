<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Services\FcmTokenService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Services\FirestoreSyncService;

class MessageController extends Controller
{
      /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, FirestoreSyncService $syncService, FcmTokenService $fcm)
    {
        $user = Auth::user();

        $request->validate([
            'delivery_id' => 'required|exists:deliveries,id',
            'receiver_id' => 'required|different:' . $user->id,
            'message' => 'required|string',
        ]);

        $message = Message::create([
            'delivery_id' => $request->delivery_id,
            'sender_id'   => $user->id,
            'receiver_id' => $request->receiver_id,
            'message'     => $request->message,
        ]);

        $syncService->addMessage($message);

        $receiver = User::find($request->receiver_id);

         if ($receiver && $receiver->fcm_token) {
        $fcm->sendNotification(
            [$receiver->fcm_token],
            "You have a new message!",
            $message->message,
            ["delivery_id" => (string)$message->delivery_id, "type" => "new_message"]
        );
    }

        return response()->json([
            'message' => $message,
        ]);
    }

    public function markAsRead($messageId, FirestoreSyncService $syncService)
    {
        $message = Message::findOrFail($messageId);
        $message->update(['read_at' => now()]);

        $syncService->addMessage($message);

        return response()->json(['message' => $message]);
    }
}
