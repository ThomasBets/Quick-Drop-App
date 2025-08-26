<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Delivery;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\FcmTokenService;
use Illuminate\Support\Facades\Auth;
use App\Services\FirestoreSyncService;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'sender') {

            return Inertia::render('Delivery/Sender/SenderDeliveries',);
        } else {

            if (!$user->driverLocation) {
                abort(403, 'No driver location set.');
            }

            return Inertia::render('Delivery/Driver/DeliveriesList',);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $locations = Location::all();

        return Inertia::render('Delivery/Sender/DeliveryCreate', ['locations' => $locations,]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, FcmTokenService $fcm)
    {
        $validated = $request->validate([
            'pickup_location_id' => 'required',
            'dropoff_location_id' => 'required|different:pickup_location_id',
            'package_description' => 'required|string|max:1000',
        ]);

        $delivery = Delivery::create([
            'sender_id' => Auth::id(),
            'package_description' => $validated['package_description'],
            'pickup_location_id' => $validated['pickup_location_id'],
            'dropoff_location_id' => $validated['dropoff_location_id'],
            'status' => 'pending',
        ]);

        $tokens = User::where('role', 'driver')
            ->whereNotNull('fcm_token')
            ->pluck('fcm_token')
            ->toArray();

        if ($tokens) {
            $fcm->sendNotification(
                $tokens,
                "New delivery request",
                "A new delivery request submitted",
                ["delivery_id" => (string)$delivery->id, "type" => "new_delivery"]
            );
        }
        return redirect("/deliveries/{$delivery->id}");
    }

    /**
     * Display the specified resource.
     */
    public function show(Delivery $delivery)
    {
        $delivery->load('pickupLocation', 'dropoffLocation', 'sender', 'driver');

        $user = User::with('driverLocation')->find(Auth::id());

        if ($user->role === 'sender') {

            return Inertia::render('Delivery/Sender/SenderShow', [
                'delivery' => $delivery,
            ]);
        } else {

            return Inertia::render('Delivery/Driver/DriverShow', [
                'delivery' => $delivery,
                'auth' => $user,
            ]);
        }
    }

    public function accept(Delivery $delivery, FirestoreSyncService $syncService, FcmTokenService $fcm)
    {
        $user = Auth::user();

        if ($delivery->status !== 'pending') {
            return response()->json(['error' => 'Delivery already accepted or completed'], 400);
        }

        $delivery->driver_id = $user->id;
        $delivery->status = 'accepted';

        // Υπολογισμός απόστασης: driver -> pickup + pickup -> dropoff
        $driverLocation = $user->driverLocation; // σχέση driver -> driver_location

        $distanceToPickup = Delivery::locationsDistance(
            $driverLocation->latitude,
            $driverLocation->longitude,
            $delivery->pickupLocation->latitude,
            $delivery->pickupLocation->longitude
        );
        $deliveryDistance = $distanceToPickup + $delivery->distance; // pickup->dropoff distance

        $speed = 500; // km/h
        $totalTimeHours = $deliveryDistance / $speed;
        $delivery->estimated_time = now()->addSeconds($totalTimeHours * 3600);

        $delivery->save();

        $syncService->syncDelivery($delivery);

        if ($delivery->sender && $delivery->sender->fcm_token) {
            $fcm->sendNotification(
                [$delivery->sender->fcm_token],
                "Your delivery request accepted",
                "Driver {$delivery->driver->name} accepted your delivery request #{$delivery->id}",
                ["delivery_id" => (string)$delivery->id, "type" => "accepted"]
            );
        }

        return response()->json(['delivery' => $delivery]);
    }

    public function cancel(Delivery $delivery, FirestoreSyncService $syncService, FcmTokenService $fcm)
    {
        $user = Auth::user();

        if ($delivery->driver_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Αν η παράδοση είναι ήδη delivered, δεν μπορεί να ακυρωθεί
        if ($delivery->status === 'delivered') {
            return response()->json(['error' => 'Delivery already completed'], 400);
        }

        // Επαναφορά σε pending
        $delivery->driver_id = null;
        $delivery->status = 'pending';
        $delivery->estimated_time = null;
        $delivery->save();

        // Κάνουμε sync στο Firestore
        $syncService->syncDelivery($delivery);

        if ($delivery->sender && $delivery->sender->fcm_token) {
        $fcm->sendNotification(
            [$delivery->sender->fcm_token],
            "Your delivery cancelled",
            "Your delivery with id #{$delivery->id} cancelled by the driver",
            ["delivery_id" => (string)$delivery->id, "type" => "canceled"]
        );
    }

    }
}
