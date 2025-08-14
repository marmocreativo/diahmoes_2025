<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    /**
     * Mostrar lista de clientes con filtros y paginación
     */
    public function index(Request $request): Response
    {
        $query = Cliente::query();

        // Aplicar filtros
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        if ($request->filled('enviar_correo')) {
            $query->filtrarPorEnvioCorreo($request->enviar_correo);
        }

        // Ordenamiento
        $sortField = $request->get('sort', 'CLIENTE_NOMBRE');
        $sortDirection = $request->get('direction', 'asc');
        
        $allowedSorts = ['CLIENTE_NOMBRE', 'CLIENTE_CORREO', 'CLIENTE_ENVIAR_CORREO'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Paginación
        $clientes = $query->paginate(10)->withQueryString();

        // Estadísticas
        $estadisticas = [
            'total' => Cliente::contarTotal(),
            'activos' => Cliente::contarActivos(),
            'inactivos' => Cliente::contarInactivos(),
        ];

        return Inertia::render('Clientes/Index', [
            'clientes' => $clientes,
            'estadisticas' => $estadisticas,
            'filtros' => [
                'search' => $request->search,
                'enviar_correo' => $request->enviar_correo,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Mostrar el formulario para crear un nuevo cliente
     */
    public function create(): Response
    {
        return Inertia::render('Clientes/Create');
    }

    /**
     * Almacenar un nuevo cliente en la base de datos
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'CLIENTE_NOMBRE' => [
                'required',
                'string',
                'max:255',
                'min:2',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/',
            ],
            'CLIENTE_CORREO' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:clientes,CLIENTE_CORREO',
            ],
            'CLIENTE_PASS' => [
                'required',
                'string',
                'min:6',
                'max:255',
            ],
            'CLIENTE_ENVIAR_CORREO' => [
                'required',
                'in:si,no',
            ],
        ], [
            'CLIENTE_NOMBRE.required' => 'El nombre del cliente es obligatorio.',
            'CLIENTE_NOMBRE.min' => 'El nombre debe tener al menos 2 caracteres.',
            'CLIENTE_NOMBRE.regex' => 'El nombre solo puede contener letras y espacios.',
            'CLIENTE_CORREO.required' => 'El correo electrónico es obligatorio.',
            'CLIENTE_CORREO.email' => 'El correo electrónico debe tener un formato válido.',
            'CLIENTE_CORREO.unique' => 'Este correo electrónico ya está registrado.',
            'CLIENTE_PASS.required' => 'La contraseña es obligatoria.',
            'CLIENTE_PASS.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'CLIENTE_ENVIAR_CORREO.required' => 'Debe especificar si enviar correos.',
            'CLIENTE_ENVIAR_CORREO.in' => 'El valor de envío de correo no es válido.',
        ]);

        try {
            Cliente::create($validated);

            return Redirect::route('clientes.index')
                ->with('success', 'Cliente creado exitosamente.');
        } catch (\Exception $e) {
            return Redirect::back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear el cliente: ' . $e->getMessage()]);
        }
    }

    /**
     * Mostrar un cliente específico
     */
    public function show(Cliente $cliente): Response
    {
        // Cargar datos adicionales para la vista
        $estudiosRecientes = $cliente->getEstudiosRecientes();
        $totalEstudios = $cliente->getTotalEstudios();

        return Inertia::render('Clientes/Show', [
            'cliente' => [
                'ID_CLIENTE' => $cliente->ID_CLIENTE,
                'CLIENTE_NOMBRE' => $cliente->CLIENTE_NOMBRE,
                'CLIENTE_CORREO' => $cliente->CLIENTE_CORREO,
                'CLIENTE_ENVIAR_CORREO' => $cliente->CLIENTE_ENVIAR_CORREO,
                'enviar_correo_text' => $cliente->enviar_correo_text,
                'enviar_correo_boolean' => $cliente->enviar_correo_boolean,
                'total_estudios' => $totalEstudios,
                'estudios_recientes' => $estudiosRecientes,
            ],
        ]);
    }

    /**
     * Mostrar el formulario para editar un cliente
     */
    public function edit(Cliente $cliente): Response
    {
        return Inertia::render('Clientes/Edit', [
            'cliente' => [
                'ID_CLIENTE' => $cliente->ID_CLIENTE,
                'CLIENTE_NOMBRE' => $cliente->CLIENTE_NOMBRE,
                'CLIENTE_CORREO' => $cliente->CLIENTE_CORREO,
                'CLIENTE_ENVIAR_CORREO' => $cliente->CLIENTE_ENVIAR_CORREO,
            ],
        ]);
    }

    /**
     * Actualizar un cliente en la base de datos
     */
    public function update(Request $request, Cliente $cliente): RedirectResponse
    {
        $validated = $request->validate([
            'CLIENTE_NOMBRE' => [
                'required',
                'string',
                'max:255',
                'min:2',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/',
            ],
            'CLIENTE_CORREO' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('clientes', 'CLIENTE_CORREO')->ignore($cliente->ID_CLIENTE, 'ID_CLIENTE'),
            ],
            'CLIENTE_PASS' => [
                'nullable',
                'string',
                'min:6',
                'max:255',
            ],
            'CLIENTE_ENVIAR_CORREO' => [
                'required',
                'in:si,no',
            ],
        ], [
            'CLIENTE_NOMBRE.required' => 'El nombre del cliente es obligatorio.',
            'CLIENTE_NOMBRE.min' => 'El nombre debe tener al menos 2 caracteres.',
            'CLIENTE_NOMBRE.regex' => 'El nombre solo puede contener letras y espacios.',
            'CLIENTE_CORREO.required' => 'El correo electrónico es obligatorio.',
            'CLIENTE_CORREO.email' => 'El correo electrónico debe tener un formato válido.',
            'CLIENTE_CORREO.unique' => 'Este correo electrónico ya está registrado.',
            'CLIENTE_PASS.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'CLIENTE_ENVIAR_CORREO.required' => 'Debe especificar si enviar correos.',
            'CLIENTE_ENVIAR_CORREO.in' => 'El valor de envío de correo no es válido.',
        ]);

        try {
            // Si no se proporciona contraseña, no la actualizamos
            if (empty($validated['CLIENTE_PASS'])) {
                unset($validated['CLIENTE_PASS']);
            }

            $cliente->update($validated);

            return Redirect::route('clientes.index')
                ->with('success', 'Cliente actualizado exitosamente.');
        } catch (\Exception $e) {
            return Redirect::back()
                ->withInput()
                ->withErrors(['error' => 'Error al actualizar el cliente: ' . $e->getMessage()]);
        }
    }

    /**
     * Eliminar un cliente de la base de datos
     */
    public function destroy(Cliente $cliente): RedirectResponse
    {
        try {
            // Verificar si el cliente tiene estudios asociados
            if ($cliente->getTotalEstudios() > 0) {
                return Redirect::back()
                    ->withErrors(['error' => 'No se puede eliminar el cliente porque tiene estudios asociados.']);
            }

            $cliente->delete();

            return Redirect::route('clientes.index')
                ->with('success', 'Cliente eliminado exitosamente.');
        } catch (\Exception $e) {
            return Redirect::back()
                ->withErrors(['error' => 'Error al eliminar el cliente: ' . $e->getMessage()]);
        }
    }

    /**
     * Alternar el estado de envío de correo del cliente
     */
    public function toggleEnvioCorreo(Cliente $cliente): RedirectResponse
    {
        try {
            $cliente->toggleEnvioCorreo();
            
            $estado = $cliente->CLIENTE_ENVIAR_CORREO === 'si' ? 'activado' : 'desactivado';
            
            return Redirect::back()
                ->with('success', "Envío de correo {$estado} exitosamente.");
        } catch (\Exception $e) {
            return Redirect::back()
                ->withErrors(['error' => 'Error al cambiar el estado: ' . $e->getMessage()]);
        }
    }

    /**
     * Verificar la contraseña de un cliente
     */
    public function verificarPassword(Request $request, Cliente $cliente): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $passwordCorrecta = $cliente->verificarPassword($request->password);

        return response()->json([
            'valida' => $passwordCorrecta,
            'mensaje' => $passwordCorrecta ? 'Contraseña correcta' : 'Contraseña incorrecta',
        ]);
    }

    /**
     * API: Obtener clientes para selects
     */
    public function apiIndex(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Cliente::query();

        // Filtro por búsqueda
        if ($request->filled('q')) {
            $query->buscar($request->q);
        }

        // Filtro por estado de envío
        if ($request->filled('envio_correo')) {
            $query->filtrarPorEnvioCorreo($request->envio_correo);
        }

        // Solo activos si se especifica
        if ($request->boolean('solo_activos')) {
            $query->activos();
        }

        $clientes = $query
            ->select('ID_CLIENTE', 'CLIENTE_NOMBRE', 'CLIENTE_CORREO', 'CLIENTE_ENVIAR_CORREO')
            ->orderBy('CLIENTE_NOMBRE')
            ->limit($request->get('limit', 50))
            ->get()
            ->map(function ($cliente) {
                return [
                    'value' => $cliente->ID_CLIENTE,
                    'label' => $cliente->CLIENTE_NOMBRE,
                    'correo' => $cliente->CLIENTE_CORREO,
                    'enviar_correo' => $cliente->CLIENTE_ENVIAR_CORREO,
                    'activo' => $cliente->CLIENTE_ENVIAR_CORREO === 'si',
                ];
            });

        return response()->json($clientes);
    }

    /**
     * API: Obtener solo clientes activos
     */
    public function apiActivos(): \Illuminate\Http\JsonResponse
    {
        $clientes = Cliente::activos()
            ->select('ID_CLIENTE', 'CLIENTE_NOMBRE', 'CLIENTE_CORREO')
            ->orderBy('CLIENTE_NOMBRE')
            ->get()
            ->map(function ($cliente) {
                return [
                    'value' => $cliente->ID_CLIENTE,
                    'label' => $cliente->CLIENTE_NOMBRE,
                    'correo' => $cliente->CLIENTE_CORREO,
                ];
            });

        return response()->json($clientes);
    }

    /**
     * API: Buscar cliente por correo
     */
    public function apiBuscarPorCorreo(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'correo' => 'required|email',
        ]);

        $cliente = Cliente::buscarPorCorreo($request->correo);

        if ($cliente) {
            return response()->json([
                'encontrado' => true,
                'cliente' => [
                    'ID_CLIENTE' => $cliente->ID_CLIENTE,
                    'CLIENTE_NOMBRE' => $cliente->CLIENTE_NOMBRE,
                    'CLIENTE_CORREO' => $cliente->CLIENTE_CORREO,
                    'CLIENTE_ENVIAR_CORREO' => $cliente->CLIENTE_ENVIAR_CORREO,
                ],
            ]);
        }

        return response()->json([
            'encontrado' => false,
            'mensaje' => 'Cliente no encontrado',
        ]);
    }

    /**
     * API: Estadísticas generales
     */
    public function apiEstadisticas(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'total' => Cliente::contarTotal(),
            'activos' => Cliente::contarActivos(),
            'inactivos' => Cliente::contarInactivos(),
            'porcentaje_activos' => Cliente::contarTotal() > 0 
                ? round((Cliente::contarActivos() / Cliente::contarTotal()) * 100, 2) 
                : 0,
        ]);
    }
}