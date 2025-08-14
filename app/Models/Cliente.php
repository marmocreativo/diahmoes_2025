<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Hash;

class Cliente extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'clientes';

    /**
     * Clave primaria de la tabla
     */
    protected $primaryKey = 'ID_CLIENTE';

    /**
     * Indica si el modelo debe manejar timestamps automáticamente
     */
    public $timestamps = false;

    /**
     * Los atributos que son asignables en masa
     */
    protected $fillable = [
        'CLIENTE_NOMBRE',
        'CLIENTE_CORREO', 
        'CLIENTE_PASS',
        'CLIENTE_ENVIAR_CORREO'
    ];

    /**
     * Los atributos que deben ocultarse para la serialización
     */
    protected $hidden = [
        'CLIENTE_PASS',
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'CLIENTE_ENVIAR_CORREO' => 'string'
    ];

    /**
     * Accessors
     */
    public function getNombreAttribute()
    {
        return $this->CLIENTE_NOMBRE;
    }

    public function getCorreoAttribute()
    {
        return $this->CLIENTE_CORREO;
    }

    public function getEnviarCorreoAttribute()
    {
        return $this->CLIENTE_ENVIAR_CORREO;
    }

    public function getEnviarCorreoBooleanAttribute()
    {
        return $this->CLIENTE_ENVIAR_CORREO === 'si';
    }

    public function getEnviarCorreoTextAttribute()
    {
        return $this->CLIENTE_ENVIAR_CORREO === 'si' ? 'Sí' : 'No';
    }

    /**
     * Mutators
     */
    public function setClientePassAttribute($value)
    {
        if ($value) {
            $this->attributes['CLIENTE_PASS'] = Hash::make($value);
        }
    }

    public function setClienteCorreoAttribute($value)
    {
        $this->attributes['CLIENTE_CORREO'] = strtolower(trim($value));
    }

    public function setClienteNombreAttribute($value)
    {
        $this->attributes['CLIENTE_NOMBRE'] = ucwords(strtolower(trim($value)));
    }

    /**
     * Scopes
     */
    public function scopeActivos($query)
    {
        return $query->where('CLIENTE_ENVIAR_CORREO', 'si');
    }

    public function scopeInactivos($query)
    {
        return $query->where('CLIENTE_ENVIAR_CORREO', 'no');
    }

    public function scopeBuscar($query, $termino)
    {
        if ($termino) {
            return $query->where(function ($q) use ($termino) {
                $q->where('CLIENTE_NOMBRE', 'LIKE', '%' . $termino . '%')
                  ->orWhere('CLIENTE_CORREO', 'LIKE', '%' . $termino . '%');
            });
        }
        return $query;
    }

    public function scopeFiltrarPorEnvioCorreo($query, $envio)
    {
        if ($envio && in_array($envio, ['si', 'no'])) {
            return $query->where('CLIENTE_ENVIAR_CORREO', $envio);
        }
        return $query;
    }

    /**
     * Relaciones
     */
    public function estudios(): HasMany
    {
        return $this->hasMany(Estudio::class, 'ID_CLIENTE', 'ID_CLIENTE');
    }

    /**
     * Métodos de utilidad
     */
    public function toggleEnvioCorreo()
    {
        $this->CLIENTE_ENVIAR_CORREO = $this->CLIENTE_ENVIAR_CORREO === 'si' ? 'no' : 'si';
        $this->save();
        return $this;
    }

    public function verificarPassword($password)
    {
        return Hash::check($password, $this->CLIENTE_PASS);
    }

    public function getTotalEstudios()
    {
        return $this->estudios()->count();
    }

    public function getEstudiosRecientes($limite = 5)
    {
        return $this->estudios()
            ->orderBy('FECHA_SOLICITUD_RECOLECCION', 'desc')
            ->limit($limite)
            ->get();
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        // Evento antes de crear
        static::creating(function ($cliente) {
            // Validar que el correo sea único
            if (self::where('CLIENTE_CORREO', $cliente->CLIENTE_CORREO)->exists()) {
                throw new \InvalidArgumentException('El correo electrónico ya está registrado.');
            }
        });

        // Evento antes de actualizar
        static::updating(function ($cliente) {
            // Validar que el correo sea único (excluyendo el actual)
            if (self::where('CLIENTE_CORREO', $cliente->CLIENTE_CORREO)
                    ->where('ID_CLIENTE', '!=', $cliente->ID_CLIENTE)
                    ->exists()) {
                throw new \InvalidArgumentException('El correo electrónico ya está registrado.');
            }
        });
    }

    /**
     * Métodos estáticos de utilidad
     */
    public static function obtenerParaSelect()
    {
        return self::select('ID_CLIENTE', 'CLIENTE_NOMBRE', 'CLIENTE_CORREO')
            ->orderBy('CLIENTE_NOMBRE')
            ->get()
            ->map(function ($cliente) {
                return [
                    'value' => $cliente->ID_CLIENTE,
                    'label' => $cliente->CLIENTE_NOMBRE,
                    'correo' => $cliente->CLIENTE_CORREO
                ];
            });
    }

    public static function buscarPorCorreo($correo)
    {
        return self::where('CLIENTE_CORREO', strtolower(trim($correo)))->first();
    }

    public static function contarTotal()
    {
        return self::count();
    }

    public static function contarActivos()
    {
        return self::activos()->count();
    }

    public static function contarInactivos()
    {
        return self::inactivos()->count();
    }

    /**
     * Serialización personalizada para JSON
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Agregar campos calculados
        $array['enviar_correo_boolean'] = $this->enviar_correo_boolean;
        $array['enviar_correo_text'] = $this->enviar_correo_text;
        $array['total_estudios'] = $this->total_estudios;
        
        // Remover campos sensibles
        unset($array['CLIENTE_PASS']);
        
        return $array;
    }
}