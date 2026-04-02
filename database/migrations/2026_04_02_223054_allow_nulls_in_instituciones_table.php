<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('instituciones', function (Blueprint $table) {
            $table->string('INSTITUCION_CORREO', 255)->nullable()->change();
            $table->string('INSTITUCION_TELEFONO', 255)->nullable()->change();
            $table->string('INSTITUCION_RFC', 255)->nullable()->change();
            $table->string('INSTITUCION_RAZON_SOCIAL', 255)->nullable()->change();
            $table->text('INSTITUCION_DIRECCION')->nullable()->change();
            $table->string('INSTITUCION_NUMERO_EXT', 255)->nullable()->change();
            $table->string('INSTITUCION_NUMERO_INT', 255)->nullable()->change();
            $table->string('INSTITUCION_COLONIA', 255)->nullable()->change();
            $table->string('INSTITUCION_MUNICIPIO', 255)->nullable()->change();
            $table->string('INSTITUCION_CIUDAD', 255)->nullable()->change();
            $table->string('INSTITUCION_ESTADO', 255)->nullable()->change();
            $table->string('INSTITUCION_CODIGO_POSTAL', 255)->nullable()->change();
            $table->string('INSTITUCION_PIN', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('instituciones', function (Blueprint $table) {
            $table->string('INSTITUCION_CORREO', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_TELEFONO', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_RFC', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_RAZON_SOCIAL', 255)->nullable(false)->default('')->change();
            $table->text('INSTITUCION_DIRECCION')->nullable(false)->change();
            $table->string('INSTITUCION_NUMERO_EXT', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_NUMERO_INT', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_COLONIA', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_MUNICIPIO', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_CIUDAD', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_ESTADO', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_CODIGO_POSTAL', 255)->nullable(false)->default('')->change();
            $table->string('INSTITUCION_PIN', 255)->nullable(false)->default('')->change();
            
        });
    }
};
