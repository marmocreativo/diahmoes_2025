<?php

namespace App\Http\Controllers;

use App\Models\Institucion;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InstitucionController extends Controller
{
    /**
     * Mostrar listado de instituciones
     */
    public function index(Request $request): Response
    {
        $query = Institucion::query();

        // Aplicar filtros
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        if ($request->filled('ciudad')) {
            $query->ciudad($request->ciudad);
        }

        if ($request->filled('estado_geografico')) {
            $query->estadoGeografico($request->estado_geografico);
        }

        // Ordenamiento
        $sortField = $request->get('sort', 'FECHA_REGISTRO');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginación
        $instituciones = $query->paginate(15)->withQueryString();

        // Agregar datos calculados a cada institución
        $instituciones->through(function ($institucion) {
            return [
                'ID_INSTITUCION' => $institucion->ID_INSTITUCION,
                'INSTITUCION_NOMBRE' => $institucion->INSTITUCION_NOMBRE,
                'INSTITUCION_CORREO' => $institucion->INSTITUCION_CORREO,
                'INSTITUCION_TELEFONO' => $institucion->INSTITUCION_TELEFONO,
                'INSTITUCION_RFC' => $institucion->INSTITUCION_RFC,
                'INSTITUCION_RAZON_SOCIAL' => $institucion->INSTITUCION_RAZON_SOCIAL,
                'INSTITUCION_DIRECCION' => $institucion->INSTITUCION_DIRECCION,
                'INSTITUCION_NUMERO_EXT' => $institucion->INSTITUCION_NUMERO_EXT,
                'INSTITUCION_NUMERO_INT' => $institucion->INSTITUCION_NUMERO_INT,
                'INSTITUCION_COLONIA' => $institucion->INSTITUCION_COLONIA,
                'INSTITUCION_MUNICIPIO' => $institucion->INSTITUCION_MUNICIPIO,
                'INSTITUCION_CIUDAD' => $institucion->INSTITUCION_CIUDAD,
                'INSTITUCION_ESTADO' => $institucion->INSTITUCION_ESTADO,
                'INSTITUCION_CODIGO_POSTAL' => $institucion->INSTITUCION_CODIGO_POSTAL,
                'INSTITUCION_PROCEDENCIA' => $institucion->INSTITUCION_PROCEDENCIA,
                'FECHA_REGISTRO' => $institucion->FECHA_REGISTRO?->format('d/m/Y H:i'),
                'FECHA_ACTUALIZACION' => $institucion->FECHA_ACTUALIZACION?->format('d/m/Y H:i'),
                // Campos calculados
                'direccion_completa' => $institucion->direccion_completa,
                'nombre_corto' => $institucion->nombre_corto,
                'contacto_completo' => $institucion->contacto_completo,
                'estadisticas' => $institucion->getEstadisticas(),
                'activa' => $institucion->estaActiva(),
            ];
        });

        // Obtener ciudades y estados únicos para filtros
        $ciudades = Institucion::select('INSTITUCION_CIUDAD')
            ->distinct()
            ->orderBy('INSTITUCION_CIUDAD')
            ->pluck('INSTITUCION_CIUDAD');

        $estadosGeograficos = Institucion::select('INSTITUCION_ESTADO')
            ->distinct()
            ->orderBy('INSTITUCION_ESTADO')
            ->pluck('INSTITUCION_ESTADO');

        return Inertia::render('Instituciones/Index', [
            'instituciones' => $instituciones,
            'filters' => $request->only(['search', 'ciudad', 'estado_geografico', 'sort', 'direction']),
            'ciudades' => $ciudades,
            'estados_geograficos' => $estadosGeograficos,
        ]);
    }

    /**
     * Mostrar formulario para crear institución
     */
    public function create(): Response
    {
        return Inertia::render('Instituciones/Create', [
            'estados_mexico' => $this->getEstadosMexico(),
        ]);
    }

    /**
     * Guardar nueva institución
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'INSTITUCION_NOMBRE'        => 'required|string|max:255',
            'INSTITUCION_CORREO'        => 'nullable|email|max:255',
            'INSTITUCION_TELEFONO'      => 'nullable|string|max:255',
            'INSTITUCION_RFC'           => 'nullable|string|max:13',
            'INSTITUCION_RAZON_SOCIAL'  => 'nullable|string|max:255',
            'INSTITUCION_DIRECCION'     => 'nullable|string',
            'INSTITUCION_NUMERO_EXT'    => 'nullable|string|max:255',
            'INSTITUCION_NUMERO_INT'    => 'nullable|string|max:255',
            'INSTITUCION_COLONIA'       => 'nullable|string|max:255',
            'INSTITUCION_MUNICIPIO'     => 'nullable|string|max:255',
            'INSTITUCION_CIUDAD'        => 'nullable|string|max:255',
            'INSTITUCION_ESTADO'        => 'nullable|string|max:255',
            'INSTITUCION_CODIGO_POSTAL' => 'nullable|string|max:5',
            'INSTITUCION_PROCEDENCIA'   => 'nullable|string|max:255',
        ], [
            'INSTITUCION_NOMBRE.required' => 'El nombre de la institución es obligatorio.',
            'INSTITUCION_CORREO.email'    => 'El correo debe tener un formato válido.',
        ]);

        $validated['INSTITUCION_PIN'] = Institucion::generarPIN();

        $institucion = Institucion::create($validated);

        return redirect()->route('instituciones.index')
            ->with('success', 'Institución creada exitosamente.');
    }

    /**
     * Mostrar institución específica
     */
    public function show(Institucion $institucion): Response
    {
        // Cargar relaciones
        $institucion->load(['usuarios', 'estudios']);

        return Inertia::render('Instituciones/Show', [
            'institucion' => [
                'ID_INSTITUCION' => $institucion->ID_INSTITUCION,
                'INSTITUCION_NOMBRE' => $institucion->INSTITUCION_NOMBRE,
                'INSTITUCION_CORREO' => $institucion->INSTITUCION_CORREO,
                'INSTITUCION_TELEFONO' => $institucion->INSTITUCION_TELEFONO,
                'INSTITUCION_RFC' => $institucion->INSTITUCION_RFC,
                'INSTITUCION_RAZON_SOCIAL' => $institucion->INSTITUCION_RAZON_SOCIAL,
                'INSTITUCION_DIRECCION' => $institucion->INSTITUCION_DIRECCION,
                'INSTITUCION_NUMERO_EXT' => $institucion->INSTITUCION_NUMERO_EXT,
                'INSTITUCION_NUMERO_INT' => $institucion->INSTITUCION_NUMERO_INT,
                'INSTITUCION_COLONIA' => $institucion->INSTITUCION_COLONIA,
                'INSTITUCION_MUNICIPIO' => $institucion->INSTITUCION_MUNICIPIO,
                'INSTITUCION_CIUDAD' => $institucion->INSTITUCION_CIUDAD,
                'INSTITUCION_ESTADO' => $institucion->INSTITUCION_ESTADO,
                'INSTITUCION_CODIGO_POSTAL' => $institucion->INSTITUCION_CODIGO_POSTAL,
                'INSTITUCION_PIN' => $institucion->INSTITUCION_PIN,
                'INSTITUCION_PROCEDENCIA' => $institucion->INSTITUCION_PROCEDENCIA,
                'FECHA_REGISTRO' => $institucion->FECHA_REGISTRO?->format('d/m/Y H:i'),
                'FECHA_ACTUALIZACION' => $institucion->FECHA_ACTUALIZACION?->format('d/m/Y H:i'),
                // Campos calculados
                'direccion_completa' => $institucion->direccion_completa,
                'nombre_corto' => $institucion->nombre_corto,
                'contacto_completo' => $institucion->contacto_completo,
                'estadisticas' => $institucion->getEstadisticas(),
                'activa' => $institucion->estaActiva(),
                'resumen' => $institucion->getResumen(),
                // Datos relacionados
                'usuarios_recientes' => $institucion->usuarios()
                    ->latest('FECHA_REGISTRO')
                    ->limit(5)
                    ->get()
                    ->map(function ($usuario) {
                        return [
                            'ID_USUARIO' => $usuario->ID_USUARIO,
                            'nombre_completo' => $usuario->nombre_completo,
                            'USUARIO_TIPO' => $usuario->USUARIO_TIPO,
                            'USUARIO_ESTADO' => $usuario->USUARIO_ESTADO,
                            'FECHA_REGISTRO' => $usuario->FECHA_REGISTRO?->format('d/m/Y'),
                        ];
                    }),
                'estudios_recientes' => $institucion->estudios()
                    ->latest('FECHA_SOLICITUD_RECOLECCION')
                    ->limit(5)
                    ->get()
                    ->map(function ($estudio) {
                        return [
                            'ID' => $estudio->ID,
                            'CLAVE_INTERNA' => $estudio->CLAVE_INTERNA,
                            'MUESTRA_INICIALES' => $estudio->MUESTRA_INICIALES,
                            'ESTUDIO_ESTADO' => $estudio->ESTUDIO_ESTADO,
                            'FECHA_SOLICITUD_RECOLECCION' => $estudio->FECHA_SOLICITUD_RECOLECCION,
                        ];
                    }),
            ],
        ]);
    }

    /**
     * Mostrar formulario para editar institución
     */
    public function edit(Institucion $institucion): Response
    {
        return Inertia::render('Instituciones/Edit', [
            'institucion' => [
                'ID_INSTITUCION' => $institucion->ID_INSTITUCION,
                'INSTITUCION_NOMBRE' => $institucion->INSTITUCION_NOMBRE,
                'INSTITUCION_CORREO' => $institucion->INSTITUCION_CORREO,
                'INSTITUCION_TELEFONO' => $institucion->INSTITUCION_TELEFONO,
                'INSTITUCION_RFC' => $institucion->INSTITUCION_RFC,
                'INSTITUCION_RAZON_SOCIAL' => $institucion->INSTITUCION_RAZON_SOCIAL,
                'INSTITUCION_DIRECCION' => $institucion->INSTITUCION_DIRECCION,
                'INSTITUCION_NUMERO_EXT' => $institucion->INSTITUCION_NUMERO_EXT,
                'INSTITUCION_NUMERO_INT' => $institucion->INSTITUCION_NUMERO_INT,
                'INSTITUCION_COLONIA' => $institucion->INSTITUCION_COLONIA,
                'INSTITUCION_MUNICIPIO' => $institucion->INSTITUCION_MUNICIPIO,
                'INSTITUCION_CIUDAD' => $institucion->INSTITUCION_CIUDAD,
                'INSTITUCION_ESTADO' => $institucion->INSTITUCION_ESTADO,
                'INSTITUCION_CODIGO_POSTAL' => $institucion->INSTITUCION_CODIGO_POSTAL,
                'INSTITUCION_PIN' => $institucion->INSTITUCION_PIN,
                'INSTITUCION_PROCEDENCIA' => $institucion->INSTITUCION_PROCEDENCIA,
            ],
            'estados' => Institucion::getEstados(),
            'estados_mexico' => $this->getEstadosMexico(),
        ]);
    }

    /**
     * Actualizar institución
     */
    public function update(Request $request, Institucion $institucion): RedirectResponse
    {
        $validated = $request->validate([
            'INSTITUCION_NOMBRE'        => 'required|string|max:255',
            'INSTITUCION_CORREO'        => 'nullable|email|max:255',
            'INSTITUCION_TELEFONO'      => 'nullable|string|max:255',
            'INSTITUCION_RFC'           => 'nullable|string|max:13',
            'INSTITUCION_RAZON_SOCIAL'  => 'nullable|string|max:255',
            'INSTITUCION_DIRECCION'     => 'nullable|string',
            'INSTITUCION_NUMERO_EXT'    => 'nullable|string|max:255',
            'INSTITUCION_NUMERO_INT'    => 'nullable|string|max:255',
            'INSTITUCION_COLONIA'       => 'nullable|string|max:255',
            'INSTITUCION_MUNICIPIO'     => 'nullable|string|max:255',
            'INSTITUCION_CIUDAD'        => 'nullable|string|max:255',
            'INSTITUCION_ESTADO'        => 'nullable|string|max:255',
            'INSTITUCION_CODIGO_POSTAL' => 'nullable|string|max:5',
            'INSTITUCION_PIN'           => 'nullable|string|max:10',
            'INSTITUCION_PROCEDENCIA'   => 'nullable|string|max:255',
        ], [
            'INSTITUCION_NOMBRE.required' => 'El nombre de la institución es obligatorio.',
            'INSTITUCION_CORREO.email'    => 'El correo debe tener un formato válido.',
        ]);

        $institucion->update($validated);

        return redirect()->route('instituciones.index')
            ->with('success', 'Institución actualizada exitosamente.');
    }

    public function updateRapido(Request $request, Institucion $institucion): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'INSTITUCION_NOMBRE'      => 'required|string|max:255',
            'INSTITUCION_CORREO'      => 'nullable|email|max:255',
            'INSTITUCION_TELEFONO'    => 'nullable|string|max:255',
            'INSTITUCION_ESTADO'      => 'nullable|string|max:255',
            'INSTITUCION_CIUDAD'      => 'nullable|string|max:255',
            'INSTITUCION_PROCEDENCIA' => 'nullable|string|max:255',
        ]);

        $institucion->update($request->only([
            'INSTITUCION_NOMBRE',
            'INSTITUCION_CORREO',
            'INSTITUCION_TELEFONO',
            'INSTITUCION_ESTADO',
            'INSTITUCION_CIUDAD',
            'INSTITUCION_PROCEDENCIA',
        ]));

        return response()->json(['success' => true]);
    }

    /**
     * Eliminar institución
     */
    public function destroy(Institucion $institucion): RedirectResponse
    {
        try {
            // Verificar si tiene usuarios o estudios relacionados
            if ($institucion->usuarios()->count() > 0) {
                return redirect()->route('instituciones.index')
                    ->with('error', 'No se puede eliminar la institución porque tiene usuarios asociados.');
            }

            if ($institucion->estudios()->count() > 0) {
                return redirect()->route('instituciones.index')
                    ->with('error', 'No se puede eliminar la institución porque tiene estudios asociados.');
            }

            $institucion->delete();
            
            return redirect()->route('instituciones.index')
                ->with('success', 'Institución eliminada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('instituciones.index')
                ->with('error', 'No se pudo eliminar la institución.');
        }
    }

    /**
     * Obtener instituciones para selects (API endpoint)
     */
    public function apiInstituciones(Request $request)
    {
        $query = Institucion::query();

        if ($request->filled('ciudad')) {
            $query->ciudad($request->ciudad);
        }

        if ($request->filled('estado')) {
            $query->estadoGeografico($request->estado);
        }

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $instituciones = $query->limit(50)
            ->get()
            ->map(function ($institucion) {
                return [
                    'value' => $institucion->ID_INSTITUCION,
                    'label' => $institucion->INSTITUCION_NOMBRE,
                    'ciudad' => $institucion->INSTITUCION_CIUDAD,
                    'estado' => $institucion->INSTITUCION_ESTADO,
                    'rfc' => $institucion->INSTITUCION_RFC,
                ];
            });

        return response()->json($instituciones);
    }

    /**
     * Obtener estadísticas generales de instituciones
     */
    public function estadisticas(): Response
    {
        $stats = [
            'total' => Institucion::count(),
            'activas' => Institucion::activas()->count(),
            'inactivas' => Institucion::inactivas()->count(),
            'por_ciudad' => Institucion::selectRaw('INSTITUCION_CIUDAD, COUNT(*) as total')
                ->groupBy('INSTITUCION_CIUDAD')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get(),
            'por_estado' => Institucion::selectRaw('INSTITUCION_ESTADO, COUNT(*) as total')
                ->groupBy('INSTITUCION_ESTADO')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get(),
        ];

        return Inertia::render('Instituciones/Estadisticas', [
            'estadisticas' => $stats
        ]);
    }

    /**
     * Obtener estados de México
     */
    private function getEstadosMexico(): array
    {
        return [
            'Aguascalientes' => 'Aguascalientes',
            'Baja California' => 'Baja California',
            'Baja California Sur' => 'Baja California Sur',
            'Campeche' => 'Campeche',
            'Chiapas' => 'Chiapas',
            'Chihuahua' => 'Chihuahua',
            'Ciudad de México' => 'Ciudad de México',
            'Coahuila' => 'Coahuila',
            'Colima' => 'Colima',
            'Durango' => 'Durango',
            'Estado de México' => 'Estado de México',
            'Guanajuato' => 'Guanajuato',
            'Guerrero' => 'Guerrero',
            'Hidalgo' => 'Hidalgo',
            'Jalisco' => 'Jalisco',
            'Michoacán' => 'Michoacán',
            'Morelos' => 'Morelos',
            'Nayarit' => 'Nayarit',
            'Nuevo León' => 'Nuevo León',
            'Oaxaca' => 'Oaxaca',
            'Puebla' => 'Puebla',
            'Querétaro' => 'Querétaro',
            'Quintana Roo' => 'Quintana Roo',
            'San Luis Potosí' => 'San Luis Potosí',
            'Sinaloa' => 'Sinaloa',
            'Sonora' => 'Sonora',
            'Tabasco' => 'Tabasco',
            'Tamaulipas' => 'Tamaulipas',
            'Tlaxcala' => 'Tlaxcala',
            'Veracruz' => 'Veracruz',
            'Yucatán' => 'Yucatán',
            'Zacatecas' => 'Zacatecas',
        ];
    }

    /**
     * Configurar el model binding para usar la clave primaria personalizada
     */
    public function getRouteKeyName()
    {
        return 'ID_INSTITUCION';
    }

    /**
     * Actualizar campos rápidos desde el listado
     */
    public function updateCampoRapido(Request $request, Institucion $institucion): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'campo' => 'required|in:INSTITUCION_CIUDAD,INSTITUCION_ESTADO,INSTITUCION_PROCEDENCIA',
            'valor' => 'nullable|string|max:255',
        ]);

        $institucion->update([
            $validated['campo'] => $validated['valor'],
        ]);

        return back();
    }
}