<?php

namespace App\Services;

use App\Models\Delivery;
use App\Models\Message;
use Illuminate\Support\Facades\Http;
use Google\Auth\Credentials\ServiceAccountCredentials;

class FirestoreSyncService
{
    protected $projectId;
    protected $creds;

    public function __construct()
    {
        $this->projectId = env('FIREBASE_PROJECT_ID');

        $serviceAccountPath = env('FIREBASE_SERVICE_ACCOUNT');

        if (!file_exists($serviceAccountPath)) {
            throw new \Exception("Service account JSON file not found at path: {$serviceAccountPath}");
        }

        $scopes = ['https://www.googleapis.com/auth/datastore'];

        $this->creds = new ServiceAccountCredentials($scopes, $serviceAccountPath);
    }

    protected function getToken(): string
    {
        $tokenArray = $this->creds->fetchAuthToken();
        return $tokenArray['access_token'];
    }

    // ===========================
    // Deliveries
    // ===========================
    public function syncDelivery(Delivery $delivery): bool
    {
        $docId = $delivery->id;
        $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents/deliveries/{$docId}";

        $pickupLocation = $delivery->pickupLocation ? [
            'id' => $delivery->pickupLocation->id,
            'address' => $delivery->pickupLocation->address,
            'latitude' => $delivery->pickupLocation->latitude,
            'longitude' => $delivery->pickupLocation->longitude,
        ] : null;

        $dropoffLocation = $delivery->dropoffLocation ? [
            'id' => $delivery->dropoffLocation->id,
            'address' => $delivery->dropoffLocation->address,
            'latitude' => $delivery->dropoffLocation->latitude,
            'longitude' => $delivery->dropoffLocation->longitude,
        ] : null;

        $data = [
            'fields' => [
                'sender_id' => ['integerValue' => $delivery->sender_id],
                'pickup_location' => ['mapValue' => ['fields' => [
                    'id' => ['integerValue' => $pickupLocation['id'] ?? 0],
                    'address' => ['stringValue' => $pickupLocation['address'] ?? ''],
                    'latitude' => ['doubleValue' => $pickupLocation['latitude'] ?? 0],
                    'longitude' => ['doubleValue' => $pickupLocation['longitude'] ?? 0],
                ]]],
                'dropoff_location' => ['mapValue' => ['fields' => [
                    'id' => ['integerValue' => $dropoffLocation['id'] ?? 0],
                    'address' => ['stringValue' => $dropoffLocation['address'] ?? ''],
                    'latitude' => ['doubleValue' => $dropoffLocation['latitude'] ?? 0],
                    'longitude' => ['doubleValue' => $dropoffLocation['longitude'] ?? 0],
                ]]],
                'package_description' => ['stringValue' => $delivery->package_description],
                'distance' => ['doubleValue' => $delivery->distance ?? 0],
                'status' => ['stringValue' => $delivery->status],
                'created_at' => ['timestampValue' => $delivery->created_at->toIso8601String()],
            ],
        ];

        $response = Http::withToken($this->getToken())->patch($url, $data);

        return $response->successful();
    }

    public function syncAllDeliveries(): void
    {
        $deliveries = Delivery::with(['pickupLocation', 'dropoffLocation'])->get();

        foreach ($deliveries as $delivery) {
            $this->syncDelivery($delivery);
        }
    }

    // ===========================
    // Driver Locations
    // ===========================
    public function syncDriverLocation($driverLocation): bool
    {
        $docId = "driver_{$driverLocation->driver_id}";
        $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents/driver_locations/{$docId}";

        $data = [
            'fields' => [
                'driver_id' => ['integerValue' => $driverLocation->driver_id],
                'latitude' => ['doubleValue' => $driverLocation->latitude],
                'longitude' => ['doubleValue' => $driverLocation->longitude],
                'updated_at' => ['timestampValue' => now()->toIso8601String()],
            ],
        ];

        $response = Http::withToken($this->getToken())->patch($url, $data);

        return $response->successful();
    }

    // ===========================
    // Chat Messages
    // ===========================
    public function addMessage(Message $message): bool
    {

        $chatId = $message->sender_id < $message->receiver_id
            ? "{$message->sender_id}_{$message->receiver_id}"
            : "{$message->receiver_id}_{$message->sender_id}";

        $docId = $message->id;

        $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents/deliveries/{$message->delivery_id}/chats/{$chatId}/messages/{$docId}";

        $data = [
            'fields' => [
                'id' => ['integerValue' => $message->id],
                'sender_id' => ['integerValue' => $message->sender_id],
                'receiver_id' => ['integerValue' => $message->receiver_id],
                'message' => ['stringValue' => $message->message],
                'read_at' => $message->read_at
                    ? ['timestampValue' => $message->read_at->toIso8601String()]
                    : ['nullValue' => null],
                'created_at' => ['timestampValue' => $message->created_at->toIso8601String()],
            ],
        ];

        $response = Http::withToken($this->getToken())->patch($url, $data);

        if (!$response->successful()) {
            logger()->error('Firestore addMessage failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
        }

        return $response->successful();
    }
}
