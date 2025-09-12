<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EnvioCorreo extends Model
{
    use HasFactory;

    protected $table = 'envios_correos';
    protected $primaryKey = 'id';
    public $timestamps = true; // Usar timestamps estándar de Laravel

    protected $fillable = [
        'ID_ESTUDIO',
        'ID_MEDICO',
        'ID_USUARIO_ENVIO', // Solo añadir si existe en tu tabla
        'NOMBRE_DESTINATARIO',
        'CORREO_DESTINATARIO',
        'TIPO_ENVIO',
        'MENSAJE_HTML',
        'ESTADO',
        'FECHA_ENVIO',
        'FECHA_LECTURA',
        'TOKEN_LECTURA'
    ];

    protected $casts = [
        'FECHA_ENVIO' => 'datetime',
        'FECHA_LECTURA' => 'datetime'
    ];

    // Constantes para estados
    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_ENVIADO = 'enviado';
    const ESTADO_LEIDO = 'leido';
    const ESTADO_ERROR = 'error';

    // Constantes para tipos de envío
    const TIPO_ENLACE = 'enlace';
    const TIPO_ADJUNTO = 'adjunto';

    protected static function boot()
    {
        parent::boot();
        
        // Generar token único para tracking al crear el registro
        static::creating(function ($envioCorreo) {
            if (empty($envioCorreo->TOKEN_LECTURA)) {
                $envioCorreo->TOKEN_LECTURA = Str::random(64);
            }
            
            if (empty($envioCorreo->FECHA_ENVIO)) {
                $envioCorreo->FECHA_ENVIO = now();
            }

            if (empty($envioCorreo->ESTADO)) {
                $envioCorreo->ESTADO = self::ESTADO_PENDIENTE;
            }
        });
    }

    /**
     * Relación con la tabla estudios
     */
    public function estudio()
    {
        return $this->belongsTo(Estudio::class, 'ID_ESTUDIO', 'ID');
    }

    /**
     * Relación con la tabla usuarios (médicos)
     */
    public function medico()
    {
        return $this->belongsTo(Usuario::class, 'ID_MEDICO', 'ID_USUARIO');
    }

    /**
     * Relación con el usuario que envió el correo
     * Solo funciona si tienes el campo ID_USUARIO_ENVIO en tu tabla
     */
    public function usuarioEnvio()
    {
        return $this->belongsTo(Usuario::class, 'ID_USUARIO_ENVIO', 'ID_USUARIO');
    }

    /**
     * Marcar como leído
     */
    public function marcarComoLeido()
    {
        $this->update([
            'ESTADO' => self::ESTADO_LEIDO,
            'FECHA_LECTURA' => now()
        ]);
    }

    /**
     * Marcar como enviado exitosamente
     */
    public function marcarComoEnviado()
    {
        $this->update([
            'ESTADO' => self::ESTADO_ENVIADO,
            'FECHA_ENVIO' => now()
        ]);
    }

    /**
     * Verificar si el correo fue leído
     */
    public function fueLeido()
    {
        return $this->ESTADO === self::ESTADO_LEIDO;
    }

    /**
     * Verificar si el correo fue enviado exitosamente
     */
    public function fueEnviado()
    {
        return $this->ESTADO === self::ESTADO_ENVIADO;
    }

    /**
     * Generar URL del pixel de seguimiento
     */
    public function getUrlPixelAttribute()
    {
        return route('tracking.pixel', ['token' => $this->TOKEN_LECTURA]);
    }

    /**
     * Generar URL pública del PDF del estudio
     */
    public function getUrlPdfPublicoAttribute()
    {
        if ($this->estudio) {
            return route('estudios.pdf.public', [
                'id' => $this->estudio->ID,
                'aleatorio' => $this->estudio->ID_ALEATORIO
            ]);
        }
        return null;
    }

    /**
     * Obtener el tiempo transcurrido desde el envío
     */
    public function getTiempoTranscurridoAttribute()
    {
        if ($this->FECHA_ENVIO) {
            return $this->FECHA_ENVIO->diffForHumans();
        }
        return null;
    }

    /**
     * Obtener el tiempo entre envío y lectura
     */
    public function getTiempoRespuestaAttribute()
    {
        if ($this->FECHA_ENVIO && $this->FECHA_LECTURA) {
            return $this->FECHA_ENVIO->diffInMinutes($this->FECHA_LECTURA);
        }
        return null;
    }

    // Scopes

    /**
     * Scope para obtener solo correos enviados
     */
    public function scopeEnviados($query)
    {
        return $query->where('ESTADO', self::ESTADO_ENVIADO);
    }

    /**
     * Scope para obtener solo correos leídos
     */
    public function scopeLeidos($query)
    {
        return $query->where('ESTADO', self::ESTADO_LEIDO);
    }

    /**
     * Scope para filtrar por estudio
     */
    public function scopePorEstudio($query, $idEstudio)
    {
        return $query->where('ID_ESTUDIO', $idEstudio);
    }

    /**
     * Scope para filtrar por médico
     */
    public function scopePorMedico($query, $idMedico)
    {
        return $query->where('ID_MEDICO', $idMedico);
    }

    /**
     * Scope para filtrar por usuario que envió
     * Solo funciona si tienes el campo ID_USUARIO_ENVIO
     */
    public function scopePorUsuarioEnvio($query, $idUsuario)
    {
        return $query->where('ID_USUARIO_ENVIO', $idUsuario);
    }

    /**
     * Scope para filtrar por tipo de envío
     */
    public function scopePorTipoEnvio($query, $tipo)
    {
        return $query->where('TIPO_ENVIO', $tipo);
    }

    /**
     * Validar si el token de lectura es válido
     */
    public static function validarTokenLectura($token)
    {
        return self::where('TOKEN_LECTURA', $token)->first();
    }

    /**
     * Obtener estadísticas básicas
     */
    public static function obtenerEstadisticas($filtros = [])
    {
        $query = self::query();

        if (isset($filtros['fecha_inicio'])) {
            $query->where('FECHA_ENVIO', '>=', $filtros['fecha_inicio']);
        }
        
        if (isset($filtros['fecha_fin'])) {
            $query->where('FECHA_ENVIO', '<=', $filtros['fecha_fin']);
        }

        if (isset($filtros['id_medico'])) {
            $query->where('ID_MEDICO', $filtros['id_medico']);
        }

        $total = $query->count();
        $enviados = $query->enviados()->count();
        $leidos = $query->leidos()->count();

        return [
            'total' => $total,
            'enviados' => $enviados,
            'leidos' => $leidos,
            'porcentaje_envio' => $total > 0 ? round(($enviados / $total) * 100, 2) : 0,
            'porcentaje_lectura' => $enviados > 0 ? round(($leidos / $enviados) * 100, 2) : 0
        ];
    }
}