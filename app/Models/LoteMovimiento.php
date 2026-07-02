<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoteMovimiento extends Model
{
    protected $table = 'lotes_movimientos';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'ID_INSUMO',
        'ID_LOTE',
        'TIPO',
        'CANTIDAD',
        'MOTIVO',
        'ID_ESTUDIO',
        'ID_USUARIO',
    ];

    const TIPO_INGRESO = 'ingreso';
    const TIPO_RETIRO  = 'retiro';

    // --- Relaciones ---

    public function insumo()
    {
        return $this->belongsTo(Insumo::class, 'ID_INSUMO', 'ID');
    }

    public function lote()
    {
        return $this->belongsTo(InsumoLote::class, 'ID_LOTE', 'ID');
    }

    public function estudio()
    {
        return $this->belongsTo(Estudio::class, 'ID_ESTUDIO', 'ID');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'ID_USUARIO', 'ID_USUARIO');
    }

    // --- Helpers ---

    public static function registrar(
        int $idInsumo,
        int $idLote,
        string $tipo,
        int $cantidad,
        string $motivo,
        ?int $idEstudio = null,
        ?int $idUsuario = null
    ): self {
        return self::create([
            'ID_INSUMO'  => $idInsumo,
            'ID_LOTE'    => $idLote,
            'TIPO'       => $tipo,
            'CANTIDAD'   => $cantidad,
            'MOTIVO'     => $motivo,
            'ID_ESTUDIO' => $idEstudio,
            'ID_USUARIO' => $idUsuario,
        ]);
    }
}