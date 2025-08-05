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
        return [
            'sender_id' => User::factory()->create(['role' => 'sender'])->id,
            'driver_id' => null,
            'pickup_location_id' => Location::factory(),
            'dropoff_location_id' => Location::factory(),
            'package_description' => fake()->sentence,
            'status' => 'pending',
            'estimated_time' => fake()->dateTimeBetween('now', '+3 hours'),
            'delivered_at' => null,
        ];
    }
}
