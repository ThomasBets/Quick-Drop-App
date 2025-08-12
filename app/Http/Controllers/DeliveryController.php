<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Delivery;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Services\FirestoreSyncService;
use Illuminate\Pagination\LengthAwarePaginator;

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
    public function store(Request $request)
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

        return redirect("/deliveries/{$delivery->id}");
    }

    /**
     * Display the specified resource.
     */
    public function show(Delivery $delivery)
    {
        $delivery->load('pickupLocation', 'dropoffLocation');

        $user = Auth::user();

        if ($user->role === 'sender') {

            return Inertia::render('Delivery/Sender/SenderShow', [
                'delivery' => $delivery,
            ]);
        } else {

            return Inertia::render('Delivery/Driver/DriverShow', [
                'delivery' => $delivery,
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Delivery $delivery)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Delivery $delivery)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Delivery $delivery)
    {
        //
    }

    public function accept(Delivery $delivery, FirestoreSyncService $syncService)
    {
        $user = Auth::user();

        if ($delivery->status !== 'pending') {
            return response()->json(['error' => 'Delivery already accepted or completed'], 400);
        }

        $delivery->driver_id = $user->id;
        $delivery->status = 'accepted';
        $delivery->save();

        $syncService->syncDelivery($delivery);

        return Inertia::render('Delivery/Driver/DeliveriesList');
    }
}
