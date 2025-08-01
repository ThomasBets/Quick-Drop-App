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
                'latitude' => fake()->latitude,
                'longitude' => fake()->longitude,
                'updated_at' => now(),
            ]);
        }
    }
}
