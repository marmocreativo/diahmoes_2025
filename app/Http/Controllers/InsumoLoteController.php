<?php

namespace App\Http\Controllers;

use App\Models\Insumo;
use App\Models\InsumoLote;
use App\Models\LoteMovimiento;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;

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

        \App\Models\LoteMovimiento::registrar(
            idInsumo:  $insumo->ID,
            idLote:    $lote->ID,
            tipo:      \App\Models\LoteMovimiento::TIPO_INGRESO,
            cantidad:  $lote->CANTIDAD_INICIAL,
            motivo:    'Ingreso inicial de lote',
            idUsuario: auth()->user()->ID_USUARIO ?? auth()->id(),
        );

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
            \DB::beginTransaction();

            $totalUsos = $lote->usos()->count();

            \Log::warning('🗑️ ELIMINACIÓN FORZADA DE LOTE CON USOS', [
                'lote_id' => $lote->ID,
                'lote' => $lote->LOTE,
                'insumo_id' => $insumo->ID,
                'total_usos_eliminados' => $totalUsos,
                'usuario' => auth()->user()->ID_USUARIO ?? auth()->id(),
            ]);

            // Eliminar los registros de uso en estudios (estudios_insumos)
            // NOTA: esto NO devuelve cantidad a ningún lado, el lote desaparece por completo
            $lote->usos()->delete();

            // Eliminar movimientos asociados al lote (ingresos/retiros históricos)
            \App\Models\LoteMovimiento::where('ID_LOTE', $lote->ID)->delete();

            // Finalmente eliminar el lote
            $lote->delete();

            \DB::commit();

            $mensaje = $totalUsos > 0
                ? "Lote eliminado exitosamente junto con {$totalUsos} registro(s) de uso en estudios."
                : 'Lote eliminado exitosamente.';

            return redirect()->route('insumos.lotes.index', $insumo)
                ->with('success', $mensaje);

        } catch (\Exception $e) {
            \DB::rollBack();

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

    /**
     * Agregar cantidad a un lote existente
     */
    public function agregarCantidad(Request $request, Insumo $insumo, InsumoLote $lote)
    {
        if ($lote->ID_INSUMO !== $insumo->ID) {
            abort(404, 'Lote no encontrado para este insumo');
        }

        $request->validate([
            'CANTIDAD' => 'required|integer|min:1',
            'MOTIVO'   => 'required|string|max:500',
        ]);

        try {
            \DB::beginTransaction();

            $lote->update([
                'CANTIDAD_INICIAL' => $lote->CANTIDAD_INICIAL + $request->CANTIDAD,
                'CANTIDAD_ACTUAL'  => $lote->CANTIDAD_ACTUAL  + $request->CANTIDAD,
                'ESTADO'           => 'disponible',
            ]);

            \App\Models\LoteMovimiento::registrar(
                idInsumo:  $insumo->ID,
                idLote:    $lote->ID,
                tipo:      \App\Models\LoteMovimiento::TIPO_INGRESO,
                cantidad:  $request->CANTIDAD,
                motivo:    $request->MOTIVO,
                idUsuario: auth()->user()->ID_USUARIO ?? auth()->id(),
            );

            \DB::commit();

            return back()->with('success', "Se agregaron {$request->CANTIDAD} unidades al lote {$lote->LOTE}.");

        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('❌ Error agregando cantidad a lote:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Error al agregar cantidad: ' . $e->getMessage()]);
        }
    }

    /**
     * Retirar cantidad de un lote existente
     */
    public function retirarCantidad(Request $request, Insumo $insumo, InsumoLote $lote)
    {
        if ($lote->ID_INSUMO !== $insumo->ID) {
            abort(404, 'Lote no encontrado para este insumo');
        }

        $request->validate([
            'CANTIDAD' => 'required|integer|min:1',
            'MOTIVO'   => 'required|string|max:500',
        ]);

        if ($request->CANTIDAD > $lote->CANTIDAD_ACTUAL) {
            return back()->withErrors([
                'CANTIDAD' => "No puedes retirar más de lo disponible. Stock actual: {$lote->CANTIDAD_ACTUAL}"
            ]);
        }

        try {
            \DB::beginTransaction();

            $nuevaCantidad = $lote->CANTIDAD_ACTUAL - $request->CANTIDAD;

            $lote->update([
                'CANTIDAD_ACTUAL' => $nuevaCantidad,
                'ESTADO'          => $nuevaCantidad <= 0 ? 'agotado' : $lote->ESTADO,
            ]);

            \App\Models\LoteMovimiento::registrar(
                idInsumo:  $insumo->ID,
                idLote:    $lote->ID,
                tipo:      \App\Models\LoteMovimiento::TIPO_RETIRO,
                cantidad:  $request->CANTIDAD,
                motivo:    $request->MOTIVO,
                idUsuario: auth()->user()->ID_USUARIO ?? auth()->id(),
            );

            \DB::commit();

            return back()->with('success', "Se retiraron {$request->CANTIDAD} unidades del lote {$lote->LOTE}.");

        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('❌ Error retirando cantidad de lote:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Error al retirar cantidad: ' . $e->getMessage()]);
        }
    }

    public function movimientos(Request $request)
    {
        $tipoFiltro   = $request->get('tipo');
        $insumoFiltro = $request->get('id_insumo');
        $loteFiltro   = $request->get('id_lote');

        // Si viene filtrado por lote o insumo y no se especificaron fechas,
        // no limitamos al mes actual: mostramos todo el historial disponible.
        $filtroEspecifico = $insumoFiltro || $loteFiltro;

        $fechaDesde = $request->get(
            'fecha_desde',
            $filtroEspecifico ? '2000-01-01' : Carbon::now()->startOfMonth()->format('Y-m-d')
        );
        $fechaHasta = $request->get('fecha_hasta', Carbon::now()->format('Y-m-d'));

        $query = \App\Models\LoteMovimiento::with(['insumo', 'lote', 'usuario'])
            ->whereBetween('created_at', [$fechaDesde . ' 00:00:00', $fechaHasta . ' 23:59:59']);

        if ($tipoFiltro) {
            $query->where('TIPO', $tipoFiltro);
        }

        if ($insumoFiltro) {
            $query->where('ID_INSUMO', $insumoFiltro);
        }

        if ($loteFiltro) {
            $query->where('ID_LOTE', $loteFiltro);
        }

        $movimientos = $query->orderByDesc('created_at')->paginate(50)->withQueryString();

        $insumos = \App\Models\Insumo::where('ESTADO', 'activo')
            ->orderBy('NOMBRE')
            ->get(['ID', 'NOMBRE']);

        // Info del insumo/lote filtrado, para mostrarlo como contexto en el título
        $insumoActivo = $insumoFiltro
            ? \App\Models\Insumo::find($insumoFiltro, ['ID', 'NOMBRE'])
            : null;

        $loteActivo = $loteFiltro
            ? \App\Models\InsumoLote::find($loteFiltro, ['ID', 'LOTE', 'ID_INSUMO'])
            : null;

        return Inertia::render('insumos/Movimientos', [
            'movimientos'  => $movimientos,
            'insumos'      => $insumos,
            'insumoActivo' => $insumoActivo,
            'loteActivo'   => $loteActivo,
            'filtros'      => [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
                'tipo'        => $tipoFiltro,
                'id_insumo'   => $insumoFiltro,
                'id_lote'     => $loteFiltro,
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // EXPORTAR INVENTARIO ACTUAL A EXCEL
    // -------------------------------------------------------------------------

    public function exportarInventarioExcel(Request $request)
    {
        $query = Insumo::with(['lotes' => function ($q) {
            $q->orderBy('FECHA_CADUCIDAD', 'asc');
        }]);

        if ($request->filled('estado')) {
            $query->where('ESTADO', $request->estado);
        }

        if ($request->filled('stock_bajo') && $request->stock_bajo === 'true') {
            $query->stockBajo();
        }

        $insumos = $query->orderBy('NOMBRE')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Inventario');

        $encabezados = [
            'A1' => 'Insumo', 'B1' => 'Descripción', 'C1' => 'Unidad',
            'D1' => 'Stock Total', 'E1' => 'Stock Mínimo', 'F1' => 'Estado Insumo',
            'G1' => 'Lote', 'H1' => 'Cant. Inicial', 'I1' => 'Cant. Actual',
            'J1' => 'Fecha Caducidad', 'K1' => 'Estado Lote', 'L1' => 'Costo Unitario',
            'M1' => 'Valor Total Lote',
        ];
        foreach ($encabezados as $celda => $texto) {
            $sheet->setCellValue($celda, $texto);
        }

        $row = 2;

        foreach ($insumos as $insumo) {
            $stockTotal = $insumo->lotes->sum('CANTIDAD_ACTUAL');

            if ($insumo->lotes->isEmpty()) {
                $sheet->setCellValue('A' . $row, $insumo->NOMBRE);
                $sheet->setCellValue('B' . $row, $insumo->DESCRIPCION ?? '');
                $sheet->setCellValue('C' . $row, $insumo->UNIDAD_MEDIDA);
                $sheet->setCellValue('D' . $row, $stockTotal);
                $sheet->setCellValue('E' . $row, $insumo->STOCK_MINIMO);
                $sheet->setCellValue('F' . $row, $insumo->ESTADO);
                $sheet->setCellValue('G' . $row, 'Sin lotes');
                $row++;
                continue;
            }

            foreach ($insumo->lotes as $lote) {
                $sheet->setCellValue('A' . $row, $insumo->NOMBRE);
                $sheet->setCellValue('B' . $row, $insumo->DESCRIPCION ?? '');
                $sheet->setCellValue('C' . $row, $insumo->UNIDAD_MEDIDA);
                $sheet->setCellValue('D' . $row, $stockTotal);
                $sheet->setCellValue('E' . $row, $insumo->STOCK_MINIMO);
                $sheet->setCellValue('F' . $row, $insumo->ESTADO);
                $sheet->setCellValue('G' . $row, $lote->LOTE);
                $sheet->setCellValue('H' . $row, $lote->CANTIDAD_INICIAL);
                $sheet->setCellValue('I' . $row, $lote->CANTIDAD_ACTUAL);
                $sheet->setCellValue('J' . $row, $lote->FECHA_CADUCIDAD ? \Carbon\Carbon::parse($lote->FECHA_CADUCIDAD)->format('d/m/Y') : '');
                $sheet->setCellValue('K' . $row, $lote->ESTADO);
                $sheet->setCellValue('L' . $row, $lote->COSTO_UNITARIO ?? 0);
                $sheet->setCellValue('M' . $row, ($lote->COSTO_UNITARIO ?? 0) * $lote->CANTIDAD_ACTUAL);
                $row++;
            }
        }

        $sheet->getStyle('A1:M1')->getFont()->setBold(true);
        $sheet->getStyle('A1:M1')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFE2E8F0');

        foreach (range('A', 'M') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $nombreArchivo = 'inventario_diahmoes_' . now()->format('Y-m-d_His') . '.xlsx';

        return $this->descargarSpreadsheet($spreadsheet, $nombreArchivo);
    }

    // -------------------------------------------------------------------------
    // EXPORTAR MOVIMIENTOS A EXCEL
    // -------------------------------------------------------------------------

    public function exportarMovimientosExcel(Request $request)
{
    $tipoFiltro   = $request->get('tipo');
    $insumoFiltro = $request->get('id_insumo');
    $loteFiltro   = $request->get('id_lote');

    $filtroEspecifico = $insumoFiltro || $loteFiltro;

    $fechaDesde = $request->get(
        'fecha_desde',
        $filtroEspecifico ? '2000-01-01' : Carbon::now()->startOfMonth()->format('Y-m-d')
    );
    $fechaHasta = $request->get('fecha_hasta', Carbon::now()->format('Y-m-d'));

    $query = LoteMovimiento::with(['insumo', 'lote', 'estudio', 'usuario'])
        ->whereBetween('created_at', [$fechaDesde . ' 00:00:00', $fechaHasta . ' 23:59:59']);

    if ($tipoFiltro) {
        $query->where('TIPO', $tipoFiltro);
    }

    if ($insumoFiltro) {
        $query->where('ID_INSUMO', $insumoFiltro);
    }

    if ($loteFiltro) {
        $query->where('ID_LOTE', $loteFiltro);
    }

    $movimientos = $query->orderByDesc('created_at')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Movimientos');

        $encabezados = [
            'A1' => 'Fecha', 'B1' => 'Insumo', 'C1' => 'Lote', 'D1' => 'Tipo',
            'E1' => 'Cantidad', 'F1' => 'Motivo', 'G1' => 'Estudio relacionado',
            'H1' => 'Usuario',
        ];
        foreach ($encabezados as $celda => $texto) {
            $sheet->setCellValue($celda, $texto);
        }

        $row = 2;
        foreach ($movimientos as $mov) {
            $sheet->setCellValue('A' . $row, $mov->created_at?->format('d/m/Y H:i'));
            $sheet->setCellValue('B' . $row, $mov->insumo->NOMBRE ?? '—');
            $sheet->setCellValue('C' . $row, $mov->lote->LOTE ?? '—');
            $sheet->setCellValue('D' . $row, $mov->TIPO === LoteMovimiento::TIPO_INGRESO ? 'Ingreso' : 'Retiro');
            $sheet->setCellValue('E' . $row, $mov->CANTIDAD);
            $sheet->setCellValue('F' . $row, $mov->MOTIVO);
            $sheet->setCellValue('G' . $row, $mov->estudio->CLAVE_INTERNA ?? '');
            $sheet->setCellValue('H' . $row, trim(($mov->usuario->USUARIO_NOMBRE ?? '') . ' ' . ($mov->usuario->USUARIO_APELLIDOS ?? '')) ?: '—');
            $row++;
        }

        $sheet->getStyle('A1:H1')->getFont()->setBold(true);
        $sheet->getStyle('A1:H1')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFE2E8F0');

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $nombreArchivo = 'movimientos_insumos_' . now()->format('Y-m-d_His') . '.xlsx';

        return $this->descargarSpreadsheet($spreadsheet, $nombreArchivo);
    }

    // -------------------------------------------------------------------------
    // HELPER — descarga común de spreadsheet
    // -------------------------------------------------------------------------

    private function descargarSpreadsheet(Spreadsheet $spreadsheet, string $nombreArchivo)
    {
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $nombreArchivo, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}