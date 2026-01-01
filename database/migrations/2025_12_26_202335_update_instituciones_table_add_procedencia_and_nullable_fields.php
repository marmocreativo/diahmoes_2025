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
        Schema::table('instituciones', function (Blueprint $table) {
            // Agregar nueva columna INSTITUCION_PROCEDENCIA
            $table->string('INSTITUCION_PROCEDENCIA', 255)->nullable()->after('INSTITUCION_PIN');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instituciones', function (Blueprint $table) {
            // Eliminar columna agregada
            $table->dropColumn('INSTITUCION_PROCEDENCIA');
        });
    }
};