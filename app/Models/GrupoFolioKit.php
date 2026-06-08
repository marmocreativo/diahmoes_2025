<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GrupoFolioKit extends Model
{
    use HasFactory;

    protected $table = 'grupos_folios_kits';

    protected $fillable = [
        'nombre',
        'id_medico',
        'fecha_envio',
    ];

    protected $casts = [
        'fecha_envio' => 'date',
        'id_medico'   => 'integer',
    ];

    // Relación con el médico (usuario)
    public function medico(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_medico', 'ID_USUARIO');
    }

    // Relación con los folios del grupo
    public function folios(): HasMany
    {
        return $this->hasMany(FolioKit::class, 'id_grupo', 'id');
    }

    // Estadísticas calculadas
    public function getEstadisticasAttribute(): array
    {
        $folios = $this->folios;

        return [
            'total'        => $folios->count(),
            'en_inventario'=> $folios->where('estado', 'en_inventario')->count(),
            'enviados'     => $folios->where('estado', 'enviado')->count(),
            'retornados'   => $folios->where('estado', 'retornado')->count(),
            'caducados'    => $folios->where('estado', 'caducado')->count(),
        ];
    }
}