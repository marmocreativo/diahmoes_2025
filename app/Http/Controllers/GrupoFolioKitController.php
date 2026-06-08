<?php

namespace App\Http\Controllers;

use App\Models\GrupoFolioKit;
use App\Models\FolioKit;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GrupoFolioKitController extends Controller
{
    public function index(Request $request)
    {
        $query = GrupoFolioKit::with(['medico', 'folios']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhereHas('medico', function ($qm) use ($search) {
                      $qm->where('USUARIO_NOMBRE', 'like', "%{$search}%")
                         ->orWhere('USUARIO_APELLIDOS', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('sort')) {
            $direction = $request->direction === 'desc' ? 'desc' : 'asc';
            $query->orderBy($request->sort, $direction);
        } else {
            $query->orderByDesc('created_at');
        }

        $grupos = $query->paginate(20)->withQueryString();

        // Formatear para la vista
        $grupos->getCollection()->transform(function ($grupo) {
            return [
                'id'          => $grupo->id,
                'nombre'      => $grupo->nombre,
                'fecha_envio' => $grupo->fecha_envio?->format('Y-m-d'),
                'medico'      => $grupo->medico ? [
                    'id'     => $grupo->medico->ID_USUARIO,
                    'nombre' => trim(($grupo->medico->PREFIJO ?? '') . ' ' . $grupo->medico->USUARIO_NOMBRE . ' ' . $grupo->medico->USUARIO_APELLIDOS),
                ] : null,
                'estadisticas' => $grupo->estadisticas,
            ];
        });

        $medicos = Usuario::where('USUARIO_TIPO', 'medico')
            ->where('USUARIO_ESTADO', 1)
            ->orderBy('USUARIO_APELLIDOS')
            ->get(['ID_USUARIO', 'PREFIJO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS'])
            ->map(fn($m) => [
                'id'     => $m->ID_USUARIO,
                'nombre' => trim(($m->PREFIJO ?? '') . ' ' . $m->USUARIO_NOMBRE . ' ' . $m->USUARIO_APELLIDOS),
            ]);

        return Inertia::render('FoliosKits/GruposIndex', [
            'grupos'   => $grupos,
            'medicos'  => $medicos,
            'filters'  => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        $medicos = Usuario::where('USUARIO_TIPO', 'medico')
            ->where('USUARIO_ESTADO', 1)
            ->orderBy('USUARIO_APELLIDOS')
            ->get(['ID_USUARIO', 'PREFIJO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS'])
            ->map(fn($m) => [
                'id'     => $m->ID_USUARIO,
                'nombre' => trim(($m->PREFIJO ?? '') . ' ' . $m->USUARIO_NOMBRE . ' ' . $m->USUARIO_APELLIDOS),
            ]);

        return Inertia::render('FoliosKits/GruposCreate', [
            'medicos' => $medicos,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'      => 'required|string|max:255',
            'id_medico'   => 'nullable|exists:usuarios,ID_USUARIO',
            'fecha_envio' => 'nullable|date',
            'folios'                  => 'nullable|array',
            'folios.*.folio'          => 'required|string|max:100',
            'folios.*.fecha_caducidad'=> 'nullable|date',
        ]);

        $grupo = GrupoFolioKit::create([
            'nombre'      => $validated['nombre'],
            'id_medico'   => $validated['id_medico'] ?? null,
            'fecha_envio' => $validated['fecha_envio'] ?? null,
        ]);

        // Crear folios si se proporcionaron
        if (!empty($validated['folios'])) {
            foreach ($validated['folios'] as $item) {
                $folio = trim($item['folio']);
                if ($folio === '') continue;

                if (!FolioKit::where('folio', $folio)->exists()) {
                    FolioKit::create([
                        'folio'           => $folio,
                        'id_grupo'        => $grupo->id,
                        'estado'          => 'en_inventario',
                        'fecha_caducidad' => $item['fecha_caducidad'] ?? null,
                    ]);
                }
            }
        }

        return redirect()->route('grupos-folios-kits.index')
            ->with('success', 'Grupo creado correctamente.');
    }

    public function show(GrupoFolioKit $grupoFolioKit)
    {
        $grupoFolioKit->load(['medico', 'folios.estudio']);

        return Inertia::render('FoliosKits/GruposShow', [
            'grupo' => [
                'id'          => $grupoFolioKit->id,
                'nombre'      => $grupoFolioKit->nombre,
                'fecha_envio' => $grupoFolioKit->fecha_envio?->format('Y-m-d'),
                'medico'      => $grupoFolioKit->medico ? [
                    'id'     => $grupoFolioKit->medico->ID_USUARIO,
                    'nombre' => trim(($grupoFolioKit->medico->PREFIJO ?? '') . ' ' . $grupoFolioKit->medico->USUARIO_NOMBRE . ' ' . $grupoFolioKit->medico->USUARIO_APELLIDOS),
                ] : null,
                'folios' => $grupoFolioKit->folios->map(fn($f) => [
                    'id'              => $f->id,
                    'folio'           => $f->folio,
                    'estado'          => $f->estado,
                    'fecha_caducidad' => $f->fecha_caducidad?->format('Y-m-d'),
                    'id_estudio'      => $f->id_estudio,
                    'estudio'         => $f->estudio ? [
                        'id'            => $f->estudio->ID,
                        'clave_interna' => $f->estudio->CLAVE_INTERNA,
                    ] : null,
                ]),
                'estadisticas' => $grupoFolioKit->estadisticas,
            ],
        ]);
    }

    public function edit(GrupoFolioKit $grupoFolioKit)
    {
        $medicos = Usuario::where('USUARIO_TIPO', 'medico')
            ->where('USUARIO_ESTADO', 1)
            ->orderBy('USUARIO_APELLIDOS')
            ->get(['ID_USUARIO', 'PREFIJO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS'])
            ->map(fn($m) => [
                'id'     => $m->ID_USUARIO,
                'nombre' => trim(($m->PREFIJO ?? '') . ' ' . $m->USUARIO_NOMBRE . ' ' . $m->USUARIO_APELLIDOS),
            ]);

        return Inertia::render('FoliosKits/GruposEdit', [
            'grupo'   => [
                'id'          => $grupoFolioKit->id,
                'nombre'      => $grupoFolioKit->nombre,
                'id_medico'   => $grupoFolioKit->id_medico,
                'fecha_envio' => $grupoFolioKit->fecha_envio?->format('Y-m-d'),
            ],
            'medicos' => $medicos,
        ]);
    }

    public function update(Request $request, GrupoFolioKit $grupoFolioKit)
    {
        $validated = $request->validate([
            'nombre'      => 'required|string|max:255',
            'id_medico'   => 'nullable|exists:usuarios,ID_USUARIO',
            'fecha_envio' => 'nullable|date',
        ]);

        $grupoFolioKit->update($validated);

        return redirect()->route('grupos-folios-kits.index')
            ->with('success', 'Grupo actualizado correctamente.');
    }

    public function destroy(GrupoFolioKit $grupoFolioKit)
    {
        // Los folios quedan con id_grupo = null por nullOnDelete
        $grupoFolioKit->delete();

        return redirect()->route('grupos-folios-kits.index')
            ->with('success', 'Grupo eliminado correctamente.');
    }
}