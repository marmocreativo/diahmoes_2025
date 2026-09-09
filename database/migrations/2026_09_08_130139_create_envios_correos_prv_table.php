<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('envios_correos_prv', function (Blueprint $table) {
            $table->id();
            $table->integer('ID_ESTUDIO'); // referencia a estudios_prv.ID
            $table->integer('ID_MEDICO')->nullable();
            $table->integer('ID_USUARIO_ENVIO')->nullable();
            $table->string('NOMBRE_DESTINATARIO');
            $table->string('CORREO_DESTINATARIO');
            $table->enum('TIPO_ENVIO', ['enlace', 'adjunto']);
            $table->longText('MENSAJE_HTML');
            $table->enum('ESTADO', ['enviado', 'leido'])->default('enviado');
            $table->timestamp('FECHA_ENVIO')->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('FECHA_LECTURA')->nullable();
            $table->string('TOKEN_LECTURA')->unique();
            $table->timestamps();

            $table->index('ID_ESTUDIO');
            $table->index('ID_MEDICO');
            $table->index('CORREO_DESTINATARIO');
            $table->index('ESTADO');
            $table->index('ID_USUARIO_ENVIO');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('envios_correos_prv');
    }
};