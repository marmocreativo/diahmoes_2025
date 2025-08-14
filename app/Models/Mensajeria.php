<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mensajeria extends Model
{
    use HasFactory;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'mensajerias';

    /**
     * La clave primaria de la tabla.
     */
    protected $primaryKey = 'ID';

    /**
     * Los campos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'NOMBRE',
        'ESTADO',
    ];

    /**
     * Los campos que deben ser cast a tipos nativos.
     */
    protected $casts = [
        'ID' => 'integer',
        'ESTADO' => 'string',
    ];

    /**
     * Deshabilitar timestamps automáticos ya que esta tabla no los tiene
     */
    public $timestamps = false;

    /**
     * Estados disponibles para mensajerías
     */
    const ESTADO_ACTIVO = 'activo';
    const ESTADO_INACTIVO = 'inactivo';

    /**
     * Obtener todos los estados disponibles
     */
    public static function getEstados(): array
    {
        return [
            self::ESTADO_ACTIVO => 'Activo',
            self::ESTADO_INACTIVO => 'Inactivo',
        ];
    }

    /**
     * Scope para mensajerías activas
     */
    public function scopeActivas($query)
    {
        return $query->where('ESTADO', self::ESTADO_ACTIVO);
    }

    /**
     * Scope para mensajerías inactivas
     */
    public function scopeInactivas($query)
    {
        return $query->where('ESTADO', self::ESTADO_INACTIVO);
    }

    /**
     * Scope para buscar por nombre
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where('NOMBRE', 'LIKE', "%{$termino}%");
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeEstado($query, string $estado)
    {
        return $query->where('ESTADO', $estado);
    }

    /**
     * Relación con estudios (guías normales)
     * Un estudio puede tener múltiples guías de diferentes mensajerías
     */
    public function estudiosGuiaNormal(): HasMany
    {
        return $this->hasMany(Estudio::class, 'MUESTRA_GUIA_MENSAJERIA', 'NOMBRE');
    }

    /**
     * Relación con estudios (guías especializadas)
     */
    public function estudiosGuiaEspecializada(): HasMany
    {
        return $this->hasMany(Estudio::class, 'MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA', 'NOMBRE');
    }

    /**
     * Relación con estudios (guías de retorno)
     */
    public function estudiosGuiaRetorno(): HasMany
    {
        return $this->hasMany(Estudio::class, 'MUESTRA_GUIA_RETORNO_MENSAJERIA', 'NOMBRE');
    }

    /**
     * Obtener todos los estudios relacionados con esta mensajería
     */
    public function estudios()
    {
        // Combinar todos los tipos de guías
        $guiasNormales = $this->estudiosGuiaNormal()->get();
        $guiasEspecializadas = $this->estudiosGuiaEspecializada()->get();
        $guiasRetorno = $this->estudiosGuiaRetorno()->get();

        return $guiasNormales->merge($guiasEspecializadas)->merge($guiasRetorno)->unique('ID');
    }

    /**
     * Verificar si la mensajería está activa
     */
    public function estaActiva(): bool
    {
        return $this->ESTADO === self::ESTADO_ACTIVO;
    }

    /**
     * Verificar si la mensajería está inactiva
     */
    public function estaInactiva(): bool
    {
        return $this->ESTADO === self::ESTADO_INACTIVO;
    }

    /**
     * Activar mensajería
     */
    public function activar(): bool
    {
        return $this->update(['ESTADO' => self::ESTADO_ACTIVO]);
    }

    /**
     * Desactivar mensajería
     */
    public function desactivar(): bool
    {
        return $this->update(['ESTADO' => self::ESTADO_INACTIVO]);
    }

    /**
     * Alternar estado de la mensajería
     */
    public function toggleEstado(): bool
    {
        $nuevoEstado = $this->estaActiva() ? self::ESTADO_INACTIVO : self::ESTADO_ACTIVO;
        return $this->update(['ESTADO' => $nuevoEstado]);
    }

    /**
     * Contar estudios con guías normales
     */
    public function contarGuiasNormales(): int
    {
        return $this->estudiosGuiaNormal()->count();
    }

    /**
     * Contar estudios con guías especializadas
     */
    public function contarGuiasEspecializadas(): int
    {
        return $this->estudiosGuiaEspecializada()->count();
    }

    /**
     * Contar estudios con guías de retorno
     */
    public function contarGuiasRetorno(): int
    {
        return $this->estudiosGuiaRetorno()->count();
    }

    /**
     * Contar total de guías/envíos
     */
    public function contarTotalGuias(): int
    {
        return $this->contarGuiasNormales() + 
               $this->contarGuiasEspecializadas() + 
               $this->contarGuiasRetorno();
    }

    /**
     * Obtener estadísticas de la mensajería
     */
    public function getEstadisticas(): array
    {
        return [
            'guias_normales' => $this->contarGuiasNormales(),
            'guias_especializadas' => $this->contarGuiasEspecializadas(),
            'guias_retorno' => $this->contarGuiasRetorno(),
            'total_guias' => $this->contarTotalGuias(),
            'estudios_unicos' => $this->estudios()->count(),
            'activa' => $this->estaActiva(),
        ];
    }

    /**
     * Obtener estudios recientes de esta mensajería
     */
    public function getEstudiosRecientes(int $limite = 5)
    {
        return Estudio::where(function ($query) {
            $query->where('MUESTRA_GUIA_MENSAJERIA', $this->NOMBRE)
                  ->orWhere('MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA', $this->NOMBRE)
                  ->orWhere('MUESTRA_GUIA_RETORNO_MENSAJERIA', $this->NOMBRE);
        })
        ->latest('FECHA_SOLICITUD_RECOLECCION')
        ->limit($limite)
        ->get();
    }

    /**
     * Obtener información resumida para APIs
     */
    public function getResumen(): array
    {
        return [
            'id' => $this->ID,
            'nombre' => $this->NOMBRE,
            'estado' => $this->ESTADO,
            'activa' => $this->estaActiva(),
            'total_guias' => $this->contarTotalGuias(),
        ];
    }

    /**
     * Validar nombre único (excluyendo el registro actual)
     */
    public static function nombreEsUnico(string $nombre, ?int $exceptoId = null): bool
    {
        $query = static::where('NOMBRE', $nombre);
        
        if ($exceptoId) {
            $query->where('ID', '!=', $exceptoId);
        }
        
        return !$query->exists();
    }

    /**
     * Crear nueva mensajería con validaciones
     */
    public static function crear(array $datos): self
    {
        // Validar que el nombre sea único
        if (!static::nombreEsUnico($datos['NOMBRE'])) {
            throw new \InvalidArgumentException('Ya existe una mensajería con este nombre.');
        }

        // Establecer estado por defecto si no se proporciona
        if (!isset($datos['ESTADO'])) {
            $datos['ESTADO'] = self::ESTADO_ACTIVO;
        }

        return static::create($datos);
    }

    /**
     * Obtener mensajerías para select/dropdown
     */
    public static function paraSelect(): array
    {
        return static::activas()
            ->orderBy('NOMBRE')
            ->get()
            ->pluck('NOMBRE', 'ID')
            ->toArray();
    }

    /**
     * Obtener mensajerías activas ordenadas por nombre
     */
    public static function activasOrdenadas()
    {
        return static::activas()->orderBy('NOMBRE')->get();
    }

    /**
     * Buscar mensajerías por nombre o estado
     */
    public static function buscarPorNombreOEstado(string $termino)
    {
        return static::where(function ($query) use ($termino) {
            $query->where('NOMBRE', 'LIKE', "%{$termino}%")
                  ->orWhere('ESTADO', 'LIKE', "%{$termino}%");
        })->get();
    }

    /**
     * Obtener mensajerías más utilizadas
     */
    public static function masUtilizadas(int $limite = 10)
    {
        return static::activas()
            ->get()
            ->sortByDesc(function ($mensajeria) {
                return $mensajeria->contarTotalGuias();
            })
            ->take($limite)
            ->values();
    }

    /**
     * Scope para ordenar por nombre
     */
    public function scopeOrdenadoPorNombre($query, string $direccion = 'asc')
    {
        return $query->orderBy('NOMBRE', $direccion);
    }

    /**
     * Scope para ordenar por estado (activas primero)
     */
    public function scopeOrdenadoPorEstado($query)
    {
        return $query->orderByRaw("CASE WHEN ESTADO = 'activo' THEN 0 ELSE 1 END")
                     ->orderBy('NOMBRE');
    }

    /**
     * Accessor para obtener el nombre formateado
     */
    public function getNombreFormateadoAttribute(): string
    {
        return ucwords(strtolower($this->NOMBRE));
    }

    /**
     * Accessor para obtener el estado formateado
     */
    public function getEstadoFormateadoAttribute(): string
    {
        return $this->ESTADO === self::ESTADO_ACTIVO ? 'Activo' : 'Inactivo';
    }

    /**
     * Accessor para obtener la clase CSS del estado
     */
    public function getEstadoCssClassAttribute(): string
    {
        return $this->estaActiva() 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200';
    }
}