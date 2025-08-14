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
            'INSTITUCION_NOMBRE' => 'required|string|max:255',
            'INSTITUCION_CORREO' => 'required|email|unique:instituciones,INSTITUCION_CORREO|max:255',
            'INSTITUCION_TELEFONO' => 'required|string|max:255',
            'INSTITUCION_RFC' => 'required|string|size:12|unique:instituciones,INSTITUCION_RFC',
            'INSTITUCION_RAZON_SOCIAL' => 'required|string|max:255',
            'INSTITUCION_DIRECCION' => 'required|string',
            'INSTITUCION_NUMERO_EXT' => 'required|string|max:255',
            'INSTITUCION_NUMERO_INT' => 'nullable|string|max:255',
            'INSTITUCION_COLONIA' => 'required|string|max:255',
            'INSTITUCION_MUNICIPIO' => 'required|string|max:255',
            'INSTITUCION_CIUDAD' => 'required|string|max:255',
            'INSTITUCION_ESTADO' => 'required|string|max:255',
            'INSTITUCION_CODIGO_POSTAL' => 'required|string|size:5',
        ], [
            'INSTITUCION_NOMBRE.required' => 'El nombre de la institución es obligatorio.',
            'INSTITUCION_CORREO.required' => 'El correo es obligatorio.',
            'INSTITUCION_CORREO.email' => 'El correo debe tener un formato válido.',
            'INSTITUCION_CORREO.unique' => 'Este correo ya está registrado.',
            'INSTITUCION_TELEFONO.required' => 'El teléfono es obligatorio.',
            'INSTITUCION_RFC.required' => 'El RFC es obligatorio.',
            'INSTITUCION_RFC.size' => 'El RFC debe tener exactamente 12 caracteres.',
            'INSTITUCION_RFC.unique' => 'Este RFC ya está registrado.',
            'INSTITUCION_RAZON_SOCIAL.required' => 'La razón social es obligatoria.',
            'INSTITUCION_DIRECCION.required' => 'La dirección es obligatoria.',
            'INSTITUCION_NUMERO_EXT.required' => 'El número exterior es obligatorio.',
            'INSTITUCION_COLONIA.required' => 'La colonia es obligatoria.',
            'INSTITUCION_MUNICIPIO.required' => 'El municipio es obligatorio.',
            'INSTITUCION_CIUDAD.required' => 'La ciudad es obligatoria.',
            'INSTITUCION_ESTADO.required' => 'El estado es obligatorio.',
            'INSTITUCION_CODIGO_POSTAL.required' => 'El código postal es obligatorio.',
            'INSTITUCION_CODIGO_POSTAL.size' => 'El código postal debe tener 5 dígitos.',
        ]);

        // Generar PIN automáticamente
        $validated['INSTITUCION_PIN'] = Institucion::generarPIN();

        // Crear institución
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
            'INSTITUCION_NOMBRE' => 'required|string|max:255',
            'INSTITUCION_CORREO' => [
                'required',
                'email',
                'max:255',
                Rule::unique('instituciones', 'INSTITUCION_CORREO')->ignore($institucion->ID_INSTITUCION, 'ID_INSTITUCION'),
            ],
            'INSTITUCION_TELEFONO' => 'required|string|max:255',
            'INSTITUCION_RFC' => [
                'required',
                'string',
                'size:12',
                Rule::unique('instituciones', 'INSTITUCION_RFC')->ignore($institucion->ID_INSTITUCION, 'ID_INSTITUCION'),
            ],
            'INSTITUCION_RAZON_SOCIAL' => 'required|string|max:255',
            'INSTITUCION_DIRECCION' => 'required|string',
            'INSTITUCION_NUMERO_EXT' => 'required|string|max:255',
            'INSTITUCION_NUMERO_INT' => 'nullable|string|max:255',
            'INSTITUCION_COLONIA' => 'required|string|max:255',
            'INSTITUCION_MUNICIPIO' => 'required|string|max:255',
            'INSTITUCION_CIUDAD' => 'required|string|max:255',
            'INSTITUCION_ESTADO' => 'required|string|max:255',
            'INSTITUCION_CODIGO_POSTAL' => 'required|string|size:5',
            'INSTITUCION_PIN' => 'required|string|size:4',
        ], [
            'INSTITUCION_NOMBRE.required' => 'El nombre de la institución es obligatorio.',
            'INSTITUCION_CORREO.required' => 'El correo es obligatorio.',
            'INSTITUCION_CORREO.email' => 'El correo debe tener un formato válido.',
            'INSTITUCION_CORREO.unique' => 'Este correo ya está registrado.',
            'INSTITUCION_TELEFONO.required' => 'El teléfono es obligatorio.',
            'INSTITUCION_RFC.required' => 'El RFC es obligatorio.',
            'INSTITUCION_RFC.size' => 'El RFC debe tener exactamente 12 caracteres.',
            'INSTITUCION_RFC.unique' => 'Este RFC ya está registrado.',
            'INSTITUCION_RAZON_SOCIAL.required' => 'La razón social es obligatoria.',
            'INSTITUCION_DIRECCION.required' => 'La dirección es obligatoria.',
            'INSTITUCION_NUMERO_EXT.required' => 'El número exterior es obligatorio.',
            'INSTITUCION_COLONIA.required' => 'La colonia es obligatoria.',
            'INSTITUCION_MUNICIPIO.required' => 'El municipio es obligatorio.',
            'INSTITUCION_CIUDAD.required' => 'La ciudad es obligatoria.',
            'INSTITUCION_ESTADO.required' => 'El estado es obligatorio.',
            'INSTITUCION_CODIGO_POSTAL.required' => 'El código postal es obligatorio.',
            'INSTITUCION_CODIGO_POSTAL.size' => 'El código postal debe tener 5 dígitos.',
            'INSTITUCION_PIN.required' => 'El PIN es obligatorio.',
            'INSTITUCION_PIN.size' => 'El PIN debe tener 4 dígitos.',
        ]);

        // Actualizar institución
        $institucion->update($validated);

        return redirect()->route('instituciones.index')
            ->with('success', 'Institución actualizada exitosamente.');
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
}