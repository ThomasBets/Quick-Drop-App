<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\Delivery;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $deliveries = Delivery::all();

        foreach ($deliveries as $delivery) {
            for ($i = 0; $i < 5; $i++) {
                if ($delivery->driver_id) {

                    if (rand(0, 1)) {
                        $sender_id = $delivery->sender_id;
                        $receiver_id = $delivery->driver_id;
                    } else {
                        $sender_id = $delivery->driver_id;
                        $receiver_id = $delivery->sender_id;
                    }
                } else {

                    do {
                        $sender_id = rand(1, 20);
                    } while ($sender_id == $delivery->sender_id);


                    do {
                        $receiver_id = rand(1, 20);
                    } while ($receiver_id == $sender_id && $receiver_id == $delivery->$sender_id);
                }

                Message::create([
                    'delivery_id' => $delivery->id,
                    'sender_id' => $sender_id,
                    'receiver_id' => $receiver_id,
                    'message' => 'Sample message ' . ($i + 1),
                ]);
            }
        }
    }
}
