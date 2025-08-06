<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DriverLocation>
 */
class DriverLocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'driver_id' => User::factory()->create(['role' => 'driver'])->id,
            'latitude' => fake()->randomFloat(6, 37.75, 38.0),
            'longitude' => fake()->randomFloat(6, -121.2, -121.1),
            'updated_at' => now(),
        ];
    }
}
