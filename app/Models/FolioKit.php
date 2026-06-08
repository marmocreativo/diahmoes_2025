<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FolioKit extends Model
{
    use HasFactory;

    protected $table = 'folios_kits';

    protected $fillable = [
        'folio',
        'id_grupo',
        'id_estudio',
        'estado',
        'fecha_caducidad',
    ];

    protected $casts = [
        'id_grupo'   => 'integer',
        'id_estudio' => 'integer',
        'fecha_caducidad' => 'date',
    ];

    // Relación con el grupo
    public function grupo(): BelongsTo
    {
        return $this->belongsTo(GrupoFolioKit::class, 'id_grupo', 'id');
    }

    // Relación con el estudio
    public function estudio(): BelongsTo
    {
        return $this->belongsTo(Estudio::class, 'id_estudio', 'ID');
    }

    // Colores de estado para la UI
    public static function colorEstado(string $estado): string
    {
        return match($estado) {
            'en_inventario' => 'gray',
            'enviado'       => 'blue',
            'retornado'     => 'green',
            'caducado'      => 'red',
            default         => 'gray',
        };
    }
}