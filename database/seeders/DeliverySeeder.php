<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Delivery;
use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DeliverySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $senders = User::where('role', 'sender')->get();
        $locations = Location::all();

        for ($i = 0; $i < 20; $i++) {
            Delivery::create([
                'sender_id' => $senders->random()->id,
                'driver_id' => null,
                'pickup_location_id' => $locations->random()->id,
                'dropoff_location_id' => $locations->random()->id,
                'package_description' => 'Package #' . ($i + 1),
                'status' => 'pending',
                'estimated_time' => null,
                'delivered_at' => null,
            ]);
        }
    }
}
