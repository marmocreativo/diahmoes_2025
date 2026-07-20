<?php

namespace App\Http\Controllers;

use App\Models\FolioKit;
use App\Models\GrupoFolioKit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FolioKitController extends Controller
{
    public function index(Request $request)
    {
        $query = FolioKit::with(['grupo', 'estudio']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('folio', 'like', "%{$search}%")
                  ->orWhereHas('grupo', fn($qg) => $qg->where('nombre', 'like', "%{$search}%"))
                  ->orWhereHas('estudio', fn($qe) => $qe->where('CLAVE_INTERNA', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('id_grupo')) {
            $query->where('id_grupo', $request->id_grupo);
        }

        if ($request->filled('sort')) {
            $direction = $request->direction === 'desc' ? 'desc' : 'asc';
            $query->orderBy($request->sort, $direction);
        } else {
            $query->orderByDesc('created_at');
        }

        $folios = $query->paginate(25)->withQueryString();

        $folios->getCollection()->transform(function ($f) {
            return [
                'id'              => $f->id,
                'folio'           => $f->folio,
                'estado'          => $f->estado,
                'id_grupo'        => $f->id_grupo,
                'id_estudio'      => $f->id_estudio,
                'fecha_caducidad' => $f->fecha_caducidad?->format('Y-m-d'),
                'grupo'           => $f->grupo ? ['id' => $f->grupo->id, 'nombre' => $f->grupo->nombre] : null,
                'estudio'         => $f->estudio ? ['id' => $f->estudio->ID, 'clave_interna' => $f->estudio->CLAVE_INTERNA] : null,
                'created_at'      => $f->created_at?->format('Y-m-d'),
            ];
        });

        $grupos = GrupoFolioKit::orderBy('nombre')->get(['id', 'nombre']);

        return Inertia::render('FoliosKits/FoliosIndex', [
            'folios'  => $folios,
            'grupos'  => $grupos,
            'filters' => $request->only(['search', 'estado', 'id_grupo', 'sort', 'direction']),
            'estados' => ['en_inventario', 'enviado', 'retornado', 'caducado'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'folio'      => 'required|string|max:100|unique:folios_kits,folio',
            'id_grupo'   => 'nullable|exists:grupos_folios_kits,id',
            'id_estudio' => 'nullable|exists:estudios,ID',
            'estado'    => 'required|in:en_inventario,enviado,retornado,caducado',
            'fecha_caducidad' => 'nullable|date',
        ]);

        FolioKit::create($validated);

        return back()->with('success', 'Folio creado correctamente.');
    }

    public function update(Request $request, FolioKit $folioKit)
    {
        $validated = $request->validate([
            'folio'      => "required|string|max:100|unique:folios_kits,folio,{$folioKit->id}",
            'id_grupo'   => 'nullable|exists:grupos_folios_kits,id',
            'id_estudio' => 'nullable|exists:estudios,ID',
            'estado' => 'required|in:en_inventario,enviado,retornado,caducado',
            'fecha_caducidad' => 'nullable|date',
        ]);

        $folioKit->update($validated);

        return back()->with('success', 'Folio actualizado correctamente.');
    }

    public function updateEstado(Request $request, FolioKit $folioKit)
    {
        $validated = $request->validate([
            'estado' => 'required|in:en_inventario,enviado,retornado,caducado',
        ]);

        $folioKit->update(['estado' => $validated['estado']]);

        return back()->with('success', 'Estado actualizado.');
    }

    public function destroy(FolioKit $folioKit)
    {
        $folioKit->delete();

        return back()->with('success', 'Folio eliminado correctamente.');
    }

    public function buscar(Request $request)
    {
        $folio = $request->get('folio', '');

        if (!$folio) {
            return response()->json(['encontrado' => false]);
        }

        $folioKit = FolioKit::where('folio', $folio)->first();

        if (!$folioKit) {
            return response()->json(['encontrado' => false]);
        }

        return response()->json([
            'encontrado'      => true,
            'id'              => $folioKit->id,
            'folio'           => $folioKit->folio,
            'estado'          => $folioKit->estado,
            'fecha_caducidad' => $folioKit->fecha_caducidad?->format('Y-m-d'),
            'id_estudio'      => $folioKit->id_estudio,
            'ya_asignado'     => $folioKit->id_estudio !== null,
        ]);
    }

    public function confirmar(Request $request, FolioKit $folioKit)
    {
        $validated = $request->validate([
            'id_estudio' => 'required|exists:estudios,ID',
        ]);

        $folioKit->update([
            'id_estudio' => $validated['id_estudio'],
            'estado'     => 'retornado',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Folio confirmado correctamente.',
        ]);
    }

    public function bulkUpdateEstado(Request $request)
    {
        $validated = $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer|exists:folios_kits,id',
            'estado' => 'required|in:en_inventario,enviado,retornado,caducado',
        ]);

        FolioKit::whereIn('id', $validated['ids'])
            ->update(['estado' => $validated['estado']]);

        return back()->with('success', count($validated['ids']) . ' folio(s) actualizados.');
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:folios_kits,id',
        ]);

        FolioKit::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', count($validated['ids']) . ' folio(s) eliminados.');
    }

    /**
     * Vincular automáticamente folios_kits sin id_estudio (o sin estado "retornado")
     * buscando coincidencia en estudios.MUESTRA_FOLIO_KIT_BL
     */
    public function vincularEstudios()
    {
        \Log::info('🔧 Iniciando vinculación automática de folios kits con estudios');

        try {
            set_time_limit(300);

            $reporte = [
                'folios_revisados' => 0,
                'folios_vinculados' => 0,
                'folios_estado_corregido' => 0,
                'folios_sin_coincidencia' => 0,
                'duplicados' => [],
            ];

            // Revisar folios que NO tienen estudio asignado, O que sí lo tienen pero no están "retornado"
            $folios = FolioKit::where(function ($q) {
                    $q->whereNull('id_estudio')
                      ->orWhere('estado', '!=', 'retornado');
                })
                ->whereNotNull('folio')
                ->where('folio', '!=', '')
                ->get();

            $reporte['folios_revisados'] = $folios->count();

            \Log::info("📊 Folios a revisar: {$reporte['folios_revisados']}");

            foreach ($folios as $folioKit) {

                // Caso 1: ya tiene id_estudio asignado, solo falta corregir el estado
                if ($folioKit->id_estudio !== null) {
                    $folioKit->update(['estado' => 'retornado']);
                    $reporte['folios_estado_corregido']++;

                    \Log::info("🔄 Folio '{$folioKit->folio}' ya vinculado a estudio ID {$folioKit->id_estudio}, estado corregido a 'retornado'");
                    continue;
                }

                // Caso 2: no tiene id_estudio, buscar coincidencia
                $estudiosCoincidentes = \App\Models\Estudio::where('MUESTRA_FOLIO_KIT_BL', $folioKit->folio)
                    ->orderBy('ID', 'asc')
                    ->get(['ID', 'CLAVE_INTERNA']);

                if ($estudiosCoincidentes->isEmpty()) {
                    $reporte['folios_sin_coincidencia']++;
                    continue;
                }

                // Tomar el primero
                $estudioAsignado = $estudiosCoincidentes->first();

                $folioKit->update([
                    'id_estudio' => $estudioAsignado->ID,
                    'estado' => 'retornado',
                ]);
                $reporte['folios_vinculados']++;

                \Log::info("✅ Folio '{$folioKit->folio}' vinculado a estudio {$estudioAsignado->CLAVE_INTERNA} (ID: {$estudioAsignado->ID})");

                // Si hay más de un estudio con el mismo folio, registrar el conflicto
                if ($estudiosCoincidentes->count() > 1) {
                    $reporte['duplicados'][] = [
                        'folio' => $folioKit->folio,
                        'id_folio_kit' => $folioKit->id,
                        'estudio_asignado' => [
                            'id' => $estudioAsignado->ID,
                            'clave_interna' => $estudioAsignado->CLAVE_INTERNA,
                        ],
                        'estudios_ignorados' => $estudiosCoincidentes->skip(1)->map(function ($e) {
                            return ['id' => $e->ID, 'clave_interna' => $e->CLAVE_INTERNA];
                        })->values(),
                    ];

                    \Log::warning("⚠️ Folio '{$folioKit->folio}' duplicado en " . $estudiosCoincidentes->count() . " estudios");
                }
            }

            $reporte['total_duplicados'] = count($reporte['duplicados']);

            \Log::info('🎉 Vinculación completada', $reporte);

            return response()->json([
                'success' => true,
                'message' => 'Vinculación de folios kits completada exitosamente',
                'reporte' => $reporte,
            ]);

        } catch (\Exception $e) {
            \Log::error('❌ Error crítico en vinculación de folios kits: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error durante la vinculación: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Exportar folios kits a Excel
     */
    public function exportarExcel(Request $request)
    {
        $query = FolioKit::with(['grupo', 'estudio']);

        // Reutilizar los mismos filtros que el index
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('folio', 'like', "%{$search}%")
                  ->orWhereHas('grupo', fn($qg) => $qg->where('nombre', 'like', "%{$search}%"))
                  ->orWhereHas('estudio', fn($qe) => $qe->where('CLAVE_INTERNA', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('id_grupo')) {
            $query->where('id_grupo', $request->id_grupo);
        }

        $folios = $query->orderBy('folio')->get();

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Folios Kits');

        // Encabezados
        $headers = ['Folio', 'Grupo', 'Estado', 'Estudio Vinculado', 'Clave Interna', 'Fecha Caducidad', 'Fecha Registro'];
        $sheet->fromArray($headers, null, 'A1');

        // Estilo del encabezado
        $sheet->getStyle('A1:G1')->getFont()->setBold(true);
        $sheet->getStyle('A1:G1')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setRGB('189BAF');
        $sheet->getStyle('A1:G1')->getFont()->getColor()
            ->setRGB('FFFFFF');

        // Datos
        $fila = 2;
        foreach ($folios as $folio) {
            $sheet->setCellValue("A{$fila}", $folio->folio);
            $sheet->setCellValue("B{$fila}", $folio->grupo->nombre ?? 'Sin grupo');
            $sheet->setCellValue("C{$fila}", ucfirst(str_replace('_', ' ', $folio->estado)));
            $sheet->setCellValue("D{$fila}", $folio->estudio ? 'Sí' : 'No');
            $sheet->setCellValue("E{$fila}", $folio->estudio->CLAVE_INTERNA ?? '');
            $sheet->setCellValue("F{$fila}", $folio->fecha_caducidad?->format('d/m/Y') ?? '');
            $sheet->setCellValue("G{$fila}", $folio->created_at?->format('d/m/Y H:i') ?? '');
            $fila++;
        }

        // Autoajustar columnas
        foreach (range('A', 'G') as $columna) {
            $sheet->getColumnDimension($columna)->setAutoSize(true);
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);

        $nombreArchivo = 'Folios_Kits_' . now()->format('Y-m-d_His') . '.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $nombreArchivo, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}