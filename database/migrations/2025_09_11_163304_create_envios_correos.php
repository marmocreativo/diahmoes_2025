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
        Schema::create('envios_correos', function (Blueprint $table) {
            $table->id();
            $table->integer('ID_ESTUDIO');
            $table->integer('ID_MEDICO')->nullable();
            $table->string('NOMBRE_DESTINATARIO');
            $table->string('CORREO_DESTINATARIO');
            $table->enum('TIPO_ENVIO', ['enlace', 'adjunto']);
            $table->longText('MENSAJE_HTML');
            $table->enum('ESTADO', ['enviado', 'leido'])->default('enviado');
            $table->timestamp('FECHA_ENVIO');
            $table->timestamp('FECHA_LECTURA')->nullable();
            $table->string('TOKEN_LECTURA')->unique(); // Para el pixel de seguimiento
            $table->timestamps();
            
            // Índices para mejorar performance
            $table->index('ID_ESTUDIO');
            $table->index('ID_MEDICO');
            $table->index('CORREO_DESTINATARIO');
            $table->index('ESTADO');
            $table->index('TOKEN_LECTURA');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('envios_correos');
    }
};