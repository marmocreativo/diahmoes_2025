<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InsumoLote extends Model
{
    use HasFactory;

    protected $table = 'insumos_lotes';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'ID_INSUMO',
        'LOTE',
        'CANTIDAD_INICIAL',
        'CANTIDAD_ACTUAL',
        'FECHA_CADUCIDAD',
        'FECHA_INGRESO',
        'PROVEEDOR',
        'COSTO_UNITARIO',
        'ESTADO',
        'NOTAS',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'FECHA_CADUCIDAD' => 'date',
        'FECHA_INGRESO' => 'datetime',
        'ID' => 'integer',
        'ID_INSUMO' => 'integer',
        'CANTIDAD_INICIAL' => 'integer',
        'CANTIDAD_ACTUAL' => 'integer',
        'COSTO_UNITARIO' => 'decimal:2',
    ];

    // Constantes para estados
    const ESTADO_DISPONIBLE = 'disponible';
    const ESTADO_AGOTADO = 'agotado';
    const ESTADO_VENCIDO = 'vencido';

    /**
     * Relación con el insumo
     */
    public function insumo(): BelongsTo
    {
        return $this->belongsTo(Insumo::class, 'ID_INSUMO', 'ID');
    }

    /**
     * Relación con usos en estudios
     */
    public function usos(): HasMany
    {
        return $this->hasMany(EstudioInsumo::class, 'ID_INSUMO_LOTE', 'ID');
    }

    /**
     * Scope para lotes disponibles
     */
    public function scopeDisponibles($query)
    {
        return $query->where('ESTADO', self::ESTADO_DISPONIBLE)
                     ->where('CANTIDAD_ACTUAL', '>', 0);
    }

    /**
     * Scope para lotes agotados
     */
    public function scopeAgotados($query)
    {
        return $query->where('ESTADO', self::ESTADO_AGOTADO)
                     ->orWhere('CANTIDAD_ACTUAL', '<=', 0);
    }

    /**
     * Scope para lotes vencidos
     */
    public function scopeVencidos($query)
    {
        return $query->where('ESTADO', self::ESTADO_VENCIDO);
    }

    /**
     * Scope para lotes próximos a vencer
     */
    public function scopeProximosVencer($query, int $dias = 30)
    {
        return $query->where('FECHA_CADUCIDAD', '<=', now()->addDays($dias))
                     ->where('FECHA_CADUCIDAD', '>=', now())
                     ->where('ESTADO', self::ESTADO_DISPONIBLE);
    }

    /**
     * Scope por insumo
     */
    public function scopePorInsumo($query, int $insumoId)
    {
        return $query->where('ID_INSUMO', $insumoId);
    }

    /**
     * Scope por lote
     */
    public function scopePorLote($query, string $lote)
    {
        return $query->where('LOTE', $lote);
    }

    /**
     * Accessor para verificar si está agotado
     */
    public function getEstaAgotadoAttribute(): bool
    {
        return $this->CANTIDAD_ACTUAL <= 0;
    }

    /**
     * Accessor para verificar si está vencido
     */
    public function getEstaVencidoAttribute(): bool
    {
        return $this->FECHA_CADUCIDAD && $this->FECHA_CADUCIDAD->isPast();
    }

    /**
     * Accessor para verificar si está próximo a vencer
     */
    public function getProximoVencerAttribute(): bool
    {
        if (!$this->FECHA_CADUCIDAD) {
            return false;
        }
        return $this->FECHA_CADUCIDAD->diffInDays(now()) <= 30 && !$this->esta_vencido;
    }

    /**
     * Accessor para obtener el estado formateado
     */
    public function getEstadoFormateadoAttribute(): string
    {
        switch ($this->ESTADO) {
            case self::ESTADO_DISPONIBLE:
                return 'Disponible';
            case self::ESTADO_AGOTADO:
                return 'Agotado';
            case self::ESTADO_VENCIDO:
                return 'Vencido';
            default:
                return $this->ESTADO;
        }
    }

    /**
     * Accessor para calcular el porcentaje usado
     */
    public function getPorcentajeUsadoAttribute(): float
    {
        if ($this->CANTIDAD_INICIAL <= 0) {
            return 0;
        }
        $usado = $this->CANTIDAD_INICIAL - $this->CANTIDAD_ACTUAL;
        return round(($usado / $this->CANTIDAD_INICIAL) * 100, 2);
    }

    /**
     * Accessor para obtener la cantidad usada
     */
    public function getCantidadUsadaAttribute(): int
    {
        return $this->CANTIDAD_INICIAL - $this->CANTIDAD_ACTUAL;
    }

    /**
     * Obtener estados disponibles
     */
    public static function getEstados(): array
    {
        return [
            self::ESTADO_DISPONIBLE => 'Disponible',
            self::ESTADO_AGOTADO => 'Agotado',
            self::ESTADO_VENCIDO => 'Vencido',
        ];
    }

    /**
     * Descontar cantidad del lote
     */
    public function descontar(int $cantidad): bool
    {
        if ($cantidad > $this->CANTIDAD_ACTUAL) {
            return false;
        }

        $nuevaCantidad = $this->CANTIDAD_ACTUAL - $cantidad;
        $this->CANTIDAD_ACTUAL = $nuevaCantidad;

        // Actualizar estado si se agotó
        if ($nuevaCantidad <= 0) {
            $this->ESTADO = self::ESTADO_AGOTADO;
        }

        return $this->save();
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($lote) {
            if (empty($lote->ESTADO)) {
                $lote->ESTADO = self::ESTADO_DISPONIBLE;
            }
            if (empty($lote->FECHA_INGRESO)) {
                $lote->FECHA_INGRESO = now();
            }
        });

        static::saving(function ($lote) {
            // Actualizar estado automáticamente según caducidad y cantidad
            // CAMBIADO: Solo verificar fecha de caducidad si no es null
            if ($lote->FECHA_CADUCIDAD && $lote->FECHA_CADUCIDAD->isPast()) {
                $lote->ESTADO = self::ESTADO_VENCIDO;
            } elseif ($lote->CANTIDAD_ACTUAL <= 0) {
                $lote->ESTADO = self::ESTADO_AGOTADO;
            }
        });
    }
}