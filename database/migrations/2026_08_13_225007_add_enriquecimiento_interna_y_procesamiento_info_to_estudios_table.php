<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->text('R_RAZON_ENRIQUECIMIENTO_INTERNA')
                ->nullable()
                ->after('R_RAZON_ENRIQUECIMIENTO');

            $table->text('R_PROCESAMIENTO_REQUIERE_INFORMACION')
                ->nullable()
                ->after('R_RAZON_ADECUADO_PROCESAMIENTO');
        });
    }

    public function down(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->dropColumn([
                'R_RAZON_ENRIQUECIMIENTO_INTERNA',
                'R_PROCESAMIENTO_REQUIERE_INFORMACION',
            ]);
        });
    }
};