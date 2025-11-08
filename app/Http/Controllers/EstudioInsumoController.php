<?php

namespace App\Http\Controllers;

use App\Models\Estudio;
use App\Models\Insumo;
use App\Models\InsumoLote;
use App\Models\EstudioInsumo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EstudioInsumoController extends Controller
{
    /**
     * Obtener insumos de un estudio específico
     */
    public function index(Estudio $estudio)
    {
        \Log::info('=== OBTENIENDO INSUMOS DEL ESTUDIO ===');
        \Log::info('Estudio ID: ' . $estudio->ID);
        
        try {
            // Cargar insumos con sus relaciones
            $insumosUsados = $estudio->insumos()
                ->with(['lote.insumo', 'usuario'])
                ->orderBy('created_at', 'desc')
                ->get();

            \Log::info('Insumos encontrados: ' . $insumosUsados->count());

            // Transformar los datos para el frontend
            $insumosFormateados = $insumosUsados->map(function($uso) {
                \Log::info('Formateando insumo:', [
                    'ID' => $uso->ID,
                    'CANTIDAD' => $uso->CANTIDAD,
                    'tiene_lote' => !is_null($uso->lote),
                    'tiene_insumo' => !is_null($uso->lote ? $uso->lote->insumo : null)
                ]);
                
                return [
                    'ID' => $uso->ID,
                    'CANTIDAD' => $uso->CANTIDAD,
                    'costo_total' => $uso->costo_total ?? 0,
                    'nombre_insumo' => $uso->lote && $uso->lote->insumo ? $uso->lote->insumo->NOMBRE : 'Sin nombre',
                    'numero_lote' => $uso->lote ? $uso->lote->LOTE : 'Sin lote',
                    'FECHA_USO' => $uso->created_at ? $uso->created_at->format('Y-m-d H:i:s') : null,
                    'lote' => [
                        'LOTE' => $uso->lote ? $uso->lote->LOTE : null,
                        'insumo' => [
                            'NOMBRE' => $uso->lote && $uso->lote->insumo ? $uso->lote->insumo->NOMBRE : null,
                        ]
                    ]
                ];
            });

            // Calcular costo total
            $costoTotal = $insumosUsados->sum('costo_total');

            \Log::info('Costo total calculado: ' . $costoTotal);
            \Log::info('Datos formateados:', $insumosFormateados->toArray());

            return response()->json([
                'success' => true,
                'insumos' => $insumosFormateados,
                'costo_total' => $costoTotal,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error al obtener insumos del estudio:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener insumos: ' . $e->getMessage(),
                'insumos' => [],
                'costo_total' => 0,
            ], 500);
        }
    }

    /**
     * Agregar un insumo a un estudio
     */
    public function store(Request $request, Estudio $estudio)
    {
        \Log::info('🔴 INICIO agregar insumo a estudio');
        \Log::info('📊 Estudio ID: ' . $estudio->ID);
        \Log::info('📊 Request completo:', $request->all());

        // Validar datos
        try {
            $validated = $request->validate([
                'ID_INSUMO_LOTE' => 'required|integer|exists:insumos_lotes,ID',
                'CANTIDAD' => 'required|integer|min:1',
                'NOTAS' => 'nullable|string|max:500',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ Error de validación:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $e->errors()
            ], 422);
        }

        \Log::info('✅ Validación exitosa');

        try {
            // Buscar el lote
            $lote = InsumoLote::findOrFail($request->ID_INSUMO_LOTE);

            \Log::info('📦 Lote encontrado:', [
                'lote_id' => $lote->ID,
                'lote_numero' => $lote->LOTE,
                'cantidad_actual' => $lote->CANTIDAD_ACTUAL,
                'cantidad_solicitada' => $request->CANTIDAD
            ]);

            // Verificar que haya suficiente stock
            if ($lote->CANTIDAD_ACTUAL < $request->CANTIDAD) {
                \Log::warning('⚠️ Stock insuficiente', [
                    'disponible' => $lote->CANTIDAD_ACTUAL,
                    'solicitado' => $request->CANTIDAD
                ]);

                return response()->json([
                    'success' => false,
                    'message' => "Stock insuficiente. Disponible: {$lote->CANTIDAD_ACTUAL}, Solicitado: {$request->CANTIDAD}"
                ], 400);
            }

            // Verificar que el lote esté disponible
            if ($lote->ESTADO !== InsumoLote::ESTADO_DISPONIBLE) {
                \Log::warning('⚠️ Lote no disponible', [
                    'estado' => $lote->ESTADO
                ]);

                return response()->json([
                    'success' => false,
                    'message' => "El lote seleccionado no está disponible (Estado: {$lote->ESTADO})"
                ], 400);
            }

            // Iniciar transacción
            \DB::beginTransaction();

            try {
                // Crear el registro de uso
                $estudioInsumo = EstudioInsumo::create([
                    'ID_ESTUDIO' => $estudio->ID,
                    'ID_INSUMO_LOTE' => $lote->ID,
                    'CANTIDAD' => $request->CANTIDAD,
                    'ID_USUARIO' => auth()->user()->ID_USUARIO ?? auth()->id(),
                    'NOTAS' => $request->NOTAS,
                ]);

                \Log::info('✅ Insumo agregado al estudio con ID: ' . $estudioInsumo->ID);

                // El descuento del stock se hace automáticamente en el boot() del modelo
                // Recargar el lote para obtener la cantidad actualizada
                $lote->refresh();

                \Log::info('📉 Stock actualizado', [
                    'cantidad_nueva' => $lote->CANTIDAD_ACTUAL,
                    'estado_nuevo' => $lote->ESTADO
                ]);

                // Commit de la transacción
                \DB::commit();

                // Cargar las relaciones para devolver en la respuesta
                $estudioInsumo->load('lote.insumo', 'usuario');

                return response()->json([
                    'success' => true,
                    'message' => 'Insumo agregado exitosamente al estudio',
                    'data' => [
                        'id' => $estudioInsumo->ID,
                        'nombre_insumo' => $estudioInsumo->lote->insumo->NOMBRE,
                        'numero_lote' => $estudioInsumo->lote->LOTE,
                        'cantidad' => $estudioInsumo->CANTIDAD,
                        'costo_total' => $estudioInsumo->costo_total,
                        'stock_restante' => $lote->CANTIDAD_ACTUAL,
                    ]
                ], 200);

            } catch (\Exception $e) {
                \DB::rollBack();
                \Log::error('❌ Error en transacción:', [
                    'message' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => $e->getFile()
                ]);
                throw $e;
            }

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('❌ Lote no encontrado:', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Lote de insumo no encontrado'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('❌ Error al agregar insumo al estudio:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar insumo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar la cantidad o notas de un insumo en un estudio
     */
    public function update(Request $request, Estudio $estudio, EstudioInsumo $estudioInsumo)
    {
        \Log::info('🔴 Actualizando insumo en estudio');
        \Log::info('📊 EstudioInsumo ID: ' . $estudioInsumo->ID);
        \Log::info('📊 Request data:', $request->all());

        // Verificar que el insumo pertenece al estudio
        if ($estudioInsumo->ID_ESTUDIO !== $estudio->ID) {
            abort(404, 'Insumo no encontrado para este estudio');
        }

        $request->validate([
            'NOTAS' => 'nullable|string|max:500',
            // NO permitir cambiar la cantidad una vez registrada
        ]);

        try {
            $estudioInsumo->update([
                'NOTAS' => $request->NOTAS,
            ]);

            \Log::info('✅ Notas actualizadas exitosamente');

            return back()->with('success', 'Información del insumo actualizada.');

        } catch (\Exception $e) {
            \Log::error('❌ Error actualizando insumo en estudio:', [
                'message' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Eliminar un insumo de un estudio (SOLO si no se ha usado aún)
     */
    public function destroy(Estudio $estudio, EstudioInsumo $estudioInsumo)
    {
        \Log::info('🔴 Eliminando insumo de estudio');
        \Log::info('📊 EstudioInsumo ID: ' . $estudioInsumo->ID);

        // Verificar que el insumo pertenece al estudio
        if ($estudioInsumo->ID_ESTUDIO !== $estudio->ID) {
            return response()->json([
                'success' => false,
                'message' => 'Insumo no encontrado para este estudio'
            ], 404);
        }

        try {
            \DB::beginTransaction();

            // Obtener el lote antes de eliminar
            $lote = $estudioInsumo->lote;
            $cantidadADevolver = $estudioInsumo->CANTIDAD;

            // Eliminar el registro
            $estudioInsumo->delete();

            // Devolver la cantidad al lote
            if ($lote) {
                $lote->update([
                    'CANTIDAD_ACTUAL' => $lote->CANTIDAD_ACTUAL + $cantidadADevolver,
                    'ESTADO' => $lote->CANTIDAD_ACTUAL > 0 ? InsumoLote::ESTADO_DISPONIBLE : $lote->ESTADO,
                ]);

                \Log::info('✅ Cantidad devuelta al lote', [
                    'lote_id' => $lote->ID,
                    'cantidad_devuelta' => $cantidadADevolver,
                    'cantidad_nueva' => $lote->CANTIDAD_ACTUAL
                ]);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Insumo eliminado del estudio y cantidad devuelta al inventario'
            ], 200);

        } catch (\Exception $e) {
            \DB::rollBack();
            
            \Log::error('❌ Error eliminando insumo de estudio:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el insumo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener insumos disponibles para agregar a un estudio
     */
    public function getInsumosDisponibles()
    {
        $insumos = Insumo::activos()
            ->with(['lotesDisponibles' => function($query) {
                $query->orderBy('FECHA_CADUCIDAD', 'asc'); // FIFO
            }])
            ->get()
            ->filter(function($insumo) {
                // Solo mostrar insumos que tienen stock disponible
                return $insumo->lotesDisponibles->sum('CANTIDAD_ACTUAL') > 0;
            })
            ->map(function($insumo) {
                return [
                    'ID' => $insumo->ID,
                    'NOMBRE' => $insumo->NOMBRE,
                    'UNIDAD_MEDIDA' => $insumo->UNIDAD_MEDIDA,
                    'STOCK_TOTAL' => $insumo->lotesDisponibles->sum('CANTIDAD_ACTUAL'),
                    'LOTES' => $insumo->lotesDisponibles->map(function($lote) {
                        return [
                            'ID' => $lote->ID,
                            'LOTE' => $lote->LOTE,
                            'CANTIDAD_ACTUAL' => $lote->CANTIDAD_ACTUAL,
                            'FECHA_CADUCIDAD' => $lote->FECHA_CADUCIDAD,
                            'PROXIMO_VENCER' => $lote->proximo_vencer,
                        ];
                    }),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'insumos' => $insumos
        ]);
    }

    /**
     * Obtener reporte de uso de insumos por período
     */
    public function getReporteUso(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'id_insumo' => 'nullable|integer|exists:insumos,ID',
        ]);

        $query = EstudioInsumo::query()
            ->with(['lote.insumo', 'estudio', 'usuario'])
            ->whereBetween('created_at', [
                $request->fecha_inicio,
                $request->fecha_fin . ' 23:59:59'
            ]);

        // Filtrar por insumo si se especifica
        if ($request->filled('id_insumo')) {
            $query->whereHas('lote', function($q) use ($request) {
                $q->where('ID_INSUMO', $request->id_insumo);
            });
        }

        $usos = $query->get();

        // Agrupar por insumo
        $resumenPorInsumo = $usos->groupBy('lote.insumo.ID')->map(function($grupo) {
            $insumo = $grupo->first()->lote->insumo;
            return [
                'insumo' => $insumo->NOMBRE,
                'unidad_medida' => $insumo->UNIDAD_MEDIDA,
                'cantidad_total_usada' => $grupo->sum('CANTIDAD'),
                'total_estudios' => $grupo->count(),
                'costo_total' => $grupo->sum('costo_total'),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'resumen' => [
                'total_usos' => $usos->count(),
                'total_estudios' => $usos->pluck('ID_ESTUDIO')->unique()->count(),
                'costo_total' => $usos->sum('costo_total'),
            ],
            'detalle_por_insumo' => $resumenPorInsumo,
            'usos_detallados' => $usos,
        ]);
    }

    /**
     * Obtener costo de insumos para un estudio específico
     */
    public function getCostoEstudio(Estudio $estudio)
    {
        $insumos = $estudio->insumos()
            ->with('lote.insumo')
            ->get();

        $costoTotal = $insumos->sum('costo_total');

        $detalle = $insumos->map(function($uso) {
            return [
                'insumo' => $uso->lote->insumo->NOMBRE,
                'lote' => $uso->lote->LOTE,
                'cantidad' => $uso->CANTIDAD,
                'costo_unitario' => $uso->lote->COSTO_UNITARIO,
                'costo_total' => $uso->costo_total,
            ];
        });

        return response()->json([
            'success' => true,
            'costo_total' => $costoTotal,
            'detalle' => $detalle,
        ]);
    }

    /**
     * Validar disponibilidad antes de agregar al estudio
     */
    public function validarDisponibilidad(Request $request)
    {
        $request->validate([
            'ID_INSUMO_LOTE' => 'required|integer|exists:insumos_lotes,ID',
            'CANTIDAD' => 'required|integer|min:1',
        ]);

        try {
            $lote = InsumoLote::with('insumo')->findOrFail($request->ID_INSUMO_LOTE);

            $disponible = $lote->CANTIDAD_ACTUAL >= $request->CANTIDAD;
            $mensaje = '';

            if (!$disponible) {
                $mensaje = "Stock insuficiente. Disponible: {$lote->CANTIDAD_ACTUAL}, Solicitado: {$request->CANTIDAD}";
            } elseif ($lote->ESTADO !== InsumoLote::ESTADO_DISPONIBLE) {
                $disponible = false;
                $mensaje = "El lote no está disponible (Estado: {$lote->estado_formateado})";
            } elseif ($lote->esta_vencido) {
                $disponible = false;
                $mensaje = "El lote está vencido (Caducidad: {$lote->FECHA_CADUCIDAD})";
            } elseif ($lote->proximo_vencer) {
                $mensaje = "⚠️ Advertencia: El lote está próximo a vencer ({$lote->FECHA_CADUCIDAD})";
            }

            return response()->json([
                'success' => true,
                'disponible' => $disponible,
                'mensaje' => $mensaje,
                'lote' => [
                    'LOTE' => $lote->LOTE,
                    'CANTIDAD_ACTUAL' => $lote->CANTIDAD_ACTUAL,
                    'FECHA_CADUCIDAD' => $lote->FECHA_CADUCIDAD,
                    'ESTADO' => $lote->ESTADO,
                    'insumo' => $lote->insumo->NOMBRE,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al validar disponibilidad: ' . $e->getMessage()
            ], 500);
        }
    }
}