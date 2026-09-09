<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('correos_copias_prv', function (Blueprint $table) {
            $table->increments('ID');
            $table->integer('ID_USUARIO');
            $table->string('ID_ESTUDIO'); // ID del estudio en estudios_prv
            $table->string('NOMBRE');
            $table->string('CORREO');
            $table->string('ENVIAR')->default('no');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('correos_copias_prv');
    }
};