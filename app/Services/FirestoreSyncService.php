<?php

namespace App\Services;

use App\Models\Delivery;
use Illuminate\Support\Facades\Http;

class FirestoreSyncService
{
    protected $projectId;
    protected $token;

    public function __construct()
    {
        $this->projectId = env('FIREBASE_PROJECT_ID');
        $this->token = env('FIREBASE_ACCESS_TOKEN');
    }

    /**
     * Sync a single delivery to Firestore
     */
    public function syncDelivery(Delivery $delivery): bool
    {
        if (!$this->projectId || !$this->token) {
            throw new \Exception('FIREBASE_PROJECT_ID and FIREBASE_ACCESS_TOKEN must be set.');
        }

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
                    'id' => ['integerValue' => $pickupLocation['id']],
                    'address' => ['stringValue' => $pickupLocation['address']],
                    'latitude' => ['doubleValue' => $pickupLocation['latitude']],
                    'longitude' => ['doubleValue' => $pickupLocation['longitude']],
                ]]],
                'dropoff_location' => ['mapValue' => ['fields' => [
                    'id' => ['integerValue' => $dropoffLocation['id']],
                    'address' => ['stringValue' => $dropoffLocation['address']],
                    'latitude' => ['doubleValue' => $dropoffLocation['latitude']],
                    'longitude' => ['doubleValue' => $dropoffLocation['longitude']],
                ]]],
                'package_description' => ['stringValue' => $delivery->package_description],
                'distance' => ['doubleValue' => $delivery->distance ?? 0],
                'status' => ['stringValue' => $delivery->status],
                'createdAt' => ['timestampValue' => $delivery->created_at->toIso8601String()],
            ],
        ];

        $response = Http::withToken($this->token)->patch($url, $data);

        return $response->successful();
    }

    /**
     * Bulk sync all deliveries to Firestore
     */
    public function syncAllDeliveries(): void
    {
        $deliveries = Delivery::with(['pickupLocation', 'dropoffLocation'])->get();

        foreach ($deliveries as $delivery) {
            $this->syncDelivery($delivery);
        }
    }
}
