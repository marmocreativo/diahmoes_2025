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
        
        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentStudies' => $recentStudies,
            'notifications' => $notifications
        ]);
    }
    
    private function getStats()
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        
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