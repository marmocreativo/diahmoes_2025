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
            // Candidato a patrocinio (Si/No) + razón cuando es "No"
            $table->string('R_CANDIDATO_A_PATROCINIO', 10)
                ->nullable()
                ->after('R_RAZON_ADECUADO_PROCESAMIENTO');

            $table->text('R_RAZON_CANDIDATO_A_PATROCINIO')
                ->nullable()
                ->after('R_CANDIDATO_A_PATROCINIO');

            // Razón de enriquecimiento cuando R_ENRIQUECIMIENTO es "Si"
            $table->text('R_RAZON_ENRIQUECIMIENTO')
                ->nullable()
                ->after('R_ENRIQUECIMIENTO');

            // Razón de cancelación del estudio
            $table->text('R_RAZON_CANCELACION')
                ->nullable()
                ->after('R_COMPLETOS');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->dropColumn([
                'R_CANDIDATO_A_PATROCINIO',
                'R_RAZON_CANDIDATO_A_PATROCINIO',
                'R_RAZON_ENRIQUECIMIENTO',
                'R_RAZON_CANCELACION',
            ]);
        });
    }
};