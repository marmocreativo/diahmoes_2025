<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('folios_kits', function (Blueprint $table) {
            $table->id();
            $table->string('folio')->unique();
            $table->unsignedBigInteger('id_grupo')->nullable();
            $table->integer('id_estudio')->nullable();
            $table->enum('estado', ['enviado', 'retornado', 'caducado'])->default('enviado');
            $table->timestamps();

            $table->foreign('id_grupo')
                  ->references('id')
                  ->on('grupos_folios_kits')
                  ->nullOnDelete();

            $table->foreign('id_estudio')
                  ->references('ID')
                  ->on('estudios')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('folios_kits');
    }
};