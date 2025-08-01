<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Message;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();

        foreach ($orders as $order) {

            for ($i = 0; $i < 5; $i++) {
                Message::create([
                    'order_id' => $order->id,
                    'sender_id' => rand(0, 1) ? $order->sender_id : $order->driver_id,
                    'receiver_id' => rand(0, 1) ? $order->sender_id : $order->driver_id,
                    'message' => 'Sample message ' . ($i + 1),
                ]);
            }
        }
    }
}
