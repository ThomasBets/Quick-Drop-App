<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\DriverLocation;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Session authentication (Web app)
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return Inertia::location('/dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials are incorrect.',
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8|max:15|confirmed',
            'role'     => 'required|in:sender,driver',

            // Optional fields
            'phone'           => 'nullable|string|min:10|max:14',
            'vehicle_type'    => 'nullable|string|min:3|max:50',
            'license_number'  => 'nullable|string|min:7|max:10',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,

            // Optional fields
            'phone'           => $request->phone,
            'vehicle_type'    => $request->vehicle_type,
            'license_number'  => $request->license_number,
        ]);

        if ($user->role === 'driver') {
            DriverLocation::create([
                'driver_id' => $user->id,
                'latitude' => fake()->randomFloat(6, 37.25, 38.0),
                'longitude' => fake()->randomFloat(6, -121.75, -121.0),
            ]);
        }

        Auth::login($user);
        return Inertia::location('/dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return Inertia::location('/');
    }

    public function saveFcmToken(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $user->update(['fcm_token' => $request->token]);
        
        return response()->json(['success' => true]);
    }

    // Api Token authentication (Mobile app)

    public function apiLogin(Request $request)
    {
        $request->validate([
            "email" => "required|email",
            "password" => "required"
        ]);

        $user = User::where("email", $request->email)->first();

        if (!$user || !Hash::check($request->password, (string)$user->password)) {
            throw ValidationException::withMessages(["email" => "The provided credentials are incorrect"]);
        }

        $token = $user->createToken("api-token")->plainTextToken;

        return response()->json([
            'token' => $token,
            'message' => 'Logged in successfully!'
        ]);
    }

    // Registers a new user with validated input and hashed password using some restrictions rules.
    public function apiRegister(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|max:15|confirmed',
            'role' => 'required|in:sender,driver',


            // Optional fields
            'phone'           => 'nullable|string|min:10|max:14',
            'vehicle_type'    => 'nullable|string|min:3|max:50',
            'license_number'  => 'nullable|string|min:7|max:10',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],

            // Optional fields
            'phone'           => $validated['phone'],
            'vehicle_type'    => $validated['vehicle_type'],
            'license_number'  => $validated['license_number'],
        ]);

        $token = $user->createToken("api-token")->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'You have registered successfully!'
        ]);
    }

    // Revokes all tokens for the authenticated user to log them out.
    public function apiLogout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully!'
        ]);
    }
}
