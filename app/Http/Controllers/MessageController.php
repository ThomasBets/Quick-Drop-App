<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Services\FirestoreSyncService;

class MessageController extends Controller
{
    public function index($delivery, $user)
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, FirestoreSyncService $syncService)
    {
        $authUser = Auth::user();

        $request->validate([
            'delivery_id' => 'required|exists:deliveries,id',
            'receiver_id' => 'required|different:' . $authUser->id,
            'message' => 'required|string',
        ]);

        Log::info('MessageController@store called', $request->all());

        $message = Message::create([
            'delivery_id' => $request->delivery_id,
            'sender_id'   => $authUser->id,
            'receiver_id' => $request->receiver_id,
            'message'     => $request->message,
        ]);

        $syncService->addMessage($message);

        return response()->json([
            'message' => $message,
        ]);
    }

    /**
     * Μαρκάρισμα ως διαβασμένο
     */
    public function markAsRead($messageId, FirestoreSyncService $syncService)
    {
        $message = Message::findOrFail($messageId);
        $message->update(['read_at' => now()]);

        $syncService->addMessage($message); // update στο Firestore

        return response()->json(['message' => $message]);
    }
}
