<?php

namespace App\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmTokenService
{
    private string $projectId;
    private string $serviceAccountPath;

    public function __construct()
    {
        $this->projectId = config('services.fcm.project_id');
        $this->serviceAccountPath = env('FIREBASE_SERVICE_ACCOUNT');

        if (!$this->projectId || !$this->serviceAccountPath) {
            throw new \Exception("Firebase project ID or service account path is missing");
        }
    }

    private function getAccessToken(): string
    {
        $scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
        $credentials = new ServiceAccountCredentials($scopes, $this->serviceAccountPath);
        $token = $credentials->fetchAuthToken();

        if (!isset($token['access_token'])) {
            throw new \Exception("Could not fetch access token for FCM");
        }

        return $token['access_token'];
    }

    public function sendNotification(array|string $tokens, string $title, string $body, array $data = []): bool
    {
        $tokens = (array) $tokens;

        foreach ($tokens as $token) {
            $payload = [
                "message" => [
                    "token" => $token,
                    "notification" => [
                        "title" => $title,
                        "body" => $body,
                    ],
                    "data" => $data,
                ],
            ];

            $url = "https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send";

            $response = Http::withToken($this->getAccessToken())
                ->withHeaders(["Content-Type" => "application/json"])
                ->post($url, $payload);

            if (!$response->successful()) {
                Log::error("FCM v1 send error", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'token' => $token,
                ]);
                return false;
            }
        }

        return true;
    }
}
