<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EnvioCorreoPrv extends Model
{
    use HasFactory;

    protected $table = 'envios_correos_prv';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'ID_ESTUDIO',
        'ID_MEDICO',
        'ID_USUARIO_ENVIO',
        'NOMBRE_DESTINATARIO',
        'CORREO_DESTINATARIO',
        'TIPO_ENVIO',
        'MENSAJE_HTML',
        'ESTADO',
        'FECHA_ENVIO',
        'FECHA_LECTURA',
        'TOKEN_LECTURA',
    ];

    protected $casts = [
        'FECHA_ENVIO' => 'datetime',
        'FECHA_LECTURA' => 'datetime',
    ];

    const ESTADO_ENVIADO = 'enviado';
    const ESTADO_LEIDO = 'leido';

    const TIPO_ENLACE = 'enlace';
    const TIPO_ADJUNTO = 'adjunto';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($envioCorreo) {
            if (empty($envioCorreo->TOKEN_LECTURA)) {
                $envioCorreo->TOKEN_LECTURA = Str::random(64);
            }

            if (empty($envioCorreo->FECHA_ENVIO)) {
                $envioCorreo->FECHA_ENVIO = now();
            }

            if (empty($envioCorreo->ESTADO)) {
                $envioCorreo->ESTADO = self::ESTADO_ENVIADO;
            }
        });
    }

    public function estudio()
    {
        return $this->belongsTo(EstudioPrv::class, 'ID_ESTUDIO', 'ID');
    }

    public function medico()
    {
        return $this->belongsTo(Usuario::class, 'ID_MEDICO', 'ID_USUARIO');
    }

    public function usuarioEnvio()
    {
        return $this->belongsTo(Usuario::class, 'ID_USUARIO_ENVIO', 'ID_USUARIO');
    }

    public function marcarComoLeido()
    {
        $this->update([
            'ESTADO' => self::ESTADO_LEIDO,
            'FECHA_LECTURA' => now(),
        ]);
    }

    public function fueLeido()
    {
        return $this->ESTADO === self::ESTADO_LEIDO;
    }

    public function getUrlPixelAttribute()
    {
        return route('tracking.pixel', ['token' => $this->TOKEN_LECTURA]);
    }

    public function getTiempoTranscurridoAttribute()
    {
        if ($this->FECHA_ENVIO) {
            return $this->FECHA_ENVIO->diffForHumans();
        }
        return null;
    }

    // Scopes
    public function scopeEnviados($query)
    {
        return $query->where('ESTADO', self::ESTADO_ENVIADO);
    }

    public function scopeLeidos($query)
    {
        return $query->where('ESTADO', self::ESTADO_LEIDO);
    }

    public function scopePorEstudio($query, $idEstudio)
    {
        return $query->where('ID_ESTUDIO', $idEstudio);
    }

    public static function validarTokenLectura($token)
    {
        return self::where('TOKEN_LECTURA', $token)->first();
    }
}