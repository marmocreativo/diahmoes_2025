<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EstudioInsumo extends Model
{
    use HasFactory;

    protected $table = 'estudios_insumos';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'ID_ESTUDIO',
        'ID_INSUMO_LOTE',
        'CANTIDAD',
        'ID_USUARIO',
        'NOTAS',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'ID' => 'integer',
        'ID_ESTUDIO' => 'integer',
        'ID_INSUMO_LOTE' => 'integer',
        'CANTIDAD' => 'integer',
        'ID_USUARIO' => 'integer',
    ];

    /**
     * Relación con el estudio
     */
    public function estudio(): BelongsTo
    {
        return $this->belongsTo(Estudio::class, 'ID_ESTUDIO', 'ID');
    }

    /**
     * Relación con el lote de insumo
     */
    public function lote(): BelongsTo
    {
        return $this->belongsTo(InsumoLote::class, 'ID_INSUMO_LOTE', 'ID');
    }

    /**
     * Relación con el usuario que registró
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'ID_USUARIO', 'ID_USUARIO');
    }

    /**
     * Scope por estudio
     */
    public function scopePorEstudio($query, int $estudioId)
    {
        return $query->where('ID_ESTUDIO', $estudioId);
    }

    /**
     * Scope por insumo
     */
    public function scopePorInsumo($query, int $insumoId)
    {
        return $query->whereHas('lote', function ($q) use ($insumoId) {
            $q->where('ID_INSUMO', $insumoId);
        });
    }

    /**
     * Scope por usuario
     */
    public function scopePorUsuario($query, int $usuarioId)
    {
        return $query->where('ID_USUARIO', $usuarioId);
    }

    /**
     * Accessor para obtener el nombre del insumo
     */
    public function getNombreInsumoAttribute(): string
    {
        return $this->lote?->insumo?->NOMBRE ?? 'N/A';
    }

    /**
     * Accessor para obtener el lote
     */
    public function getNumeroLoteAttribute(): string
    {
        return $this->lote?->LOTE ?? 'N/A';
    }

    /**
     * Accessor para obtener el costo total
     */
    public function getCostoTotalAttribute(): float
    {
        $costoUnitario = $this->lote?->COSTO_UNITARIO ?? 0;
        return $costoUnitario * $this->CANTIDAD;
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();
        
        static::created(function ($estudioInsumo) {
            // Al crear un registro, descontar del lote automáticamente
            $lote = $estudioInsumo->lote;
            if ($lote) {
                $lote->descontar($estudioInsumo->CANTIDAD);
            }
        });
    }
}