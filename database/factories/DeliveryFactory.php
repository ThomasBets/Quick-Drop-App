<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Delivery>
 */
class DeliveryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $pickupLocation = Location::factory()->create();

        do {
            $dropoffLocation = Location::factory()->create();

            $distance = $this->haversineDistance(
                $pickupLocation->latitude,
                $pickupLocation->longitude,
                $dropoffLocation->latitude,
                $dropoffLocation->longitude,
            );
        } while ($distance > 50);

        return [
            'sender_id' => User::factory()->create(['role' => 'sender'])->id,
            'driver_id' => null,
            'pickup_location_id' => $pickupLocation->id,
            'dropoff_location_id' => $dropoffLocation->id,
            'package_description' => fake()->sentence,
            'status' => 'pending',
            'estimated_time' => null, // fake()->dateTimeBetween('now', '+3 hours'),
            'delivered_at' => null,
        ];
    }

    public function haversineDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDiff = $latTo - $latFrom;
        $lonDiff = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDiff / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDiff / 2), 2)));

        $earthRadius = 6371;

        return round($earthRadius * $angle, 2);
    }
}
