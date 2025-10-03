<?php

namespace App\Http\Controllers;

use App\Models\Estudio;
use App\Models\Institucion;
use App\Models\Cliente;
use App\Models\Usuario;
use App\Models\Mensajeria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Obtener estadísticas principales
        $stats = $this->getStats();
        
        // Obtener estudios recientes
        $recentStudies = $this->getRecentStudies();
        
        // Obtener notificaciones urgentes
        $notifications = $this->getNotifications();
        
        // Obtener datos para gráficas de últimos 30 días
        $chartData = $this->getChartData();
        
        // Obtener contadores por estado para la fila principal
        $mainCounters = $this->getMainCounters();
        
        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentStudies' => $recentStudies,
            'notifications' => $notifications,
            'chartData' => $chartData,
            'mainCounters' => $mainCounters
        ]);
    }
    
    /**
     * Obtiene los contadores principales por estado para la fila de cuatro columnas
     */
    private function getMainCounters()
    {
        return [
            'solicitud_recoleccion' => [
                'count' => Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_PENDIENTE)->count(),
                'label' => 'Solicitud Recolección',
                'color' => 'blue',
                'url' => route('estudios.index', ['filtro_estado' => Estudio::ESTADO_PENDIENTE])
            ],
            'recepcion_laboratorio' => [
                'count' => Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_LABORATORIO_RECEPCION)->count(),
                'label' => 'Recepción Laboratorio',
                'color' => 'yellow',
                'url' => route('estudios.index', ['filtro_estado' => Estudio::ESTADO_LABORATORIO_RECEPCION])
            ],
            'resultados_completos' => [
                'count' => Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_LABORATORIO_COMPLETO)->count(),
                'label' => 'Resultados Completos',
                'color' => 'green',
                'url' => route('estudios.index', ['filtro_estado' => Estudio::ESTADO_LABORATORIO_COMPLETO])
            ],
            'resultados_enviados' => [
                'count' => Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_COMPLETADO)->count(),
                'label' => 'Resultados Enviados',
                'color' => 'purple',
                'url' => route('estudios.index', ['filtro_estado' => Estudio::ESTADO_COMPLETADO])
            ]
        ];
    }
    
    /**
     * Obtiene datos para las gráficas de los últimos 30 días
     */
    private function getChartData()
    {
        $fechaInicio = Carbon::now()->subDays(30);
        $fechaFin = Carbon::now();
        
        return [
            // Gráfica de estudios por día (últimos 30 días)
            'estudios_diarios' => $this->getEstudiosDiarios($fechaInicio, $fechaFin),
            
            // Gráfica de distribución por tipo de estudio
            'estudios_por_tipo' => $this->getEstudiosPorTipo($fechaInicio, $fechaFin),
            
            // Gráfica de estados en los últimos 30 días
            'estudios_por_estado' => $this->getEstudiosPorEstado($fechaInicio, $fechaFin),
            
            // Gráfica de tiempo promedio de procesamiento por semana
            'tiempo_procesamiento_semanal' => $this->getTiempoProcesamiento($fechaInicio, $fechaFin),
            
            // Gráfica de instituciones más activas
            'instituciones_activas' => $this->getInstitucionesActivas($fechaInicio, $fechaFin),
            
            // Métricas de rendimiento
            'metricas_rendimiento' => $this->getMetricasRendimiento($fechaInicio, $fechaFin)
        ];
    }
    
    private function getEstudiosDiarios($fechaInicio, $fechaFin)
    {
        $estudios = DB::table('estudios')
            ->select(
                DB::raw('DATE(FECHA_SOLICITUD_RECOLECCION) as fecha'),
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('FECHA_SOLICITUD_RECOLECCION', [$fechaInicio, $fechaFin])
            ->where('FECHA_SOLICITUD_RECOLECCION', '!=', '0000-00-00 00:00:00')
            ->groupBy(DB::raw('DATE(FECHA_SOLICITUD_RECOLECCION)'))
            ->orderBy('fecha')
            ->get();
        
        // Rellenar días faltantes con 0
        $datos = [];
        $fechaActual = $fechaInicio->copy();
        
        while ($fechaActual->lte($fechaFin)) {
            $fechaString = $fechaActual->format('Y-m-d');
            $estudioDelDia = $estudios->firstWhere('fecha', $fechaString);
            
            $datos[] = [
                'fecha' => $fechaActual->format('d/m'),
                'total' => $estudioDelDia ? $estudioDelDia->total : 0,
                'fecha_completa' => $fechaString
            ];
            
            $fechaActual->addDay();
        }
        
        return $datos;
    }
    
    private function getEstudiosPorTipo($fechaInicio, $fechaFin)
    {
        return DB::table('estudios')
            ->select(
                'MUESTRA_TIPO_ESTUDIO as tipo',
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('FECHA_SOLICITUD_RECOLECCION', [$fechaInicio, $fechaFin])
            ->where('FECHA_SOLICITUD_RECOLECCION', '!=', '0000-00-00 00:00:00')
            ->whereNotNull('MUESTRA_TIPO_ESTUDIO')
            ->groupBy('MUESTRA_TIPO_ESTUDIO')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->tipo ?: 'Sin especificar',
                    'value' => $item->total
                ];
            });
    }
    
    private function getEstudiosPorEstado($fechaInicio, $fechaFin)
    {
        $estados = DB::table('estudios')
            ->select(
                'ESTUDIO_ESTADO as estado',
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('FECHA_SOLICITUD_RECOLECCION', [$fechaInicio, $fechaFin])
            ->where('FECHA_SOLICITUD_RECOLECCION', '!=', '0000-00-00 00:00:00')
            ->groupBy('ESTUDIO_ESTADO')
            ->get();
        
        $estadosFormateados = [];
        foreach ($estados as $estado) {
            $nombreEstado = $this->formatearNombreEstado($estado->estado);
            $estadosFormateados[] = [
                'name' => $nombreEstado,
                'value' => $estado->total,
                'estado_codigo' => $estado->estado
            ];
        }
        
        return $estadosFormateados;
    }
    
    private function getTiempoProcesamiento($fechaInicio, $fechaFin)
    {
        return DB::table('estudios')
            ->select(
                DB::raw('YEARWEEK(FECHA_SOLICITUD_RECOLECCION) as semana'),
                DB::raw('AVG(DATEDIFF(
                    CASE 
                        WHEN FECHA_RESULTADOS_CORREO != "0000-00-00 00:00:00" THEN FECHA_RESULTADOS_CORREO
                        WHEN FECHA_INFORME != "0000-00-00 00:00:00" THEN FECHA_INFORME
                        ELSE NOW()
                    END,
                    FECHA_SOLICITUD_RECOLECCION
                )) as promedio_dias'),
                DB::raw('MIN(DATE(FECHA_SOLICITUD_RECOLECCION)) as fecha_inicio_semana')
            )
            ->whereBetween('FECHA_SOLICITUD_RECOLECCION', [$fechaInicio, $fechaFin])
            ->where('FECHA_SOLICITUD_RECOLECCION', '!=', '0000-00-00 00:00:00')
            ->groupBy(DB::raw('YEARWEEK(FECHA_SOLICITUD_RECOLECCION)'))
            ->orderBy('semana')
            ->get()
            ->map(function($item) {
                return [
                    'semana' => 'Sem ' . substr($item->semana, -2),
                    'promedio_dias' => round($item->promedio_dias, 1),
                    'fecha_inicio' => Carbon::parse($item->fecha_inicio_semana)->format('d/m')
                ];
            });
    }
    
    private function getInstitucionesActivas($fechaInicio, $fechaFin)
    {
        return DB::table('estudios')
            ->join('instituciones', 'estudios.ID_INSTITUCION', '=', 'instituciones.ID_INSTITUCION')
            ->select(
                'instituciones.INSTITUCION_NOMBRE as nombre',
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('estudios.FECHA_SOLICITUD_RECOLECCION', [$fechaInicio, $fechaFin])
            ->where('estudios.FECHA_SOLICITUD_RECOLECCION', '!=', '0000-00-00 00:00:00')
            ->groupBy('instituciones.ID_INSTITUCION', 'instituciones.INSTITUCION_NOMBRE')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(function($item) {
                return [
                    'name' => substr($item->nombre, 0, 30) . (strlen($item->nombre) > 30 ? '...' : ''),
                    'value' => $item->total,
                    'nombre_completo' => $item->nombre
                ];
            });
    }
    
    private function getMetricasRendimiento($fechaInicio, $fechaFin)
    {
        $totalEstudios = Estudio::whereBetween('FECHA_SOLICITUD_RECOLECCION', [$fechaInicio, $fechaFin])
            ->where('FECHA_SOLICITUD_RECOLECCION', '!=', '0000-00-00 00:00:00')
            ->count();
        
        $estudiosCompletados = Estudio::whereBetween('FECHA_SOLICITUD_RECOLECCION', [$fechaInicio, $fechaFin])
            ->where('FECHA_SOLICITUD_RECOLECCION', '!=', '0000-00-00 00:00:00')
            ->where('ESTUDIO_ESTADO', Estudio::ESTADO_COMPLETADO)
            ->count();
        
        $tiempoPromedioTotal = DB::table('estudios')
            ->whereBetween('FECHA_SOLICITUD_RECOLECCION', [$fechaInicio, $fechaFin])
            ->where('FECHA_SOLICITUD_RECOLECCION', '!=', '0000-00-00 00:00:00')
            ->where('FECHA_RESULTADOS_CORREO', '!=', '0000-00-00 00:00:00')
            ->avg(DB::raw('DATEDIFF(FECHA_RESULTADOS_CORREO, FECHA_SOLICITUD_RECOLECCION)'));
        
        $eficiencia = $totalEstudios > 0 ? round(($estudiosCompletados / $totalEstudios) * 100, 1) : 0;
        
        return [
            'total_estudios' => $totalEstudios,
            'estudios_completados' => $estudiosCompletados,
            'eficiencia_porcentaje' => $eficiencia,
            'tiempo_promedio_dias' => round($tiempoPromedioTotal ?? 0, 1),
            'estudios_urgentes' => Estudio::where('ESTUDIO_ESTADO', '!=', Estudio::ESTADO_COMPLETADO)
                ->where('ESTUDIO_ESTADO', '!=', Estudio::ESTADO_CANCELADO)
                ->where('FECHA_SOLICITUD_RECOLECCION', '<=', Carbon::now()->subDays(7))
                ->count()
        ];
    }
    
    private function formatearNombreEstado($estado)
    {
        $estados = [
            Estudio::ESTADO_PENDIENTE => 'Pendiente',
            Estudio::ESTADO_LABORATORIO_RECEPCION => 'En Laboratorio',
            Estudio::ESTADO_LABORATORIO_COMPLETO => 'Resultados Completos',
            Estudio::ESTADO_COMPLETADO => 'Completado',
            Estudio::ESTADO_CANCELADO => 'Cancelado',
            Estudio::ESTADO_TERMINADO => 'Terminado'
        ];
        
        return $estados[$estado] ?? ucfirst($estado);
    }
    
    private function getStats()
    {
        $now = Carbon::now();
        
        // Estados de estudios
        $estudios_pendientes = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_PENDIENTE)->count();
        $estudios_laboratorio_recepcion = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_LABORATORIO_RECEPCION)->count();
        $estudios_laboratorio_completo = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_LABORATORIO_COMPLETO)->count();
        $estudios_completados = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_COMPLETADO)->count();
        $estudios_cancelados = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_CANCELADO)->count();
        
        // Total de estudios
        $total_estudios = $estudios_pendientes + $estudios_laboratorio_recepcion + 
                         $estudios_laboratorio_completo + $estudios_completados + $estudios_cancelados;
        
        // Usuarios por tipo
        $usuarios_pacientes = Usuario::where('USUARIO_TIPO', 'paciente')
                                   ->where('USUARIO_ESTADO', 'activo')
                                   ->count();
        
        $usuarios_medicos = Usuario::where('USUARIO_TIPO', 'medico')
                                 ->where('USUARIO_ESTADO', 'activo')
                                 ->count();
        
        $usuarios_administradores = Usuario::where('USUARIO_TIPO', 'administrador')
                                         ->where('USUARIO_ESTADO', 'activo')
                                         ->count();
        
        // Otras entidades
        $instituciones = Institucion::count();
        $mensajerias = Mensajeria::where('ESTADO', 'activo')->count();
        
        // Estudios por clave (tipo de estudio)
        $estudios_por_clave = DB::table('estudios')
            ->select('CLAVE', DB::raw('count(*) as total'))
            ->groupBy('CLAVE')
            ->orderByDesc('total')
            ->get()
            ->pluck('total', 'CLAVE')
            ->toArray();
        
        // Estudios urgentes (en laboratorio más de 24 horas)
        $estudios_urgentes = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_LABORATORIO_RECEPCION)
            ->whereNotNull('FECHA_ENVIO_LABORATORIO')
            ->where('FECHA_ENVIO_LABORATORIO', '!=', '0000-00-00 00:00:00')
            ->where('FECHA_ENVIO_LABORATORIO', '<=', $now->subHours(24))
            ->count();
        
        // Instituciones activas (con estudios en últimos 90 días)
        $instituciones_activas = Institucion::whereHas('estudios', function($query) use ($now) {
            $query->where('FECHA_SOLICITUD_RECOLECCION', '>=', $now->copy()->subDays(90));
        })->count();
        
        return [
            // Estados de estudios
            'estudios_pendientes' => $estudios_pendientes,
            'estudios_laboratorio_recepcion' => $estudios_laboratorio_recepcion,
            'estudios_laboratorio_completo' => $estudios_laboratorio_completo,
            'estudios_completados' => $estudios_completados,
            'estudios_cancelados' => $estudios_cancelados,
            'total_estudios' => $total_estudios,
            
            // Usuarios
            'usuarios_pacientes' => $usuarios_pacientes,
            'usuarios_medicos' => $usuarios_medicos,
            'usuarios_administradores' => $usuarios_administradores,
            'total_usuarios' => $usuarios_pacientes + $usuarios_medicos + $usuarios_administradores,
            
            // Otras entidades
            'instituciones' => $instituciones,
            'instituciones_activas' => $instituciones_activas,
            'mensajerias' => $mensajerias,
            
            // Métricas adicionales
            'estudios_por_clave' => $estudios_por_clave,
            'estudios_urgentes' => $estudios_urgentes,
            
            // Para compatibilidad con el frontend actual
            'muestras_procesando' => $estudios_laboratorio_recepcion + $estudios_laboratorio_completo,
        ];
    }
    
    private function getRecentStudies()
    {
        return Estudio::with(['medico', 'paciente', 'institucion'])
            ->orderBy('FECHA_SOLICITUD_RECOLECCION', 'desc')
            ->take(5)
            ->get()
            ->map(function($estudio) {
                return [
                    'id' => $estudio->folio_completo,
                    'paciente' => $estudio->MUESTRA_INICIALES ?: 
                        ($estudio->paciente ? 
                            substr($estudio->paciente->USUARIO_NOMBRE, 0, 1) . '.' . 
                            substr($estudio->paciente->USUARIO_APELLIDOS, 0, 1) . '.' 
                            : 'N/A'),
                    'tipo' => $estudio->MUESTRA_TIPO_ESTUDIO,
                    'estado' => $estudio->estado_formateado,
                    'fecha' => Carbon::parse($estudio->FECHA_SOLICITUD_RECOLECCION)->format('d/m/Y'),
                    'institucion' => $estudio->institucion ? $estudio->institucion->INSTITUCION_NOMBRE : 'N/A',
                    'dias_transcurridos' => $estudio->dias_transcurridos
                ];
            });
    }
    
    private function getNotifications()
    {
        $notifications = [];
        
        // Muestras urgentes (más de 7 días sin procesamiento)
        $muestras_urgentes = Estudio::where('ESTUDIO_ESTADO', '!=', Estudio::ESTADO_COMPLETADO)
            ->where('ESTUDIO_ESTADO', '!=', Estudio::ESTADO_TERMINADO)
            ->where('ESTUDIO_ESTADO', '!=', Estudio::ESTADO_CANCELADO)
            ->where('FECHA_SOLICITUD_RECOLECCION', '<=', Carbon::now()->subDays(7))
            ->count();
        
        if ($muestras_urgentes > 0) {
            $notifications[] = [
                'type' => 'warning',
                'title' => 'Estudios Urgentes',
                'message' => "{$muestras_urgentes} estudios requieren atención urgente (más de 7 días)",
                'count' => $muestras_urgentes
            ];
        }
        
        // Resultados completos listos para envío
        $resultados_listos = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_LABORATORIO_COMPLETO)
            ->where('R_COMPLETOS', 'si')
            ->count();
        
        if ($resultados_listos > 0) {
            $notifications[] = [
                'type' => 'info',
                'title' => 'Resultados Listos',
                'message' => "{$resultados_listos} estudios con resultados completos listos para envío",
                'count' => $resultados_listos
            ];
        }
        
        // Estudios pendientes de recolección
        $pendientes_recoleccion = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_PENDIENTE)
            ->where('FECHA_SOLICITUD_RECOLECCION', '<=', Carbon::now()->subDays(2))
            ->count();
        
        if ($pendientes_recoleccion > 0) {
            $notifications[] = [
                'type' => 'warning',
                'title' => 'Recolecciones Pendientes',
                'message' => "{$pendientes_recoleccion} estudios pendientes de recolección",
                'count' => $pendientes_recoleccion
            ];
        }
        
        // Material pendiente de retorno
        $pendiente_retorno = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_COMPLETADO)
            ->whereNull('FECHA_RETORNO_MATERIAL')
            ->where('FECHA_RESULTADOS_CORREO', '<=', Carbon::now()->subDays(5))
            ->count();
        
        if ($pendiente_retorno > 0) {
            $notifications[] = [
                'type' => 'info',
                'title' => 'Retorno de Material',
                'message' => "{$pendiente_retorno} estudios pendientes de retorno de material",
                'count' => $pendiente_retorno
            ];
        }
        
        return $notifications;
    }
    
    /**
     * API endpoint para obtener datos de gráficas en tiempo real
     */
    public function getChartDataApi(Request $request)
    {
        $dias = $request->get('dias', 30);
        $fechaInicio = Carbon::now()->subDays($dias);
        $fechaFin = Carbon::now();
        
        return response()->json([
            'chartData' => $this->getChartData()
        ]);
    }
    
    /**
     * Método para obtener estadísticas detalladas por período
     */
    public function getDetailedStats(Request $request)
    {
        $periodo = $request->get('periodo', '30'); // días
        $fechaInicio = Carbon::now()->subDays($periodo);
        
        $stats = [
            'estudios_por_estado' => DB::table('estudios')
                ->select('ESTUDIO_ESTADO', DB::raw('count(*) as total'))
                ->where('FECHA_SOLICITUD_RECOLECCION', '>=', $fechaInicio)
                ->groupBy('ESTUDIO_ESTADO')
                ->get(),
                
            'estudios_por_mes' => DB::table('estudios')
                ->select(
                    DB::raw('YEAR(FECHA_SOLICITUD_RECOLECCION) as año'),
                    DB::raw('MONTH(FECHA_SOLICITUD_RECOLECCION) as mes'),
                    DB::raw('count(*) as total')
                )
                ->where('FECHA_SOLICITUD_RECOLECCION', '>=', $fechaInicio)
                ->groupBy('año', 'mes')
                ->orderBy('año', 'desc')
                ->orderBy('mes', 'desc')
                ->get(),
                
            'tiempo_promedio_procesamiento' => DB::table('estudios')
                ->whereNotNull('FECHA_SOLICITUD_RECOLECCION')
                ->whereNotNull('FECHA_RESULTADOS_CORREO')
                ->where('FECHA_SOLICITUD_RECOLECCION', '>=', $fechaInicio)
                ->avg(DB::raw('DATEDIFF(FECHA_RESULTADOS_CORREO, FECHA_SOLICITUD_RECOLECCION)'))
        ];
        
        return response()->json($stats);
    }
}