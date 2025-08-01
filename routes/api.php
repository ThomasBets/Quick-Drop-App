<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Request;
use App\Http\Controllers\AuthController;

// Public API routes
Route::post('/login', [AuthController::class, 'apiLogin']);

Route::post('/register', [AuthController::class, 'apiRegister']);

// Protected API routes (Sanctum token-based)
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'apiLogout']);
});
