<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EstudioPrv extends Model
{
    use HasFactory;

    protected $table = 'estudios_prv';
    protected $primaryKey = 'ID';

    // No hay timestamps automáticos, se manejan manualmente (igual que Estudio)
    public $timestamps = false;

    protected $fillable = [
        'CLAVE_INTERNA',
        'CLAVE',
        'SERIADO',
        'ANIO',
        'FOLIO_MERCK',
        'ID_MEDICO',
        'ID_PACIENTE',
        'ID_INSTITUCION',
        'MUESTRA_CLAVE',
        'MUESTRA_FOLIO_SOBRE',
        'MUESTRA_FOLIO_KIT_BL',
        'MUESTRA_FOLIO_KIT_BL_CADUCIDAD',
        'MUESTRA_COLON',
        'MUESTRA_OTROS_ROTULOS',
        'MUESTRA_TIPO',
        'MUESTRA_SITIO_LESION',
        'MUESTRA_TIPO_ESTUDIO',
        'MUESTRA_INICIALES',
        'MUESTRA_GENERO',
        'MUESTRA_EDAD',
        'MUESTRA_BLOQUES',
        'MUESTRA_LAMINILLAS',
        'MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA',
        'MUESTRA_ENVIO',
        'MUESTRA_ENVIO_TIPO',
        'MUESTRA_GUIA',
        'MUESTRA_GUIA_MENSAJERIA',
        'MUESTRA_GUIA_ESPECIALIZADA',
        'MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA',
        'MUESTRA_GUIA_RETORNO',
        'MUESTRA_GUIA_RETORNO_MENSAJERIA',
        'MUESTRA_DIRECCION',
        'MUESTRA_NUMERO_EXT',
        'MUESTRA_NUMERO_INT',
        'MUESTRA_COLONIA',
        'MUESTRA_MUNICIPIO',
        'MUESTRA_CIUDAD',
        'MUESTRA_ESTADO',
        'MUESTRA_CODIGO_POSTAL',
        'MUESTRA_REFERENCIAS',
        'MUESTRA_HORARIOS',
        'MUESTRA_DIAGNOSTICO_CLINICO',
        'MUESTRA_LIQ_CONDICION',
        'MUESTRA_LIQ_CONDICION_PRESENCIA',
        'MUESTRA_LIQ_CANTIDAD_ADECUADA',
        'MUESTRA_LIQ_CANTIDAD_ML',
        'MUESTRA_LIQ_HEMOLISIS',
        'MUESTRA_LIQ_AMP_INDICACION',
        'MUESTRA_LIQ_AMP_RAZON',
        'MUESTRA_LIQ_LIPEMICA',
        'FECHA_SOLICITUD_RECOLECCION',
        'FECHA_RECOLECCION',
        'FECHA_RECEPCION',
        'FECHA_RECEPCION_LABORATORIO',
        'FECHA_OBTENCION_RESULTADOS',
        'FECHA_RESULTADOS_CORREO',
        'ESTUDIO_NOTAS',
        'ESTUDIO_ESTADO',
    ];

    protected $casts = [
        'FECHA_SOLICITUD_RECOLECCION' => 'datetime',
        'FECHA_RECOLECCION' => 'datetime',
        'FECHA_RECEPCION' => 'datetime',
        'FECHA_RECEPCION_LABORATORIO' => 'datetime',
        'FECHA_OBTENCION_RESULTADOS' => 'datetime',
        'FECHA_RESULTADOS_CORREO' => 'datetime',
        'MUESTRA_FOLIO_KIT_BL_CADUCIDAD' => 'date',
    ];

    // Prefijo fijo del folio en este sistema
    const CLAVE_PRV = 'PRV';

    // Constantes para tipos de muestra
    const TIPO_MUESTRA_BIOPSIA = 'biopsia';
    const TIPO_MUESTRA_CITOLOGIA = 'citologia';
    const TIPO_MUESTRA_LIQUIDO = 'liquido';

    // Constantes para tipos de estudio (mismo catálogo que Estudio)
    const TIPO_ESTUDIO_KRAS = 'KRAS';
    const TIPO_ESTUDIO_NRAS = 'NRAS';
    const TIPO_ESTUDIO_BRAF = 'BRAF';
    const TIPO_ESTUDIO_PANEL = 'PANEL';

    // Constantes para estados del estudio.
    // NOTA: como esta tabla no tiene columnas de Resultados, dejo fuera los
    // estados que dependían de R_COMPLETOS ("Resultados Completos" /
    // "Resultados Enviados"). Si necesitas ese flujo aquí también, lo
    // ajustamos cuando definamos qué reemplaza a los campos R_ en PRV.
    const ESTADO_PENDIENTE = 'Solicitud Recolección';
    const ESTADO_LABORATORIO_RECEPCION = 'Recepción Laboratorio';
    const ESTADO_RETORNO = 'Retorno Material';
    const ESTADO_TERMINADO = 'Terminado';
    const ESTADO_CANCELADO = 'Cancelado';

    // Constantes para género
    const GENERO_MASCULINO = 'Masculino';
    const GENERO_FEMENINO = 'Femenino';

    // Constantes para envío
    const ENVIO_APLICA = 'aplica';
    const ENVIO_NO_APLICA = 'no_aplica';

    // Constantes para tipo de envío
    const ENVIO_TIPO_LOCAL = 'Local';
    const ENVIO_TIPO_FORANEO = 'Foráneo';

    /**
     * Relación con el médico (usuario)
     */
    public function medico(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'ID_MEDICO', 'ID_USUARIO');
    }

    /**
     * Relación con el paciente (usuario)
     */
    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'ID_PACIENTE', 'ID_USUARIO');
    }

    /**
     * Relación con la institución
     */
    public function institucion(): BelongsTo
    {
        return $this->belongsTo(Institucion::class, 'ID_INSTITUCION', 'ID_INSTITUCION');
    }

        /**
     * Relación con correos de copia
     */
    public function correosCopia()
    {
        return $this->hasMany(CorreoCopiaPrv::class, 'ID_ESTUDIO', 'ID');
    }

    /**
     * Relación con envíos de correos
     */
    public function enviosCorreos()
    {
        return $this->hasMany(EnvioCorreoPrv::class, 'ID_ESTUDIO', 'ID');
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('ESTUDIO_ESTADO', self::ESTADO_PENDIENTE);
    }

    public function scopeTerminados($query)
    {
        return $query->where('ESTUDIO_ESTADO', self::ESTADO_TERMINADO);
    }

    public function scopeConRetorno($query)
    {
        return $query->where('ESTUDIO_ESTADO', self::ESTADO_RETORNO);
    }

    public function scopePorTipoEstudio($query, $tipo)
    {
        return $query->where('MUESTRA_TIPO_ESTUDIO', $tipo);
    }

    public function scopePorInstitucion($query, $institucionId)
    {
        return $query->where('ID_INSTITUCION', $institucionId);
    }

    public function scopePorMedico($query, $medicoId)
    {
        return $query->where('ID_MEDICO', $medicoId);
    }

    // Accessors
    public function getPacienteNombreAttribute()
    {
        return $this->MUESTRA_INICIALES ?: ($this->paciente ? $this->paciente->nombre_completo : 'N/A');
    }

    public function getEdadFormateadaAttribute()
    {
        if ($this->MUESTRA_EDAD) {
            return $this->MUESTRA_EDAD . ' años';
        }
        return 'No especificada';
    }

    public function getGeneroFormateadoAttribute()
    {
        switch ($this->MUESTRA_GENERO) {
            case self::GENERO_MASCULINO:
                return 'Masculino';
            case self::GENERO_FEMENINO:
                return 'Femenino';
            default:
                return 'No especificado';
        }
    }

    public function getEstadoFormateadoAttribute()
    {
        return $this->ESTUDIO_ESTADO ?: 'Sin estado';
    }

    public function getDiasTranscurridosAttribute()
    {
        $fechaInicio = $this->FECHA_RECEPCION ?: $this->FECHA_SOLICITUD_RECOLECCION;
        if ($fechaInicio) {
            return now()->diffInDays($fechaInicio);
        }
        return null;
    }

    public function getRequiereEnvioAttribute()
    {
        return $this->MUESTRA_ENVIO === self::ENVIO_APLICA;
    }

    // Métodos auxiliares
    public static function getTiposMuestra()
    {
        return [
            self::TIPO_MUESTRA_BIOPSIA => 'Biopsia',
            self::TIPO_MUESTRA_CITOLOGIA => 'Citología',
            self::TIPO_MUESTRA_LIQUIDO => 'Líquido',
        ];
    }

    public static function getTiposEstudio()
    {
        return [
            self::TIPO_ESTUDIO_KRAS => 'KRAS',
            self::TIPO_ESTUDIO_NRAS => 'NRAS',
            self::TIPO_ESTUDIO_BRAF => 'BRAF',
            self::TIPO_ESTUDIO_PANEL => 'Panel Completo',
        ];
    }

    public static function getEstados()
    {
        return [
            self::ESTADO_PENDIENTE => 'Solicitud Recolección',
            self::ESTADO_LABORATORIO_RECEPCION => 'Recepción Laboratorio',
            self::ESTADO_RETORNO => 'Retorno Material',
            self::ESTADO_TERMINADO => 'Terminado',
            self::ESTADO_CANCELADO => 'Cancelado',
        ];
    }

    public static function getGeneros()
    {
        return [
            self::GENERO_MASCULINO => 'Masculino',
            self::GENERO_FEMENINO => 'Femenino',
        ];
    }

    public static function getTiposEnvio()
    {
        return [
            self::ENVIO_TIPO_LOCAL => 'Local',
            self::ENVIO_TIPO_FORANEO => 'Foráneo',
        ];
    }

    /**
     * Genera el folio diario con formato PRV-DD-MM-SERIADO (ej. PRV-09-08-01).
     * El SERIADO se reinicia cada día: busca el último usado ESE día
     * (comparando el prefijo dentro de CLAVE_INTERNA, ya que la tabla no
     * tiene timestamps automáticos) y le suma 1.
     */
    public function generarClaveInterna(): string
    {
        $dia = date('d');
        $mes = date('m');
        $prefijo = self::CLAVE_PRV . '-' . $dia . '-' . $mes . '-';

        $ultimoSeriado = self::where('CLAVE_INTERNA', 'like', $prefijo . '%')
            ->max('SERIADO') ?: 0;

        $nuevoSeriado = $ultimoSeriado + 1;

        $this->CLAVE = self::CLAVE_PRV;
        $this->ANIO = date('Y');
        $this->SERIADO = $nuevoSeriado;
        $this->CLAVE_INTERNA = $prefijo . str_pad($nuevoSeriado, 2, '0', STR_PAD_LEFT);

        return $this->CLAVE_INTERNA;
    }

    public function esEstudioUrgente(): bool
    {
        $diasTranscurridos = $this->dias_transcurridos;
        return $diasTranscurridos && $diasTranscurridos > 7;
    }

    public function puedeSerEditado(): bool
    {
        return in_array($this->ESTUDIO_ESTADO, [
            self::ESTADO_PENDIENTE,
            self::ESTADO_LABORATORIO_RECEPCION,
        ]);
    }

    public function puedeSerCancelado(): bool
    {
        return !in_array($this->ESTUDIO_ESTADO, [
            self::ESTADO_TERMINADO,
        ]);
    }

    // Boot method para generar valores automáticos
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($estudio) {
            if (empty($estudio->MUESTRA_CLAVE)) {
                $estudio->MUESTRA_CLAVE = null;
            }

            if (empty($estudio->ESTUDIO_ESTADO)) {
                $estudio->ESTUDIO_ESTADO = self::ESTADO_PENDIENTE;
            }

            if (empty($estudio->CLAVE_INTERNA)) {
                $estudio->generarClaveInterna();
            }
        });
    }
}