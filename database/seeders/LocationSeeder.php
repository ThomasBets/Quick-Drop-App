<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $senders = User::where('role', 'sender')->get();

        foreach ($senders as $sender) {
            Location::factory()->count(20)->create([
                'user_id' => $sender->id,
            ]);
        }
    }
}
