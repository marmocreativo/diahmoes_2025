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
        // Tabla principal de insumos (catálogo)
        Schema::create('insumos', function (Blueprint $table) {
            $table->integer('ID', true, true); // auto-increment, unsigned
            $table->string('NOMBRE', 255);
            $table->text('DESCRIPCION')->nullable();
            $table->string('UNIDAD_MEDIDA', 50); // 'pieza', 'ml', 'kit', etc.
            $table->integer('STOCK_MINIMO')->default(0); // Para alertas
            $table->string('ESTADO', 50)->default('activo'); // activo/inactivo
            $table->timestamps(); // created_at, updated_at
            
            $table->primary('ID');
            $table->index('ESTADO');
        });

        // Tabla de lotes (cada lote es una entrada de inventario)
        Schema::create('insumos_lotes', function (Blueprint $table) {
            $table->integer('ID', true, true); // auto-increment, unsigned
            $table->integer('ID_INSUMO')->unsigned();
            $table->string('LOTE', 255);
            $table->integer('CANTIDAD_INICIAL');
            $table->integer('CANTIDAD_ACTUAL');
            $table->date('FECHA_CADUCIDAD')->nullable();
            $table->timestamp('FECHA_INGRESO')->useCurrent();
            $table->string('PROVEEDOR', 255)->nullable();
            $table->decimal('COSTO_UNITARIO', 10, 2)->nullable();
            $table->string('ESTADO', 50)->default('disponible'); // disponible/agotado/vencido
            $table->timestamps();
            
            // Primary key
            $table->primary('ID');
            
            // Índices
            $table->index('ID_INSUMO');
            $table->index('LOTE');
            $table->index('ESTADO');
            $table->index('FECHA_CADUCIDAD');
            
            // Foreign key
            $table->foreign('ID_INSUMO')
                  ->references('ID')
                  ->on('insumos')
                  ->onDelete('cascade');
        });

        // Tabla de relación con estudios (registro de uso)
        Schema::create('estudios_insumos', function (Blueprint $table) {
            $table->integer('ID', true, true); // auto-increment, unsigned
            $table->integer('ID_ESTUDIO'); // SIN unsigned porque estudios.ID es signed
            $table->integer('ID_INSUMO_LOTE')->unsigned();
            $table->integer('CANTIDAD');
            $table->integer('ID_USUARIO')->nullable(); // SIN unsigned porque usuarios.ID_USUARIO es signed
            $table->text('NOTAS')->nullable();
            $table->timestamps();
            
            // Primary key
            $table->primary('ID');
            
            // Índices
            $table->index('ID_ESTUDIO');
            $table->index('ID_INSUMO_LOTE');
            $table->index('ID_USUARIO');
            
            // Foreign keys
            $table->foreign('ID_ESTUDIO')
                ->references('ID')
                ->on('estudios')
                ->onDelete('cascade');
                
            $table->foreign('ID_INSUMO_LOTE')
                ->references('ID')
                ->on('insumos_lotes')
                ->onDelete('restrict');
                
            $table->foreign('ID_USUARIO')
                ->references('ID_USUARIO')
                ->on('usuarios')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estudios_insumos');
        Schema::dropIfExists('insumos_lotes');
        Schema::dropIfExists('insumos');
    }
};