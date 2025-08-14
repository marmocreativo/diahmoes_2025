<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institucion extends Model
{
    use HasFactory;

    protected $table = 'instituciones';
    protected $primaryKey = 'ID_INSTITUCION';
    
    const CREATED_AT = 'FECHA_REGISTRO';
    const UPDATED_AT = 'FECHA_ACTUALIZACION';

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
        'INSTITUCION_PIN'
    ];

    protected $casts = [
        'FECHA_REGISTRO' => 'datetime',
        'FECHA_ACTUALIZACION' => 'datetime',
    ];

    public function getRouteKeyName()
    {
        return 'ID_INSTITUCION';
    }

    // Constantes para estados (aunque no está en tu DB actual, podrías agregarlo)
    const ESTADO_ACTIVO = 'activo';
    const ESTADO_INACTIVO = 'inactivo';

    /**
     * Relación con usuarios
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuario::class, 'ID_INSTITUCION', 'ID_INSTITUCION');
    }

    /**
     * Relación con estudios a través de usuarios
     */
    public function estudios(): HasMany
    {
        return $this->hasMany(Estudio::class, 'ID_INSTITUCION', 'ID_INSTITUCION');
    }

    // Scopes
    public function scopeActivas($query)
    {
        // Si decides agregar campo ESTADO en el futuro
        return $query; // Por ahora retorna todas
    }

    public function scopePorNombre($query, $nombre)
    {
        return $query->where('INSTITUCION_NOMBRE', 'like', "%{$nombre}%");
    }

    public function scopePorCiudad($query, $ciudad)
    {
        return $query->where('INSTITUCION_CIUDAD', 'like', "%{$ciudad}%");
    }

    public function scopePorEstado($query, $estado)
    {
        return $query->where('INSTITUCION_ESTADO', 'like', "%{$estado}%");
    }

    // Accessors
    public function getDireccionCompletaAttribute()
    {
        $direccion = $this->INSTITUCION_DIRECCION;
        
        if ($this->INSTITUCION_NUMERO_EXT) {
            $direccion .= ' #' . $this->INSTITUCION_NUMERO_EXT;
        }
        
        if ($this->INSTITUCION_NUMERO_INT) {
            $direccion .= ' Int. ' . $this->INSTITUCION_NUMERO_INT;
        }
        
        if ($this->INSTITUCION_COLONIA) {
            $direccion .= ', ' . $this->INSTITUCION_COLONIA;
        }
        
        $direccion .= ', ' . $this->INSTITUCION_MUNICIPIO;
        $direccion .= ', ' . $this->INSTITUCION_CIUDAD;
        $direccion .= ', ' . $this->INSTITUCION_ESTADO;
        
        if ($this->INSTITUCION_CODIGO_POSTAL) {
            $direccion .= ' C.P. ' . $this->INSTITUCION_CODIGO_POSTAL;
        }
        
        return $direccion;
    }

    public function getInicialesAttribute()
    {
        $palabras = explode(' ', $this->INSTITUCION_NOMBRE);
        $iniciales = '';
        
        foreach (array_slice($palabras, 0, 2) as $palabra) {
            $iniciales .= strtoupper(substr($palabra, 0, 1));
        }
        
        return $iniciales ?: strtoupper(substr($this->INSTITUCION_NOMBRE, 0, 2));
    }

    public function getUsuariosCountAttribute()
    {
        return $this->usuarios()->count();
    }

    public function getUsuariosActivosCountAttribute()
    {
        return $this->usuarios()->where('USUARIO_ESTADO', Usuario::ESTADO_ACTIVO)->count();
    }

    // Métodos auxiliares
    public static function getEstadosMexico()
    {
        return [
            'Aguascalientes' => 'Aguascalientes',
            'Baja California' => 'Baja California',
            'Baja California Sur' => 'Baja California Sur',
            'Campeche' => 'Campeche',
            'Chiapas' => 'Chiapas',
            'Chihuahua' => 'Chihuahua',
            'Ciudad de México' => 'Ciudad de México',
            'Coahuila' => 'Coahuila',
            'Colima' => 'Colima',
            'Durango' => 'Durango',
            'Estado de México' => 'Estado de México',
            'Guanajuato' => 'Guanajuato',
            'Guerrero' => 'Guerrero',
            'Hidalgo' => 'Hidalgo',
            'Jalisco' => 'Jalisco',
            'Michoacán' => 'Michoacán',
            'Morelos' => 'Morelos',
            'Nayarit' => 'Nayarit',
            'Nuevo León' => 'Nuevo León',
            'Oaxaca' => 'Oaxaca',
            'Puebla' => 'Puebla',
            'Querétaro' => 'Querétaro',
            'Quintana Roo' => 'Quintana Roo',
            'San Luis Potosí' => 'San Luis Potosí',
            'Sinaloa' => 'Sinaloa',
            'Sonora' => 'Sonora',
            'Tabasco' => 'Tabasco',
            'Tamaulipas' => 'Tamaulipas',
            'Tlaxcala' => 'Tlaxcala',
            'Veracruz' => 'Veracruz',
            'Yucatán' => 'Yucatán',
            'Zacatecas' => 'Zacatecas',
        ];
    }

    public function formatearTelefono()
    {
        $telefono = preg_replace('/\D/', '', $this->INSTITUCION_TELEFONO);
        
        if (strlen($telefono) == 10) {
            return sprintf('(%s) %s-%s', 
                substr($telefono, 0, 2),
                substr($telefono, 2, 4),
                substr($telefono, 6, 4)
            );
        }
        
        return $this->INSTITUCION_TELEFONO;
    }

    public function validarRFC()
    {
        // Validación básica de RFC
        $rfc = strtoupper(trim($this->INSTITUCION_RFC));
        
        if (strlen($rfc) == 12) {
            // RFC de persona moral
            return preg_match('/^[A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}$/', $rfc);
        } elseif (strlen($rfc) == 13) {
            // RFC de persona física
            return preg_match('/^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/', $rfc);
        }
        
        return false;
    }

    // Boot method para generar PIN automáticamente
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($institucion) {
            if (empty($institucion->INSTITUCION_PIN)) {
                $institucion->INSTITUCION_PIN = static::generateUniquePin();
            }
        });
    }

    /**
     * Generar PIN único de 6 dígitos
     */
    public static function generateUniquePin()
    {
        do {
            $pin = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (static::where('INSTITUCION_PIN', $pin)->exists());
        
        return $pin;
    }
}