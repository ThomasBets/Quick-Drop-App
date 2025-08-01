<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Order;
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
        $orders = Order::all();

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

        foreach ($orders->random(rand(1, 5)) as $order) {
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Order Update',
                'body' => 'Order #' . $order->id . ' status changed.',
                'type' => 'order',
                'data' => ['order_id' => $order->id],
                'read_at' => null,
            ]);
        }
    }
}
