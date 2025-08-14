<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Primero, deshabilitar temporalmente el modo estricto
        DB::statement("SET sql_mode = ''");
        
        // Actualizar los timestamps con valores '0000-00-00 00:00:00' a NULL
        DB::statement("UPDATE usuarios SET FECHA_REGISTRO = NULL WHERE FECHA_REGISTRO = '0000-00-00 00:00:00'");
        
        // Modificar la tabla usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            // Cambiar los timestamps para que sean nullable y tengan valores por defecto válidos
            $table->timestamp('FECHA_REGISTRO')->nullable()->default(null)->change();
            $table->timestamp('FECHA_ACTUALIZACION')->nullable()->default(null)->change();
            
            // Agregar remember_token
            $table->rememberToken();
        });
        
        // Restaurar el modo estricto
        DB::statement("SET sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropRememberToken();
            // Revertir los cambios de timestamp sería complicado, mejor dejarlo así
        });
    }
};