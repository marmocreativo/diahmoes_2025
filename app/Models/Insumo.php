<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Insumo extends Model
{
    use HasFactory;

    protected $table = 'insumos';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'NOMBRE',
        'DESCRIPCION',
        'UNIDAD_MEDIDA',
        'STOCK_MINIMO',
        'ESTADO',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'ID' => 'integer',
        'STOCK_MINIMO' => 'integer',
    ];

    // Constantes para estados
    const ESTADO_ACTIVO = 'activo';
    const ESTADO_INACTIVO = 'inactivo';

    // Constantes para unidades de medida
    const UNIDAD_PIEZA = 'pieza';
    const UNIDAD_ML = 'ml';
    const UNIDAD_KIT = 'kit';
    const UNIDAD_CAJA = 'caja';
    const UNIDAD_FRASCO = 'frasco';

    /**
     * Relación con lotes
     */
    public function lotes(): HasMany
    {
        return $this->hasMany(InsumoLote::class, 'ID_INSUMO', 'ID');
    }

    /**
     * Relación con lotes disponibles
     */
    public function lotesDisponibles(): HasMany
    {
        return $this->hasMany(InsumoLote::class, 'ID_INSUMO', 'ID')
                    ->where('ESTADO', InsumoLote::ESTADO_DISPONIBLE)
                    ->where('CANTIDAD_ACTUAL', '>', 0);
    }

    /**
     * Scope para insumos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('ESTADO', self::ESTADO_ACTIVO);
    }

    /**
     * Scope para insumos inactivos
     */
    public function scopeInactivos($query)
    {
        return $query->where('ESTADO', self::ESTADO_INACTIVO);
    }

    /**
     * Scope para buscar por nombre
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('NOMBRE', 'LIKE', "%{$termino}%")
              ->orWhere('DESCRIPCION', 'LIKE', "%{$termino}%");
        });
    }

    /**
     * Scope para insumos con stock bajo
     */
    public function scopeStockBajo($query)
    {
        return $query->whereRaw('(
            SELECT SUM(CANTIDAD_ACTUAL) 
            FROM insumos_lotes 
            WHERE insumos_lotes.ID_INSUMO = insumos.ID 
            AND insumos_lotes.ESTADO = ?
        ) <= insumos.STOCK_MINIMO', [InsumoLote::ESTADO_DISPONIBLE]);
    }

    /**
     * Accessor para obtener el stock total actual
     */
    public function getStockTotalAttribute(): int
    {
        return $this->lotesDisponibles()->sum('CANTIDAD_ACTUAL');
    }

    /**
     * Accessor para verificar si el stock está bajo
     */
    public function getStockBajoAttribute(): bool
    {
        return $this->stock_total <= $this->STOCK_MINIMO;
    }

    /**
     * Accessor para obtener el nombre formateado
     */
    public function getNombreFormateadoAttribute(): string
    {
        return $this->NOMBRE . ' (' . $this->UNIDAD_MEDIDA . ')';
    }

    /**
     * Obtener todas las unidades de medida
     */
    public static function getUnidadesMedida(): array
    {
        return [
            self::UNIDAD_PIEZA => 'Pieza',
            self::UNIDAD_ML => 'Mililitros (ml)',
            self::UNIDAD_KIT => 'Kit',
            self::UNIDAD_CAJA => 'Caja',
            self::UNIDAD_FRASCO => 'Frasco',
        ];
    }

    /**
     * Obtener estados disponibles
     */
    public static function getEstados(): array
    {
        return [
            self::ESTADO_ACTIVO => 'Activo',
            self::ESTADO_INACTIVO => 'Inactivo',
        ];
    }

    /**
     * Verificar si está activo
     */
    public function estaActivo(): bool
    {
        return $this->ESTADO === self::ESTADO_ACTIVO;
    }

    /**
     * Activar insumo
     */
    public function activar(): bool
    {
        return $this->update(['ESTADO' => self::ESTADO_ACTIVO]);
    }

    /**
     * Desactivar insumo
     */
    public function desactivar(): bool
    {
        return $this->update(['ESTADO' => self::ESTADO_INACTIVO]);
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($insumo) {
            if (empty($insumo->ESTADO)) {
                $insumo->ESTADO = self::ESTADO_ACTIVO;
            }
            if (empty($insumo->STOCK_MINIMO)) {
                $insumo->STOCK_MINIMO = 0;
            }
        });
    }
}