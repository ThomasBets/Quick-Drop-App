<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    /** @use HasFactory<\Database\Factories\DeliveryFactory> */
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'driver_id',
        'pickup_location_id',
        'dropoff_location_id',
        'package_description',
        'status',
        'estimated_time',
        'delivered_at'
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function pickupLocation()
    {
        return $this->belongsTo(Location::class, 'pickup_location_id');
    }

    public function dropoffLocation()
    {
        return $this->belongsTo(Location::class, 'dropoff_location_id');
    }
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    protected $appends = ['distance'];

    public function getDistanceAttribute()
    {
        return $this->locationsDistance(
            $this->pickupLocation->latitude,
            $this->pickupLocation->longitude,
            $this->dropoffLocation->latitude,
            $this->dropoffLocation->longitude
        );
    }

    public static function locationsDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDiff = $latTo - $latFrom;
        $lonDiff = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDiff / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDiff / 2), 2)));

        $earthRadius = 6371;

        return round($earthRadius * $angle, 2);
    }
}
