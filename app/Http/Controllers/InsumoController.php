<?php

namespace App\Http\Controllers;

use App\Models\Insumo;
use App\Models\InsumoLote;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsumoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Insumo::query();
        
        // Búsqueda global
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('NOMBRE', 'like', "%{$search}%")
                  ->orWhere('DESCRIPCION', 'like', "%{$search}%");
            });
        }
        
        // Filtro por estado
        if ($request->filled('estado')) {
            $query->where('ESTADO', $request->get('estado'));
        }
        
        // Filtro por stock bajo
        if ($request->filled('stock_bajo') && $request->stock_bajo === 'true') {
            $query->stockBajo();
        }
        
        // Cargar la relación de lotes disponibles para calcular stock
        $query->with(['lotesDisponibles']);
        
        // Ordenamiento
        $query->orderBy('NOMBRE', 'asc');
        
        $insumos = $query->paginate(20)->withQueryString();
        
        // Agregar stock total a cada insumo
        $insumos->getCollection()->transform(function ($insumo) {
            $insumo->stock_total = $insumo->lotesDisponibles->sum('CANTIDAD_ACTUAL');
            $insumo->stock_bajo = $insumo->stock_total <= $insumo->STOCK_MINIMO;
            return $insumo;
        });
        
        return Inertia::render('insumos/index', [
            'insumos' => $insumos,
            'filters' => $request->only(['search', 'estado', 'stock_bajo']),
            'estados' => Insumo::getEstados(),
            'unidadesMedida' => Insumo::getUnidadesMedida(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('insumos/create', [
            'unidadesMedida' => Insumo::getUnidadesMedida(),
            'estados' => Insumo::getEstados(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        \Log::info('🔴 INICIO store insumo');
        \Log::info('📊 Request completo:', $request->all());
        
        $request->validate([
            'NOMBRE' => 'required|string|max:255',
            'DESCRIPCION' => 'nullable|string',
            'UNIDAD_MEDIDA' => 'required|string|max:50',
            'STOCK_MINIMO' => 'required|integer|min:0',
            'ESTADO' => 'nullable|string|in:activo,inactivo',
        ]);

        \Log::info('✅ Validación exitosa');

        try {
            $insumo = Insumo::create([
                'NOMBRE' => $request->NOMBRE,
                'DESCRIPCION' => $request->DESCRIPCION,
                'UNIDAD_MEDIDA' => $request->UNIDAD_MEDIDA,
                'STOCK_MINIMO' => $request->STOCK_MINIMO,
                'ESTADO' => $request->ESTADO ?? 'activo',
            ]);

            \Log::info('✅ Insumo creado exitosamente con ID: ' . $insumo->ID);

            return redirect()->route('insumos.index')
                ->with('success', 'Insumo creado exitosamente.');

        } catch (\Exception $e) {
            \Log::error('❌ Error al guardar insumo:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ]);
            throw $e;
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Insumo $insumo)
    {
        \Log::info('=== MOSTRANDO DETALLE DE INSUMO ===');
        \Log::info('Insumo ID: ' . $insumo->ID);
        
        // Cargar lotes con información de usos y estudios
        $insumo->load([
            'lotes' => function($query) {
                $query->orderBy('FECHA_CADUCIDAD', 'asc');
            },
            'lotes.usos' => function($query) {
                $query->with(['estudio', 'usuario'])->orderBy('created_at', 'desc');
            }
        ]);
        
        // Calcular estadísticas
        $stockTotal = $insumo->lotes->sum('CANTIDAD_ACTUAL');
        $stockInicial = $insumo->lotes->sum('CANTIDAD_INICIAL');
        $stockUsado = $stockInicial - $stockTotal;
        $porcentajeUsado = $stockInicial > 0 ? round(($stockUsado / $stockInicial) * 100, 2) : 0;
        
        // Obtener estudios que han usado este insumo
        $estudiosConInsumo = \DB::table('estudios_insumos')
            ->join('estudios', 'estudios_insumos.ID_ESTUDIO', '=', 'estudios.ID')
            ->join('insumos_lotes', 'estudios_insumos.ID_INSUMO_LOTE', '=', 'insumos_lotes.ID')
            ->where('insumos_lotes.ID_INSUMO', $insumo->ID)
            ->select(
                'estudios.ID',
                'estudios.CLAVE_INTERNA',
                'estudios.MUESTRA_INICIALES',
                'estudios.ESTUDIO_ESTADO',
                'estudios_insumos.CANTIDAD',
                'estudios_insumos.created_at as FECHA_USO',
                'insumos_lotes.LOTE as NUMERO_LOTE'
            )
            ->orderBy('estudios_insumos.created_at', 'desc')
            ->get();
        
        // Formatear lotes con información adicional
        $lotesFormateados = $insumo->lotes->map(function($lote) {
            return [
                'ID' => $lote->ID,
                'LOTE' => $lote->LOTE,
                'CANTIDAD_INICIAL' => $lote->CANTIDAD_INICIAL,
                'CANTIDAD_ACTUAL' => $lote->CANTIDAD_ACTUAL,
                'CANTIDAD_USADA' => $lote->CANTIDAD_INICIAL - $lote->CANTIDAD_ACTUAL,
                'PORCENTAJE_USADO' => $lote->CANTIDAD_INICIAL > 0 
                    ? round((($lote->CANTIDAD_INICIAL - $lote->CANTIDAD_ACTUAL) / $lote->CANTIDAD_INICIAL) * 100, 2) 
                    : 0,
                'FECHA_INGRESO' => $lote->FECHA_INGRESO,
                'FECHA_CADUCIDAD' => $lote->FECHA_CADUCIDAD,
                'ESTADO' => $lote->ESTADO,
                'estado_formateado' => $lote->estado_formateado,
                'esta_vencido' => $lote->esta_vencido,
                'proximo_vencer' => $lote->proximo_vencer,
                'dias_para_vencer' => $lote->dias_para_vencer,
                'usos_count' => $lote->usos->count(),
            ];
        });
        
        // Estadísticas por mes
        $usosPorMes = \DB::table('estudios_insumos')
            ->join('insumos_lotes', 'estudios_insumos.ID_INSUMO_LOTE', '=', 'insumos_lotes.ID')
            ->where('insumos_lotes.ID_INSUMO', $insumo->ID)
            ->selectRaw('
                DATE_FORMAT(estudios_insumos.created_at, "%Y-%m") as mes,
                SUM(estudios_insumos.CANTIDAD) as cantidad_usada,
                COUNT(DISTINCT estudios_insumos.ID_ESTUDIO) as total_estudios
            ')
            ->groupBy('mes')
            ->orderBy('mes', 'desc')
            ->limit(12)
            ->get();
        
        \Log::info('Estadísticas calculadas:', [
            'stock_total' => $stockTotal,
            'stock_usado' => $stockUsado,
            'total_estudios' => $estudiosConInsumo->count(),
            'total_lotes' => $insumo->lotes->count()
        ]);
        
        return Inertia::render('insumos/show', [
            'insumo' => [
                'ID' => $insumo->ID,
                'NOMBRE' => $insumo->NOMBRE,
                'DESCRIPCION' => $insumo->DESCRIPCION,
                'UNIDAD_MEDIDA' => $insumo->UNIDAD_MEDIDA,
                'STOCK_MINIMO' => $insumo->STOCK_MINIMO,
                'COSTO_UNITARIO' => $insumo->COSTO_UNITARIO,
                'ESTADO' => $insumo->ESTADO,
            ],
            'lotes' => $lotesFormateados,
            'estudios' => $estudiosConInsumo,
            'estadisticas' => [
                'stock_total' => $stockTotal,
                'stock_inicial' => $stockInicial,
                'stock_usado' => $stockUsado,
                'porcentaje_usado' => $porcentajeUsado,
                'stock_minimo' => $insumo->STOCK_MINIMO,
                'stock_bajo' => $stockTotal <= $insumo->STOCK_MINIMO,
                'total_lotes' => $insumo->lotes->count(),
                'lotes_disponibles' => $insumo->lotes->where('ESTADO', 'disponible')->count(),
                'lotes_agotados' => $insumo->lotes->where('ESTADO', 'agotado')->count(),
                'lotes_vencidos' => $insumo->lotes->where('ESTADO', 'vencido')->count(),
                'total_estudios' => $estudiosConInsumo->count(),
                'costo_total_inventario' => $stockTotal * ($insumo->COSTO_UNITARIO ?? 0),
            ],
            'usosPorMes' => $usosPorMes,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Insumo $insumo)
    {
        return Inertia::render('insumos/edit', [
            'insumo' => $insumo,
            'unidadesMedida' => Insumo::getUnidadesMedida(),
            'estados' => Insumo::getEstados(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Insumo $insumo)
    {
        \Log::info('🔴 Actualizando insumo ID: ' . $insumo->ID);
        \Log::info('📊 Request data:', $request->all());

        $request->validate([
            'NOMBRE' => 'required|string|max:255',
            'DESCRIPCION' => 'nullable|string',
            'UNIDAD_MEDIDA' => 'required|string|max:50',
            'STOCK_MINIMO' => 'required|integer|min:0',
            'ESTADO' => 'nullable|string|in:activo,inactivo',
        ]);

        try {
            $insumo->update([
                'NOMBRE' => $request->NOMBRE,
                'DESCRIPCION' => $request->DESCRIPCION,
                'UNIDAD_MEDIDA' => $request->UNIDAD_MEDIDA,
                'STOCK_MINIMO' => $request->STOCK_MINIMO,
                'ESTADO' => $request->ESTADO ?? $insumo->ESTADO,
            ]);

            \Log::info('✅ Insumo actualizado exitosamente');

            return redirect()->route('insumos.index')
                ->with('success', 'Insumo actualizado exitosamente.');

        } catch (\Exception $e) {
            \Log::error('❌ Error actualizando insumo:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ]);
            throw $e;
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Insumo $insumo)
    {
        try {
            // Verificar si tiene lotes asociados
            if ($insumo->lotes()->count() > 0) {
                return back()->withErrors([
                    'delete' => 'No se puede eliminar el insumo porque tiene lotes asociados.'
                ]);
            }

            $insumo->delete();
            
            return redirect()->route('insumos.index')
                ->with('success', 'Insumo eliminado exitosamente.');

        } catch (\Exception $e) {
            \Log::error('❌ Error eliminando insumo:', [
                'insumo_id' => $insumo->ID,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors([
                'delete' => 'Error al eliminar el insumo: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener insumos disponibles para un formulario
     */
    public function getDisponibles()
    {
        $insumos = Insumo::activos()
            ->with('lotesDisponibles')
            ->get()
            ->map(function($insumo) {
                return [
                    'ID' => $insumo->ID,
                    'NOMBRE' => $insumo->NOMBRE,
                    'UNIDAD_MEDIDA' => $insumo->UNIDAD_MEDIDA,
                    'STOCK_TOTAL' => $insumo->lotesDisponibles->sum('CANTIDAD_ACTUAL'),
                    'STOCK_MINIMO' => $insumo->STOCK_MINIMO,
                ];
            });

        return response()->json([
            'success' => true,
            'insumos' => $insumos
        ]);
    }
}