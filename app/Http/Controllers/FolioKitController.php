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
}