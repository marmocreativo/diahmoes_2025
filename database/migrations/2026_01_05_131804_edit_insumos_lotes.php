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
        Schema::table('insumos_lotes', function (Blueprint $table) {
            $table->text('NOTAS')->nullable()->after('ESTADO');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('insumos_lotes', function (Blueprint $table) {
            $table->dropColumn('NOTAS');
        });
    }
};