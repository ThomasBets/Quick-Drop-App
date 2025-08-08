<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DeliveryController;

Route::get('/', function () {
    return inertia('Home');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login');
    });

    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/register', function () {
        return Inertia::render('Auth/Register');
    });

    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Delivery/Dashboard');
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::resource('/deliveries', DeliveryController::class);

    Route::patch('/deliveries/{delivery}/accept', [DeliveryController::class, 'accept']);
});
