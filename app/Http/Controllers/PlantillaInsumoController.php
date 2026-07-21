<?php

namespace App\Http\Controllers;

use App\Models\Estudio;
use App\Models\Insumo;
use App\Models\InsumoLote;
use App\Models\EstudioInsumo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PlantillaInsumoController extends Controller
{
    /**
     * Obtener todas las plantillas disponibles
     */
    public function getPlantillas()
    {
        try {
            $configPath = config_path('plantillas_insumos.json');
            
            if (!file_exists($configPath)) {
                \Log::error('Archivo de plantillas no encontrado: ' . $configPath);
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo de configuración de plantillas no encontrado'
                ], 404);
            }
            
            $config = json_decode(file_get_contents($configPath), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('Error al parsear JSON de plantillas: ' . json_last_error_msg());
                return response()->json([
                    'success' => false,
                    'message' => 'Error en el formato del archivo de plantillas'
                ], 500);
            }
            
            return response()->json([
                'success' => true,
                'plantillas' => $config['plantillas'] ?? []
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error al obtener plantillas:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno al obtener plantillas'
            ], 500);
        }
    }
    
    /**
     * Obtener plantillas recomendadas para un estudio específico
     */
    public function getPlantillasRecomendadas(Request $request, Estudio $estudio)
    {
        try {
            $plantillas = $this->cargarPlantillas();
            $recomendadas = [];

            // Permitir sobreescribir valores no guardados aún (desde el front)
            $estudio->R_ESTATUS_KRAS = $request->query('estatus_kras', $estudio->R_ESTATUS_KRAS);
            $estudio->R_ESTATUS_NRAS = $request->query('estatus_nras', $estudio->R_ESTATUS_NRAS);
            $estudio->R_ESTATUS_BRAF = $request->query('estatus_braf', $estudio->R_ESTATUS_BRAF);

            foreach ($plantillas['plantillas'] as $key => $plantilla) {
                if ($this->plantillaAplicaAlEstudio($plantilla, $estudio)) {
                    $recomendadas[$key] = $plantilla;
                }
            }
            
            return response()->json([
                'success' => true,
                'plantillas_recomendadas' => $recomendadas,
                'info_estudio' => [
                    'tipo_muestra' => $estudio->MUESTRA_TIPO,
                    'estatus_kras' => $estudio->R_ESTATUS_KRAS,
                    'estatus_nras' => $estudio->R_ESTATUS_NRAS,
                    'estatus_braf' => $estudio->R_ESTATUS_BRAF
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error al obtener plantillas recomendadas:', [
                'estudio_id' => $estudio->ID,
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener plantillas recomendadas'
            ], 500);
        }
    }
    
    /**
     * Aplicar una plantilla específica a un estudio
     */
    public function aplicarPlantilla(Request $request, Estudio $estudio)
    {
        $request->validate([
            'plantilla_key' => 'required|string',
            'ajustes' => 'nullable|array',
            'ajustes.*.insumo' => 'required|string',
            'ajustes.*.cantidad' => 'required|integer|min:1'
        ]);
        
        try {
            \Log::info('=== APLICANDO PLANTILLA (REEMPLAZAR) ===', [
                'estudio_id' => $estudio->ID,
                'plantilla_key' => $request->plantilla_key,
                'ajustes' => $request->ajustes ?? []
            ]);
            
            $plantillas = $this->cargarPlantillas();
            
            if (!isset($plantillas['plantillas'][$request->plantilla_key])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plantilla no encontrada'
                ], 404);
            }
            
            $plantilla = $plantillas['plantillas'][$request->plantilla_key];
            $ajustes = collect($request->ajustes ?? [])->keyBy('insumo');
            
            DB::beginTransaction();
            
            // 🔄 NUEVO: ELIMINAR TODOS LOS INSUMOS EXISTENTES
            $insumosExistentes = $estudio->insumos()->with('lote')->get();
            
            foreach ($insumosExistentes as $uso) {
                $uso->lote->increment('CANTIDAD_ACTUAL', $uso->CANTIDAD);

                \App\Models\LoteMovimiento::registrar(
                    idInsumo:  $uso->lote->ID_INSUMO,
                    idLote:    $uso->lote->ID,
                    tipo:      \App\Models\LoteMovimiento::TIPO_INGRESO,
                    cantidad:  $uso->CANTIDAD,
                    motivo:    "Devolución por reemplazo de plantilla en estudio {$estudio->CLAVE_INTERNA}",
                    idEstudio: $estudio->ID,
                    idUsuario: auth()->user()->ID_USUARIO ?? auth()->id(),
                );

                $uso->delete();
            }
            
            \Log::info('🗑️ Eliminados ' . $insumosExistentes->count() . ' insumos existentes');
            
            // Continúa con el código existente para agregar los nuevos insumos...
            $insumosAgregados = [];
            $errores = [];
            $lotesCreados = []; // 🆕 Para trackear lotes nuevos creados
            
            foreach ($plantilla['insumos'] as $itemPlantilla) {
                try {
                    // Verificar si hay ajustes para este insumo
                    $cantidadFinal = $ajustes->has($itemPlantilla['nombre_insumo']) 
                        ? $ajustes[$itemPlantilla['nombre_insumo']]['cantidad']
                        : $itemPlantilla['cantidad'];
                    
                    $resultado = $this->agregarInsumoDePlantilla(
                        $estudio, 
                        $itemPlantilla['nombre_insumo'], 
                        $cantidadFinal,
                        $lotesCreados // 🆕 Pasar referencia de lotes creados
                    );
                    
                    if ($resultado['success']) {
                        $insumosAgregados[] = $resultado['insumo'];
                        
                        // 🆕 Si se creó un lote nuevo, trackear
                        if (isset($resultado['lote_creado'])) {
                            $lotesCreados[] = $resultado['lote_creado'];
                        }
                    } else {
                        $errores[] = $resultado['message'];
                    }
                    
                } catch (\Exception $e) {
                    $errores[] = "Error con {$itemPlantilla['nombre_insumo']}: " . $e->getMessage();
                    \Log::error('Error agregando insumo de plantilla:', [
                        'insumo' => $itemPlantilla['nombre_insumo'],
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            if (empty($insumosAgregados) && !empty($errores)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo agregar ningún insumo',
                    'errores' => $errores
                ], 400);
            }
            
            DB::commit();
            
            $mensaje = 'Plantilla aplicada exitosamente (insumos reemplazados)';
            if (!empty($lotesCreados)) {
                $mensaje .= '. Se crearon ' . count($lotesCreados) . ' lotes nuevos automáticamente.';
            }
            
            return response()->json([
                'success' => true,
                'message' => $mensaje,
                'insumos_reemplazados' => $insumosExistentes->count(),
                'insumos_agregados' => count($insumosAgregados),
                'lotes_creados' => count($lotesCreados),
                'errores' => $errores,
                'detalle' => $insumosAgregados
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error aplicando plantilla:', [
                'estudio_id' => $estudio->ID,
                'plantilla_key' => $request->plantilla_key,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno al aplicar plantilla'
            ], 500);
        }
    }
    
    /**
     * Validar disponibilidad de insumos de una plantilla
     */
    public function validarDisponibilidadPlantilla(Request $request, Estudio $estudio)
    {
        $request->validate([
            'plantilla_key' => 'required|string'
        ]);
        
        try {
            $plantillas = $this->cargarPlantillas();
            
            if (!isset($plantillas['plantillas'][$request->plantilla_key])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plantilla no encontrada'
                ], 404);
            }
            
            $plantilla = $plantillas['plantillas'][$request->plantilla_key];
            $validaciones = [];
            $todasDisponibles = true;
            
            foreach ($plantilla['insumos'] as $item) {
                $validacion = $this->validarDisponibilidadInsumo(
                    $item['nombre_insumo'], 
                    $item['cantidad']
                );
                
                $validaciones[] = [
                    'insumo' => $item['nombre_insumo'],
                    'cantidad_requerida' => $item['cantidad'],
                    'disponible' => $validacion['disponible'],
                    'stock_actual' => $validacion['stock_actual'],
                    'mensaje' => $validacion['mensaje']
                ];
                
                if (!$validacion['disponible']) {
                    $todasDisponibles = false;
                }
            }
            
            return response()->json([
                'success' => true,
                'todas_disponibles' => $todasDisponibles,
                'validaciones' => $validaciones
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error validando disponibilidad de plantilla:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al validar disponibilidad'
            ], 500);
        }
    }
    
    // MÉTODOS PRIVADOS DE APOYO
    
    private function cargarPlantillas()
    {
        $configPath = config_path('plantillas_insumos.json');
        return json_decode(file_get_contents($configPath), true);
    }
    
    private function plantillaAplicaAlEstudio($plantilla, $estudio)
    {
        $condiciones = $plantilla['condiciones'] ?? [];
        
        if (empty($condiciones)) {
            return true; // Plantilla universal
        }
        
        // Verificar tipo de muestra
        if (isset($condiciones['tipo_muestra'])) {
            $tiposValidos = is_array($condiciones['tipo_muestra']) 
                ? $condiciones['tipo_muestra'] 
                : [$condiciones['tipo_muestra']];
                
            if (!in_array($estudio->MUESTRA_TIPO, $tiposValidos)) {
                return false;
            }
        }
        
        // Verificar resultado KRAS
        if (isset($condiciones['resultado_kras'])) {
            $resultadosValidos = is_array($condiciones['resultado_kras']) 
                ? $condiciones['resultado_kras'] 
                : [$condiciones['resultado_kras']];
                
            if (!in_array($estudio->R_ESTATUS_KRAS, $resultadosValidos)) {
                return false;
            }
        }
        
        // Verificar si requiere NRAS (lógica especial)
        if (isset($condiciones['requiere_nras']) && $condiciones['requiere_nras']) {
            $estudiosRequeridos = $estudio->R_ESTUDIO_SOLICITADO ?? '';
            if (!str_contains($estudiosRequeridos, 'N-RAS')) {
                return false;
            }
        }
        
        return true;
    }
    
    private function agregarInsumoDePlantilla($estudio, $nombreInsumo, $cantidad, &$lotesCreados = [])
    {
        // Buscar el insumo por nombre
        $insumo = Insumo::where('NOMBRE', 'LIKE', "%{$nombreInsumo}%")
                        ->where('ESTADO', 'activo')
                        ->first();
        
        if (!$insumo) {
            return [
                'success' => false,
                'message' => "Insumo '{$nombreInsumo}' no encontrado"
            ];
        }
        
        // Buscar lote disponible (FIFO)
        $lote = InsumoLote::where('ID_INSUMO', $insumo->ID)
                        ->where('ESTADO', 'disponible')
                        ->where('CANTIDAD_ACTUAL', '>=', $cantidad)
                        ->orderBy('FECHA_CADUCIDAD', 'asc')
                        ->first();
        
        // Si no hay lote disponible con stock suficiente, se omite este insumo
        // y el proceso continúa con el resto (no se crean lotes ficticios)
        if (!$lote) {
            \Log::info("⏭️ Omitiendo '{$nombreInsumo}' por falta de stock disponible");

            return [
                'success' => false,
                'message' => "'{$nombreInsumo}' no se agregó: no hay stock disponible"
            ];
        }
        
        // Crear el registro de uso
        $estudioInsumo = EstudioInsumo::create([
            'ID_ESTUDIO' => $estudio->ID,
            'ID_INSUMO_LOTE' => $lote->ID,
            'CANTIDAD' => $cantidad,
            'ID_USUARIO' => auth()->user()->ID_USUARIO ?? null,
            'NOTAS' => 'Agregado por plantilla' . (isset($lotesCreados) ? ' (lote auto-creado)' : '')
        ]);
        
        // Actualizar stock del lote
        $lote->decrement('CANTIDAD_ACTUAL', $cantidad);

        \App\Models\LoteMovimiento::registrar(
            idInsumo:  $insumo->ID,
            idLote:    $lote->ID,
            tipo:      \App\Models\LoteMovimiento::TIPO_RETIRO,
            cantidad:  $cantidad,
            motivo:    "Uso por plantilla en estudio {$estudio->CLAVE_INTERNA}",
            idEstudio: $estudio->ID,
            idUsuario: auth()->user()->ID_USUARIO ?? auth()->id(),
        );
        
        $resultado = [
            'success' => true,
            'insumo' => [
                'nombre' => $insumo->NOMBRE,
                'lote' => $lote->LOTE,
                'cantidad' => $cantidad,
                'stock_restante' => $lote->CANTIDAD_ACTUAL
            ]
        ];
        
        // Si se creó un lote nuevo, incluir esa información
        if (str_starts_with($lote->LOTE, 'AUTO-')) {
            $resultado['lote_creado'] = [
                'lote' => $lote->LOTE,
                'cantidad_inicial' => $lote->CANTIDAD_INICIAL + $cantidad // La que tenía + la que se usó
            ];
        }
        
        return $resultado;
    }
    
    private function validarDisponibilidadInsumo($nombreInsumo, $cantidadRequerida)
    {
        $insumo = Insumo::where('NOMBRE', 'LIKE', "%{$nombreInsumo}%")
                        ->where('ESTADO', 'activo')
                        ->first();
        
        if (!$insumo) {
            return [
                'disponible' => false,
                'stock_actual' => 0,
                'mensaje' => 'Insumo no encontrado'
            ];
        }
        
        $stockTotal = InsumoLote::where('ID_INSUMO', $insumo->ID)
                               ->where('ESTADO', 'disponible')
                               ->sum('CANTIDAD_ACTUAL');
        
        return [
            'disponible' => $stockTotal >= $cantidadRequerida,
            'stock_actual' => $stockTotal,
            'mensaje' => $stockTotal >= $cantidadRequerida 
                ? 'Stock suficiente' 
                : "Stock insuficiente (disponible: {$stockTotal}, requerido: {$cantidadRequerida})"
        ];
    }
}