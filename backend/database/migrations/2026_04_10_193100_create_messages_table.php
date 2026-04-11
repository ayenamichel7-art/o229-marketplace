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
        Schema::create('messages', function (Blueprint $col) {
            $col->id();
            $col->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $col->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $col->text('content');
            $col->boolean('is_read')->default(false);
            $col->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
