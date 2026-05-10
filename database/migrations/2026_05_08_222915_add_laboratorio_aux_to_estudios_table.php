<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->string('MUESTRA_REQUIERE_LABORATORIO_AUX', 2)->nullable()->after('MUESTRA_LAMINILLAS');
            $table->text('MUESTRA_NOMBRE_LABORATORIO_AUX')->nullable()->after('MUESTRA_REQUIERE_LABORATORIO_AUX');
        });
    }

    public function down(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->dropColumn(['MUESTRA_REQUIERE_LABORATORIO_AUX', 'MUESTRA_NOMBRE_LABORATORIO_AUX']);
        });
    }
};