<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lotes_movimientos', function (Blueprint $table) {
            $table->id('ID');
            $table->unsignedBigInteger('ID_INSUMO');
            $table->unsignedBigInteger('ID_LOTE');
            $table->enum('TIPO', ['ingreso', 'retiro']);
            $table->integer('CANTIDAD');
            $table->string('MOTIVO', 500);
            $table->unsignedBigInteger('ID_ESTUDIO')->nullable();
            $table->unsignedBigInteger('ID_USUARIO')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lotes_movimientos');
    }
};