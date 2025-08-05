<?php

namespace Database\Seeders;

use App\Models\Delivery;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $deliveries = Delivery::all();

        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Welcome Notification',
                'body' => 'Welcome to QuickDrop, ' . $user->name,
                'type' => 'welcome',
                'data' => [],
                'read_at' => null,
            ]);
        }

        foreach ($deliveries->random(rand(1, 5)) as $delivery) {
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Delivery Update',
                'body' => 'Delivery #' . $delivery->id . ' status changed.',
                'type' => 'delivery',
                'data' => ['delivery_id' => $delivery->id],
                'read_at' => null,
            ]);
        }
    }
}
