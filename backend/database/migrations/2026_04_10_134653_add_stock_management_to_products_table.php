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
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('manage_stock')->default(false)->after('rejection_reason');
            $table->integer('stock_quantity')->nullable()->after('manage_stock');
            $table->boolean('in_stock')->default(true)->after('stock_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['manage_stock', 'stock_quantity', 'in_stock']);
        });
    }
};
