<?php

namespace App\Http\Controllers;

use App\Models\EnvioCorreo;
use App\Models\Estudio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EnviosCorreosController extends Controller
{
    /**
     * Mostrar lista de envíos de correos
     */
    public function index(Request $request)
    {
        $query = EnvioCorreo::with(['estudio', 'medico', 'usuarioEnvio']);

        // Filtros
        if ($request->filled('estudio_id')) {
            $query->porEstudio($request->estudio_id);
        }

        if ($request->filled('medico_id')) {
            $query->porMedico($request->medico_id);
        }

        if ($request->filled('usuario_envio_id')) {
            $query->porUsuarioEnvio($request->usuario_envio_id);
        }

        if ($request->filled('estado')) {
            $query->where('ESTADO', $request->estado);
        }

        if ($request->filled('tipo_envio')) {
            $query->where('TIPO_ENVIO', $request->tipo_envio);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('FECHA_ENVIO', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('FECHA_ENVIO', '<=', $request->fecha_hasta);
        }

        if ($request->filled('correo')) {
            $query->where('CORREO_DESTINATARIO', 'like', '%' . $request->correo . '%');
        }

        $envios = $query->orderBy('FECHA_ENVIO', 'desc')->paginate(20);

        return view('envios-correos.index', compact('envios'));
    }

    /**
     * Mostrar detalles de un envío específico
     */
    public function show($id)
    {
        $envio = EnvioCorreo::with(['estudio', 'medico', 'usuarioEnvio'])->findOrFail($id);
        
        return view('envios-correos.show', compact('envio'));
    }

    /**
     * Registrar un nuevo envío de correo
     */
    public function registrarEnvio(Request $request)
    {
        $request->validate([
            'ID_ESTUDIO' => 'required|integer|exists:estudios,ID',
            'ID_MEDICO' => 'nullable|integer|exists:usuarios,ID_USUARIO',
            'NOMBRE_DESTINATARIO' => 'required|string|max:255',
            'CORREO_DESTINATARIO' => 'required|email|max:255',
            'TIPO_ENVIO' => 'required|in:enlace,adjunto',
            'MENSAJE_HTML' => 'required|string',
        ]);

        $envio = EnvioCorreo::create([
            'ID_ESTUDIO' => $request->ID_ESTUDIO,
            'ID_MEDICO' => $request->ID_MEDICO,
            'ID_USUARIO_ENVIO' => Auth::user()->ID_USUARIO ?? Auth::id(),
            'NOMBRE_DESTINATARIO' => $request->NOMBRE_DESTINATARIO,
            'CORREO_DESTINATARIO' => $request->CORREO_DESTINATARIO,
            'TIPO_ENVIO' => $request->TIPO_ENVIO,
            'MENSAJE_HTML' => $request->MENSAJE_HTML,
            'ESTADO' => 'enviado',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Envío registrado correctamente',
            'envio_id' => $envio->id,
            'token_lectura' => $envio->TOKEN_LECTURA,
            'url_pixel' => $envio->url_pixel
        ]);
    }

    /**
     * Endpoint para el pixel de tracking
     */
    public function trackingPixel($token)
    {
        $envio = EnvioCorreo::where('TOKEN_LECTURA', $token)->first();
        
        if ($envio && $envio->ESTADO === 'enviado') {
            $envio->marcarComoLeido();
        }

        // Retornar una imagen transparente de 1x1 pixel
        $pixel = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        return response($pixel, 200, [
            'Content-Type' => 'image/png',
            'Content-Length' => strlen($pixel),
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ]);
    }

    /**
     * Obtener estadísticas de envíos
     */
    public function estadisticas(Request $request)
    {
        $fechaDesde = $request->get('fecha_desde', now()->subMonth());
        $fechaHasta = $request->get('fecha_hasta', now());

        $estadisticas = [
            'total_envios' => EnvioCorreo::whereBetween('FECHA_ENVIO', [$fechaDesde, $fechaHasta])->count(),
            'envios_leidos' => EnvioCorreo::whereBetween('FECHA_ENVIO', [$fechaDesde, $fechaHasta])->leidos()->count(),
            'envios_pendientes' => EnvioCorreo::whereBetween('FECHA_ENVIO', [$fechaDesde, $fechaHasta])->enviados()->count(),
            'por_tipo' => EnvioCorreo::whereBetween('FECHA_ENVIO', [$fechaDesde, $fechaHasta])
                ->select('TIPO_ENVIO', DB::raw('count(*) as total'))
                ->groupBy('TIPO_ENVIO')
                ->get(),
            'por_dia' => EnvioCorreo::whereBetween('FECHA_ENVIO', [$fechaDesde, $fechaHasta])
                ->select(DB::raw('DATE(FECHA_ENVIO) as fecha'), DB::raw('count(*) as total'))
                ->groupBy(DB::raw('DATE(FECHA_ENVIO)'))
                ->orderBy('fecha')
                ->get(),
            'top_usuarios' => EnvioCorreo::with('usuarioEnvio')
                ->whereBetween('FECHA_ENVIO', [$fechaDesde, $fechaHasta])
                ->select('ID_USUARIO_ENVIO', DB::raw('count(*) as total'))
                ->groupBy('ID_USUARIO_ENVIO')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get()
        ];

        $estadisticas['porcentaje_lectura'] = $estadisticas['total_envios'] > 0 
            ? round(($estadisticas['envios_leidos'] / $estadisticas['total_envios']) * 100, 2)
            : 0;

        return response()->json($estadisticas);
    }

    /**
     * Obtener envíos por estudio
     */
    public function porEstudio($estudioId)
    {
        $estudio = Estudio::findOrFail($estudioId);
        $envios = $estudio->enviosCorreos()
            ->with(['medico', 'usuarioEnvio'])
            ->orderBy('FECHA_ENVIO', 'desc')
            ->get();

        $estadisticas = $estudio->getEstadisticasCorreos();

        return response()->json([
            'estudio' => $estudio,
            'envios' => $envios,
            'estadisticas' => $estadisticas
        ]);
    }

    /**
     * Reenviar correo (crear nuevo registro)
     */
    public function reenviar(Request $request, $id)
    {
        $envioOriginal = EnvioCorreo::findOrFail($id);
        
        $nuevoEnvio = EnvioCorreo::create([
            'ID_ESTUDIO' => $envioOriginal->ID_ESTUDIO,
            'ID_MEDICO' => $envioOriginal->ID_MEDICO,
            'ID_USUARIO_ENVIO' => Auth::user()->ID_USUARIO ?? Auth::id(),
            'NOMBRE_DESTINATARIO' => $envioOriginal->NOMBRE_DESTINATARIO,
            'CORREO_DESTINATARIO' => $envioOriginal->CORREO_DESTINATARIO,
            'TIPO_ENVIO' => $request->get('tipo_envio', $envioOriginal->TIPO_ENVIO),
            'MENSAJE_HTML' => $request->get('mensaje_html', $envioOriginal->MENSAJE_HTML),
            'ESTADO' => 'enviado',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Correo reenviado correctamente',
            'envio_id' => $nuevoEnvio->id,
            'token_lectura' => $nuevoEnvio->TOKEN_LECTURA,
            'url_pixel' => $nuevoEnvio->url_pixel
        ]);
    }

    /**
     * Exportar envíos a CSV
     */
    public function exportar(Request $request)
    {
        $query = EnvioCorreo::with(['estudio', 'medico', 'usuarioEnvio']);

        // Aplicar los mismos filtros que en index
        if ($request->filled('estudio_id')) {
            $query->porEstudio($request->estudio_id);
        }
        // ... resto de filtros

        $envios = $query->orderBy('FECHA_ENVIO', 'desc')->get();

        $filename = 'envios_correos_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($envios) {
            $file = fopen('php://output', 'w');
            
            // Encabezados del CSV
            fputcsv($file, [
                'ID',
                'Estudio',
                'Médico',
                'Usuario Envío',
                'Destinatario',
                'Correo',
                'Tipo Envío',
                'Estado',
                'Fecha Envío',
                'Fecha Lectura'
            ]);

            foreach ($envios as $envio) {
                fputcsv($file, [
                    $envio->id,
                    $envio->estudio->CLAVE_INTERNA ?? '',
                    $envio->medico->USUARIO_NOMBRE ?? '',
                    $envio->usuarioEnvio->USUARIO_NOMBRE ?? '',
                    $envio->NOMBRE_DESTINATARIO,
                    $envio->CORREO_DESTINATARIO,
                    $envio->TIPO_ENVIO,
                    $envio->ESTADO,
                    $envio->FECHA_ENVIO->format('Y-m-d H:i:s'),
                    $envio->FECHA_LECTURA ? $envio->FECHA_LECTURA->format('Y-m-d H:i:s') : ''
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // En EnviosCorreosController, agrega esta función:
    public function destroy($id)
    {
        try {
            // Buscar el envío
            $envio = \App\Models\EnvioCorreo::findOrFail($id);
            
            // Obtener el estudio para verificar permisos si es necesario
            $estudio = \App\Models\Estudio::findOrFail($envio->ID_ESTUDIO);
            
            // Eliminar el registro
            $envio->delete();
            
            \Log::info('Envío de correo eliminado exitosamente', [
                'envio_id' => $id,
                'estudio_id' => $estudio->ID,
                'usuario_elimino' => auth()->user()->ID_USUARIO ?? auth()->id()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Envío eliminado exitosamente'
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Envío no encontrado'
            ], 404);
            
        } catch (\Exception $e) {
            \Log::error('Error eliminando envío de correo', [
                'envio_id' => $id,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el envío: ' . $e->getMessage()
            ], 500);
        }
    }
}