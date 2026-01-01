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
        Schema::table('estudios', function (Blueprint $table) {
            $table->enum('MUESTRA_LIQ_LIPEMICA', ['Si', 'No'])
                  ->nullable()
                  ->default(null)
                  ->after('MUESTRA_LIQ_AMP_RAZON');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->dropColumn('MUESTRA_LIQ_LIPEMICA');
        });
    }
};