<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('envios_correos', function (Blueprint $table) {
            $table->integer('ID_USUARIO_ENVIO')->after('ID_MEDICO')->nullable();
            
            // Agregar índice para mejorar performance
            $table->index('ID_USUARIO_ENVIO');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('envios_correos', function (Blueprint $table) {
            $table->dropIndex(['ID_USUARIO_ENVIO']);
            $table->dropColumn('ID_USUARIO_ENVIO');
        });
    }
};