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
    public function index(Request $request)
    {
        $user = Auth::user();
        $driverLocation = $user->driverLocation;

        $sortField = $request->input('sort', 'status');
        $direction = $request->input('direction', 'asc');

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

            return $pickupDistance <= 50 && $dropoffDistance <= 50 && $delivery->distance <= 50;
        })->values();

        $statusOrder = [
            'pending' => 0,
            'accepted' => 1,
            'in_transit' => 2,
            'delivered' => 3,
            'cancelled' => 4,
        ];

        $sorted = $filtered->sort(function ($a, $b) use ($sortField, $direction, $statusOrder) {
            // Helper: get values to compare
            $getComparable = function ($item) use ($sortField, $statusOrder) {
                if ($sortField === 'status') {
                    return $statusOrder[$item->status] ?? 99;
                } elseif ($sortField === 'distance') {
                    return $item->distance ?? PHP_INT_MAX;
                }
                return $item->$sortField ?? null;
            };

            $valA = $getComparable($a);
            $valB = $getComparable($b);

            // Primary sort
            $comparison = $direction === 'asc'
                ? $valA <=> $valB
                : $valB <=> $valA;

            // If primary comparison is equal, sort by distance ascending
            if ($comparison === 0 && $sortField !== 'distance') {
                return ($a->distance ?? PHP_INT_MAX) <=> ($b->distance ?? PHP_INT_MAX);
            }

            return $comparison;
        })->values();

        // Manual pagination (re-applied on every request)
        $perPage = 10;
        $currentPage = LengthAwarePaginator::resolveCurrentPage();

        $paginated = new LengthAwarePaginator(
            $sorted->forPage($currentPage, $perPage)->values(),
            $sorted->count(),
            $perPage,
            $currentPage,
            [
                'path' => route('deliveries.index'),
                'query' => request()->query()
            ]
        );

        return Inertia::render('Delivery/DeliveriesList', [
            'deliveries' => $paginated,
            'sortField' => $sortField,
            'sortDirection' => $direction,
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $locations = Location::all();

        return Inertia::render('Delivery/DeliveryCreate', ['locations' => $locations,]);
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
    public function show(Delivery $delivery, Request $request)
    {
        $sort = $request->query('sort', 'status');
        $direction = $request->query('direction', 'asc');

        $delivery->load('pickupLocation', 'dropoffLocation');

        return Inertia::render('Delivery/DeliveryShow', [
            'delivery' => $delivery,
            'sort' => $sort,
            'direction' => $direction
        ]);
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

    public function accept(Delivery $delivery, Request $request)
    {
        $user = Auth::user();

        $sort = $request->query('sort', 'status');
        $direction = $request->query('direction', 'asc');

        if ($delivery->status !== 'pending') {
            return response()->json(['error' => 'Delivery already accepted or completed'], 400);
        }

        $delivery->driver_id = $user->id;
        $delivery->status = 'accepted';
        $delivery->save();

        return Inertia::render('Delivery/DeliveriesList', [
            'deliveries' => Delivery::with('pickupLocation', 'dropoffLocation')->paginate(10),
            'sort' => $sort,
            'direction' => $direction
        ]);
    }
}
