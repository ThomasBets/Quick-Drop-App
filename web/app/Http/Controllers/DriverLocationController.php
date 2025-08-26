<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\Request;
use App\Models\DriverLocation;
use App\Http\Controllers\Controller;
use App\Services\FcmTokenService;
use Illuminate\Support\Facades\Auth;
use App\Services\FirestoreSyncService;

class DriverLocationController extends Controller
{
    public function updateLocation(Request $request, Delivery $delivery, FirestoreSyncService $syncService, FcmTokenService $fcm)
    {
        $user = Auth::user();

        if ($delivery->driver_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // Ενημέρωση driver_location
        $driverLocation = $user->driverLocation;

        $driverLocation->latitude = $request->latitude;
        $driverLocation->longitude = $request->longitude;
        $driverLocation->save();

        // Έλεγχος για αλλαγή status
        $distToPickup = Delivery::locationsDistance(
            $driverLocation->latitude,
            $driverLocation->longitude,
            $delivery->pickupLocation->latitude,
            $delivery->pickupLocation->longitude
        );
        $distToDropoff = Delivery::locationsDistance(
            $driverLocation->latitude,
            $driverLocation->longitude,
            $delivery->dropoffLocation->latitude,
            $delivery->dropoffLocation->longitude
        );

        if ($delivery->status === 'accepted' && $distToPickup <= 0.01) {
            $delivery->status = 'in_transit';
            $delivery->save();

            if ($delivery->sender && $delivery->sender->fcm_token) {

                $fcm->sendNotification(
                    [$delivery->sender->fcm_token],
                    "Update of the delivery #{$delivery->id}",
                    "Your delivery is on the way!",
                    ["delivery_id" => (string)$delivery->id, "type" => "status_update"]
                );
            }
        } elseif ($delivery->status === 'in_transit' && $distToDropoff <= 0.01) {
            $delivery->status = 'delivered';
            $delivery->delivered_at = now();
            $delivery->save();

            if ($delivery->sender && $delivery->sender->fcm_token) {

                $fcm->sendNotification(
                    [$delivery->sender->fcm_token],
                    "Update of the delivery #{$delivery->id}",
                    "Your delivery just delivered!",
                    ["delivery_id" => (string)$delivery->id, "type" => "status_update"]
                );
            }
        }
        $syncService->syncDelivery($delivery);
        // Sync τοποθεσίας στο Firestore
        $syncService->syncDriverLocation($driverLocation);

        return response()->json(['success' => true]);
    }
}
