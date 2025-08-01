<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained('users')->cascadeOnDelete();

            $table->foreignId('pickup_location_id')->constrained('locations')->cascadeOnDelete();
            $table->foreignId('dropoff_location_id')->constrained('locations')->cascadeOnDelete();

            $table->string('package_description')->nullable();
            $table->enum('status', ['pending', 'accepted', 'in_transit', 'delivered', 'cancelled']);;
            $table->dateTime('estimated_time')->nullable();
            $table->timestamp('delivered_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
