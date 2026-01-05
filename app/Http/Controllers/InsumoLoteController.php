<?php

namespace App\Http\Controllers;

use App\Models\Insumo;
use App\Models\InsumoLote;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsumoLoteController extends Controller
{
    /**
     * Display a listing of lotes for a specific insumo.
     */
    public function index(Request $request, Insumo $insumo)
    {
        $query = $insumo->lotes();
        
        // Búsqueda por lote
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('LOTE', 'like', "%{$search}%")
                ->orWhere('NOTAS', 'like', "%{$search}%"); // CAMBIADO de PROVEEDOR a NOTAS
            });
        }
        
        // Filtro por estado
        if ($request->filled('estado')) {
            $query->where('ESTADO', $request->get('estado'));
        }
        
        // Filtro por próximos a vencer
        if ($request->filled('proximos_vencer') && $request->proximos_vencer === 'true') {
            $query->proximosVencer(30);
        }
        
        // Ordenamiento - FIFO por fecha de caducidad
        $query->orderBy('FECHA_CADUCIDAD', 'asc');
        
        // NO paginar, obtener todos los lotes
        $lotes = $query->get();
        
        // Agregar días para vencer a cada lote
        $lotes->transform(function($lote) {
            if ($lote->FECHA_CADUCIDAD) {
                $lote->dias_para_vencer = now()->diffInDays($lote->FECHA_CADUCIDAD, false);
            }
            return $lote;
        });
        
        return Inertia::render('insumos/lotes/index', [
            'insumo' => $insumo,
            'lotes' => $lotes, // Ahora es un array simple
            'filters' => $request->only(['search', 'estado', 'proximos_vencer']),
            'estados' => InsumoLote::getEstados(),
        ]);
    }

    /**
     * Show the form for creating a new lote.
     */
    public function create(Insumo $insumo)
    {
        return Inertia::render('insumos/lotes/create', [
            'insumo' => $insumo,
            'estados' => InsumoLote::getEstados(),
        ]);
    }

/**
 * Store a newly created lote in storage.
 */
public function store(Request $request, Insumo $insumo)
{
    \Log::info('🔴 INICIO store lote para insumo ID: ' . $insumo->ID);
    \Log::info('📊 Request completo:', $request->all());
    
    $request->validate([
        'LOTE' => 'required|string|max:255',
        'CANTIDAD_INICIAL' => 'required|integer|min:1',
        'FECHA_CADUCIDAD' => 'nullable|date|after:today', // CAMBIADO: nullable en lugar de required
        'COSTO_UNITARIO' => 'nullable|numeric|min:0',
        'NOTAS' => 'nullable|string|max:500',
        'ESTADO' => 'nullable|string|in:disponible,agotado,vencido,proximo_vencer',
    ]);

    \Log::info('✅ Validación exitosa');

    try {
        $lote = InsumoLote::create([
            'ID_INSUMO' => $insumo->ID,
            'LOTE' => $request->LOTE,
            'CANTIDAD_INICIAL' => $request->CANTIDAD_INICIAL,
            'CANTIDAD_ACTUAL' => $request->CANTIDAD_INICIAL, // Inicialmente igual
            'FECHA_CADUCIDAD' => $request->FECHA_CADUCIDAD, // Puede ser null
            'COSTO_UNITARIO' => $request->COSTO_UNITARIO,
            'NOTAS' => $request->NOTAS,
            'ESTADO' => $request->ESTADO ?? 'disponible',
        ]);

        \Log::info('✅ Lote creado exitosamente con ID: ' . $lote->ID);

        return redirect()->route('insumos.lotes.index', $insumo)
            ->with('success', 'Lote agregado exitosamente al inventario.');

    } catch (\Exception $e) {
        \Log::error('❌ Error al guardar lote:', [
            'message' => $e->getMessage(),
            'line' => $e->getLine()
        ]);
        throw $e;
    }
}

    /**
     * Display the specified lote.
     */
    public function show(Insumo $insumo, InsumoLote $lote)
    {
        // Verificar que el lote pertenece al insumo
        if ($lote->ID_INSUMO !== $insumo->ID) {
            abort(404, 'Lote no encontrado para este insumo');
        }
        
        // Cargar usos del lote con información del estudio
        $lote->load(['usos.estudio.medico', 'usos.usuario']);
        
        return Inertia::render('insumos/lotes/show', [
            'insumo' => $insumo,
            'lote' => $lote,
            'usos' => $lote->usos,
            'estadisticas' => [
                'cantidad_inicial' => $lote->CANTIDAD_INICIAL,
                'cantidad_actual' => $lote->CANTIDAD_ACTUAL,
                'cantidad_usada' => $lote->cantidad_usada,
                'porcentaje_usado' => $lote->porcentaje_usado,
                'total_usos' => $lote->usos->count(),
                'costo_total_usado' => $lote->usos->sum('costo_total'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified lote.
     */
    public function edit(Insumo $insumo, InsumoLote $lote)
    {
        // Verificar que el lote pertenece al insumo
        if ($lote->ID_INSUMO !== $insumo->ID) {
            abort(404, 'Lote no encontrado para este insumo');
        }
        
        return Inertia::render('insumos/lotes/edit', [
            'insumo' => $insumo,
            'lote' => $lote,
            'estados' => InsumoLote::getEstados(),
        ]);
    }

/**
 * Update the specified lote in storage.
 */
public function update(Request $request, Insumo $insumo, InsumoLote $lote)
{
    \Log::info('🔴 Actualizando lote ID: ' . $lote->ID);
    \Log::info('📊 Request data:', $request->all());

    // Verificar que el lote pertenece al insumo
    if ($lote->ID_INSUMO !== $insumo->ID) {
        abort(404, 'Lote no encontrado para este insumo');
    }

    $request->validate([
        'LOTE' => 'required|string|max:255',
        'CANTIDAD_INICIAL' => 'required|integer|min:1',
        'FECHA_CADUCIDAD' => 'nullable|date',
        'COSTO_UNITARIO' => 'nullable|numeric|min:0',
        'NOTAS' => 'nullable|string|max:500',
        'ESTADO' => 'nullable|string|in:disponible,agotado,vencido,proximo_vencer',
    ]);

    try {
        // Validar que no se reduzca CANTIDAD_INICIAL por debajo de CANTIDAD_ACTUAL
        if ($request->CANTIDAD_INICIAL < $lote->CANTIDAD_ACTUAL) {
            return back()->withErrors([
                'CANTIDAD_INICIAL' => "No se puede reducir la cantidad inicial por debajo del stock actual ({$lote->CANTIDAD_ACTUAL})"
            ]);
        }

        // NUEVA LÓGICA: Calcular la nueva CANTIDAD_ACTUAL
        $cantidadInicialAnterior = $lote->CANTIDAD_INICIAL;
        $cantidadActualAnterior = $lote->CANTIDAD_ACTUAL;
        $nuevaCantidadInicial = $request->CANTIDAD_INICIAL;
        
        // Calcular cuánto se había usado del lote original
        $cantidadUsada = $cantidadInicialAnterior - $cantidadActualAnterior;
        
        // La nueva cantidad actual = nueva cantidad inicial - cantidad ya usada
        $nuevaCantidadActual = $nuevaCantidadInicial - $cantidadUsada;
        
        \Log::info('🔢 Cálculo de cantidades:', [
            'cantidad_inicial_anterior' => $cantidadInicialAnterior,
            'cantidad_actual_anterior' => $cantidadActualAnterior,
            'cantidad_usada' => $cantidadUsada,
            'nueva_cantidad_inicial' => $nuevaCantidadInicial,
            'nueva_cantidad_actual' => $nuevaCantidadActual
        ]);

        $lote->update([
            'LOTE' => $request->LOTE,
            'CANTIDAD_INICIAL' => $nuevaCantidadInicial,
            'CANTIDAD_ACTUAL' => $nuevaCantidadActual, // CORREGIDO: Ajustar proporcionalmente
            'FECHA_CADUCIDAD' => $request->FECHA_CADUCIDAD,
            'COSTO_UNITARIO' => $request->COSTO_UNITARIO,
            'NOTAS' => $request->NOTAS,
            'ESTADO' => $request->ESTADO ?? $lote->ESTADO,
        ]);

        \Log::info('✅ Lote actualizado exitosamente');

        return redirect()->route('insumos.lotes.index', $insumo)
            ->with('success', 'Lote actualizado exitosamente. Stock ajustado proporcionalmente.');

    } catch (\Exception $e) {
        \Log::error('❌ Error actualizando lote:', [
            'message' => $e->getMessage(),
            'line' => $e->getLine()
        ]);
        throw $e;
    }
}

    /**
     * Remove the specified lote from storage.
     */
    public function destroy(Insumo $insumo, InsumoLote $lote)
    {
        // Verificar que el lote pertenece al insumo
        if ($lote->ID_INSUMO !== $insumo->ID) {
            abort(404, 'Lote no encontrado para este insumo');
        }

        try {
            // Verificar si tiene usos registrados
            if ($lote->usos()->count() > 0) {
                return back()->withErrors([
                    'delete' => 'No se puede eliminar el lote porque tiene usos registrados en estudios.'
                ]);
            }

            $lote->delete();
            
            return redirect()->route('insumos.lotes.index', $insumo)
                ->with('success', 'Lote eliminado exitosamente.');

        } catch (\Exception $e) {
            \Log::error('❌ Error eliminando lote:', [
                'lote_id' => $lote->ID,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors([
                'delete' => 'Error al eliminar el lote: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener lotes disponibles de un insumo para un formulario
     */
    public function getLotesDisponibles(Insumo $insumo)
    {
        $lotes = $insumo->lotesDisponibles()
            ->orderBy('FECHA_CADUCIDAD', 'asc') // FIFO por fecha de caducidad
            ->get()
            ->map(function($lote) {
                return [
                    'ID' => $lote->ID,
                    'LOTE' => $lote->LOTE,
                    'CANTIDAD_ACTUAL' => $lote->CANTIDAD_ACTUAL,
                    'FECHA_CADUCIDAD' => $lote->FECHA_CADUCIDAD,
                    'PROXIMO_VENCER' => $lote->proximo_vencer,
                ];
            });

        return response()->json([
            'success' => true,
            'lotes' => $lotes
        ]);
    }

    /**
     * Ajustar manualmente la cantidad de un lote (para correcciones de inventario)
     */
    public function ajustarCantidad(Request $request, Insumo $insumo, InsumoLote $lote)
    {
        \Log::info('🔧 Ajustando cantidad de lote ID: ' . $lote->ID);

        // Verificar que el lote pertenece al insumo
        if ($lote->ID_INSUMO !== $insumo->ID) {
            abort(404, 'Lote no encontrado para este insumo');
        }

        $request->validate([
            'CANTIDAD_NUEVA' => 'required|integer|min:0',
            'MOTIVO' => 'required|string|max:500',
        ]);

        try {
            $cantidadAnterior = $lote->CANTIDAD_ACTUAL;
            $cantidadNueva = $request->CANTIDAD_NUEVA;

            $lote->update([
                'CANTIDAD_ACTUAL' => $cantidadNueva,
                'ESTADO' => $cantidadNueva <= 0 ? 'agotado' : $lote->ESTADO,
            ]);

            \Log::info('✅ Cantidad ajustada', [
                'lote_id' => $lote->ID,
                'cantidad_anterior' => $cantidadAnterior,
                'cantidad_nueva' => $cantidadNueva,
                'motivo' => $request->MOTIVO,
                'usuario' => auth()->id()
            ]);

            return back()->with('success', "Cantidad ajustada de {$cantidadAnterior} a {$cantidadNueva}.");

        } catch (\Exception $e) {
            \Log::error('❌ Error ajustando cantidad:', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Obtener alertas de inventario (stock bajo y próximos a vencer)
     */
    public function getAlertas()
    {
        // Lotes próximos a vencer (30 días)
        $lotesProximosVencer = InsumoLote::proximosVencer(30)
            ->with('insumo')
            ->get();

        // Insumos con stock bajo
        $insumosStockBajo = Insumo::activos()
            ->stockBajo()
            ->with('lotesDisponibles')
            ->get()
            ->map(function($insumo) {
                return [
                    'insumo' => $insumo,
                    'stock_actual' => $insumo->lotesDisponibles->sum('CANTIDAD_ACTUAL'),
                    'stock_minimo' => $insumo->STOCK_MINIMO,
                ];
            });

        return response()->json([
            'success' => true,
            'alertas' => [
                'lotes_proximos_vencer' => $lotesProximosVencer,
                'insumos_stock_bajo' => $insumosStockBajo,
            ]
        ]);
    }
}