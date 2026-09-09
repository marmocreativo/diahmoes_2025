<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultadoPrv extends Model
{
    protected $table = 'estudios_prv_resultados';
    protected $primaryKey = 'ID';

    protected $fillable = ['ID_ESTUDIO', 'CODIGO_PLANTILLA', 'DATOS'];

    protected $casts = [
        'DATOS' => 'array',
    ];

    public function estudio(): BelongsTo
    {
        return $this->belongsTo(EstudioPrv::class, 'ID_ESTUDIO', 'ID');
    }

    public function plantilla(): BelongsTo
    {
        return $this->belongsTo(PlantillaResultadoPrv::class, 'CODIGO_PLANTILLA', 'CODIGO');
    }
}