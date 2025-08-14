<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Usuario extends Model
{
    use HasFactory;

    /**
     * La tabla asociada con el modelo.
     */
    protected $table = 'usuarios';

    /**
     * La clave primaria de la tabla.
     */
    protected $primaryKey = 'ID_USUARIO';

    /**
     * Los campos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'USUARIO_NOMBRE',
        'USUARIO_APELLIDOS',
        'USUARIO_CORREO',
        'USUARIO_TELEFONO',
        'USUARIO_PASS',
        'USUARIO_TIPO',
        'ID_INSTITUCION',
        'USUARIO_ESTADO',
        'remember_token',
    ];

    /**
     * Los campos que deben ocultarse en arrays.
     */
    protected $hidden = [
        'USUARIO_PASS',
        'remember_token',
    ];

    /**
     * Los campos que deben ser cast a tipos nativos.
     */
    protected $casts = [
        'FECHA_REGISTRO' => 'datetime',
        'FECHA_ACTUALIZACION' => 'datetime',
        'ID_USUARIO' => 'integer',
        'ID_INSTITUCION' => 'integer',
    ];

    /**
     * Nombres de campos para timestamps personalizados
     */
    const CREATED_AT = 'FECHA_REGISTRO';
    const UPDATED_AT = 'FECHA_ACTUALIZACION';

    /**
     * Tipos de usuario disponibles
     */
    const TIPO_ADMIN = 'admin';
    const TIPO_CLIENTE = 'clientes';
    const TIPO_MEDICO = 'medico';
    const TIPO_PACIENTE = 'paciente';

    /**
     * Estados de usuario disponibles
     */
    const ESTADO_ACTIVO = 'activo';
    const ESTADO_INACTIVO = 'inactivo';

    /**
     * Obtener todos los tipos de usuario disponibles
     */
    public static function getTiposUsuario(): array
    {
        return [
            self::TIPO_ADMIN => 'Administrador',
            self::TIPO_CLIENTE => 'Cliente',
            self::TIPO_MEDICO => 'Médico',
            self::TIPO_PACIENTE => 'Paciente',
        ];
    }

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
     * Relación con la institución
     */
    public function institucion(): BelongsTo
    {
        return $this->belongsTo(Institucion::class, 'ID_INSTITUCION', 'ID_INSTITUCION');
    }

    /**
     * Relación con estudios (si el usuario es médico)
     */
    public function estudios(): HasMany
    {
        return $this->hasMany(Estudio::class, 'ID_MEDICO', 'ID_USUARIO');
    }

    /**
     * Relación con correos de copias
     */
    public function correosCopias(): HasMany
    {
        return $this->hasMany(CorreoCopia::class, 'ID_USUARIO', 'ID_USUARIO');
    }

    /**
     * Scope para filtrar por tipo de usuario
     */
    public function scopeTipo($query, string $tipo)
    {
        return $query->where('USUARIO_TIPO', $tipo);
    }

    /**
     * Scope para usuarios activos
     */
    public function scopeActivos($query)
    {
        return $query->where('USUARIO_ESTADO', self::ESTADO_ACTIVO);
    }

    /**
     * Scope para usuarios inactivos
     */
    public function scopeInactivos($query)
    {
        return $query->where('USUARIO_ESTADO', self::ESTADO_INACTIVO);
    }

    /**
     * Scope para buscar por nombre o apellidos
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('USUARIO_NOMBRE', 'LIKE', "%{$termino}%")
              ->orWhere('USUARIO_APELLIDOS', 'LIKE', "%{$termino}%")
              ->orWhere('USUARIO_CORREO', 'LIKE', "%{$termino}%");
        });
    }

    /**
     * Scope para filtrar por institución
     */
    public function scopeInstitucion($query, int $institucionId)
    {
        return $query->where('ID_INSTITUCION', $institucionId);
    }

    /**
     * Accessor para obtener el nombre completo
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim($this->USUARIO_NOMBRE . ' ' . $this->USUARIO_APELLIDOS);
    }

    /**
     * Accessor para obtener el nombre del tipo de usuario
     */
    public function getTipoNombreAttribute(): string
    {
        return self::getTiposUsuario()[$this->USUARIO_TIPO] ?? $this->USUARIO_TIPO;
    }

    /**
     * Accessor para obtener el nombre del estado
     */
    public function getEstadoNombreAttribute(): string
    {
        return self::getEstados()[$this->USUARIO_ESTADO] ?? $this->USUARIO_ESTADO;
    }

    /**
     * Verificar si el usuario es administrador
     */
    public function esAdmin(): bool
    {
        return $this->USUARIO_TIPO === self::TIPO_ADMIN;
    }

    /**
     * Verificar si el usuario es cliente
     */
    public function esCliente(): bool
    {
        return $this->USUARIO_TIPO === self::TIPO_CLIENTE;
    }

    /**
     * Verificar si el usuario es médico
     */
    public function esMedico(): bool
    {
        return $this->USUARIO_TIPO === self::TIPO_MEDICO;
    }

    /**
     * Verificar si el usuario es paciente
     */
    public function esPaciente(): bool
    {
        return $this->USUARIO_TIPO === self::TIPO_PACIENTE;
    }

    /**
     * Verificar si el usuario está activo
     */
    public function estaActivo(): bool
    {
        return $this->USUARIO_ESTADO === self::ESTADO_ACTIVO;
    }

    /**
     * Activar usuario
     */
    public function activar(): bool
    {
        return $this->update(['USUARIO_ESTADO' => self::ESTADO_ACTIVO]);
    }

    /**
     * Desactivar usuario
     */
    public function desactivar(): bool
    {
        return $this->update(['USUARIO_ESTADO' => self::ESTADO_INACTIVO]);
    }

    /**
     * Obtener usuarios por tipo
     */
    public static function porTipo(string $tipo)
    {
        return static::where('USUARIO_TIPO', $tipo)->activos()->get();
    }

    /**
     * Obtener médicos activos
     */
    public static function medicos()
    {
        return static::tipo(self::TIPO_MEDICO)->activos();
    }

    /**
     * Obtener clientes activos
     */
    public static function clientes()
    {
        return static::tipo(self::TIPO_CLIENTE)->activos();
    }

    /**
     * Obtener administradores activos
     */
    public static function administradores()
    {
        return static::tipo(self::TIPO_ADMIN)->activos();
    }
}