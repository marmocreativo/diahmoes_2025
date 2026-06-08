<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE folios_kits MODIFY COLUMN estado ENUM('en_inventario', 'enviado', 'retornado', 'caducado') NOT NULL DEFAULT 'en_inventario'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE folios_kits MODIFY COLUMN estado ENUM('enviado', 'retornado', 'caducado') NOT NULL DEFAULT 'enviado'");
    }
};