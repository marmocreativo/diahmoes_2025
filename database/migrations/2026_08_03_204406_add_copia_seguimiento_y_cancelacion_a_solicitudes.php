<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitudes_cliente', function (Blueprint $table) {
            $table->text('COPIA_SEGUIMIENTO')->nullable()->after('EMAIL_RESULTADOS');
        });

        DB::statement("ALTER TABLE solicitudes_cliente MODIFY ESTADO ENUM('pendiente', 'confirmada', 'convertida', 'cancelada') NOT NULL DEFAULT 'pendiente'");

        DB::statement("ALTER TABLE solicitud_cliente_eventos MODIFY TIPO ENUM('creacion', 'edicion', 'comentario', 'confirmacion', 'envio_guia', 'cancelacion') NOT NULL");
    }

    public function down(): void
    {
        Schema::table('solicitudes_cliente', function (Blueprint $table) {
            $table->dropColumn('COPIA_SEGUIMIENTO');
        });

        DB::statement("ALTER TABLE solicitudes_cliente MODIFY ESTADO ENUM('pendiente', 'confirmada', 'convertida') NOT NULL DEFAULT 'pendiente'");
        DB::statement("ALTER TABLE solicitud_cliente_eventos MODIFY TIPO ENUM('creacion', 'edicion', 'comentario', 'confirmacion', 'envio_guia') NOT NULL");
    }
};