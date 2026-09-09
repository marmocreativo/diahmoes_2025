<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estudios_prv', function (Blueprint $table) {
            $table->increments('ID');

            // --- Identificación / Folio ---
            // CLAVE_INTERNA guardará el folio con formato PRV-DD-MM-SERIADO (ej. PRV-09-08-01)
            $table->string('CLAVE_INTERNA');
            $table->string('CLAVE', 3);
            $table->integer('SERIADO');
            $table->integer('ANIO');
            $table->string('FOLIO_MERCK');

            // --- Relaciones (sin FK reales, se manejan a nivel Eloquent) ---
            $table->integer('ID_MEDICO')->nullable();
            $table->integer('ID_PACIENTE')->nullable();
            $table->integer('ID_INSTITUCION')->nullable();

            // --- Datos de la muestra ---
            $table->string('MUESTRA_CLAVE')->nullable();
            $table->string('MUESTRA_FOLIO_SOBRE');
            $table->string('MUESTRA_FOLIO_KIT_BL');
            $table->date('MUESTRA_FOLIO_KIT_BL_CADUCIDAD')->nullable();
            $table->enum('MUESTRA_COLON', ['ASC', 'DESC'])->nullable();
            $table->text('MUESTRA_OTROS_ROTULOS');
            $table->string('MUESTRA_TIPO')->nullable();
            $table->string('MUESTRA_SITIO_LESION');
            $table->string('MUESTRA_TIPO_ESTUDIO');
            $table->string('MUESTRA_INICIALES');
            $table->string('MUESTRA_GENERO')->nullable();
            $table->string('MUESTRA_EDAD')->nullable();
            $table->string('MUESTRA_BLOQUES');
            $table->string('MUESTRA_LAMINILLAS');
            $table->text('MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA');

            // --- Envío / logística ---
            $table->string('MUESTRA_ENVIO')->default('aplica');
            $table->string('MUESTRA_ENVIO_TIPO')->default('Local');
            $table->string('MUESTRA_GUIA')->nullable();
            $table->string('MUESTRA_GUIA_MENSAJERIA');
            $table->string('MUESTRA_GUIA_ESPECIALIZADA');
            $table->string('MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA');
            $table->string('MUESTRA_GUIA_RETORNO');
            $table->string('MUESTRA_GUIA_RETORNO_MENSAJERIA');

            // --- Dirección ---
            $table->text('MUESTRA_DIRECCION')->nullable();
            $table->string('MUESTRA_NUMERO_EXT');
            $table->string('MUESTRA_NUMERO_INT');
            $table->string('MUESTRA_COLONIA')->nullable();
            $table->string('MUESTRA_MUNICIPIO');
            $table->string('MUESTRA_CIUDAD');
            $table->string('MUESTRA_ESTADO')->nullable();
            $table->string('MUESTRA_CODIGO_POSTAL');
            $table->text('MUESTRA_REFERENCIAS')->nullable();
            $table->text('MUESTRA_HORARIOS')->nullable();

            // --- Datos clínicos / líquido ---
            $table->text('MUESTRA_DIAGNOSTICO_CLINICO');
            $table->string('MUESTRA_LIQ_CONDICION');
            $table->string('MUESTRA_LIQ_CONDICION_PRESENCIA');
            $table->string('MUESTRA_LIQ_CANTIDAD_ADECUADA');
            $table->string('MUESTRA_LIQ_CANTIDAD_ML');
            $table->string('MUESTRA_LIQ_HEMOLISIS');
            $table->string('MUESTRA_LIQ_AMP_INDICACION');
            $table->string('MUESTRA_LIQ_AMP_RAZON');
            $table->enum('MUESTRA_LIQ_LIPEMICA', ['Si', 'No'])->nullable();

            // --- Fechas del proceso ---
            $table->timestamp('FECHA_SOLICITUD_RECOLECCION')->nullable();
            $table->timestamp('FECHA_RECOLECCION')->nullable();
            $table->timestamp('FECHA_RECEPCION')->nullable();
            $table->timestamp('FECHA_RECEPCION_LABORATORIO')->nullable();
            $table->timestamp('FECHA_OBTENCION_RESULTADOS')->nullable();
            $table->timestamp('FECHA_RESULTADOS_CORREO')->nullable();

            // --- Notas / estado ---
            $table->text('ESTUDIO_NOTAS');
            $table->string('ESTUDIO_ESTADO')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estudios_prv');
    }
};