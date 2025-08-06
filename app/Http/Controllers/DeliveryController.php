<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Delivery;
use App\Models\Location;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;

class DeliveryController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $driverLocation = $user->driverLocation;

        if (!$driverLocation) {
            abort(403, 'No driver location set.');
        }

        // Fetch all deliveries with their related locations
        $deliveries = Delivery::with(['pickupLocation', 'dropoffLocation'])->get();

        // Filter deliveries: both pickup and dropoff within 50km
        $filtered = $deliveries->filter(function ($delivery) use ($driverLocation) {
            if (!$delivery->pickupLocation || !$delivery->dropoffLocation) {
                return false;
            }

            $pickupDistance = Delivery::locationsDistance(
                $driverLocation->latitude,
                $driverLocation->longitude,
                $delivery->pickupLocation->latitude,
                $delivery->pickupLocation->longitude
            );

            $dropoffDistance = Delivery::locationsDistance(
                $driverLocation->latitude,
                $driverLocation->longitude,
                $delivery->dropoffLocation->latitude,
                $delivery->dropoffLocation->longitude
            );

            return $pickupDistance <= 50 && $dropoffDistance <= 50;
        })->values();

        // Manual pagination (re-applied on every request)
        $perPage = 10;
        $currentPage = LengthAwarePaginator::resolveCurrentPage();

        $paginated = new LengthAwarePaginator(
            $filtered->forPage($currentPage, $perPage)->values(),
            $filtered->count(),
            $perPage,
            $currentPage,
            ['path' => request()->url(), 'query' => request()->query()]
        );

        return Inertia::render('Main/DeliveriesList', [
            'deliveries' => $paginated,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $locations = Location::all();

        return Inertia::render('Main/DeliveryCreate', ['locations' => $locations,]);
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

        return redirect('/dashboard')->with([
            'success' => 'Delivery request submitted successfully.',
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Delivery $delivery)
    {
        $delivery->load('pickupLocation', 'dropoffLocation');

        return Inertia::render('Main/DeliveryShow', ['delivery' => $delivery,]);
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

    public function accept(Delivery $delivery)
    {
        $user = Auth::user();

        if ($delivery->status !== 'pending') {
            return response()->json(['error' => 'Delivery already accepted or completed'], 400);
        }

        $delivery->driver_id = $user->id;
        $delivery->status = 'accepted';
        $delivery->save();

        return Inertia::render('Main/DeliveriesList', [
            'deliveries' => Delivery::with('pickupLocation', 'dropoffLocation')->paginate(10),
        ]);
    }
}
