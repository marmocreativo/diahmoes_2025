<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CorreoCopia extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'correos_copias';

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
        'ID_USUARIO',
        'ID_ESTUDIO',
        'NOMBRE',
        'CORREO',
        'ENVIAR'
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'ID_USUARIO' => 'integer',
        'ID_ESTUDIO' => 'string',
        'NOMBRE' => 'string',
        'CORREO' => 'string',
        'ENVIAR' => 'string'
    ];

    /**
     * Accessors
     */

    public function getEnviarBooleanAttribute()
    {
        return $this->ENVIAR === 'si';
    }

    public function getEnviarTextAttribute()
    {
        return $this->ENVIAR === 'si' ? 'Sí' : 'No';
    }

    public function getNombreFormateadoAttribute()
    {
        return ucwords(strtolower(trim($this->NOMBRE)));
    }

    public function getCorreoFormateadoAttribute()
    {
        return strtolower(trim($this->CORREO));
    }

    public function getEstadoCssClassAttribute()
    {
        return $this->ENVIAR === 'si' 
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-red-100 text-red-800 border-red-200';
    }

    /**
     * Mutators
     */
    public function setNombreAttribute($value)
    {
        $this->attributes['NOMBRE'] = ucwords(strtolower(trim($value)));
    }

    public function setCorreoAttribute($value)
    {
        $this->attributes['CORREO'] = strtolower(trim($value));
    }

    public function setEnviarAttribute($value)
    {
        $this->attributes['ENVIAR'] = in_array($value, ['si', 'no']) ? $value : 'no';
    }

    /**
     * Scopes
     */
    public function scopeActivos($query)
    {
        return $query->where('ENVIAR', 'si');
    }

    public function scopeInactivos($query)
    {
        return $query->where('ENVIAR', 'no');
    }

    public function scopePorUsuario($query, $usuarioId)
    {
        return $query->where('ID_USUARIO', $usuarioId);
    }

    public function scopePorEstudio($query, $estudioId)
    {
        return $query->where('ID_ESTUDIO', $estudioId);
    }

    public function scopeBuscar($query, $termino)
    {
        if ($termino) {
            return $query->where(function ($q) use ($termino) {
                $q->where('NOMBRE', 'LIKE', '%' . $termino . '%')
                  ->orWhere('CORREO', 'LIKE', '%' . $termino . '%');
            });
        }
        return $query;
    }

    public function scopeFiltrarPorEnvio($query, $envio)
    {
        if ($envio && in_array($envio, ['si', 'no'])) {
            return $query->where('ENVIAR', $envio);
        }
        return $query;
    }

    public function scopeOrdenadoPorNombre($query)
    {
        return $query->orderBy('NOMBRE');
    }

    /**
     * Relaciones
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'ID_USUARIO', 'ID_USUARIO');
    }

    public function estudio(): BelongsTo
    {
        return $this->belongsTo(Estudio::class, 'ID_ESTUDIO', 'ID');
    }

    /**
     * Métodos de utilidad
     */
    public function toggleEnvio()
    {
        $this->ENVIAR = $this->ENVIAR === 'si' ? 'no' : 'si';
        $this->save();
        return $this;
    }

    public function activar()
    {
        $this->ENVIAR = 'si';
        $this->save();
        return $this;
    }

    public function desactivar()
    {
        $this->ENVIAR = 'no';
        $this->save();
        return $this;
    }

    public function validarCorreo()
    {
        return filter_var($this->CORREO, FILTER_VALIDATE_EMAIL) !== false;
    }

    public function esDuplicado()
    {
        return self::where('ID_ESTUDIO', $this->ID_ESTUDIO)
            ->where('CORREO', $this->CORREO)
            ->where('ID', '!=', $this->ID)
            ->exists();
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        // Evento antes de crear
        static::creating(function ($correoCopia) {
            // Validar formato de correo
            if (!filter_var($correoCopia->CORREO, FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException('El formato del correo electrónico no es válido.');
            }

            // Validar que no exista duplicado
            if (self::where('ID_ESTUDIO', $correoCopia->ID_ESTUDIO)
                    ->where('CORREO', $correoCopia->CORREO)
                    ->exists()) {
                throw new \InvalidArgumentException('Este correo ya está registrado para este estudio.');
            }
        });

        // Evento antes de actualizar
        static::updating(function ($correoCopia) {
            // Validar formato de correo
            if (!filter_var($correoCopia->CORREO, FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException('El formato del correo electrónico no es válido.');
            }

            // Validar que no exista duplicado (excluyendo el actual)
            if (self::where('ID_ESTUDIO', $correoCopia->ID_ESTUDIO)
                    ->where('CORREO', $correoCopia->CORREO)
                    ->where('ID', '!=', $correoCopia->ID)
                    ->exists()) {
                 return false; // No se guarda, pero el programa continúa
            }
        });
    }

    /**
     * Métodos estáticos de utilidad
     */
    public static function obtenerPorEstudio($estudioId)
    {
        return self::porEstudio($estudioId)
            ->ordenadoPorNombre()
            ->get();
    }

    public static function obtenerActivosPorEstudio($estudioId)
    {
        return self::porEstudio($estudioId)
            ->activos()
            ->ordenadoPorNombre()
            ->get();
    }

    public static function obtenerPorUsuario($usuarioId)
    {
        return self::porUsuario($usuarioId)
            ->ordenadoPorNombre()
            ->get();
    }

    public static function contarPorEstudio($estudioId)
    {
        return self::porEstudio($estudioId)->count();
    }

    public static function contarActivosPorEstudio($estudioId)
    {
        return self::porEstudio($estudioId)->activos()->count();
    }

    public static function agregarCorreo($estudioId, $usuarioId, $nombre, $correo, $enviar = 'si')
    {
        return self::create([
            'ID_ESTUDIO' => $estudioId,
            'ID_USUARIO' => $usuarioId,
            'NOMBRE' => $nombre,
            'CORREO' => $correo,
            'ENVIAR' => $enviar,
        ]);
    }

    public static function activarTodosPorEstudio($estudioId)
    {
        return self::porEstudio($estudioId)->update(['ENVIAR' => 'si']);
    }

    public static function desactivarTodosPorEstudio($estudioId)
    {
        return self::porEstudio($estudioId)->update(['ENVIAR' => 'no']);
    }

    public static function eliminarPorEstudio($estudioId)
    {
        return self::porEstudio($estudioId)->delete();
    }

    public static function obtenerCorreosUnicos()
    {
        return self::select('CORREO', 'NOMBRE')
            ->distinct()
            ->ordenadoPorNombre()
            ->get()
            ->map(function ($correo) {
                return [
                    'correo' => $correo->CORREO,
                    'nombre' => $correo->NOMBRE,
                    'label' => $correo->NOMBRE . ' (' . $correo->CORREO . ')'
                ];
            });
    }

    public static function obtenerEstadisticas()
    {
        $total = self::count();
        $activos = self::activos()->count();
        $inactivos = self::inactivos()->count();
        
        return [
            'total' => $total,
            'activos' => $activos,
            'inactivos' => $inactivos,
            'porcentaje_activos' => $total > 0 ? round(($activos / $total) * 100, 2) : 0,
            'estudios_con_copias' => self::select('ID_ESTUDIO')->distinct()->count(),
            'usuarios_registrados' => self::select('ID_USUARIO')->distinct()->count(),
        ];
    }

    public static function buscarCorreos($termino)
    {
        return self::buscar($termino)
            ->ordenadoPorNombre()
            ->get();
    }

    public static function obtenerParaSelect()
    {
        return self::select('ID', 'NOMBRE', 'CORREO', 'ENVIAR')
            ->ordenadoPorNombre()
            ->get()
            ->map(function ($correo) {
                return [
                    'value' => $correo->ID,
                    'label' => $correo->NOMBRE,
                    'correo' => $correo->CORREO,
                    'activo' => $correo->enviar_boolean,
                ];
            });
    }

    public static function importarDesdeUsuarios($estudioId)
    {
        // Obtener usuarios con tipo 'medico' o 'admin' que tengan correo
        $usuarios = Usuario::whereIn('USUARIO_TIPO', ['medico', 'admin'])
            ->where('USUARIO_ESTADO', 'activo')
            ->whereNotNull('USUARIO_CORREO')
            ->where('USUARIO_CORREO', '!=', '')
            ->get();

        $importados = 0;
        foreach ($usuarios as $usuario) {
            try {
                // Verificar si ya existe
                if (!self::where('ID_ESTUDIO', $estudioId)
                        ->where('CORREO', $usuario->USUARIO_CORREO)
                        ->exists()) {
                    
                    self::create([
                        'ID_ESTUDIO' => $estudioId,
                        'ID_USUARIO' => $usuario->ID_USUARIO,
                        'NOMBRE' => $usuario->USUARIO_NOMBRE . ' ' . $usuario->USUARIO_APELLIDOS,
                        'CORREO' => $usuario->USUARIO_CORREO,
                        'ENVIAR' => 'no', // Por defecto desactivado
                    ]);
                    
                    $importados++;
                }
            } catch (\Exception $e) {
                // Continuar con el siguiente si hay error
                continue;
            }
        }

        return $importados;
    }

    public static function duplicarDesdeEstudio($estudioOrigenId, $estudioDestinoId)
    {
        $correosOrigen = self::porEstudio($estudioOrigenId)->get();
        $duplicados = 0;

        foreach ($correosOrigen as $correo) {
            try {
                // Verificar si ya existe en el destino
                if (!self::where('ID_ESTUDIO', $estudioDestinoId)
                        ->where('CORREO', $correo->CORREO)
                        ->exists()) {
                    
                    self::create([
                        'ID_ESTUDIO' => $estudioDestinoId,
                        'ID_USUARIO' => $correo->ID_USUARIO,
                        'NOMBRE' => $correo->NOMBRE,
                        'CORREO' => $correo->CORREO,
                        'ENVIAR' => $correo->ENVIAR,
                    ]);
                    
                    $duplicados++;
                }
            } catch (\Exception $e) {
                // Continuar con el siguiente si hay error
                continue;
            }
        }

        return $duplicados;
    }

    /**
     * Validaciones específicas
     */
    public static function validarCorreoFormato($correo)
    {
        return filter_var($correo, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function validarNombre($nombre)
    {
        $nombre = trim($nombre);
        return !empty($nombre) && strlen($nombre) >= 2 && strlen($nombre) <= 255;
    }

    public static function validarEnvio($envio)
    {
        return in_array($envio, ['si', 'no']);
    }

    /**
     * Serialización personalizada para JSON
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Agregar campos calculados
        $array['enviar_boolean'] = $this->enviar_boolean;
        $array['enviar_text'] = $this->enviar_text;
        $array['nombre_formateado'] = $this->nombre_formateado;
        $array['correo_formateado'] = $this->correo_formateado;
        $array['estado_css_class'] = $this->estado_css_class;
        $array['correo_valido'] = $this->validarCorreo();
        
        // Incluir información de relaciones si están cargadas
        if ($this->relationLoaded('usuario')) {
            $array['usuario_info'] = $this->usuario ? [
                'nombre_completo' => $this->usuario->nombre_completo,
                'tipo' => $this->usuario->tipo_formateado,
            ] : null;
        }
        
        return $array;
    }
}