<?php

namespace App\Services;

use App\Models\Delivery;
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

        // DEBUG: βεβαιώσου ότι η PHP βλέπει το αρχείο
        if (!file_exists($serviceAccountPath)) {
            throw new \Exception("Service account JSON file not found at path: {$serviceAccountPath}");
        }

        $scopes = ['https://www.googleapis.com/auth/datastore'];

        // Service account credentials για αυτόματο refresh του token
        $this->creds = new ServiceAccountCredentials($scopes, $serviceAccountPath);
    }

    protected function getToken(): string
    {
        $tokenArray = $this->creds->fetchAuthToken();
        return $tokenArray['access_token'];
    }

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

    public function syncDriverLocation($driverLocation): bool
    {
        $docId = "driver_{$driverLocation->driver_id}";
        $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents/driver_locations/{$docId}";

        $data = [
            'fields' => [
                'driver_id' => ['integerValue' => $driverLocation->driver_id],
                'latitude' => ['doubleValue' => $driverLocation->latitude],
                'longitude' => ['doubleValue' => $driverLocation->longitude],
                'updatedAt' => ['timestampValue' => now()->toIso8601String()],
            ],
        ];

        $response = Http::withToken($this->getToken())->patch($url, $data);

        return $response->successful();
    }
}
