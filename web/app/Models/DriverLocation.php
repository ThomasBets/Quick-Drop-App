<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverLocation extends Model
{
    /** @use HasFactory<\Database\Factories\DriverLocationFactory> */
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'latitude',
        'longitude',
        'updated_at',
    ];
    public $timestamps = false;
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
