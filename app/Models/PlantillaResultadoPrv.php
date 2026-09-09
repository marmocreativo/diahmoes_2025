<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantillaResultadoPrv extends Model
{
    protected $table = 'estudios_prv_plantillas_resultado';
    protected $primaryKey = 'ID';

    protected $fillable = ['CODIGO', 'NOMBRE', 'DESCRIPCION', 'CAMPOS', 'ESTADO'];

    protected $casts = [
        'CAMPOS' => 'array',
    ];

    public function scopeActivas($query)
    {
        return $query->where('ESTADO', 'activo');
    }
}