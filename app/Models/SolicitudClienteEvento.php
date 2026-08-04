<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Mail;
use App\Mail\SolicitudClienteNotificacion;

class SolicitudClienteEvento extends Model
{
    protected $table = 'solicitud_cliente_eventos';
    protected $primaryKey = 'ID';
    public $timestamps = false; // solo created_at, manejado manualmente

    protected $fillable = [
        'ID_SOLICITUD',
        'TIPO',
        'AUTOR_TIPO',
        'AUTOR_NOMBRE',
        'MENSAJE',
        'CAMBIOS',
        'created_at',
    ];

    protected $casts = [
        'CAMBIOS'    => 'array',
        'created_at' => 'datetime',
    ];

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(SolicitudCliente::class, 'ID_SOLICITUD', 'ID');
    }

    /**
     * Crea el evento y dispara el correo a ambas partes.
     * Este es el único punto de entrada que deben usar los controladores.
     */
    public static function registrar(SolicitudCliente $solicitud, array $datos): self
    {
        $evento = static::create([
            'ID_SOLICITUD' => $solicitud->ID,
            'TIPO'         => $datos['TIPO'],
            'AUTOR_TIPO'   => $datos['AUTOR_TIPO'],
            'AUTOR_NOMBRE' => $datos['AUTOR_NOMBRE'] ?? null,
            'MENSAJE'      => $datos['MENSAJE'] ?? null,
            'CAMBIOS'      => $datos['CAMBIOS'] ?? null,
            'created_at'   => now(),
        ]);

        static::notificar($solicitud, $evento);

        return $evento;
    }

    private const CC_FIJOS = [
        'soluciones@geneticlab.mx',
        'laboratorio@geneticlab.mx',
        'alicia.lopez@geneticlab.mx',
        'agendatucita@geneticlab.mx',
    ];

    private static function notificar(SolicitudCliente $solicitud, SolicitudClienteEvento $evento): void
    {
        $seguimiento = array_filter(array_map('trim', explode(',', (string) $solicitud->COPIA_SEGUIMIENTO)));
        $ccBase = array_unique(array_merge(self::CC_FIJOS, $seguimiento));

        // Correo al cliente (acceso externo que creó la solicitud)
        if ($solicitud->accesoCreador?->email) {
            $cc = array_diff($ccBase, [$solicitud->accesoCreador->email]);

            Mail::to($solicitud->accesoCreador->email)->cc($cc)->send(
                new SolicitudClienteNotificacion(
                    $solicitud,
                    $evento,
                    url('/reportes/solicitudes/' . $solicitud->ID)
                )
            );
        }

        // Correo interno (admin / notificación de laboratorio)
        $correoAdmin = config('mail.from.address');

        if ($correoAdmin) {
            $cc = array_diff($ccBase, [$correoAdmin]);

            Mail::to($correoAdmin)->cc($cc)->send(
                new SolicitudClienteNotificacion(
                    $solicitud,
                    $evento,
                    url('/solicitudes-cliente/' . $solicitud->ID)
                )
            );
        }
    }
}