<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estudios_prv_plantillas_resultado', function (Blueprint $table) {
            $table->increments('ID');
            $table->string('CODIGO')->unique();
            $table->string('NOMBRE');
            $table->text('DESCRIPCION')->nullable();
            $table->json('CAMPOS');
            $table->string('ESTADO')->default('activo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estudios_prv_plantillas_resultado');
    }
};