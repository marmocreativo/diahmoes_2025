<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class ReporteLog extends Model
{
    protected $table = 'reporte_logs';

    protected $fillable = [
        'reporte_acceso_id',
        'user_id',
        'tipo_accion',
        'descripcion',
        'ip',
        'user_agent',
    ];

    /**
     * Usuario de acceso externo asociado.
     *
     * @return BelongsTo
     */
    public function reporteAcceso(): BelongsTo
    {
        return $this->belongsTo(ReporteAcceso::class, 'reporte_acceso_id');
    }

    /**
     * Usuario admin del sistema asociado.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Método estático para registrar una acción fácilmente desde cualquier controller.
     *
     * @param  Request  $request
     * @param  string   $tipoAccion  'login' | 'filtro' | 'exportacion'
     * @param  string|null $descripcion
     * @return self
     */
    public static function registrar(Request $request, string $tipoAccion, ?string $descripcion = null): self
    {
        $reporteAccesoId = $request->session()->get('reporte_acceso_id');
        $userId          = $request->session()->get('reporte_user_id'); // admin del sistema

        return self::create([
            'reporte_acceso_id' => $reporteAccesoId,
            'user_id'           => $userId,
            'tipo_accion'       => $tipoAccion,
            'descripcion'       => $descripcion,
            'ip'                => $request->ip(),
            'user_agent'        => $request->userAgent(),
        ]);
    }
}