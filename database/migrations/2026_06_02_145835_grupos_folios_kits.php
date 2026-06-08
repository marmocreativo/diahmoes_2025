<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grupos_folios_kits', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->integer('id_medico')->nullable();
            $table->date('fecha_envio')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grupos_folios_kits');
    }
};