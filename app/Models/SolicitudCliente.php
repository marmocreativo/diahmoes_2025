<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudCliente extends Model
{
    protected $table = 'solicitudes_cliente';
    protected $primaryKey = 'ID';
    public $timestamps = true;

    protected $fillable = [
        'FOLIO_MERCK',
        'TIPO_SOLICITUD',
        'CANTIDAD',
        'ID_MEDICO',
        'MEDICO_NOMBRE_LIBRE',
        'ID_INSTITUCION',
        'INSTITUCION_NOMBRE_LIBRE',
        'SOLICITA',
        'PREGUNTAR_POR',
        'TELEFONO',
        'CELULAR',
        'PROGRAMAR_PARA',
        'HORARIO',
        'DIRIGIRSE_A',
        'MUESTRA_CALLE',
        'MUESTRA_NUMERO_EXT',
        'MUESTRA_NUMERO_INT',
        'MUESTRA_COLONIA',
        'MUESTRA_MUNICIPIO',
        'MUESTRA_ESTADO',
        'MUESTRA_CODIGO_POSTAL',
        'EMAIL_GUIA',
        'EMAIL_RESULTADOS',
        'KAM',
        'PAL',
        'ESTADO',
        'ESTUDIOS_GENERADOS',
        'CREADO_POR_ACCESO_ID',
        'NOTAS',
    ];

    protected $casts = [
        'ESTUDIOS_GENERADOS' => 'array',
        'PROGRAMAR_PARA'     => 'date',
    ];

    // Relación con médico (usuario)
    public function medico(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'ID_MEDICO', 'ID_USUARIO');
    }

    // Relación con institución
    public function institucion(): BelongsTo
    {
        return $this->belongsTo(Institucion::class, 'ID_INSTITUCION', 'ID_INSTITUCION');
    }

    // Relación con el acceso externo que creó la solicitud
    public function accesoCreador(): BelongsTo
    {
        return $this->belongsTo(ReporteAcceso::class, 'CREADO_POR_ACCESO_ID', 'id');
    }

    // Helpers de estado
    public function isPendiente(): bool
    {
        return $this->ESTADO === 'pendiente';
    }

    public function isConfirmada(): bool
    {
        return $this->ESTADO === 'confirmada';
    }

    public function isConvertida(): bool
    {
        return $this->ESTADO === 'convertida';
    }

    // Nombre resuelto del médico (registro o texto libre)
    public function getNombreMedicoAttribute(): string
    {
        if ($this->medico) {
            return trim(($this->medico->PREFIJO ? $this->medico->PREFIJO . ' ' : '') .
                $this->medico->USUARIO_NOMBRE . ' ' .
                $this->medico->USUARIO_APELLIDOS);
        }
        return $this->MEDICO_NOMBRE_LIBRE ?? '—';
    }

    // Nombre resuelto de la institución
    public function getNombreInstitucionAttribute(): string
    {
        if ($this->institucion) {
            return $this->institucion->INSTITUCION_NOMBRE;
        }
        return $this->INSTITUCION_NOMBRE_LIBRE ?? '—';
    }
}