<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CorreoCopiaPrv extends Model
{
    use HasFactory;

    protected $table = 'correos_copias_prv';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'ID_USUARIO',
        'ID_ESTUDIO',
        'NOMBRE',
        'CORREO',
        'ENVIAR',
    ];

    protected $casts = [
        'ID_USUARIO' => 'integer',
        'ID_ESTUDIO' => 'string',
        'NOMBRE' => 'string',
        'CORREO' => 'string',
        'ENVIAR' => 'string',
    ];

    // Accessors
    public function getEnviarBooleanAttribute()
    {
        return $this->ENVIAR === 'si';
    }

    public function getEnviarTextAttribute()
    {
        return $this->ENVIAR === 'si' ? 'Sí' : 'No';
    }

    public function getEstadoCssClassAttribute()
    {
        return $this->ENVIAR === 'si'
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-red-100 text-red-800 border-red-200';
    }

    // Mutators
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

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('ENVIAR', 'si');
    }

    public function scopePorEstudio($query, $estudioId)
    {
        return $query->where('ID_ESTUDIO', $estudioId);
    }

    public function scopeOrdenadoPorNombre($query)
    {
        return $query->orderBy('NOMBRE');
    }

    // Relaciones
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'ID_USUARIO', 'ID_USUARIO');
    }

    public function estudio(): BelongsTo
    {
        return $this->belongsTo(EstudioPrv::class, 'ID_ESTUDIO', 'ID');
    }

    // Boot: mismas validaciones que CorreoCopia (formato + duplicados)
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($correoCopia) {
            if (!filter_var($correoCopia->CORREO, FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException('El formato del correo electrónico no es válido.');
            }

            if (self::where('ID_ESTUDIO', $correoCopia->ID_ESTUDIO)
                    ->where('CORREO', $correoCopia->CORREO)
                    ->exists()) {
                throw new \InvalidArgumentException('Este correo ya está registrado para este estudio.');
            }
        });
    }

    // Métodos estáticos de utilidad
    public static function obtenerActivosPorEstudio($estudioId)
    {
        return self::porEstudio($estudioId)
            ->activos()
            ->ordenadoPorNombre()
            ->get();
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
}