<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institucion extends Model
{
    use HasFactory;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'instituciones';

    /**
     * La clave primaria de la tabla.
     */
    protected $primaryKey = 'ID_INSTITUCION';

    /**
     * Los campos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'INSTITUCION_NOMBRE',
        'INSTITUCION_CORREO',
        'INSTITUCION_TELEFONO',
        'INSTITUCION_RFC',
        'INSTITUCION_RAZON_SOCIAL',
        'INSTITUCION_DIRECCION',
        'INSTITUCION_NUMERO_EXT',
        'INSTITUCION_NUMERO_INT',
        'INSTITUCION_COLONIA',
        'INSTITUCION_MUNICIPIO',
        'INSTITUCION_CIUDAD',
        'INSTITUCION_ESTADO',
        'INSTITUCION_CODIGO_POSTAL',
        'INSTITUCION_PIN',
    ];

    /**
     * Los campos que deben ocultarse en arrays.
     */
    protected $hidden = [
        'INSTITUCION_PIN',
    ];

    /**
     * Los campos que deben ser cast a tipos nativos.
     */
    protected $casts = [
        'FECHA_REGISTRO' => 'datetime',
        'FECHA_ACTUALIZACION' => 'datetime',
        'ID_INSTITUCION' => 'integer',
    ];

    /**
     * Nombres de campos para timestamps personalizados
     */
    const CREATED_AT = 'FECHA_REGISTRO';
    const UPDATED_AT = 'FECHA_ACTUALIZACION';

    /**
     * Estados de institución disponibles (solo para referencia futura)
     */
    const ESTADO_ACTIVA = 'activa';
    const ESTADO_INACTIVA = 'inactiva';
    const ESTADO_SUSPENDIDA = 'suspendida';

    /**
     * Obtener todos los estados disponibles (para referencia futura)
     */
    public static function getEstados(): array
    {
        return [
            'Nota' => 'Las instituciones no tienen estados en la BD actual',
        ];
    }

    /**
     * Relación con usuarios
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuario::class, 'ID_INSTITUCION', 'ID_INSTITUCION');
    }

    /**
     * Relación con estudios
     */
    public function estudios(): HasMany
    {
        return $this->hasMany(Estudio::class, 'ID_INSTITUCION', 'ID_INSTITUCION');
    }

    /**
     * Scope para buscar por nombre, RFC o ciudad
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('INSTITUCION_NOMBRE', 'LIKE', "%{$termino}%")
              ->orWhere('INSTITUCION_RFC', 'LIKE', "%{$termino}%")
              ->orWhere('INSTITUCION_CIUDAD', 'LIKE', "%{$termino}%")
              ->orWhere('INSTITUCION_RAZON_SOCIAL', 'LIKE', "%{$termino}%");
        });
    }

    /**
     * Scope para filtrar por ciudad
     */
    public function scopeCiudad($query, string $ciudad)
    {
        return $query->where('INSTITUCION_CIUDAD', $ciudad);
    }

    /**
     * Scope para filtrar por estado geográfico
     */
    public function scopeEstadoGeografico($query, string $estado)
    {
        return $query->where('INSTITUCION_ESTADO', $estado);
    }

    /**
     * Accessor para obtener la dirección completa
     */
    public function getDireccionCompletaAttribute(): string
    {
        $direccion = $this->INSTITUCION_DIRECCION;
        $numero_ext = $this->INSTITUCION_NUMERO_EXT;
        $numero_int = $this->INSTITUCION_NUMERO_INT ? ', Int. ' . $this->INSTITUCION_NUMERO_INT : '';
        $colonia = $this->INSTITUCION_COLONIA;
        $ciudad = $this->INSTITUCION_CIUDAD;
        $estado = $this->INSTITUCION_ESTADO;
        $cp = $this->INSTITUCION_CODIGO_POSTAL;

        return "{$direccion} {$numero_ext}{$numero_int}, {$colonia}, {$ciudad}, {$estado} {$cp}";
    }

    /**
     * Accessor para obtener información de contacto
     */
    public function getContactoCompletoAttribute(): array
    {
        return [
            'telefono' => $this->INSTITUCION_TELEFONO,
            'correo' => $this->INSTITUCION_CORREO,
            'direccion' => $this->direccion_completa,
        ];
    }

    /**
     * Accessor para obtener el nombre corto (primeras 3 palabras)
     */
    public function getNombreCortoAttribute(): string
    {
        $palabras = explode(' ', $this->INSTITUCION_NOMBRE);
        return implode(' ', array_slice($palabras, 0, 3));
    }

    /**
     * Verificar si la institución está activa
     */
    public function estaActiva(): bool
    {
        return $this->INSTITUCION_ESTADO === self::ESTADO_ACTIVA;
    }

    /**
     * Verificar si la institución está inactiva
     */
    public function estaInactiva(): bool
    {
        return $this->INSTITUCION_ESTADO === self::ESTADO_INACTIVA;
    }

    /**
     * Verificar si la institución está suspendida
     */
    public function estaSuspendida(): bool
    {
        return $this->INSTITUCION_ESTADO === self::ESTADO_SUSPENDIDA;
    }

    /**
     * Activar institución
     */
    public function activar(): bool
    {
        return $this->update(['INSTITUCION_ESTADO' => self::ESTADO_ACTIVA]);
    }

    /**
     * Desactivar institución
     */
    public function desactivar(): bool
    {
        return $this->update(['INSTITUCION_ESTADO' => self::ESTADO_INACTIVA]);
    }

    /**
     * Suspender institución
     */
    public function suspender(): bool
    {
        return $this->update(['INSTITUCION_ESTADO' => self::ESTADO_SUSPENDIDA]);
    }

    /**
     * Contar usuarios activos de la institución
     */
    public function contarUsuariosActivos(): int
    {
        return $this->usuarios()->where('USUARIO_ESTADO', 'activo')->count();
    }

    /**
     * Contar estudios de la institución
     */
    public function contarEstudios(): int
    {
        return $this->estudios()->count();
    }

    /**
     * Obtener usuarios por tipo
     */
    public function usuariosPorTipo(string $tipo)
    {
        return $this->usuarios()
            ->where('USUARIO_TIPO', $tipo)
            ->where('USUARIO_ESTADO', 'activo')
            ->get();
    }

    /**
     * Obtener médicos de la institución
     */
    public function medicos()
    {
        return $this->usuariosPorTipo('medico');
    }

    /**
     * Obtener clientes de la institución
     */
    public function clientesUsuarios()
    {
        return $this->usuariosPorTipo('clientes');
    }

    /**
     * Obtener pacientes de la institución
     */
    public function pacientes()
    {
        return $this->usuariosPorTipo('paciente');
    }

    /**
     * Validar RFC mexicano
     */
    public function validarRFC(): bool
    {
        // RFC para persona moral (12 caracteres) o física (13 caracteres)
        $patron = '/^[A-ZÑ&]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/';
        return preg_match($patron, $this->INSTITUCION_RFC);
    }

    /**
     * Validar código postal mexicano
     */
    public function validarCodigoPostal(): bool
    {
        $patron = '/^[0-9]{5}$/';
        return preg_match($patron, $this->INSTITUCION_CODIGO_POSTAL);
    }

    /**
     * Generar PIN aleatorio
     */
    public static function generarPIN(): string
    {
        return str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    /**
     * Obtener instituciones por ciudad
     */
    public static function porCiudad(string $ciudad)
    {
        return static::where('INSTITUCION_CIUDAD', $ciudad)->activas()->get();
    }

    /**
     * Obtener instituciones por estado
     */
    public static function porEstado(string $estado)
    {
        return static::where('INSTITUCION_ESTADO', $estado)->activas()->get();
    }

    /**
     * Obtener estadísticas de la institución
     */
    public function getEstadisticas(): array
    {
        return [
            'usuarios_total' => $this->usuarios()->count(),
            'usuarios_activos' => $this->contarUsuariosActivos(),
            'medicos' => $this->medicos()->count(),
            'clientes' => $this->clientesUsuarios()->count(),
            'pacientes' => $this->pacientes()->count(),
            'estudios_total' => $this->contarEstudios(),
            'estudios_mes_actual' => $this->estudios()
                ->whereMonth('FECHA_SOLICITUD_RECOLECCION', now()->month)
                ->whereYear('FECHA_SOLICITUD_RECOLECCION', now()->year)
                ->count(),
        ];
    }

    /**
     * Obtener información resumida para APIs
     */
    public function getResumen(): array
    {
        return [
            'id' => $this->ID_INSTITUCION,
            'nombre' => $this->INSTITUCION_NOMBRE,
            'nombre_corto' => $this->nombre_corto,
            'ciudad' => $this->INSTITUCION_CIUDAD,
            'estado' => $this->INSTITUCION_ESTADO,
            'telefono' => $this->INSTITUCION_TELEFONO,
            'correo' => $this->INSTITUCION_CORREO,
            'activa' => $this->estaActiva(),
        ];
    }
}