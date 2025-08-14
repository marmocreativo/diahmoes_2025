<?php

namespace App\Http\Controllers;

use App\Models\Mensajeria;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MensajeriaController extends Controller
{
    /**
     * Mostrar listado de mensajerías
     */
    public function index(Request $request): Response
    {
        $query = Mensajeria::query();

        // Aplicar filtros
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        if ($request->filled('estado')) {
            $query->estado($request->estado);
        }

        // Ordenamiento
        $sortField = $request->get('sort', 'NOMBRE');
        $sortDirection = $request->get('direction', 'asc');
        
        if ($sortField === 'total_guias') {
            // Para ordenar por total de guías, necesitamos hacer una consulta especial
            $mensajerias = $query->get()->map(function ($mensajeria) {
                return [
                    'ID' => $mensajeria->ID,
                    'NOMBRE' => $mensajeria->NOMBRE,
                    'ESTADO' => $mensajeria->ESTADO,
                    'nombre_formateado' => $mensajeria->nombre_formateado,
                    'estado_formateado' => $mensajeria->estado_formateado,
                    'estado_css_class' => $mensajeria->estado_css_class,
                    'estadisticas' => $mensajeria->getEstadisticas(),
                    'activa' => $mensajeria->estaActiva(),
                ];
            })->sortBy(function ($mensajeria) use ($sortDirection) {
                return $sortDirection === 'desc' 
                    ? -$mensajeria['estadisticas']['total_guias']
                    : $mensajeria['estadisticas']['total_guias'];
            })->values();

            // Simular paginación para mantener consistencia
            $page = $request->get('page', 1);
            $perPage = 15;
            $total = $mensajerias->count();
            $items = $mensajerias->slice(($page - 1) * $perPage, $perPage);
            
            $paginatedData = new \Illuminate\Pagination\LengthAwarePaginator(
                $items,
                $total,
                $perPage,
                $page,
                ['path' => $request->url(), 'pageName' => 'page']
            );
            $paginatedData->withQueryString();
        } else {
            $query->orderBy($sortField, $sortDirection);
            
            // Paginación normal
            $mensajerias = $query->paginate(15)->withQueryString();
            
            // Agregar datos calculados a cada mensajería
            $mensajerias->through(function ($mensajeria) {
                return [
                    'ID' => $mensajeria->ID,
                    'NOMBRE' => $mensajeria->NOMBRE,
                    'ESTADO' => $mensajeria->ESTADO,
                    'nombre_formateado' => $mensajeria->nombre_formateado,
                    'estado_formateado' => $mensajeria->estado_formateado,
                    'estado_css_class' => $mensajeria->estado_css_class,
                    'estadisticas' => $mensajeria->getEstadisticas(),
                    'activa' => $mensajeria->estaActiva(),
                ];
            });
            
            $paginatedData = $mensajerias;
        }

        // Obtener estados disponibles para filtros
        $estados = Mensajeria::getEstados();

        return Inertia::render('Mensajerias/Index', [
            'mensajerias' => $paginatedData,
            'filters' => $request->only(['search', 'estado', 'sort', 'direction']),
            'estados' => $estados,
        ]);
    }

    /**
     * Mostrar formulario para crear mensajería
     */
    public function create(): Response
    {
        return Inertia::render('Mensajerias/Create', [
            'estados' => Mensajeria::getEstados(),
        ]);
    }

    /**
     * Guardar nueva mensajería
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'NOMBRE' => 'required|string|max:255|unique:mensajerias,NOMBRE',
            'ESTADO' => ['required', Rule::in(array_keys(Mensajeria::getEstados()))],
        ], [
            'NOMBRE.required' => 'El nombre de la mensajería es obligatorio.',
            'NOMBRE.unique' => 'Ya existe una mensajería con este nombre.',
            'NOMBRE.max' => 'El nombre no puede exceder 255 caracteres.',
            'ESTADO.required' => 'El estado es obligatorio.',
            'ESTADO.in' => 'El estado seleccionado no es válido.',
        ]);

        try {
            $mensajeria = Mensajeria::crear($validated);
            
            return redirect()->route('mensajerias.index')
                ->with('success', 'Mensajería creada exitosamente.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()
                ->withErrors(['NOMBRE' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Mostrar mensajería específica
     */
    public function show(Mensajeria $mensajeria): Response
    {
        return Inertia::render('Mensajerias/Show', [
            'mensajeria' => [
                'ID' => $mensajeria->ID,
                'NOMBRE' => $mensajeria->NOMBRE,
                'ESTADO' => $mensajeria->ESTADO,
                'nombre_formateado' => $mensajeria->nombre_formateado,
                'estado_formateado' => $mensajeria->estado_formateado,
                'estado_css_class' => $mensajeria->estado_css_class,
                'activa' => $mensajeria->estaActiva(),
                'estadisticas' => $mensajeria->getEstadisticas(),
                'resumen' => $mensajeria->getResumen(),
                // Estudios recientes
                'estudios_recientes' => $mensajeria->getEstudiosRecientes(10)->map(function ($estudio) {
                    return [
                        'ID' => $estudio->ID,
                        'CLAVE_INTERNA' => $estudio->CLAVE_INTERNA,
                        'MUESTRA_INICIALES' => $estudio->MUESTRA_INICIALES,
                        'ESTUDIO_ESTADO' => $estudio->ESTUDIO_ESTADO,
                        'FECHA_SOLICITUD_RECOLECCION' => $estudio->FECHA_SOLICITUD_RECOLECCION,
                        'MUESTRA_GUIA' => $estudio->MUESTRA_GUIA,
                        'MUESTRA_GUIA_ESPECIALIZADA' => $estudio->MUESTRA_GUIA_ESPECIALIZADA,
                        'MUESTRA_GUIA_RETORNO' => $estudio->MUESTRA_GUIA_RETORNO,
                        'tipo_guia' => $this->determinarTipoGuia($estudio, $mensajeria->NOMBRE),
                    ];
                }),
            ],
        ]);
    }

    /**
     * Mostrar formulario para editar mensajería
     */
    public function edit(Mensajeria $mensajeria): Response
    {
        return Inertia::render('Mensajerias/Edit', [
            'mensajeria' => [
                'ID' => $mensajeria->ID,
                'NOMBRE' => $mensajeria->NOMBRE,
                'ESTADO' => $mensajeria->ESTADO,
            ],
            'estados' => Mensajeria::getEstados(),
        ]);
    }

    /**
     * Actualizar mensajería
     */
    public function update(Request $request, Mensajeria $mensajeria): RedirectResponse
    {
        $validated = $request->validate([
            'NOMBRE' => [
                'required',
                'string',
                'max:255',
                Rule::unique('mensajerias', 'NOMBRE')->ignore($mensajeria->ID, 'ID'),
            ],
            'ESTADO' => ['required', Rule::in(array_keys(Mensajeria::getEstados()))],
        ], [
            'NOMBRE.required' => 'El nombre de la mensajería es obligatorio.',
            'NOMBRE.unique' => 'Ya existe una mensajería con este nombre.',
            'NOMBRE.max' => 'El nombre no puede exceder 255 caracteres.',
            'ESTADO.required' => 'El estado es obligatorio.',
            'ESTADO.in' => 'El estado seleccionado no es válido.',
        ]);

        $mensajeria->update($validated);

        return redirect()->route('mensajerias.index')
            ->with('success', 'Mensajería actualizada exitosamente.');
    }

    /**
     * Eliminar mensajería
     */
    public function destroy(Mensajeria $mensajeria): RedirectResponse
    {
        try {
            // Verificar si tiene estudios relacionados
            $totalGuias = $mensajeria->contarTotalGuias();
            
            if ($totalGuias > 0) {
                return redirect()->route('mensajerias.index')
                    ->with('error', "No se puede eliminar la mensajería porque tiene {$totalGuias} guías asociadas.");
            }

            $mensajeria->delete();
            
            return redirect()->route('mensajerias.index')
                ->with('success', 'Mensajería eliminada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('mensajerias.index')
                ->with('error', 'No se pudo eliminar la mensajería.');
        }
    }

    /**
     * Cambiar estado de la mensajería (activar/desactivar)
     */
    public function toggleEstado(Mensajeria $mensajeria): RedirectResponse
    {
        $estadoAnterior = $mensajeria->estado_formateado;
        $mensajeria->toggleEstado();
        $estadoNuevo = $mensajeria->fresh()->estado_formateado;

        return redirect()->back()
            ->with('success', "Mensajería cambiada de {$estadoAnterior} a {$estadoNuevo}.");
    }

    /**
     * Obtener mensajerías para selects (API endpoint)
     */
    public function apiMensajerias(Request $request)
    {
        $query = Mensajeria::query();

        // Filtrar solo activas por defecto
        if (!$request->has('incluir_inactivas')) {
            $query->activas();
        }

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        if ($request->filled('estado')) {
            $query->estado($request->estado);
        }

        $mensajerias = $query->ordenadoPorNombre()
            ->limit(50)
            ->get()
            ->map(function ($mensajeria) {
                return [
                    'value' => $mensajeria->ID,
                    'label' => $mensajeria->NOMBRE,
                    'estado' => $mensajeria->ESTADO,
                    'activa' => $mensajeria->estaActiva(),
                    'total_guias' => $mensajeria->contarTotalGuias(),
                ];
            });

        return response()->json($mensajerias);
    }

    /**
     * Obtener estadísticas generales de mensajerías
     */
    public function estadisticas(): Response
    {
        $todasMensajerias = Mensajeria::all();
        
        $stats = [
            'total' => $todasMensajerias->count(),
            'activas' => $todasMensajerias->where('ESTADO', Mensajeria::ESTADO_ACTIVO)->count(),
            'inactivas' => $todasMensajerias->where('ESTADO', Mensajeria::ESTADO_INACTIVO)->count(),
            'mas_utilizadas' => Mensajeria::masUtilizadas(10)->map(function ($mensajeria) {
                return [
                    'nombre' => $mensajeria->NOMBRE,
                    'total_guias' => $mensajeria->contarTotalGuias(),
                    'estadisticas' => $mensajeria->getEstadisticas(),
                ];
            }),
            'distribucion_guias' => $todasMensajerias->map(function ($mensajeria) {
                $stats = $mensajeria->getEstadisticas();
                return [
                    'nombre' => $mensajeria->NOMBRE,
                    'guias_normales' => $stats['guias_normales'],
                    'guias_especializadas' => $stats['guias_especializadas'],
                    'guias_retorno' => $stats['guias_retorno'],
                    'total' => $stats['total_guias'],
                ];
            })->filter(function ($item) {
                return $item['total'] > 0;
            })->values(),
        ];

        return Inertia::render('Mensajerias/Estadisticas', [
            'estadisticas' => $stats
        ]);
    }

    /**
     * Exportar mensajerías
     */
    public function exportar(Request $request, string $formato = 'excel')
    {
        $mensajerias = Mensajeria::with([])
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->buscar($request->search);
            })
            ->when($request->filled('estado'), function ($query) use ($request) {
                $query->estado($request->estado);
            })
            ->ordenadoPorNombre()
            ->get();

        // Preparar datos para exportación
        $datos = $mensajerias->map(function ($mensajeria) {
            $stats = $mensajeria->getEstadisticas();
            return [
                'ID' => $mensajeria->ID,
                'Nombre' => $mensajeria->NOMBRE,
                'Estado' => $mensajeria->estado_formateado,
                'Guías Normales' => $stats['guias_normales'],
                'Guías Especializadas' => $stats['guias_especializadas'],
                'Guías de Retorno' => $stats['guias_retorno'],
                'Total de Guías' => $stats['total_guias'],
                'Estudios Únicos' => $stats['estudios_unicos'],
            ];
        });

        switch ($formato) {
            case 'csv':
                return $this->exportarCSV($datos, 'mensajerias.csv');
            case 'pdf':
                return $this->exportarPDF($datos, 'mensajerias.pdf');
            default:
                return $this->exportarExcel($datos, 'mensajerias.xlsx');
        }
    }

    /**
     * Buscar mensajerías por nombre (para autocomplete)
     */
    public function buscar(Request $request)
    {
        $termino = $request->get('q', '');
        
        $mensajerias = Mensajeria::buscar($termino)
            ->activas()
            ->ordenadoPorNombre()
            ->limit(10)
            ->get()
            ->map(function ($mensajeria) {
                return [
                    'id' => $mensajeria->ID,
                    'text' => $mensajeria->NOMBRE,
                    'nombre' => $mensajeria->NOMBRE,
                    'total_guias' => $mensajeria->contarTotalGuias(),
                ];
            });

        return response()->json($mensajerias);
    }

    /**
     * Configurar el model binding para usar la clave primaria personalizada
     */
    public function getRouteKeyName()
    {
        return 'ID';
    }

    /**
     * Determinar el tipo de guía para un estudio específico
     */
    private function determinarTipoGuia($estudio, string $nombreMensajeria): string
    {
        if ($estudio->MUESTRA_GUIA_MENSAJERIA === $nombreMensajeria) {
            return 'normal';
        }
        
        if ($estudio->MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA === $nombreMensajeria) {
            return 'especializada';
        }
        
        if ($estudio->MUESTRA_GUIA_RETORNO_MENSAJERIA === $nombreMensajeria) {
            return 'retorno';
        }
        
        return 'desconocido';
    }

    /**
     * Métodos auxiliares para exportación (implementar según necesidades)
     */
    private function exportarCSV($datos, string $nombreArchivo)
    {
        // Implementar exportación CSV
        // return response()->streamDownload(...);
    }

    private function exportarPDF($datos, string $nombreArchivo)
    {
        // Implementar exportación PDF
        // return response()->streamDownload(...);
    }

    private function exportarExcel($datos, string $nombreArchivo)
    {
        // Implementar exportación Excel
        // return response()->streamDownload(...);
    }
}