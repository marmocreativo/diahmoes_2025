<?php

namespace App\Http\Controllers;

use App\Models\Estudio;
use App\Models\Institucion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Obtener parámetros de filtro
        $fechaDesde = $request->get('fecha_desde', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $fechaHasta = $request->get('fecha_hasta', Carbon::now()->format('Y-m-d'));
        $muestraEstado = $request->get('muestra_estado');
        $tipoEstudio = $request->get('tipo_estudio');
        $prefijo = $request->get('prefijo');
        
        // Datos para los filtros
        $filtros = $this->getFiltros();
        
        // Datos principales del dashboard
        $datos = [
            'metricas_principales' => $this->getMetricasPrincipales($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'graficas_pie' => $this->getGraficasPie($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'top_instituciones' => $this->getTopInstituciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'todas_instituciones' => $this->getTodasInstituciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'top_estados' => $this->getTopEstados($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'todos_estados' => $this->getTodosEstados($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'tendencia_5_anios' => $this->getEstudiosUltimos5Anios($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'comparativa_tipos' => $this->getComparativaTiposEstudio($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'comparativa_mutacion' => $this->getComparativaMutacion($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'comparacion_3_periodos' => $this->getComparacion3Periodos($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'predicciones' => $this->getPredicciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
            'estudios_faltantes' => $this->getEstudiosFaltantes($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo) // NUEVA LÍNEA
        ];
        
        return Inertia::render('dashboard', [
            'filtros' => $filtros,
            'datos' => $datos,
            'filtrosActivos' => [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
                'muestra_estado' => $muestraEstado,
                'tipo_estudio' => $tipoEstudio,
                'prefijo' => $prefijo
            ]
        ]);
    }
    
    private function getFiltros()
    {
        return [
            'muestra_estados' => DB::table('estudios')
                ->select('MUESTRA_ESTADO')
                ->whereNotNull('MUESTRA_ESTADO')
                ->where('MUESTRA_ESTADO', '!=', '')
                ->distinct()
                ->orderBy('MUESTRA_ESTADO')
                ->pluck('MUESTRA_ESTADO'),
            'tipos_estudio' => DB::table('estudios')
                ->select('MUESTRA_TIPO_ESTUDIO')
                ->whereNotNull('MUESTRA_TIPO_ESTUDIO')
                ->where('MUESTRA_TIPO_ESTUDIO', '!=', '')
                ->distinct()
                ->orderBy('MUESTRA_TIPO_ESTUDIO')
                ->pluck('MUESTRA_TIPO_ESTUDIO'),
            'prefijos' => DB::table('estudios')
                ->select('CLAVE')
                ->whereNotNull('CLAVE')
                ->where('CLAVE', '!=', '')
                ->distinct()
                ->orderBy('CLAVE')
                ->pluck('CLAVE')
        ];
    }
    
    private function getQueryBase($fechaDesde, $fechaHasta, $muestraEstado = null, $tipoEstudio = null, $prefijo = null)
    {
        $query = DB::table('estudios')
            ->whereBetween('FECHA_RECEPCION', [$fechaDesde . ' 00:00:00', $fechaHasta . ' 23:59:59'])
            ->whereNotNull('FECHA_RECEPCION')
            ->where('FECHA_RECEPCION', '>', '1000-01-01 00:00:00');
            
        if ($muestraEstado) {
            $query->where('MUESTRA_ESTADO', $muestraEstado);
        }
        
        if ($tipoEstudio) {
            $query->where('MUESTRA_TIPO_ESTUDIO', $tipoEstudio);
        }
        
        if ($prefijo) {
            $query->where('CLAVE', $prefijo);
        }
        
        return $query;
    }
    
    private function getMetricasPrincipales($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        // Total de estudios en el periodo
        $totalEstudios = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->count();
        
        // Estudios pendientes (cualquier estado que no sea "Resultados Enviados")
        $estudiosQuery = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo);
        $pendientes = clone $estudiosQuery;
        $pendientes = $pendientes
            ->where(function($query) {
                $query->where('ESTUDIO_ESTADO', '!=', 'Resultados Enviados')
                      ->orWhereNull('ESTUDIO_ESTADO')
                      ->orWhere('ESTUDIO_ESTADO', '');
            })
            ->count();
        
        return [
            'total_estudios' => $totalEstudios,
            'pendientes' => $pendientes,
            'completados' => $totalEstudios - $pendientes
        ];
    }
    
    private function getGraficasPie($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        // Solo MUESTRA_TIPO_ESTUDIO - INCLUIR VALORES VACÍOS
        $muestraTipoEstudio = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->select('MUESTRA_TIPO_ESTUDIO', DB::raw('COUNT(*) as total'))
            ->groupBy('MUESTRA_TIPO_ESTUDIO')
            ->orderByDesc('total')
            ->get()
            ->map(function($item) {
                return [
                    'name' => empty($item->MUESTRA_TIPO_ESTUDIO) ? 'N/D' : $item->MUESTRA_TIPO_ESTUDIO,
                    'value' => $item->total
                ];
            });
        
        // Agrupar elementos con menos del 10%
        $muestraTipoEstudio = $this->agruparPorcentajesBajos($muestraTipoEstudio);
        
        return [
            'tipo_estudio' => $muestraTipoEstudio
        ];
    }
    
    private function getTopInstituciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->join('instituciones', 'estudios.ID_INSTITUCION', '=', 'instituciones.ID_INSTITUCION')
            ->select('instituciones.INSTITUCION_NOMBRE as nombre', DB::raw('COUNT(*) as total'))
            ->groupBy('estudios.ID_INSTITUCION', 'instituciones.INSTITUCION_NOMBRE')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->nombre,
                    'value' => $item->total
                ];
            });
    }
    
    private function getTodasInstituciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->join('instituciones', 'estudios.ID_INSTITUCION', '=', 'instituciones.ID_INSTITUCION')
            ->select('instituciones.INSTITUCION_NOMBRE as nombre', DB::raw('COUNT(*) as total'))
            ->groupBy('estudios.ID_INSTITUCION', 'instituciones.INSTITUCION_NOMBRE')
            ->orderByDesc('total')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->nombre,
                    'value' => $item->total
                ];
            });
    }
    
    private function getTopEstados($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->select('MUESTRA_ESTADO as estado', DB::raw('COUNT(*) as total'))
            ->whereNotNull('MUESTRA_ESTADO')
            ->where('MUESTRA_ESTADO', '!=', '')
            ->groupBy('MUESTRA_ESTADO')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->estado,
                    'value' => $item->total
                ];
            });
    }
    
    private function getTodosEstados($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
        ->select('MUESTRA_ESTADO as estado', DB::raw('COUNT(*) as total'))
        ->whereNotNull('MUESTRA_ESTADO')
        ->where('MUESTRA_ESTADO', '!=', '')
        ->groupBy('MUESTRA_ESTADO')
        ->orderByDesc('total')
        ->get()
        ->map(function($item) {
            return [
                'name' => $item->estado,
                'value' => $item->total
            ];
        });
    }
    
    private function getComparativaTiposEstudio($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        $fechaInicioHistorico = Carbon::parse($fechaDesde)->subYears(5);
        
        $query = DB::table('estudios')
            ->select(
                DB::raw('YEAR(FECHA_RECEPCION) as anio'),
                DB::raw('MONTH(FECHA_RECEPCION) as mes'),
                'MUESTRA_TIPO_ESTUDIO',
                DB::raw('COUNT(*) as total')
            )
            ->where('FECHA_RECEPCION', '>=', $fechaInicioHistorico)
            ->whereNotNull('FECHA_RECEPCION')
            ->where('FECHA_RECEPCION', '>', '1000-01-01 00:00:00')
            ->whereNotNull('MUESTRA_TIPO_ESTUDIO');
            //->where('MUESTRA_TIPO_ESTUDIO', '!=', '');
        
        // Aplicar filtros condicionales
        if ($muestraEstado) {
            $query->where('ESTUDIO_ESTADO', $muestraEstado);
        }
        
        if ($tipoEstudio) {
            $query->where('MUESTRA_TIPO_ESTUDIO', $tipoEstudio);
        }
        
        if ($prefijo) {
            $query->where('CLAVE', $prefijo);
        }
        
        $datos = $query
            ->groupBy(DB::raw('YEAR(FECHA_RECEPCION)'), DB::raw('MONTH(FECHA_RECEPCION)'), 'MUESTRA_TIPO_ESTUDIO')
            ->orderBy(DB::raw('YEAR(FECHA_RECEPCION)'))
            ->orderBy(DB::raw('MONTH(FECHA_RECEPCION)'))
            ->get();
        
        // Agrupar por mes y organizar tipos de estudio
        $datosAgrupados = [];
        $tiposEstudio = [];
        
        foreach ($datos as $item) {
            $fecha = Carbon::createFromDate($item->anio, $item->mes, 1);
            $mesKey = $fecha->format('Y-m');
            $mesLabel = $fecha->format('M Y');
            
            if (!isset($datosAgrupados[$mesKey])) {
                $datosAgrupados[$mesKey] = [
                    'mes' => $mesLabel,
                    'fecha_completa' => $mesKey
                ];
            }
            
            $datosAgrupados[$mesKey][$item->MUESTRA_TIPO_ESTUDIO] = $item->total;
            $tiposEstudio[] = $item->MUESTRA_TIPO_ESTUDIO;
        }
        
        $tiposEstudio = array_unique($tiposEstudio);
        
        // Completar datos faltantes con 0
        foreach ($datosAgrupados as &$mes) {
            foreach ($tiposEstudio as $tipo) {
                if (!isset($mes[$tipo])) {
                    $mes[$tipo] = 0;
                }
            }
        }
        
        return [
            'datos' => array_values($datosAgrupados),
            'tipos_estudio' => array_values($tiposEstudio)
        ];
    }

    private function getComparativaMutacion($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        // Usar las fechas del período actual, no 5 años atrás
        $query = DB::table('estudios')
            ->select(
                'R_ESTATUS_KRAS',
                'R_ESTATUS_NRAS',
                'R_ESTATUS_BRAF',
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('FECHA_RECEPCION', [$fechaDesde . ' 00:00:00', $fechaHasta . ' 23:59:59'])
            ->whereNotNull('FECHA_RECEPCION')
            ->where('FECHA_RECEPCION', '>', '1000-01-01 00:00:00');
        
        // Aplicar filtros condicionales
        if ($muestraEstado) {
            $query->where('MUESTRA_ESTADO', $muestraEstado);
        }
        
        if ($tipoEstudio) {
            $query->where('MUESTRA_TIPO_ESTUDIO', $tipoEstudio);
        }
        
        if ($prefijo) {
            $query->where('CLAVE', $prefijo);
        }
        
        $datos = $query
            ->groupBy('R_ESTATUS_KRAS', 'R_ESTATUS_NRAS', 'R_ESTATUS_BRAF')
            ->get();
        
        // Clasificar y sumar totales
        $totales = [
            'mutado' => 0,
            'no_mutado' => 0,
            'invalido' => 0
        ];
        
        foreach ($datos as $item) {
            $estado = $this->clasificarMutacion($item->R_ESTATUS_KRAS, $item->R_ESTATUS_NRAS, $item->R_ESTATUS_BRAF);
            $totales[$estado] += $item->total;
        }
        
        return $totales;
    }

    private function clasificarMutacion($kras, $nras, $braf)
    {
        // Convertir a mayúsculas y limpiar espacios para comparación consistente
        $kras = trim(strtoupper($kras ?? ''));
        $nras = trim(strtoupper($nras ?? ''));
        $braf = trim(strtoupper($braf ?? ''));
        
        // Estados que indican mutación
        $estadosMutado = ['MUTADO', 'MUTADO (VER NOTAS)'];
        
        // Estados que indican no mutación
        $estadosNoMutado = ['NO MUTADO', 'NO MUTADO (VER NOTAS)'];
        
        // Estados inválidos/no procesables
        $estadosInvalidos = ['INVALIDO', 'NO APLICA', 'NO PROCESABLE', '', 'NULL'];
        
        // Verificar si alguna columna tiene mutación
        if (in_array($kras, $estadosMutado) || in_array($nras, $estadosMutado) || in_array($braf, $estadosMutado)) {
            return 'mutado';
        }
        
        // Verificar si alguna columna tiene no mutación (y ninguna tiene mutación)
        if (in_array($kras, $estadosNoMutado) || in_array($nras, $estadosNoMutado) || in_array($braf, $estadosNoMutado)) {
            return 'no_mutado';
        }
        
        // Si no hay mutación ni no mutación clara, es inválido
        return 'invalido';
    }
    
    private function getComparacion2Anios($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        $fecha2AniosAtras = Carbon::parse($fechaDesde)->subYears(2);
        $fechaHasta2AniosAtras = Carbon::parse($fechaHasta)->subYears(2);
        
        // Estudios del período actual
        $estudiosActuales = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->count();
        
        // Estudios de hace 2 años
        $estudios2AniosAtras = $this->getQueryBase(
            $fecha2AniosAtras->format('Y-m-d'), 
            $fechaHasta2AniosAtras->format('Y-m-d'), 
            $muestraEstado, 
            $tipoEstudio, 
            $prefijo
        )->count();
        
        // Calcular porcentaje de cambio
        $porcentajeCambio = 0;
        if ($estudios2AniosAtras > 0) {
            $porcentajeCambio = round((($estudiosActuales - $estudios2AniosAtras) / $estudios2AniosAtras) * 100, 1);
        }
        
        // Comparación por meses
        $comparacionMensual = $this->getComparacionMensual2Anios($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo);
        
        return [
            'actual' => $estudiosActuales,
            'hace_2_anios' => $estudios2AniosAtras,
            'porcentaje_cambio' => $porcentajeCambio,
            'comparacion_mensual' => $comparacionMensual
        ];
    }
    
    private function getComparacionMensual2Anios($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        $fechaInicio = Carbon::parse($fechaDesde);
        $fechaFin = Carbon::parse($fechaHasta);
        
        $mesesComparacion = [];
        
        $fechaActual = $fechaInicio->copy();
        while ($fechaActual->lte($fechaFin)) {
            $inicioMes = $fechaActual->copy()->startOfMonth();
            $finMes = $fechaActual->copy()->endOfMonth();
            
            // Si el mes se extiende fuera del rango, ajustar
            if ($inicioMes->lt($fechaInicio)) $inicioMes = $fechaInicio->copy();
            if ($finMes->gt($fechaFin)) $finMes = $fechaFin->copy();
            
            // Estudios del mes actual
            $estudiosActual = $this->getQueryBase(
                $inicioMes->format('Y-m-d'), 
                $finMes->format('Y-m-d'), 
                $muestraEstado, 
                $tipoEstudio, 
                $prefijo
            )->count();
            
            // Estudios del mismo mes hace 2 años
            $inicioMes2Anios = $inicioMes->copy()->subYears(2);
            $finMes2Anios = $finMes->copy()->subYears(2);
            
            $estudios2Anios = $this->getQueryBase(
                $inicioMes2Anios->format('Y-m-d'), 
                $finMes2Anios->format('Y-m-d'), 
                $muestraEstado, 
                $tipoEstudio, 
                $prefijo
            )->count();
            
            $mesesComparacion[] = [
                'mes' => $fechaActual->format('M Y'),
                'estudios_actual' => $estudiosActual,
                'estudios_2_anios' => $estudios2Anios
            ];
            
            $fechaActual->addMonth();
        }
        
        return $mesesComparacion;
    }

    private function getComparacion3Periodos($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        $fecha1AnioAtras = Carbon::parse($fechaDesde)->subYear();
        $fechaHasta1AnioAtras = Carbon::parse($fechaHasta)->subYear();
        
        $fecha2AniosAtras = Carbon::parse($fechaDesde)->subYears(2);
        $fechaHasta2AniosAtras = Carbon::parse($fechaHasta)->subYears(2);
        
        // Estudios actuales
        $estudiosActuales = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)->count();
        
        // Hace 1 año
        $estudios1Anio = $this->getQueryBase($fecha1AnioAtras->format('Y-m-d'), $fechaHasta1AnioAtras->format('Y-m-d'), $muestraEstado, $tipoEstudio, $prefijo)->count();
        
        // Hace 2 años
        $estudios2Anios = $this->getQueryBase($fecha2AniosAtras->format('Y-m-d'), $fechaHasta2AniosAtras->format('Y-m-d'), $muestraEstado, $tipoEstudio, $prefijo)->count();
        
        // Comparación mensual
        $comparacionMensual = $this->getComparacionMensual3Periodos($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo);
        
        return [
            'actual' => $estudiosActuales,
            'hace_1_anio' => $estudios1Anio,
            'hace_2_anios' => $estudios2Anios,
            'cambio_1_anio' => $estudios1Anio > 0 ? round((($estudiosActuales - $estudios1Anio) / $estudios1Anio) * 100, 1) : 0,
            'cambio_2_anios' => $estudios2Anios > 0 ? round((($estudiosActuales - $estudios2Anios) / $estudios2Anios) * 100, 1) : 0,
            'comparacion_mensual' => $comparacionMensual
        ];
    }
    
    private function getPredicciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        // Obtener el mes siguiente basado en la fecha actual
        $mesActual = Carbon::now();
        $mesSiguiente = $mesActual->copy()->addMonth();
        
        // Obtener datos históricos para el mismo mes en años anteriores
        $datosHistoricosMes = DB::table('estudios')
            ->select(DB::raw('YEAR(FECHA_RECEPCION) as anio'), DB::raw('COUNT(*) as total'))
            ->whereMonth('FECHA_RECEPCION', $mesSiguiente->month)
            ->where('FECHA_RECEPCION', '>=', Carbon::now()->subYears(5))
            ->whereNotNull('FECHA_RECEPCION')
            ->where('FECHA_RECEPCION', '>', '1000-01-01 00:00:00');
        
        if ($muestraEstado) $datosHistoricosMes->where('MUESTRA_ESTADO', $muestraEstado);
        if ($tipoEstudio) $datosHistoricosMes->where('MUESTRA_TIPO_ESTUDIO', $tipoEstudio);
        if ($prefijo) $datosHistoricosMes->where('CLAVE', $prefijo);
        
        $datosHistoricosMes = $datosHistoricosMes
            ->groupBy(DB::raw('YEAR(FECHA_RECEPCION)'))
            ->orderBy(DB::raw('YEAR(FECHA_RECEPCION)'))
            ->get();
        
        $promedioMesSiguiente = $datosHistoricosMes->avg('total');
        
        return [
            'mes_siguiente' => $mesSiguiente->format('F Y'),
            'mes_siguiente_numero' => $mesSiguiente->month,
            'prediccion_mes_siguiente' => round($promedioMesSiguiente),
            'datos_historicos_mes' => $datosHistoricosMes,
            'anios_analizados' => $datosHistoricosMes->count()
        ];
    }
    
    private function calcularPrediccionSiguienteMes($datosHistoricos, $factorTendencia)
    {
        if ($datosHistoricos->count() < 3) {
            return null;
        }
        
        // Predicción mejorada con tendencia
        $ultimosTres = $datosHistoricos->slice(-6)->pluck('total')->toArray();
        $promedioBase = round(array_sum($ultimosTres) / count($ultimosTres));
        
        // Aplicar factor de tendencia
        $prediccion = round($promedioBase * (1 + $factorTendencia * 0.5));
        
        return max(0, $prediccion); // No puede ser negativo
    }
    
    private function calcularRangoPrediccion($datosHistoricos, $promedioMensual)
    {
        if ($datosHistoricos->count() < 6) {
            return null;
        }
        
        // Calcular desviación estándar simple
        $valores = $datosHistoricos->pluck('total')->toArray();
        $varianza = 0;
        
        foreach ($valores as $valor) {
            $varianza += pow($valor - $promedioMensual, 2);
        }
        
        $desviacionEstandar = sqrt($varianza / count($valores));
        
        return [
            'minimo' => max(0, round($promedioMensual - $desviacionEstandar)),
            'maximo' => round($promedioMensual + $desviacionEstandar)
        ];
    }

    private function agruparPorcentajesBajos($datos, $umbral = 0.10)
    {
        $total = $datos->sum('value');
        $datosAgrupados = [];
        $otros = 0;
        
        foreach ($datos as $item) {
            $porcentaje = $item['value'] / $total;
            if ($porcentaje >= $umbral) {
                $datosAgrupados[] = $item;
            } else {
                $otros += $item['value'];
            }
        }
        
        // Si hay elementos agrupados en "otros", agregarlos
        if ($otros > 0) {
            $datosAgrupados[] = [
                'name' => 'Otros',
                'value' => $otros
            ];
        }
        
        return collect($datosAgrupados);
    }

    private function getEstudiosUltimos5Anios($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        // Calcular fecha de inicio (5 años atrás desde la fecha más antigua del filtro)
        $fechaInicioHistorico = Carbon::parse($fechaDesde)->subYears(5);
        
        $query = DB::table('estudios')
            ->select(
                DB::raw('YEAR(FECHA_RECEPCION) as anio'),
                DB::raw('MONTH(FECHA_RECEPCION) as mes'),
                DB::raw('COUNT(*) as total')
            )
            ->where('FECHA_RECEPCION', '>=', $fechaInicioHistorico)
            ->whereNotNull('FECHA_RECEPCION')
            ->where('FECHA_RECEPCION', '>', '1000-01-01 00:00:00');
        
        // Aplicar filtros condicionales
        if ($muestraEstado) {
            $query->where('ESTUDIO_ESTADO', $muestraEstado);
        }
        
        if ($tipoEstudio) {
            $query->where('MUESTRA_TIPO_ESTUDIO', $tipoEstudio);
        }
        
        if ($prefijo) {
            $query->where('CLAVE', $prefijo);
        }
        
        $datos = $query
            ->groupBy(DB::raw('YEAR(FECHA_RECEPCION)'), DB::raw('MONTH(FECHA_RECEPCION)'))
            ->orderBy(DB::raw('YEAR(FECHA_RECEPCION)'))
            ->orderBy(DB::raw('MONTH(FECHA_RECEPCION)'))
            ->get();
        
        // Formatear datos para la gráfica
        $datosFormateados = $datos->map(function($item) {
            $fecha = Carbon::createFromDate($item->anio, $item->mes, 1);
            return [
                'mes' => $fecha->format('M Y'),
                'total' => $item->total,
                'fecha_completa' => $fecha->format('Y-m')
            ];
        });
        
        return $datosFormateados;
    }

    private function getComparacionMensual3Periodos($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        $fechaInicio = Carbon::parse($fechaDesde);
        $fechaFin = Carbon::parse($fechaHasta);
        
        $mesesComparacion = [];
        
        $fechaActual = $fechaInicio->copy();
        while ($fechaActual->lte($fechaFin)) {
            $inicioMes = $fechaActual->copy()->startOfMonth();
            $finMes = $fechaActual->copy()->endOfMonth();
            
            // Si el mes se extiende fuera del rango, ajustar
            if ($inicioMes->lt($fechaInicio)) $inicioMes = $fechaInicio->copy();
            if ($finMes->gt($fechaFin)) $finMes = $fechaFin->copy();
            
            // Estudios del mes actual
            $estudiosActual = $this->getQueryBase(
                $inicioMes->format('Y-m-d'), 
                $finMes->format('Y-m-d'), 
                $muestraEstado, 
                $tipoEstudio, 
                $prefijo
            )->count();
            
            // Estudios del mismo mes hace 1 año
            $inicioMes1Anio = $inicioMes->copy()->subYear();
            $finMes1Anio = $finMes->copy()->subYear();
            
            $estudios1Anio = $this->getQueryBase(
                $inicioMes1Anio->format('Y-m-d'), 
                $finMes1Anio->format('Y-m-d'), 
                $muestraEstado, 
                $tipoEstudio, 
                $prefijo
            )->count();
            
            // Estudios del mismo mes hace 2 años
            $inicioMes2Anios = $inicioMes->copy()->subYears(2);
            $finMes2Anios = $finMes->copy()->subYears(2);
            
            $estudios2Anios = $this->getQueryBase(
                $inicioMes2Anios->format('Y-m-d'), 
                $finMes2Anios->format('Y-m-d'), 
                $muestraEstado, 
                $tipoEstudio, 
                $prefijo
            )->count();
            
            $mesesComparacion[] = [
                'mes' => $fechaActual->format('M Y'),
                'estudios_actual' => $estudiosActual,
                'estudios_1_anio' => $estudios1Anio,
                'estudios_2_anios' => $estudios2Anios
            ];
            
            $fechaActual->addMonth();
        }
        
        return $mesesComparacion;
    }

    private function getEstudiosFaltantes($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        // Obtener todos los estudios que cumplen con los filtros
        $query = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->select('ID', 'CLAVE', 'ANIO', 'SERIADO', 'CLAVE_INTERNA')
            ->orderBy('CLAVE')
            ->orderBy('ANIO')
            ->orderBy('SERIADO');
        
        $estudiosEncontrados = $query->get();
        
        // Agrupar por CLAVE y AÑO
        $gruposClave = $estudiosEncontrados->groupBy(function($estudio) {
            return $estudio->CLAVE . '_' . $estudio->ANIO;
        });
        
        $estudiosFaltantes = [];
        
        foreach ($gruposClave as $grupoKey => $estudios) {
            list($clave, $anio) = explode('_', $grupoKey);
            
            // Obtener el rango de seriados
            $seriados = $estudios->pluck('SERIADO')->toArray();
            $minSeriado = min($seriados);
            $maxSeriado = max($seriados);
            
            // Crear array con todos los números que deberían existir
            $seriadosCompletos = range($minSeriado, $maxSeriado);
            
            // Encontrar los faltantes
            $seriadosFaltantes = array_diff($seriadosCompletos, $seriados);
            
            // Por cada faltante, buscar el estudio en la BD
            foreach ($seriadosFaltantes as $seriadoFaltante) {
                $estudioFaltante = DB::table('estudios')
                    ->select('ID', 'CLAVE_INTERNA', 'CLAVE', 'ANIO', 'SERIADO', 'FECHA_RECEPCION', 'MUESTRA_TIPO_ESTUDIO', 'ESTUDIO_ESTADO')
                    ->where('CLAVE', $clave)
                    ->where('ANIO', $anio)
                    ->where('SERIADO', $seriadoFaltante)
                    ->first();
                
                if ($estudioFaltante) {
                    $estudiosFaltantes[] = [
                        'id' => $estudioFaltante->ID,
                        'clave_interna' => $estudioFaltante->CLAVE_INTERNA,
                        'clave' => $estudioFaltante->CLAVE,
                        'anio' => $estudioFaltante->ANIO,
                        'seriado' => $estudioFaltante->SERIADO,
                        'fecha_recepcion' => $estudioFaltante->FECHA_RECEPCION,
                        'tipo_estudio' => $estudioFaltante->MUESTRA_TIPO_ESTUDIO ?: 'N/D',
                        'estado' => $estudioFaltante->ESTUDIO_ESTADO ?: 'Sin estado',
                        'url' => "/estudios/{$estudioFaltante->ID}",
                        'razon_faltante' => $this->determinarRazonFaltante($estudioFaltante, $fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
                    ];
                }
            }
        }
        
        return collect($estudiosFaltantes)->sortBy(['clave', 'anio', 'seriado'])->values()->all();
    }

    private function determinarRazonFaltante($estudio, $fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        $razones = [];
        
        // Verificar fecha
        if ($estudio->FECHA_RECEPCION) {
            $fechaEstudio = date('Y-m-d', strtotime($estudio->FECHA_RECEPCION));
            if ($fechaEstudio < $fechaDesde || $fechaEstudio > $fechaHasta) {
                $razones[] = 'Fecha fuera del rango';
            }
        } else {
            $razones[] = 'Sin fecha de recepción';
        }
        
        // Verificar estado
        if ($muestraEstado && $estudio->MUESTRA_ESTADO !== $muestraEstado) {
            $razones[] = "Estado: {$estudio->MUESTRA_ESTADO} (filtrado: {$muestraEstado})";
        }
        
        // Verificar tipo estudio
        if ($tipoEstudio && $estudio->MUESTRA_TIPO_ESTUDIO !== $tipoEstudio) {
            $razones[] = "Tipo: {$estudio->MUESTRA_TIPO_ESTUDIO} (filtrado: {$tipoEstudio})";
        }
        
        // Verificar prefijo
        if ($prefijo && $estudio->CLAVE !== $prefijo) {
            $razones[] = "Prefijo: {$estudio->CLAVE} (filtrado: {$prefijo})";
        }
        
        return empty($razones) ? 'Datos incompletos' : implode(', ', $razones);
    }
}