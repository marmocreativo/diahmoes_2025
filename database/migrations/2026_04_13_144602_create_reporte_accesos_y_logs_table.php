<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reporte_accesos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('email')->unique();
            $table->string('password');
            $table->tinyInteger('activo')->default(1);
            $table->timestamps();
        });

        Schema::create('reporte_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reporte_acceso_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable(); // admin del sistema (tabla users)
            $table->enum('tipo_accion', ['login', 'filtro', 'exportacion']);
            $table->text('descripcion')->nullable();
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->foreign('reporte_acceso_id')
                ->references('id')
                ->on('reporte_accesos')
                ->onDelete('set null');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reporte_logs');
        Schema::dropIfExists('reporte_accesos');
    }
};