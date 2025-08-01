<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar_url',
        'vehicle_type',
        'license_number'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sentOrders()
    {
        return $this->hasMany(Order::class, 'sender_id');
    }

    public function deliveries()
    {
        return $this->hasMany(Order::class, 'driver_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function driverLocation()
    {
        return $this->hasOne(DriverLocation::class, 'driver_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function isDriver()
    {
        return $this->role === 'driver';
    }

    public function isSender()
    {
        return $this->role === 'sender';
    }
}
