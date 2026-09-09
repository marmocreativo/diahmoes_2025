<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudios_prv', function (Blueprint $table) {
            $table->string('FOLIO_MERCK')->nullable()->change();

            $table->string('MUESTRA_FOLIO_SOBRE')->nullable()->change();
            $table->string('MUESTRA_FOLIO_KIT_BL')->nullable()->change();
            $table->text('MUESTRA_OTROS_ROTULOS')->nullable()->change();
            $table->string('MUESTRA_SITIO_LESION')->nullable()->change();
            $table->string('MUESTRA_TIPO_ESTUDIO')->nullable()->change();
            $table->string('MUESTRA_INICIALES')->nullable()->change();
            $table->string('MUESTRA_BLOQUES')->nullable()->change();
            $table->string('MUESTRA_LAMINILLAS')->nullable()->change();
            $table->text('MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA')->nullable()->change();

            $table->string('MUESTRA_ENVIO')->nullable()->change();
            $table->string('MUESTRA_ENVIO_TIPO')->nullable()->change();
            $table->string('MUESTRA_GUIA_MENSAJERIA')->nullable()->change();
            $table->string('MUESTRA_GUIA_ESPECIALIZADA')->nullable()->change();
            $table->string('MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA')->nullable()->change();
            $table->string('MUESTRA_GUIA_RETORNO')->nullable()->change();
            $table->string('MUESTRA_GUIA_RETORNO_MENSAJERIA')->nullable()->change();

            $table->string('MUESTRA_NUMERO_EXT')->nullable()->change();
            $table->string('MUESTRA_NUMERO_INT')->nullable()->change();
            $table->string('MUESTRA_MUNICIPIO')->nullable()->change();
            $table->string('MUESTRA_CIUDAD')->nullable()->change();
            $table->string('MUESTRA_CODIGO_POSTAL')->nullable()->change();

            $table->text('MUESTRA_DIAGNOSTICO_CLINICO')->nullable()->change();
            $table->string('MUESTRA_LIQ_CONDICION')->nullable()->change();
            $table->string('MUESTRA_LIQ_CONDICION_PRESENCIA')->nullable()->change();
            $table->string('MUESTRA_LIQ_CANTIDAD_ADECUADA')->nullable()->change();
            $table->string('MUESTRA_LIQ_CANTIDAD_ML')->nullable()->change();
            $table->string('MUESTRA_LIQ_HEMOLISIS')->nullable()->change();
            $table->string('MUESTRA_LIQ_AMP_INDICACION')->nullable()->change();
            $table->string('MUESTRA_LIQ_AMP_RAZON')->nullable()->change();

            $table->text('ESTUDIO_NOTAS')->nullable()->change();
        });
    }

    public function down(): void
    {
        // No revertimos a NOT NULL: hacerlo fallaría si ya existen filas
        // con esos campos en null. Si algún día hace falta revertir,
        // habría que rellenar valores antes.
    }
};