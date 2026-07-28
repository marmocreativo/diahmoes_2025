<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitud_cliente_eventos', function (Blueprint $table) {
            $table->id('ID');
            $table->unsignedBigInteger('ID_SOLICITUD');
            $table->enum('TIPO', ['creacion', 'edicion', 'comentario', 'confirmacion']);
            $table->enum('AUTOR_TIPO', ['cliente', 'admin']);
            $table->string('AUTOR_NOMBRE')->nullable();
            $table->text('MENSAJE')->nullable();
            $table->json('CAMBIOS')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('ID_SOLICITUD');
            // Sin foreign key constraint (mismo criterio que el resto del proyecto en Bluehost:
            // la relación se maneja solo a nivel Eloquent).
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitud_cliente_eventos');
    }
};