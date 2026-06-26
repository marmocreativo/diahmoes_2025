<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_cliente', function (Blueprint $table) {
            $table->bigIncrements('ID');
            $table->string('FOLIO_MERCK')->nullable();
            $table->string('TIPO_SOLICITUD')->nullable();
            $table->unsignedInteger('CANTIDAD')->default(1);

            // Médico
            $table->integer('ID_MEDICO')->nullable();
            $table->string('MEDICO_NOMBRE_LIBRE')->nullable();

            // Institución
            $table->integer('ID_INSTITUCION')->nullable();
            $table->string('INSTITUCION_NOMBRE_LIBRE')->nullable();

            // Datos de contacto / logística
            $table->string('SOLICITA')->nullable();
            $table->string('PREGUNTAR_POR')->nullable();
            $table->string('TELEFONO')->nullable();
            $table->string('CELULAR')->nullable();
            $table->date('PROGRAMAR_PARA')->nullable();
            $table->string('HORARIO')->nullable();
            $table->string('DIRIGIRSE_A')->nullable();

            // Dirección de recolección
            $table->string('MUESTRA_CALLE')->nullable();
            $table->string('MUESTRA_NUMERO_EXT')->nullable();
            $table->string('MUESTRA_NUMERO_INT')->nullable();
            $table->string('MUESTRA_COLONIA')->nullable();
            $table->string('MUESTRA_MUNICIPIO')->nullable();
            $table->string('MUESTRA_ESTADO')->nullable();
            $table->string('MUESTRA_CODIGO_POSTAL')->nullable();

            // Contactos de correo
            $table->string('EMAIL_GUIA')->nullable();
            $table->string('EMAIL_RESULTADOS')->nullable();
            $table->string('KAM')->nullable();
            $table->string('PAL')->nullable();

            // Estado del flujo
            $table->enum('ESTADO', ['pendiente', 'confirmada', 'convertida'])->default('pendiente');
            $table->json('ESTUDIOS_GENERADOS')->nullable(); // IDs de estudios creados

            // Quién capturó (acceso externo)
            $table->unsignedInteger('CREADO_POR_ACCESO_ID')->nullable();

            $table->text('NOTAS')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_cliente');
    }
};