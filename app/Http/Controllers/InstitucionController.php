<?php

namespace App\Http\Controllers;

use App\Models\Institucion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class InstitucionController extends Controller
{
    /**
     * Mostrar lista de instituciones con filtros
     */
    public function index(Request $request)
    {
        $query = Institucion::query();

        // Búsqueda por nombre
        if ($request->filled('buscar')) {
            $buscar = $request->buscar;
            $query->where(function($q) use ($buscar) {
                $q->where('INSTITUCION_NOMBRE', 'like', "%{$buscar}%")
                  ->orWhere('INSTITUCION_RAZON_SOCIAL', 'like', "%{$buscar}%")
                  ->orWhere('INSTITUCION_RFC', 'like', "%{$buscar}%")
                  ->orWhere('INSTITUCION_CORREO', 'like', "%{$buscar}%");
            });
        }

        // Filtro por ciudad
        if ($request->filled('ciudad')) {
            $query->porCiudad($request->ciudad);
        }

        // Filtro por estado
        if ($request->filled('estado')) {
            $query->porEstado($request->estado);
        }

        // Ordenamiento
        $sortField = $request->get('sort', 'FECHA_REGISTRO');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Cargar relaciones y conteos
        $query->withCount(['usuarios', 'estudios']);

        // Paginación
        $instituciones = $query->paginate(15)->withQueryString();

        // Obtener ciudades y estados únicos para filtros
        $ciudades = Institucion::select('INSTITUCION_CIUDAD')
                              ->distinct()
                              ->orderBy('INSTITUCION_CIUDAD')
                              ->pluck('INSTITUCION_CIUDAD')
                              ->filter()
                              ->values();

        $estados = Institucion::select('INSTITUCION_ESTADO')
                             ->distinct()
                             ->orderBy('INSTITUCION_ESTADO')
                             ->pluck('INSTITUCION_ESTADO')
                             ->filter()
                             ->values();

        return Inertia::render('instituciones/index', [
            'instituciones' => $instituciones,
            'ciudades' => $ciudades,
            'estados' => $estados,
            'estadosMexico' => Institucion::getEstadosMexico(),
            'filtros' => [
                'buscar' => $request->buscar,
                'ciudad' => $request->ciudad,
                'estado' => $request->estado,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ]
        ]);
    }

    /**
     * Mostrar formulario de creación
     */
    public function create()
    {
        return Inertia::render('instituciones/create', [
            'estadosMexico' => Institucion::getEstadosMexico(),
        ]);
    }

    /**
     * Almacenar nueva institución
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'INSTITUCION_NOMBRE' => 'required|string|max:255',
            'INSTITUCION_CORREO' => 'required|string|email|max:255|unique:instituciones,INSTITUCION_CORREO',
            'INSTITUCION_TELEFONO' => 'required|string|max:255',
            'INSTITUCION_RFC' => 'required|string|max:255|unique:instituciones,INSTITUCION_RFC',
            'INSTITUCION_RAZON_SOCIAL' => 'required|string|max:255',
            'INSTITUCION_DIRECCION' => 'required|string',
            'INSTITUCION_NUMERO_EXT' => 'required|string|max:255',
            'INSTITUCION_NUMERO_INT' => 'nullable|string|max:255',
            'INSTITUCION_COLONIA' => 'required|string|max:255',
            'INSTITUCION_MUNICIPIO' => 'required|string|max:255',
            'INSTITUCION_CIUDAD' => 'required|string|max:255',
            'INSTITUCION_ESTADO' => 'required|string|max:255',
            'INSTITUCION_CODIGO_POSTAL' => 'required|string|max:10',
        ], [
            'INSTITUCION_NOMBRE.required' => 'El nombre de la institución es obligatorio.',
            'INSTITUCION_CORREO.required' => 'El correo electrónico es obligatorio.',
            'INSTITUCION_CORREO.email' => 'El correo electrónico debe ser válido.',
            'INSTITUCION_CORREO.unique' => 'Este correo electrónico ya está registrado.',
            'INSTITUCION_TELEFONO.required' => 'El teléfono es obligatorio.',
            'INSTITUCION_RFC.required' => 'El RFC es obligatorio.',
            'INSTITUCION_RFC.unique' => 'Este RFC ya está registrado.',
            'INSTITUCION_RAZON_SOCIAL.required' => 'La razón social es obligatoria.',
            'INSTITUCION_DIRECCION.required' => 'La dirección es obligatoria.',
            'INSTITUCION_NUMERO_EXT.required' => 'El número exterior es obligatorio.',
            'INSTITUCION_COLONIA.required' => 'La colonia es obligatoria.',
            'INSTITUCION_MUNICIPIO.required' => 'El municipio es obligatorio.',
            'INSTITUCION_CIUDAD.required' => 'La ciudad es obligatoria.',
            'INSTITUCION_ESTADO.required' => 'El estado es obligatorio.',
            'INSTITUCION_CODIGO_POSTAL.required' => 'El código postal es obligatorio.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Validar RFC
        $institucion = new Institucion($request->all());
        if (!$institucion->validarRFC()) {
            return back()->withErrors(['INSTITUCION_RFC' => 'El formato del RFC no es válido.'])->withInput();
        }

        $institucion->FECHA_REGISTRO = now();
        $institucion->save();

        return redirect()->route('instituciones.index')
                        ->with('success', 'Institución creada exitosamente.');
    }

    /**
     * Mostrar detalles de la institución
     */
    public function show(Institucion $institucion)
    {
        // Cargar usuarios activos
        $institucion->load(['usuarios' => function($query) {
            $query->where('USUARIO_ESTADO', 'activo')
                  ->orderBy('USUARIO_NOMBRE');
        }]);

        // Estadísticas adicionales
        $stats = [
            'usuarios_total' => $institucion->usuarios()->count(),
            'usuarios_activos' => $institucion->usuarios()->where('USUARIO_ESTADO', 'activo')->count(),
            'usuarios_por_tipo' => $institucion->usuarios()
                                               ->selectRaw('USUARIO_TIPO, COUNT(*) as count')
                                               ->groupBy('USUARIO_TIPO')
                                               ->pluck('count', 'USUARIO_TIPO'),
            'estudios_total' => $institucion->estudios()->count(),
        ];

        return Inertia::render('instituciones/show', [
            'institucion' => $institucion,
            'stats' => $stats,
        ]);
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit(Institucion $institucion)
    {
        return Inertia::render('instituciones/edit', [
            'institucion' => $institucion,
            'estadosMexico' => Institucion::getEstadosMexico(),
        ]);
    }

    /**
     * Actualizar institución
     */
    public function update(Request $request, Institucion $institucion)
    {
        $validator = Validator::make($request->all(), [
            'INSTITUCION_NOMBRE' => 'required|string|max:255',
            'INSTITUCION_CORREO' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('instituciones', 'INSTITUCION_CORREO')->ignore($institucion->ID_INSTITUCION, 'ID_INSTITUCION')
            ],
            'INSTITUCION_TELEFONO' => 'required|string|max:255',
            'INSTITUCION_RFC' => [
                'required',
                'string',
                'max:255',
                Rule::unique('instituciones', 'INSTITUCION_RFC')->ignore($institucion->ID_INSTITUCION, 'ID_INSTITUCION')
            ],
            'INSTITUCION_RAZON_SOCIAL' => 'required|string|max:255',
            'INSTITUCION_DIRECCION' => 'required|string',
            'INSTITUCION_NUMERO_EXT' => 'required|string|max:255',
            'INSTITUCION_NUMERO_INT' => 'nullable|string|max:255',
            'INSTITUCION_COLONIA' => 'required|string|max:255',
            'INSTITUCION_MUNICIPIO' => 'required|string|max:255',
            'INSTITUCION_CIUDAD' => 'required|string|max:255',
            'INSTITUCION_ESTADO' => 'required|string|max:255',
            'INSTITUCION_CODIGO_POSTAL' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Validar RFC
        $institucionTemp = new Institucion($request->all());
        if (!$institucionTemp->validarRFC()) {
            return back()->withErrors(['INSTITUCION_RFC' => 'El formato del RFC no es válido.'])->withInput();
        }

        $institucion->update($request->all());

        return redirect()->route('instituciones.index')
                        ->with('success', 'Institución actualizada exitosamente.');
    }

    /**
     * Eliminar institución (solo si no tiene usuarios asociados)
     */
    public function destroy(Institucion $institucion)
    {
        // Verificar si tiene usuarios asociados
        if ($institucion->usuarios()->count() > 0) {
            return back()->withErrors(['error' => 'No se puede eliminar la institución porque tiene usuarios asociados.']);
        }

        // Verificar si tiene estudios asociados
        if ($institucion->estudios()->count() > 0) {
            return back()->withErrors(['error' => 'No se puede eliminar la institución porque tiene estudios asociados.']);
        }

        $institucion->delete();

        return redirect()->route('instituciones.index')
                        ->with('success', 'Institución eliminada exitosamente.');
    }

    /**
     * API para obtener instituciones (para selects dinámicos)
     */
    public function getForSelect(Request $request)
    {
        $instituciones = Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE', 'INSTITUCION_CIUDAD', 'INSTITUCION_ESTADO')
                                  ->orderBy('INSTITUCION_NOMBRE')
                                  ->get()
                                  ->map(function ($institucion) {
                                      return [
                                          'id' => $institucion->ID_INSTITUCION,
                                          'nombre' => $institucion->INSTITUCION_NOMBRE,
                                          'ciudad' => $institucion->INSTITUCION_CIUDAD,
                                          'estado' => $institucion->INSTITUCION_ESTADO,
                                          'text' => $institucion->INSTITUCION_NOMBRE . ' - ' . $institucion->INSTITUCION_CIUDAD,
                                      ];
                                  });

        return response()->json($instituciones);
    }

    /**
     * Generar nuevo PIN para la institución
     */
    public function regeneratePin(Institucion $institucion)
    {
        $institucion->INSTITUCION_PIN = Institucion::generateUniquePin();
        $institucion->save();

        return back()->with('success', 'PIN regenerado exitosamente.');
    }

    /**
     * Obtener estadísticas generales de instituciones
     */
    public function stats()
    {
        $stats = [
            'total_instituciones' => Institucion::count(),
            'instituciones_por_estado' => Institucion::selectRaw('INSTITUCION_ESTADO, COUNT(*) as count')
                                                    ->groupBy('INSTITUCION_ESTADO')
                                                    ->orderBy('count', 'desc')
                                                    ->get(),
            'instituciones_con_mas_usuarios' => Institucion::withCount('usuarios')
                                                          ->orderBy('usuarios_count', 'desc')
                                                          ->limit(10)
                                                          ->get(),
            'distribucion_por_ciudad' => Institucion::selectRaw('INSTITUCION_CIUDAD, INSTITUCION_ESTADO, COUNT(*) as count')
                                                   ->groupBy('INSTITUCION_CIUDAD', 'INSTITUCION_ESTADO')
                                                   ->orderBy('count', 'desc')
                                                   ->limit(20)
                                                   ->get(),
        ];

        return response()->json($stats);
    }
}