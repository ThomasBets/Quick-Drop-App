<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => 'Order Update',
            'body' => 'Your package is on the way!',
            'type' => 'order',
            'data' => ['order_id' => fake()->numberBetween(1,100)],
            'read_at' => null,
        ];
    }
}
