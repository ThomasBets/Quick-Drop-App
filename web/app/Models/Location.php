<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    /** @use HasFactory<\Database\Factories\LocationFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'latitude',
        'longitude',
        'address',
    ];

    public function pickupOrders()
    {
        return $this->hasMany(Delivery::class, 'pickup_location_id');
    }

    public function dropoffOrders()
    {
        return $this->hasMany(Delivery::class, 'dropoff_location_id');
    }
}
