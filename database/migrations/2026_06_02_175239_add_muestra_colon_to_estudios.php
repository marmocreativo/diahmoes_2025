<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->enum('MUESTRA_COLON', ['ASC', 'DESC'])
                  ->nullable()
                  ->after('MUESTRA_FOLIO_KIT_BL_CADUCIDAD');
        });
    }

    public function down(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->dropColumn('MUESTRA_COLON');
        });
    }
};