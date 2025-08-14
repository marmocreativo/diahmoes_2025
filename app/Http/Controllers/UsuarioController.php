<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Institucion;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    /**
     * Mostrar listado de usuarios
     */
    public function index(Request $request): Response
    {
        $query = Usuario::with('institucion');

        // Aplicar filtros
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        if ($request->filled('tipo')) {
            $query->tipo($request->tipo);
        }

        if ($request->filled('estado')) {
            if ($request->estado === 'activo') {
                $query->activos();
            } elseif ($request->estado === 'inactivo') {
                $query->inactivos();
            }
        }

        if ($request->filled('institucion')) {
            $query->institucion($request->institucion);
        }

        // Ordenamiento
        $sortField = $request->get('sort', 'FECHA_REGISTRO');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginación
        $usuarios = $query->paginate(15)->withQueryString();

        // Agregar datos calculados a cada usuario
        $usuarios->through(function ($usuario) {
            return [
                'ID_USUARIO' => $usuario->ID_USUARIO,
                'USUARIO_NOMBRE' => $usuario->USUARIO_NOMBRE,
                'USUARIO_APELLIDOS' => $usuario->USUARIO_APELLIDOS,
                'USUARIO_CORREO' => $usuario->USUARIO_CORREO,
                'USUARIO_TELEFONO' => $usuario->USUARIO_TELEFONO,
                'USUARIO_TIPO' => $usuario->USUARIO_TIPO,
                'USUARIO_ESTADO' => $usuario->USUARIO_ESTADO,
                'ID_INSTITUCION' => $usuario->ID_INSTITUCION,
                'FECHA_REGISTRO' => $usuario->FECHA_REGISTRO?->format('d/m/Y H:i'),
                'FECHA_ACTUALIZACION' => $usuario->FECHA_ACTUALIZACION?->format('d/m/Y H:i'),
                // Campos calculados
                'nombre_completo' => $usuario->nombre_completo,
                'tipo_nombre' => $usuario->tipo_nombre,
                'estado_nombre' => $usuario->estado_nombre,
                'institucion' => $usuario->institucion ? [
                    'ID_INSTITUCION' => $usuario->institucion->ID_INSTITUCION,
                    'INSTITUCION_NOMBRE' => $usuario->institucion->INSTITUCION_NOMBRE,
                ] : null,
            ];
        });

        return Inertia::render('Usuarios/Index', [
            'usuarios' => $usuarios,
            'filters' => $request->only(['search', 'tipo', 'estado', 'institucion', 'sort', 'direction']),
            'tipos_usuario' => Usuario::getTiposUsuario(),
            'estados' => Usuario::getEstados(),
            'instituciones' => Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
                ->orderBy('INSTITUCION_NOMBRE')
                ->get(),
        ]);
    }

    /**
     * Mostrar formulario para crear usuario
     */
    public function create(): Response
    {
        return Inertia::render('Usuarios/Create', [
            'tipos_usuario' => Usuario::getTiposUsuario(),
            'estados' => Usuario::getEstados(),
            'instituciones' => Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
                ->orderBy('INSTITUCION_NOMBRE')
                ->get(),
        ]);
    }

    /**
     * Guardar nuevo usuario
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'USUARIO_NOMBRE' => 'required|string|max:255',
            'USUARIO_APELLIDOS' => 'required|string|max:255',
            'USUARIO_CORREO' => 'required|email|unique:usuarios,USUARIO_CORREO|max:255',
            'USUARIO_TELEFONO' => 'nullable|string|max:255',
            'USUARIO_PASS' => 'required|string|min:6|confirmed',
            'USUARIO_TIPO' => ['required', Rule::in(array_keys(Usuario::getTiposUsuario()))],
            'ID_INSTITUCION' => 'required|integer|exists:instituciones,ID_INSTITUCION',
            'USUARIO_ESTADO' => ['required', Rule::in(array_keys(Usuario::getEstados()))],
        ], [
            'USUARIO_NOMBRE.required' => 'El nombre es obligatorio.',
            'USUARIO_APELLIDOS.required' => 'Los apellidos son obligatorios.',
            'USUARIO_CORREO.required' => 'El correo es obligatorio.',
            'USUARIO_CORREO.email' => 'El correo debe tener un formato válido.',
            'USUARIO_CORREO.unique' => 'Este correo ya está registrado.',
            'USUARIO_PASS.required' => 'La contraseña es obligatoria.',
            'USUARIO_PASS.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'USUARIO_PASS.confirmed' => 'Las contraseñas no coinciden.',
            'USUARIO_TIPO.required' => 'El tipo de usuario es obligatorio.',
            'USUARIO_TIPO.in' => 'El tipo de usuario seleccionado no es válido.',
            'ID_INSTITUCION.required' => 'La institución es obligatoria.',
            'ID_INSTITUCION.exists' => 'La institución seleccionada no existe.',
            'USUARIO_ESTADO.required' => 'El estado es obligatorio.',
            'USUARIO_ESTADO.in' => 'El estado seleccionado no es válido.',
        ]);

        // Encriptar contraseña
        $validated['USUARIO_PASS'] = Hash::make($validated['USUARIO_PASS']);

        // Crear usuario
        $usuario = Usuario::create($validated);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Mostrar usuario específico
     */
    public function show(Usuario $usuario): Response
    {
        $usuario->load('institucion');

        return Inertia::render('Usuarios/Show', [
            'usuario' => [
                'ID_USUARIO' => $usuario->ID_USUARIO,
                'USUARIO_NOMBRE' => $usuario->USUARIO_NOMBRE,
                'USUARIO_APELLIDOS' => $usuario->USUARIO_APELLIDOS,
                'USUARIO_CORREO' => $usuario->USUARIO_CORREO,
                'USUARIO_TELEFONO' => $usuario->USUARIO_TELEFONO,
                'USUARIO_TIPO' => $usuario->USUARIO_TIPO,
                'USUARIO_ESTADO' => $usuario->USUARIO_ESTADO,
                'ID_INSTITUCION' => $usuario->ID_INSTITUCION,
                'FECHA_REGISTRO' => $usuario->FECHA_REGISTRO?->format('d/m/Y H:i'),
                'FECHA_ACTUALIZACION' => $usuario->FECHA_ACTUALIZACION?->format('d/m/Y H:i'),
                // Campos calculados
                'nombre_completo' => $usuario->nombre_completo,
                'tipo_nombre' => $usuario->tipo_nombre,
                'estado_nombre' => $usuario->estado_nombre,
                'institucion' => $usuario->institucion,
            ],
        ]);
    }

    /**
     * Mostrar formulario para editar usuario
     */
    public function edit(Usuario $usuario): Response
    {
        $usuario->load('institucion');

        return Inertia::render('Usuarios/Edit', [
            'usuario' => [
                'ID_USUARIO' => $usuario->ID_USUARIO,
                'USUARIO_NOMBRE' => $usuario->USUARIO_NOMBRE,
                'USUARIO_APELLIDOS' => $usuario->USUARIO_APELLIDOS,
                'USUARIO_CORREO' => $usuario->USUARIO_CORREO,
                'USUARIO_TELEFONO' => $usuario->USUARIO_TELEFONO,
                'USUARIO_TIPO' => $usuario->USUARIO_TIPO,
                'USUARIO_ESTADO' => $usuario->USUARIO_ESTADO,
                'ID_INSTITUCION' => $usuario->ID_INSTITUCION,
            ],
            'tipos_usuario' => Usuario::getTiposUsuario(),
            'estados' => Usuario::getEstados(),
            'instituciones' => Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
                ->orderBy('INSTITUCION_NOMBRE')
                ->get(),
        ]);
    }

    /**
     * Actualizar usuario
     */
    public function update(Request $request, Usuario $usuario): RedirectResponse
    {
        $validated = $request->validate([
            'USUARIO_NOMBRE' => 'required|string|max:255',
            'USUARIO_APELLIDOS' => 'required|string|max:255',
            'USUARIO_CORREO' => [
                'required',
                'email',
                'max:255',
                Rule::unique('usuarios', 'USUARIO_CORREO')->ignore($usuario->ID_USUARIO, 'ID_USUARIO'),
            ],
            'USUARIO_TELEFONO' => 'nullable|string|max:255',
            'USUARIO_PASS' => 'nullable|string|min:6|confirmed',
            'USUARIO_TIPO' => ['required', Rule::in(array_keys(Usuario::getTiposUsuario()))],
            'ID_INSTITUCION' => 'required|integer|exists:instituciones,ID_INSTITUCION',
            'USUARIO_ESTADO' => ['required', Rule::in(array_keys(Usuario::getEstados()))],
        ], [
            'USUARIO_NOMBRE.required' => 'El nombre es obligatorio.',
            'USUARIO_APELLIDOS.required' => 'Los apellidos son obligatorios.',
            'USUARIO_CORREO.required' => 'El correo es obligatorio.',
            'USUARIO_CORREO.email' => 'El correo debe tener un formato válido.',
            'USUARIO_CORREO.unique' => 'Este correo ya está registrado.',
            'USUARIO_PASS.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'USUARIO_PASS.confirmed' => 'Las contraseñas no coinciden.',
            'USUARIO_TIPO.required' => 'El tipo de usuario es obligatorio.',
            'USUARIO_TIPO.in' => 'El tipo de usuario seleccionado no es válido.',
            'ID_INSTITUCION.required' => 'La institución es obligatoria.',
            'ID_INSTITUCION.exists' => 'La institución seleccionada no existe.',
            'USUARIO_ESTADO.required' => 'El estado es obligatorio.',
            'USUARIO_ESTADO.in' => 'El estado seleccionado no es válido.',
        ]);

        // Solo encriptar contraseña si se proporciona una nueva
        if (!empty($validated['USUARIO_PASS'])) {
            $validated['USUARIO_PASS'] = Hash::make($validated['USUARIO_PASS']);
        } else {
            unset($validated['USUARIO_PASS']);
        }

        // Actualizar usuario
        $usuario->update($validated);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Eliminar usuario
     */
    public function destroy(Usuario $usuario): RedirectResponse
    {
        try {
            $usuario->delete();
            
            return redirect()->route('usuarios.index')
                ->with('success', 'Usuario eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No se pudo eliminar el usuario. Puede tener registros relacionados.');
        }
    }

    /**
     * Cambiar estado del usuario (activar/desactivar)
     */
    public function toggleEstado(Usuario $usuario): RedirectResponse
    {
        $nuevoEstado = $usuario->estaActivo() ? Usuario::ESTADO_INACTIVO : Usuario::ESTADO_ACTIVO;
        
        $usuario->update(['USUARIO_ESTADO' => $nuevoEstado]);

        $mensaje = $nuevoEstado === Usuario::ESTADO_ACTIVO ? 'activado' : 'desactivado';
        
        return redirect()->back()
            ->with('success', "Usuario {$mensaje} exitosamente.");
    }

    /**
     * Obtener usuarios para selects (API endpoint)
     */
    public function apiUsuarios(Request $request)
    {
        $query = Usuario::activos();

        if ($request->filled('tipo')) {
            $query->tipo($request->tipo);
        }

        if ($request->filled('institucion')) {
            $query->institucion($request->institucion);
        }

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $usuarios = $query->limit(50)
            ->get()
            ->map(function ($usuario) {
                return [
                    'value' => $usuario->ID_USUARIO,
                    'label' => $usuario->nombre_completo,
                    'email' => $usuario->USUARIO_CORREO,
                    'tipo' => $usuario->USUARIO_TIPO,
                ];
            });

        return response()->json($usuarios);
    }

    /**
     * Configurar el model binding para usar la clave primaria personalizada
     */
    public function getRouteKeyName()
    {
        return 'ID_USUARIO';
    }
}