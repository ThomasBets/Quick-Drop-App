<?php

namespace App\Providers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'auth' => [
                'user' => function () {
                    $user = Auth::user();
                    if ($user) {
                        // return only specific fields as an array
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'role' => $user->role,
                            'phone' => $user->phone,
                            'vehicle_type' => $user->vehicle_type,
                            'license_number' => $user->license_number,
                        ];
                    }
                    return null;
                },
            ],
        ]);
    }
}
