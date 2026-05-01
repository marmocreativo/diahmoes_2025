<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->text('R_NOTAS_ESPECIALES')->nullable()->after('R_INTERPRETACION');
        });
    }

    public function down(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->dropColumn('R_NOTAS_ESPECIALES');
        });
    }
};