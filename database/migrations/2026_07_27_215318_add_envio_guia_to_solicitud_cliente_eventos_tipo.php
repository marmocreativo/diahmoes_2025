<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE solicitud_cliente_eventos MODIFY TIPO ENUM('creacion', 'edicion', 'comentario', 'confirmacion', 'envio_guia') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE solicitud_cliente_eventos MODIFY TIPO ENUM('creacion', 'edicion', 'comentario', 'confirmacion') NOT NULL");
    }
};