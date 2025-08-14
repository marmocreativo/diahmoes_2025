<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conteo extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'conteo';

    /**
     * Clave primaria de la tabla
     */
    protected $primaryKey = 'ID';

    /**
     * Indica si el modelo debe manejar timestamps automáticamente
     */
    public $timestamps = false;

    /**
     * Los atributos que son asignables en masa
     */
    protected $fillable = [
        'CLAVE',
        'CONTINUO'
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'CLAVE' => 'string',
        'CONTINUO' => 'integer'
    ];

    /**
     * Accessors
     */
    public function getClaveAttribute()
    {
        return $this->CLAVE;
    }

    public function getContinuoAttribute()
    {
        return (int) $this->CONTINUO;
    }

    public function getClaveFormateadaAttribute()
    {
        return strtoupper(trim($this->CLAVE));
    }

    public function getSiguienteNumeroAttribute()
    {
        return $this->continuo + 1;
    }

    public function getSiguienteClaveCompletaAttribute()
    {
        return $this->clave_formateada . str_pad($this->siguiente_numero, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Mutators
     */
    public function setClaveAttribute($value)
    {
        $this->attributes['CLAVE'] = strtoupper(trim($value));
    }

    public function setContinuoAttribute($value)
    {
        $this->attributes['CONTINUO'] = (int) $value;
    }

    /**
     * Scopes
     */
    public function scopePorClave($query, $clave)
    {
        return $query->where('CLAVE', strtoupper(trim($clave)));
    }

    public function scopeOrdenadoPorClave($query)
    {
        return $query->orderBy('CLAVE');
    }

    public function scopeActivos($query)
    {
        return $query->where('CONTINUO', '>=', 0);
    }

    /**
     * Métodos de utilidad
     */
    public function incrementar($cantidad = 1)
    {
        $this->CONTINUO += $cantidad;
        $this->save();
        return $this;
    }

    public function decrementar($cantidad = 1)
    {
        $nuevoValor = $this->CONTINUO - $cantidad;
        $this->CONTINUO = max(0, $nuevoValor); // No permitir valores negativos
        $this->save();
        return $this;
    }

    public function resetear($valor = 0)
    {
        $this->CONTINUO = max(0, $valor);
        $this->save();
        return $this;
    }

    public function establecerValor($valor)
    {
        $this->CONTINUO = max(0, (int) $valor);
        $this->save();
        return $this;
    }

    public function obtenerYIncrementar()
    {
        $valorActual = $this->CONTINUO;
        $this->incrementar();
        return $valorActual + 1;
    }

    public function generarSiguienteClave()
    {
        $numero = $this->obtenerYIncrementar();
        return $this->clave_formateada . str_pad($numero, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        // Evento antes de crear
        static::creating(function ($conteo) {
            // Validar que la clave sea única
            if (self::where('CLAVE', $conteo->CLAVE)->exists()) {
                throw new \InvalidArgumentException('La clave ya existe en el sistema.');
            }
            
            // Asegurar que el continuo no sea negativo
            if ($conteo->CONTINUO < 0) {
                $conteo->CONTINUO = 0;
            }
        });

        // Evento antes de actualizar
        static::updating(function ($conteo) {
            // Asegurar que el continuo no sea negativo
            if ($conteo->CONTINUO < 0) {
                $conteo->CONTINUO = 0;
            }
        });
    }

    /**
     * Métodos estáticos de utilidad
     */
    public static function obtenerPorClave($clave)
    {
        return self::porClave($clave)->first();
    }

    public static function crearOObtener($clave, $valorInicial = 0)
    {
        return self::firstOrCreate(
            ['CLAVE' => strtoupper(trim($clave))],
            ['CONTINUO' => max(0, (int) $valorInicial)]
        );
    }

    public static function obtenerSiguienteNumero($clave)
    {
        $conteo = self::obtenerPorClave($clave);
        
        if (!$conteo) {
            $conteo = self::crearOObtener($clave, 0);
        }
        
        return $conteo->obtenerYIncrementar();
    }

    public static function generarClave($prefijo)
    {
        $conteo = self::crearOObtener($prefijo, 0);
        return $conteo->generarSiguienteClave();
    }

    public static function obtenerTodasLasClaves()
    {
        return self::ordenadoPorClave()->get()->map(function ($conteo) {
            return [
                'id' => $conteo->ID,
                'clave' => $conteo->CLAVE,
                'continuo' => $conteo->CONTINUO,
                'siguiente_numero' => $conteo->siguiente_numero,
                'siguiente_clave_completa' => $conteo->siguiente_clave_completa,
            ];
        });
    }

    public static function resetearTodas()
    {
        return self::query()->update(['CONTINUO' => 0]);
    }

    public static function resetearClave($clave, $valor = 0)
    {
        $conteo = self::obtenerPorClave($clave);
        if ($conteo) {
            return $conteo->resetear($valor);
        }
        return false;
    }

    public static function eliminarClave($clave)
    {
        $conteo = self::obtenerPorClave($clave);
        if ($conteo) {
            return $conteo->delete();
        }
        return false;
    }

    public static function establecerValorClave($clave, $valor)
    {
        $conteo = self::crearOObtener($clave, 0);
        return $conteo->establecerValor($valor);
    }

    public static function obtenerEstadisticas()
    {
        $conteos = self::all();
        
        return [
            'total_claves' => $conteos->count(),
            'total_generados' => $conteos->sum('CONTINUO'),
            'promedio_por_clave' => $conteos->count() > 0 ? round($conteos->avg('CONTINUO'), 2) : 0,
            'clave_mas_usada' => $conteos->sortByDesc('CONTINUO')->first(),
            'claves_disponibles' => $conteos->map(function ($conteo) {
                return [
                    'clave' => $conteo->CLAVE,
                    'continuo' => $conteo->CONTINUO,
                    'siguiente' => $conteo->siguiente_clave_completa
                ];
            })->toArray(),
        ];
    }

    /**
     * Validaciones específicas
     */
    public static function validarClave($clave)
    {
        $clave = strtoupper(trim($clave));
        
        // Validar formato (solo letras y números, máximo 10 caracteres)
        if (!preg_match('/^[A-Z0-9]{1,10}$/', $clave)) {
            return false;
        }
        
        return true;
    }

    public static function validarContinuo($continuo)
    {
        // Solo números enteros positivos o cero
        return is_numeric($continuo) && (int) $continuo >= 0;
    }

    /**
     * Serialización personalizada para JSON
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Agregar campos calculados
        $array['clave_formateada'] = $this->clave_formateada;
        $array['siguiente_numero'] = $this->siguiente_numero;
        $array['siguiente_clave_completa'] = $this->siguiente_clave_completa;
        
        return $array;
    }
}