<?php

namespace App\Http\Controllers;

use App\Models\Estudio;
use App\Models\Institucion;
use App\Models\Cliente;
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
        $previousMonth = $now->copy()->subMonth();
        $previousMonthStart = $previousMonth->copy()->startOfMonth();
        $previousMonthEnd = $previousMonth->copy()->endOfMonth();
        $currentMonthStart = $now->copy()->startOfMonth();
        
        // Estudios pendientes (últimos 30 días)
        $estudios_pendientes = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_PENDIENTE)
            ->where('FECHA_SOLICITUD_RECOLECCION', '>=', $thirtyDaysAgo)
            ->count();
        
        // Estudios completados (este mes)
        $estudios_completados_mes_actual = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_COMPLETADO)
            ->where('FECHA_FIN_PROCESO', '>=', $currentMonthStart)
            ->count();
        
        // Estudios completados (mes anterior para comparación)
        $estudios_completados_mes_anterior = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_COMPLETADO)
            ->whereBetween('FECHA_FIN_PROCESO', [$previousMonthStart, $previousMonthEnd])
            ->count();
        
        // Calcular porcentaje de cambio
        $porcentaje_cambio = 0;
        if ($estudios_completados_mes_anterior > 0) {
            $porcentaje_cambio = round((($estudios_completados_mes_actual - $estudios_completados_mes_anterior) / $estudios_completados_mes_anterior) * 100);
        } elseif ($estudios_completados_mes_actual > 0) {
            $porcentaje_cambio = 100; // Si no había estudios el mes anterior pero sí este mes
        }
        
        // Muestras en proceso (en laboratorio)
        $muestras_procesando = Estudio::where('ESTUDIO_ESTADO', Estudio::ESTADO_EN_PROCESO)
            ->whereNotNull('FECHA_ENVIO_LABORATORIO')
            ->whereNull('FECHA_OBTENCION_RESULTADOS')
            ->count();
        
        // Instituciones activas (que han enviado estudios en los últimos 90 días)
        $instituciones_activas = Institucion::whereHas('estudios', function($query) {
            $query->where('FECHA_SOLICITUD_RECOLECCION', '>=', Carbon::now()->subDays(90));
        })->count();
        
        return [
            'estudios_pendientes' => $estudios_pendientes,
            'estudios_completados' => $estudios_completados_mes_actual,
            'porcentaje_cambio_completados' => $porcentaje_cambio,
            'muestras_procesando' => $muestras_procesando,
            'instituciones_activas' => $instituciones_activas
        ];
    }
    
    private function getRecentStudies()
    {
        return Estudio::with(['medico', 'paciente'])
            ->orderBy('FECHA_SOLICITUD_RECOLECCION', 'desc')
            ->take(4)
            ->get()
            ->map(function($estudio) {
                return [
                    'id' => $estudio->folio_completo,
                    'paciente' => $estudio->MUESTRA_INICIALES ?: ($estudio->paciente ? substr($estudio->paciente->USUARIO_NOMBRE, 0, 1) . '.' . substr($estudio->paciente->USUARIO_APELLIDOS, 0, 1) . '.' : 'N/A'),
                    'tipo' => $estudio->MUESTRA_TIPO_ESTUDIO,
                    'estado' => $estudio->estado_formateado,
                    'fecha' => Carbon::parse($estudio->FECHA_SOLICITUD_RECOLECCION)->format('Y-m-d')
                ];
            });
    }
    
    private function getNotifications()
    {
        $notifications = [];
        
        // Muestras por vencer (más de 7 días sin procesamiento)
        $muestras_vencer = Estudio::where('ESTUDIO_ESTADO', '!=', Estudio::ESTADO_COMPLETADO)
            ->where('ESTUDIO_ESTADO', '!=', Estudio::ESTADO_CANCELADO)
            ->where('FECHA_SOLICITUD_RECOLECCION', '<=', Carbon::now()->subDays(7))
            ->count();
        
        if ($muestras_vencer > 0) {
            $notifications[] = [
                'type' => 'warning',
                'title' => 'Muestras por vencer',
                'message' => "{$muestras_vencer} muestras requieren procesamiento urgente",
                'count' => $muestras_vencer
            ];
        }
        
        // Resultados listos para envío
        $resultados_listos = Estudio::where('R_COMPLETOS', 'si')
            ->whereNull('FECHA_RESULTADOS_CORREO')
            ->count();
        
        if ($resultados_listos > 0) {
            $notifications[] = [
                'type' => 'info',
                'title' => 'Resultados listos',
                'message' => "{$resultados_listos} estudios completados pendientes de envío",
                'count' => $resultados_listos
            ];
        }
        
        return $notifications;
    }
}