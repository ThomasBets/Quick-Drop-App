<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DriverLocation;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DriverLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $drivers = User::where('role', 'driver')->get();

        foreach ($drivers as $driver) {
            DriverLocation::create([
                'driver_id' => $driver->id,
                'latitude' => fake()->randomFloat(6, 37.5, 38.0),
                'longitude' => fake()->randomFloat(6, -121.5, -121.0),
                'updated_at' => now(),
            ]);
        }
    }
}
