<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estudios_prv_resultados', function (Blueprint $table) {
            $table->increments('ID');
            $table->integer('ID_ESTUDIO');       // referencia a estudios_prv.ID
            $table->string('CODIGO_PLANTILLA');  // referencia a estudios_prv_plantillas_resultado.CODIGO
            $table->json('DATOS');               // { "campo_key": "valor", ... }
            $table->timestamps();

            $table->index('ID_ESTUDIO');
            $table->index('CODIGO_PLANTILLA');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estudios_prv_resultados');
    }
};