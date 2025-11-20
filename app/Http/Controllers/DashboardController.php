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
        $institucionId = $request->get('institucion_id');
        $muestraEstado = $request->get('muestra_estado');
        
        // Datos para los filtros
        $filtros = $this->getFiltros();
        
        // Datos principales del dashboard
        $datos = [
            'graficas_pie' => $this->getGraficasPie($fechaDesde, $fechaHasta, $institucionId, $muestraEstado),
            'top_instituciones' => $this->getTopInstituciones($fechaDesde, $fechaHasta, $muestraEstado),
            'top_estados' => $this->getTopEstados($fechaDesde, $fechaHasta, $institucionId),
            'tendencia_5_anios' => $this->getEstudiosUltimos5Anios($fechaDesde, $fechaHasta, $institucionId, $muestraEstado),
            'comparacion_anual' => $this->getComparacionAnual($fechaDesde, $fechaHasta, $institucionId, $muestraEstado),
            'predicciones' => $this->getPredicciones($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
        ];
        
        return Inertia::render('dashboard', [
            'filtros' => $filtros,
            'datos' => $datos,
            'filtrosActivos' => [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
                'institucion_id' => $institucionId,
                'muestra_estado' => $muestraEstado
            ]
        ]);
    }
    
    private function getFiltros()
    {
        return [
            'instituciones' => Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
                ->orderBy('INSTITUCION_NOMBRE')
                ->get(),
            'muestra_estados' => DB::table('estudios')
                ->select('MUESTRA_ESTADO')
                ->whereNotNull('MUESTRA_ESTADO')
                ->where('MUESTRA_ESTADO', '!=', '')
                ->distinct()
                ->orderBy('MUESTRA_ESTADO')
                ->pluck('MUESTRA_ESTADO')
        ];
    }
    
    private function getQueryBase($fechaDesde, $fechaHasta, $institucionId = null, $muestraEstado = null)
    {
        $query = DB::table('estudios')
            ->whereBetween('FECHA_SOLICITUD_RECOLECCION', [$fechaDesde . ' 00:00:00', $fechaHasta . ' 23:59:59'])
            ->whereNotNull('FECHA_SOLICITUD_RECOLECCION')
            ->where('FECHA_SOLICITUD_RECOLECCION', '>', '1000-01-01 00:00:00');
            
        if ($institucionId) {
            $query->where('ID_INSTITUCION', $institucionId);
        }
        
        if ($muestraEstado) {
            $query->where('MUESTRA_ESTADO', $muestraEstado);
        }
        
        return $query;
    }
    
    private function getGraficasPie($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
    {
        // MUESTRA_TIPO
        $muestraTipo = $this->getQueryBase($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
            ->select('MUESTRA_TIPO', DB::raw('COUNT(*) as total'))
            ->whereNotNull('MUESTRA_TIPO')
            ->where('MUESTRA_TIPO', '!=', '')
            ->groupBy('MUESTRA_TIPO')
            ->orderByDesc('total')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->MUESTRA_TIPO ?: 'Sin especificar',
                    'value' => $item->total
                ];
            });
        
        // Agrupar elementos con menos del 10%
        $muestraTipo = $this->agruparPorcentajesBajos($muestraTipo);
        
        // MUESTRA_SITIO_LESION
        $muestraSitioLesion = $this->getQueryBase($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
            ->select('MUESTRA_SITIO_LESION', DB::raw('COUNT(*) as total'))
            ->whereNotNull('MUESTRA_SITIO_LESION')
            ->where('MUESTRA_SITIO_LESION', '!=', '')
            ->groupBy('MUESTRA_SITIO_LESION')
            ->orderByDesc('total')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->MUESTRA_SITIO_LESION ?: 'Sin especificar',
                    'value' => $item->total
                ];
            });
        
        // Agrupar elementos con menos del 10%
        $muestraSitioLesion = $this->agruparPorcentajesBajos($muestraSitioLesion);
        
        // MUESTRA_TIPO_ESTUDIO
        $muestraTipoEstudio = $this->getQueryBase($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
            ->select('MUESTRA_TIPO_ESTUDIO', DB::raw('COUNT(*) as total'))
            ->whereNotNull('MUESTRA_TIPO_ESTUDIO')
            ->where('MUESTRA_TIPO_ESTUDIO', '!=', '')
            ->groupBy('MUESTRA_TIPO_ESTUDIO')
            ->orderByDesc('total')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->MUESTRA_TIPO_ESTUDIO ?: 'Sin especificar',
                    'value' => $item->total
                ];
            });
        
        // Agrupar elementos con menos del 10%
        $muestraTipoEstudio = $this->agruparPorcentajesBajos($muestraTipoEstudio);
        
        return [
            'muestra_tipo' => $muestraTipo,
            'sitio_lesion' => $muestraSitioLesion,
            'tipo_estudio' => $muestraTipoEstudio
        ];
    }
    
    private function getTopInstituciones($fechaDesde, $fechaHasta, $muestraEstado)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, null, $muestraEstado)
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
    
    private function getTopEstados($fechaDesde, $fechaHasta, $institucionId)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $institucionId)
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
    
    private function getComparacionAnual($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
    {
        $fechaDesdeAnioAnterior = Carbon::parse($fechaDesde)->subYear()->format('Y-m-d');
        $fechaHastaAnioAnterior = Carbon::parse($fechaHasta)->subYear()->format('Y-m-d');
        
        // Estudios del período actual
        $estudiosActuales = $this->getQueryBase($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
            ->count();
        
        // Estudios del mismo período año anterior
        $estudiosAnioAnterior = $this->getQueryBase($fechaDesdeAnioAnterior, $fechaHastaAnioAnterior, $institucionId, $muestraEstado)
            ->count();
        
        // Calcular porcentaje de cambio
        $porcentajeCambio = 0;
        if ($estudiosAnioAnterior > 0) {
            $porcentajeCambio = round((($estudiosActuales - $estudiosAnioAnterior) / $estudiosAnioAnterior) * 100, 1);
        }
        
        // Comparación por meses
        $comparacionMensual = $this->getComparacionMensual($fechaDesde, $fechaHasta, $institucionId, $muestraEstado);
        
        return [
            'actual' => $estudiosActuales,
            'anio_anterior' => $estudiosAnioAnterior,
            'porcentaje_cambio' => $porcentajeCambio,
            'comparacion_mensual' => $comparacionMensual
        ];
    }
    
    private function getComparacionMensual($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
    {
        $fechaInicio = Carbon::parse($fechaDesde);
        $fechaFin = Carbon::parse($fechaHasta);
        
        $mesesActuales = [];
        $mesesAnteriores = [];
        
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
                $institucionId, 
                $muestraEstado
            )->count();
            
            // Estudios del mismo mes año anterior
            $inicioMesAnterior = $inicioMes->copy()->subYear();
            $finMesAnterior = $finMes->copy()->subYear();
            
            $estudiosAnterior = $this->getQueryBase(
                $inicioMesAnterior->format('Y-m-d'), 
                $finMesAnterior->format('Y-m-d'), 
                $institucionId, 
                $muestraEstado
            )->count();
            
            $mesesActuales[] = [
                'mes' => $fechaActual->format('M Y'),
                'estudios_actual' => $estudiosActual,
                'estudios_anterior' => $estudiosAnterior
            ];
            
            $fechaActual->addMonth();
        }
        
        return $mesesActuales;
    }
    
    private function getPredicciones($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
    {
        // Obtener datos de los últimos 12 meses para hacer predicción
        $fechaInicioHistorico = Carbon::parse($fechaDesde)->subMonths(12);
        
        $query = DB::table('estudios')
            ->select(
                DB::raw('YEAR(FECHA_SOLICITUD_RECOLECCION) as anio'),
                DB::raw('MONTH(FECHA_SOLICITUD_RECOLECCION) as mes'),
                DB::raw('COUNT(*) as total')
            )
            ->where('FECHA_SOLICITUD_RECOLECCION', '>=', $fechaInicioHistorico)
            ->whereNotNull('FECHA_SOLICITUD_RECOLECCION')
            ->where('FECHA_SOLICITUD_RECOLECCION', '>', '1000-01-01 00:00:00');
        
        // Aplicar filtros condicionales
        if ($institucionId) {
            $query->where('ID_INSTITUCION', $institucionId);
        }
        
        if ($muestraEstado) {
            $query->where('MUESTRA_ESTADO', $muestraEstado);
        }
        
        $datosHistoricos = $query
            ->groupBy(DB::raw('YEAR(FECHA_SOLICITUD_RECOLECCION)'), DB::raw('MONTH(FECHA_SOLICITUD_RECOLECCION)'))
            ->orderBy(DB::raw('YEAR(FECHA_SOLICITUD_RECOLECCION)'))
            ->orderBy(DB::raw('MONTH(FECHA_SOLICITUD_RECOLECCION)'))
            ->get();
        
        // Calcular promedio simple para predicción básica
        $totalEstudios = $datosHistoricos->sum('total');
        $promedioMensual = $datosHistoricos->count() > 0 ? round($totalEstudios / $datosHistoricos->count()) : 0;
        
        // Tendencia (muy básica)
        $tendencia = 'estable';
        if ($datosHistoricos->count() >= 3) {
            $ultimosTres = $datosHistoricos->slice(-3);
            $promedioPrimeros = $ultimosTres->slice(0, 2)->avg('total');
            $ultimoMes = $ultimosTres->last()->total;
            
            if ($ultimoMes > $promedioPrimeros * 1.1) {
                $tendencia = 'creciente';
            } elseif ($ultimoMes < $promedioPrimeros * 0.9) {
                $tendencia = 'decreciente';
            }
        }
        
        return [
            'promedio_mensual' => $promedioMensual,
            'tendencia' => $tendencia,
            'datos_historicos' => $datosHistoricos,
            'prediccion_siguiente_mes' => $this->calcularPrediccionSiguienteMes($datosHistoricos)
        ];
    }
    
    private function calcularPrediccionSiguienteMes($datosHistoricos)
    {
        if ($datosHistoricos->count() < 3) {
            return null;
        }
        
        // Predicción simple basada en tendencia de últimos 3 meses
        $ultimosTres = $datosHistoricos->slice(-3)->pluck('total')->toArray();
        
        // Media móvil simple
        $prediccion = round(array_sum($ultimosTres) / count($ultimosTres));
        
        return $prediccion;
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

    private function getEstudiosUltimos5Anios($fechaDesde, $fechaHasta, $institucionId, $muestraEstado)
    {
        // Calcular fecha de inicio (5 años atrás desde la fecha más antigua del filtro)
        $fechaInicioHistorico = Carbon::parse($fechaDesde)->subYears(5);
        
        $query = DB::table('estudios')
            ->select(
                DB::raw('YEAR(FECHA_SOLICITUD_RECOLECCION) as anio'),
                DB::raw('MONTH(FECHA_SOLICITUD_RECOLECCION) as mes'),
                DB::raw('COUNT(*) as total')
            )
            ->where('FECHA_SOLICITUD_RECOLECCION', '>=', $fechaInicioHistorico)
            ->whereNotNull('FECHA_SOLICITUD_RECOLECCION')
            ->where('FECHA_SOLICITUD_RECOLECCION', '>', '1000-01-01 00:00:00');
        
        // Aplicar filtros condicionales
        if ($institucionId) {
            $query->where('ID_INSTITUCION', $institucionId);
        }
        
        if ($muestraEstado) {
            $query->where('MUESTRA_ESTADO', $muestraEstado);
        }
        
        $datos = $query
            ->groupBy(DB::raw('YEAR(FECHA_SOLICITUD_RECOLECCION)'), DB::raw('MONTH(FECHA_SOLICITUD_RECOLECCION)'))
            ->orderBy(DB::raw('YEAR(FECHA_SOLICITUD_RECOLECCION)'))
            ->orderBy(DB::raw('MONTH(FECHA_SOLICITUD_RECOLECCION)'))
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
}