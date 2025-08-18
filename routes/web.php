<?php

use Inertia\Inertia;
use App\Models\Delivery;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\DriverLocationController;

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

    Route::get('/sender-deliveries', function () {
        return Inertia::render('Delivery/Sender/SenderDeliveries');
    });

    Route::get('/driver-deliveries', function () {
        return Inertia::render('Delivery/Driver/DeliveriesList');
    });

    Route::patch('/deliveries/{delivery}/accept', [DeliveryController::class, 'accept']);

    Route::patch('/deliveries/{delivery}/cancel', [DeliveryController::class, 'cancel']);

    Route::patch('/deliveries/{delivery}/location', [DriverLocationController::class, 'updateLocation']);

    Route::get('/sender-deliveries/{delivery}/track', function (Delivery $delivery) {

        $delivery->load(['pickupLocation', 'dropoffLocation']);

        return Inertia::render('Delivery/Sender/LiveTrackingMap', [
            'delivery' => $delivery,
        ]);
    });

    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{user}', [MessageController::class, 'chatWith']);
    Route::post('/messages', [MessageController::class, 'store']);
});
