<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'address' => fake()->address,
            'latitude' => fake()->randomFloat(6, 37.5, 38.0),
            'longitude' => fake()->randomFloat(6, -121.5, -121.0),
        ];
    }
}
