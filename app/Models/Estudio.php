<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estudio extends Model
{
    use HasFactory;

    protected $table = 'estudios';
    protected $primaryKey = 'ID';
    
    // No hay timestamps automáticos, se manejan manualmente
    public $timestamps = false;

    protected $fillable = [
        'ID_ALEATORIO',
        'CLAVE_INTERNA',
        'CLAVE',
        'SERIADO',
        'ANIO',
        'FOLIO_MERCK',
        'ID_MEDICO',
        'ID_PACIENTE',
        'ID_INSTITUCION',
        'ID_CLIENTE',
        'BENEFICIARIO',
        'CORREO_COPIA',
        'MUESTRA_CLAVE',
        'MUESTRA_FOLIO_SOBRE',
        'MUESTRA_FOLIO_KIT_BL',
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
        'R_ESTUDIO_SOLICITADO',
        'R_METODO_PROCESO',
        'R_EVALUACION_HISTOPATOLOGICA',
        'R_PRESERVACION_H_E',
        'R_NUMERO_CELULAS_TUMORALES',
        'R_AREA_TUMORAL',
        'R_PORCENTAJE_TUMOR_TEJIDO',
        'R_ENRIQUECIMIENTO',
        'R_ADECUADO_PROCESAMIENTO',
        'R_RAZON_ADECUADO_PROCESAMIENTO',
        'R_ESTATUS_KRAS',
        'R_GENOTIPO_KRAS',
        'R_ESTATUS_NRAS',
        'R_GENOTIPO_NRAS',
        'R_ESTATUS_BRAF',
        'R_GENOTIPO_BRAF',
        'R_RESULTADO_HISTOPATOLOGICO',
        'R_INTERPRETACION',
        'R_COMPLETOS',
        'FECHA_SOLICITUD_RECOLECCION',
        'FECHA_RECOLECCION',
        'FECHA_RECEPCION',
        'FECHA_ENVIO_LABORATORIO',
        'FECHA_RECEPCION_LABORATORIO',
        'FECHA_ENTREGA_PROCESAMIENTO',
        'FECHA_OBTENCION_RESULTADOS',
        'FECHA_INFORME',
        'FECHA_RESULTADOS_CORREO',
        'FECHA_RETORNO_MATERIAL',
        'FECHA_RECEPCION_RESULTADOS_FISICOS',
        'FECHA_FIN_PROCESO',
        'ESTUDIO_FACTURADO',
        'ESTUDIO_NOTAS',
        'ESTUDIO_COMENTARIOS',
        'ESTUDIO_ESTADO'
    ];

    protected $casts = [
        'FECHA_SOLICITUD_RECOLECCION' => 'datetime',
        'FECHA_RECOLECCION' => 'datetime',
        'FECHA_RECEPCION' => 'datetime',
        'FECHA_ENVIO_LABORATORIO' => 'datetime',
        'FECHA_RECEPCION_LABORATORIO' => 'datetime',
        'FECHA_ENTREGA_PROCESAMIENTO' => 'datetime',
        'FECHA_OBTENCION_RESULTADOS' => 'datetime',
        'FECHA_INFORME' => 'datetime',
        'FECHA_RESULTADOS_CORREO' => 'datetime',
        'FECHA_RETORNO_MATERIAL' => 'datetime',
        'FECHA_RECEPCION_RESULTADOS_FISICOS' => 'datetime',
        'FECHA_FIN_PROCESO' => 'datetime',
    ];

    // Constantes para tipos de muestra
    const TIPO_MUESTRA_BIOPSIA = 'biopsia';
    const TIPO_MUESTRA_CITOLOGIA = 'citologia';
    const TIPO_MUESTRA_LIQUIDO = 'liquido';

    // Constantes para tipos de estudio
    const TIPO_ESTUDIO_KRAS = 'KRAS';
    const TIPO_ESTUDIO_NRAS = 'NRAS';
    const TIPO_ESTUDIO_BRAF = 'BRAF';
    const TIPO_ESTUDIO_PANEL = 'PANEL';


    // Constantes para estados del estudio - CORREGIDAS
    const ESTADO_PENDIENTE = 'Solicitud Recolección';
    const ESTADO_LABORATORIO_RECEPCION = 'Recepción Laboratorio';
    const ESTADO_LABORATORIO_COMPLETO = 'Resultados Completos';
    const ESTADO_COMPLETADO = 'Resultados Enviados';
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
     * Relación con el cliente
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'ID_CLIENTE', 'ID_CLIENTE');
    }

    /**
     * Relación con adjuntos
     */
    public function adjuntos(): HasMany
    {
        return $this->hasMany(Adjunto::class, 'MUESTRA_CLAVE', 'MUESTRA_CLAVE');
    }

    /**
     * Relación con correos de copia
     */
    public function correosCopia(): HasMany
    {
        return $this->hasMany(CorreoCopia::class, 'ID_ESTUDIO', 'ID');
    }

    // Scopes - ACTUALIZADOS
    public function scopePendientes($query)
    {
        return $query->where('ESTUDIO_ESTADO', self::ESTADO_PENDIENTE);
    }

    public function scopeEnProceso($query)
    {
        return $query->whereIn('ESTUDIO_ESTADO', [
            self::ESTADO_LABORATORIO_RECEPCION,
            self::ESTADO_LABORATORIO_COMPLETO
        ]);
    }

    public function scopeCompletados($query)
    {
        return $query->where('ESTUDIO_ESTADO', self::ESTADO_COMPLETADO);
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

    public function scopePorAnio($query, $anio)
    {
        return $query->where('ANIO', $anio);
    }

    public function scopePorInstitucion($query, $institucionId)
    {
        return $query->where('ID_INSTITUCION', $institucionId);
    }

    public function scopePorMedico($query, $medicoId)
    {
        return $query->where('ID_MEDICO', $medicoId);
    }

    public function scopeResultadosCompletos($query)
    {
        return $query->where('R_COMPLETOS', 'si');
    }

    public function scopeFacturados($query)
    {
        return $query->where('ESTUDIO_FACTURADO', 'si');
    }

    // Accessors
    public function getFolioCompletoAttribute()
    {
        return $this->CLAVE . '-' . $this->ANIO . '-' . str_pad($this->SERIADO, 3, '0', STR_PAD_LEFT);
    }

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

    // MÉTODO CORREGIDO
    public function getEstadoFormateadoAttribute()
    {
        switch ($this->ESTUDIO_ESTADO) {
            case self::ESTADO_PENDIENTE:
                return 'Solicitud Recolección';
            case self::ESTADO_LABORATORIO_RECEPCION:
                return 'Recepción Laboratorio';
            case self::ESTADO_LABORATORIO_COMPLETO:
                return 'Resultados Completos';
            case self::ESTADO_COMPLETADO:
                return 'Resultados Enviados';
            case self::ESTADO_RETORNO:
                return 'Retorno Material';
            case self::ESTADO_TERMINADO:
                return 'Terminado';
            case self::ESTADO_CANCELADO:
                return 'Cancelado';
            default:
                return $this->ESTUDIO_ESTADO ?: 'Sin estado';
        }
    }

    public function getDiasTranscurridosAttribute()
    {
        $fechaInicio = $this->FECHA_RECEPCION ?: $this->FECHA_SOLICITUD_RECOLECCION;
        if ($fechaInicio) {
            return now()->diffInDays($fechaInicio);
        }
        return null;
    }

    public function getPorcentajeAvanceAttribute()
    {
        $etapas = [
            'FECHA_SOLICITUD_RECOLECCION',
            'FECHA_RECOLECCION',
            'FECHA_RECEPCION',
            'FECHA_ENVIO_LABORATORIO',
            'FECHA_RECEPCION_LABORATORIO',
            'FECHA_ENTREGA_PROCESAMIENTO',
            'FECHA_OBTENCION_RESULTADOS',
            'FECHA_INFORME',
            'FECHA_FIN_PROCESO'
        ];

        $completadas = 0;
        foreach ($etapas as $etapa) {
            if ($this->$etapa && $this->$etapa != '0000-00-00 00:00:00') {
                $completadas++;
            }
        }

        return round(($completadas / count($etapas)) * 100);
    }

    public function getTieneResultadosAttribute()
    {
        return $this->R_COMPLETOS === 'si';
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

    // MÉTODO CORREGIDO
    public static function getEstados()
    {
        return [
            self::ESTADO_PENDIENTE => 'Solicitud Recolección',
            self::ESTADO_LABORATORIO_RECEPCION => 'Recepción Laboratorio',
            self::ESTADO_LABORATORIO_COMPLETO => 'Resultados Completos',
            self::ESTADO_COMPLETADO => 'Resultados Enviados',
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

    public function generarClaveInterna()
    {
        $año = date('Y');
        $mes = date('m');
        $ultimoSeriado = self::where('ANIO', $año)->max('SERIADO') ?: 0;
        $nuevoSeriado = $ultimoSeriado + 1;
        
        $this->ANIO = $año;
        $this->SERIADO = $nuevoSeriado;
        $this->CLAVE_INTERNA = $this->CLAVE . '-' . $año . '-' . str_pad($nuevoSeriado, 3, '0', STR_PAD_LEFT);
        
        return $this->CLAVE_INTERNA;
    }

    public function calcularTiempoPromedio($desde, $hasta)
    {
        if ($this->$desde && $this->$hasta) {
            return $this->$desde->diffInHours($this->$hasta);
        }
        return null;
    }

    public function esEstudioUrgente()
    {
        $diasTranscurridos = $this->dias_transcurridos;
        return $diasTranscurridos && $diasTranscurridos > 7;
    }

    // MÉTODO ACTUALIZADO
    public function puedeSerEditado()
    {
        return in_array($this->ESTUDIO_ESTADO, [
            self::ESTADO_PENDIENTE,
            self::ESTADO_LABORATORIO_RECEPCION,
            self::ESTADO_LABORATORIO_COMPLETO
        ]);
    }

    // MÉTODO ACTUALIZADO
    public function puedeSerCancelado()
    {
        return !in_array($this->ESTUDIO_ESTADO, [
            self::ESTADO_COMPLETADO,
            self::ESTADO_TERMINADO
        ]);
    }

    // Boot method para generar valores automáticos
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($estudio) {
            if (empty($estudio->ID_ALEATORIO)) {
                $estudio->ID_ALEATORIO = uniqid();
            }
            
            if (empty($estudio->MUESTRA_CLAVE)) {
                $estudio->MUESTRA_CLAVE = null;
            }
            
            if (empty($estudio->FECHA_SOLICITUD_RECOLECCION)) {
                $estudio->FECHA_SOLICITUD_RECOLECCION = now();
            }
            
            if (empty($estudio->ESTUDIO_ESTADO)) {
                $estudio->ESTUDIO_ESTADO = self::ESTADO_PENDIENTE;
            }
            
            if (empty($estudio->R_COMPLETOS)) {
                $estudio->R_COMPLETOS = 'no';
            }
            
            if (empty($estudio->ESTUDIO_FACTURADO)) {
                $estudio->ESTUDIO_FACTURADO = 'no';
            }
        });
    }
    /**
     * Relación con envíos de correos
     */
    public function enviosCorreos()
    {
        return $this->hasMany(\App\Models\EnvioCorreo::class, 'ID_ESTUDIO', 'ID');
    }

    /**
     * Verificar si todos los correos del estudio fueron leídos
     */
    public function todosCorreosLeidos()
    {
        $totalEnvios = $this->enviosCorreos()->count();
        
        if ($totalEnvios === 0) {
            return null; // No hay envíos
        }
        
        $enviosLeidos = $this->enviosCorreos()->leidos()->count();
        
        return $totalEnvios === $enviosLeidos;
    }

    /**
     * Obtener estadísticas de correos del estudio
     */
    public function getEstadisticasCorreos()
    {
        $envios = $this->enviosCorreos();
        
        return [
            'total' => $envios->count(),
            'enviados' => $envios->enviados()->count(),
            'leidos' => $envios->leidos()->count(),
            'pendientes_lectura' => $envios->enviados()->count(),
            'porcentaje_lectura' => $envios->count() > 0 
                ? round(($envios->leidos()->count() / $envios->count()) * 100, 2) 
                : 0
        ];
    }

    /**
     * Obtener el último envío de correo
     */
    public function ultimoEnvioCorreo()
    {
        return $this->enviosCorreos()->latest('FECHA_ENVIO')->first();
    }

    /**
     * Relación con el usuario que envió el correo
     */
    public function usuarioEnvio()
    {
        return $this->belongsTo(\App\Models\Usuario::class, 'ID_USUARIO_ENVIO', 'ID_USUARIO');
    }
}