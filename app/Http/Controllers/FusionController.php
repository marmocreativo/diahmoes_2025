<?php

namespace App\Http\Controllers;

use App\Models\Institucion;
use App\Models\Cliente;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class FusionController extends Controller
{
    /**
     * Vista de fusión de instituciones
     */
    public function instituciones(Request $request)
    {
        $sugerencias = $this->detectarDuplicadosInstituciones();

        return Inertia::render('Fusion/Instituciones', [
            'sugerencias' => $sugerencias,
        ]);
    }

    /**
     * Detectar posibles instituciones duplicadas
     * Criterio: mismo RFC (si no es "PENDIENTE") o nombre muy similar
     */
    private function detectarDuplicadosInstituciones(): array
    {
        $grupos = [];

        // 1. Agrupar por RFC (excluyendo PENDIENTE y vacíos)
        $porRfc = Institucion::whereNotNull('INSTITUCION_RFC')
            ->where('INSTITUCION_RFC', '!=', '')
            ->where('INSTITUCION_RFC', '!=', 'PENDIENTE')
            ->get()
            ->groupBy('INSTITUCION_RFC')
            ->filter(fn($grupo) => $grupo->count() > 1);

        foreach ($porRfc as $rfc => $instituciones) {
            $grupos[] = [
                'criterio' => 'RFC idéntico: ' . $rfc,
                'instituciones' => $instituciones->map(fn($i) => $this->resumenInstitucion($i))->values(),
            ];
        }

        // 2. Agrupar por nombre normalizado (sin acentos, mayúsculas, espacios extra)
        $todas = Institucion::all();
        $normalizados = [];

        foreach ($todas as $institucion) {
            $normalizado = $this->normalizarTexto($institucion->INSTITUCION_NOMBRE);
            $normalizados[$normalizado][] = $institucion;
        }

        foreach ($normalizados as $nombreNormalizado => $instituciones) {
            if (count($instituciones) > 1) {
                // Evitar duplicar grupos ya detectados por RFC
                $ids = collect($instituciones)->pluck('ID_INSTITUCION')->sort()->values()->toArray();
                $yaExiste = collect($grupos)->contains(function ($g) use ($ids) {
                    $idsGrupo = collect($g['instituciones'])->pluck('id')->sort()->values()->toArray();
                    return $idsGrupo === $ids;
                });

                if (!$yaExiste) {
                    $grupos[] = [
                        'criterio' => 'Nombre similar: "' . $instituciones[0]->INSTITUCION_NOMBRE . '"',
                        'instituciones' => collect($instituciones)->map(fn($i) => $this->resumenInstitucion($i))->values(),
                    ];
                }
            }
        }

        return $grupos;
    }

    private function normalizarTexto(string $texto): string
    {
        $texto = mb_strtolower(trim($texto));
        $texto = preg_replace('/\s+/', ' ', $texto);
        $texto = str_replace(
            ['á', 'é', 'í', 'ó', 'ú', 'ñ'],
            ['a', 'e', 'i', 'o', 'u', 'n'],
            $texto
        );
        return $texto;
    }

    private function resumenInstitucion(Institucion $institucion): array
    {
        return [
            'id' => $institucion->ID_INSTITUCION,
            'nombre' => $institucion->INSTITUCION_NOMBRE,
            'rfc' => $institucion->INSTITUCION_RFC,
            'ciudad' => $institucion->INSTITUCION_CIUDAD,
            'correo' => $institucion->INSTITUCION_CORREO,
            'total_usuarios' => $institucion->usuarios()->count(),
            'total_estudios' => $institucion->estudios()->count(),
        ];
    }

    /**
     * Búsqueda manual de instituciones (para armar grupo a fusionar)
     */
    public function buscarInstituciones(Request $request)
    {
        $termino = $request->get('q', '');

        $instituciones = Institucion::when($termino, function ($q) use ($termino) {
                $q->where('INSTITUCION_NOMBRE', 'LIKE', "%{$termino}%")
                  ->orWhere('INSTITUCION_RFC', 'LIKE', "%{$termino}%");
            })
            ->limit(20)
            ->get()
            ->map(fn($i) => $this->resumenInstitucion($i));

        return response()->json($instituciones);
    }

    /**
     * Preview de la fusión: cuántos registros se van a reasignar
     */
    public function previewFusionInstituciones(Request $request)
    {
        $request->validate([
            'maestro_id' => 'required|integer|exists:instituciones,ID_INSTITUCION',
            'duplicados_ids' => 'required|array|min:1',
            'duplicados_ids.*' => 'integer|exists:instituciones,ID_INSTITUCION|different:maestro_id',
        ]);

        $duplicadosIds = $request->duplicados_ids;

        $preview = [
            'estudios' => DB::table('estudios')->whereIn('ID_INSTITUCION', $duplicadosIds)->count(),
            'usuarios' => DB::table('usuarios')->whereIn('ID_INSTITUCION', $duplicadosIds)->count(),
            'solicitudes_cliente' => DB::table('solicitudes_cliente')->whereIn('ID_INSTITUCION', $duplicadosIds)->count(),
        ];

        return response()->json(['preview' => $preview]);
    }

    /**
     * Ejecutar la fusión de instituciones
     */
    public function fusionarInstituciones(Request $request)
    {
        $request->validate([
            'maestro_id' => 'required|integer|exists:instituciones,ID_INSTITUCION',
            'duplicados_ids' => 'required|array|min:1',
            'duplicados_ids.*' => 'integer|exists:instituciones,ID_INSTITUCION|different:maestro_id',
        ]);

        $maestroId = $request->maestro_id;
        $duplicadosIds = $request->duplicados_ids;

        \Log::info('🔀 Iniciando fusión de instituciones', [
            'maestro_id' => $maestroId,
            'duplicados_ids' => $duplicadosIds,
        ]);

        DB::beginTransaction();

        try {
            $reporte = [
                'estudios_reasignados' => DB::table('estudios')
                    ->whereIn('ID_INSTITUCION', $duplicadosIds)
                    ->update(['ID_INSTITUCION' => $maestroId]),

                'usuarios_reasignados' => DB::table('usuarios')
                    ->whereIn('ID_INSTITUCION', $duplicadosIds)
                    ->update(['ID_INSTITUCION' => $maestroId]),

                'solicitudes_reasignadas' => DB::table('solicitudes_cliente')
                    ->whereIn('ID_INSTITUCION', $duplicadosIds)
                    ->update(['ID_INSTITUCION' => $maestroId]),
            ];

            $eliminadas = Institucion::whereIn('ID_INSTITUCION', $duplicadosIds)->delete();
            $reporte['instituciones_eliminadas'] = $eliminadas;

            DB::commit();

            \Log::info('✅ Fusión de instituciones completada', $reporte);

            return response()->json([
                'success' => true,
                'message' => 'Instituciones fusionadas exitosamente',
                'reporte' => $reporte,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('❌ Error fusionando instituciones: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error durante la fusión: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Vista de fusión de clientes
     */
    public function clientes(Request $request)
    {
        $sugerencias = $this->detectarDuplicadosClientes();

        return Inertia::render('Fusion/Clientes', [
            'sugerencias' => $sugerencias,
        ]);
    }

    /**
     * Detectar posibles clientes duplicados
     * Criterio: mismo correo o nombre muy similar
     */
    private function detectarDuplicadosClientes(): array
    {
        $grupos = [];

        // 1. Agrupar por correo (por si existen duplicados de antes de la validación única)
        $porCorreo = Cliente::whereNotNull('CLIENTE_CORREO')
            ->where('CLIENTE_CORREO', '!=', '')
            ->get()
            ->groupBy('CLIENTE_CORREO')
            ->filter(fn($grupo) => $grupo->count() > 1);

        foreach ($porCorreo as $correo => $clientes) {
            $grupos[] = [
                'criterio' => 'Correo idéntico: ' . $correo,
                'clientes' => $clientes->map(fn($c) => $this->resumenCliente($c))->values(),
            ];
        }

        // 2. Agrupar por nombre normalizado
        $todos = Cliente::all();
        $normalizados = [];

        foreach ($todos as $cliente) {
            $normalizado = $this->normalizarTexto($cliente->CLIENTE_NOMBRE);
            $normalizados[$normalizado][] = $cliente;
        }

        foreach ($normalizados as $nombreNormalizado => $clientes) {
            if (count($clientes) > 1) {
                $ids = collect($clientes)->pluck('ID_CLIENTE')->sort()->values()->toArray();
                $yaExiste = collect($grupos)->contains(function ($g) use ($ids) {
                    $idsGrupo = collect($g['clientes'])->pluck('id')->sort()->values()->toArray();
                    return $idsGrupo === $ids;
                });

                if (!$yaExiste) {
                    $grupos[] = [
                        'criterio' => 'Nombre similar: "' . $clientes[0]->CLIENTE_NOMBRE . '"',
                        'clientes' => collect($clientes)->map(fn($c) => $this->resumenCliente($c))->values(),
                    ];
                }
            }
        }

        return $grupos;
    }

    private function resumenCliente(Cliente $cliente): array
    {
        return [
            'id' => $cliente->ID_CLIENTE,
            'nombre' => $cliente->CLIENTE_NOMBRE,
            'correo' => $cliente->CLIENTE_CORREO,
            'envia_correo' => $cliente->CLIENTE_ENVIAR_CORREO === 'si',
            'total_estudios' => $cliente->estudios()->count(),
        ];
    }

    /**
     * Búsqueda manual de clientes
     */
    public function buscarClientes(Request $request)
    {
        $termino = $request->get('q', '');

        $clientes = Cliente::when($termino, function ($q) use ($termino) {
                $q->where('CLIENTE_NOMBRE', 'LIKE', "%{$termino}%")
                  ->orWhere('CLIENTE_CORREO', 'LIKE', "%{$termino}%");
            })
            ->limit(20)
            ->get()
            ->map(fn($c) => $this->resumenCliente($c));

        return response()->json($clientes);
    }

    /**
     * Preview de la fusión de clientes
     */
    public function previewFusionClientes(Request $request)
    {
        $request->validate([
            'maestro_id' => 'required|integer|exists:clientes,ID_CLIENTE',
            'duplicados_ids' => 'required|array|min:1',
            'duplicados_ids.*' => 'integer|exists:clientes,ID_CLIENTE|different:maestro_id',
        ]);

        $duplicadosIds = $request->duplicados_ids;

        $preview = [
            'estudios' => DB::table('estudios')->whereIn('ID_CLIENTE', $duplicadosIds)->count(),
        ];

        return response()->json(['preview' => $preview]);
    }

    /**
     * Ejecutar la fusión de clientes
     */
    public function fusionarClientes(Request $request)
    {
        $request->validate([
            'maestro_id' => 'required|integer|exists:clientes,ID_CLIENTE',
            'duplicados_ids' => 'required|array|min:1',
            'duplicados_ids.*' => 'integer|exists:clientes,ID_CLIENTE|different:maestro_id',
        ]);

        $maestroId = $request->maestro_id;
        $duplicadosIds = $request->duplicados_ids;

        \Log::info('🔀 Iniciando fusión de clientes', [
            'maestro_id' => $maestroId,
            'duplicados_ids' => $duplicadosIds,
        ]);

        DB::beginTransaction();

        try {
            $reporte = [
                'estudios_reasignados' => DB::table('estudios')
                    ->whereIn('ID_CLIENTE', $duplicadosIds)
                    ->update(['ID_CLIENTE' => $maestroId]),
            ];

            // Eliminar directo con DB::table para evitar el evento 'updating'/validación única del modelo
            $eliminados = DB::table('clientes')->whereIn('ID_CLIENTE', $duplicadosIds)->delete();
            $reporte['clientes_eliminados'] = $eliminados;

            DB::commit();

            \Log::info('✅ Fusión de clientes completada', $reporte);

            return response()->json([
                'success' => true,
                'message' => 'Clientes fusionados exitosamente',
                'reporte' => $reporte,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('❌ Error fusionando clientes: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error durante la fusión: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Vista de fusión de usuarios (médicos y pacientes)
     */
    public function usuarios(Request $request)
    {
        $tipo = $request->get('tipo', 'medico'); // 'medico' o 'paciente'

        $sugerencias = $this->detectarDuplicadosUsuarios($tipo);

        return Inertia::render('Fusion/Usuarios', [
            'sugerencias' => $sugerencias,
            'tipoActivo' => $tipo,
        ]);
    }

    /**
     * Detectar posibles usuarios duplicados (dentro del mismo tipo)
     * Criterio: mismo correo (real, no autogenerado) o nombre+apellidos muy similar
     */
    private function detectarDuplicadosUsuarios(string $tipo): array
    {
        $grupos = [];

        $baseQuery = Usuario::where('USUARIO_TIPO', $tipo);

        // 1. Agrupar por correo real (excluir los generados automáticamente)
        $porCorreo = (clone $baseQuery)
            ->whereNotNull('USUARIO_CORREO')
            ->where('USUARIO_CORREO', '!=', '')
            ->where('USUARIO_CORREO', 'NOT LIKE', 'sin-correo-%')
            ->where('USUARIO_CORREO', 'NOT LIKE', '%@sin-correo.com')
            ->where('USUARIO_CORREO', 'NOT LIKE', 'sin_correo_%')
            ->get()
            ->groupBy(fn($u) => strtolower(trim($u->USUARIO_CORREO)))
            ->filter(fn($grupo) => $grupo->count() > 1);

        foreach ($porCorreo as $correo => $usuarios) {
            $grupos[] = [
                'criterio' => 'Correo idéntico: ' . $correo,
                'usuarios' => $usuarios->map(fn($u) => $this->resumenUsuario($u))->values(),
            ];
        }

        // 2. Agrupar por nombre + apellidos normalizado
        $todos = (clone $baseQuery)->get();
        $normalizados = [];

        foreach ($todos as $usuario) {
            $normalizado = $this->normalizarTexto($usuario->USUARIO_NOMBRE . ' ' . $usuario->USUARIO_APELLIDOS);
            $normalizados[$normalizado][] = $usuario;
        }

        foreach ($normalizados as $nombreNormalizado => $usuarios) {
            if (count($usuarios) > 1) {
                $ids = collect($usuarios)->pluck('ID_USUARIO')->sort()->values()->toArray();
                $yaExiste = collect($grupos)->contains(function ($g) use ($ids) {
                    $idsGrupo = collect($g['usuarios'])->pluck('id')->sort()->values()->toArray();
                    return $idsGrupo === $ids;
                });

                if (!$yaExiste) {
                    $primero = $usuarios[0];
                    $grupos[] = [
                        'criterio' => 'Nombre similar: "' . trim($primero->USUARIO_NOMBRE . ' ' . $primero->USUARIO_APELLIDOS) . '"',
                        'usuarios' => collect($usuarios)->map(fn($u) => $this->resumenUsuario($u))->values(),
                    ];
                }
            }
        }

        return $grupos;
    }

    private function resumenUsuario(Usuario $usuario): array
    {
        return [
            'id' => $usuario->ID_USUARIO,
            'nombre' => trim($usuario->USUARIO_NOMBRE . ' ' . $usuario->USUARIO_APELLIDOS),
            'correo' => $usuario->USUARIO_CORREO,
            'telefono' => $usuario->USUARIO_TELEFONO,
            'tipo' => $usuario->USUARIO_TIPO,
            'institucion' => $usuario->institucion->INSTITUCION_NOMBRE ?? null,
            'total_estudios_medico' => $usuario->USUARIO_TIPO === 'medico' ? $usuario->estudios()->count() : 0,
            'total_estudios_paciente' => $usuario->USUARIO_TIPO === 'paciente' ? $usuario->estudiosComoPaciente()->count() : 0,
        ];
    }

    /**
     * Búsqueda manual de usuarios (limitada a un tipo específico)
     */
    public function buscarUsuarios(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:medico,paciente',
        ]);

        $termino = $request->get('q', '');
        $tipo = $request->tipo;

        $usuarios = Usuario::where('USUARIO_TIPO', $tipo)
            ->when($termino, function ($q) use ($termino) {
                $q->where(function ($sub) use ($termino) {
                    $sub->where('USUARIO_NOMBRE', 'LIKE', "%{$termino}%")
                        ->orWhere('USUARIO_APELLIDOS', 'LIKE', "%{$termino}%")
                        ->orWhere('USUARIO_CORREO', 'LIKE', "%{$termino}%");
                });
            })
            ->limit(20)
            ->get()
            ->map(fn($u) => $this->resumenUsuario($u));

        return response()->json($usuarios);
    }

    /**
     * Preview de la fusión de usuarios
     */
    public function previewFusionUsuarios(Request $request)
    {
        $request->validate([
            'maestro_id' => 'required|integer|exists:usuarios,ID_USUARIO',
            'duplicados_ids' => 'required|array|min:1',
            'duplicados_ids.*' => 'integer|exists:usuarios,ID_USUARIO|different:maestro_id',
        ]);

        $maestroId = $request->maestro_id;
        $duplicadosIds = $request->duplicados_ids;

        // Validar que todos sean del mismo tipo (candado de seguridad)
        $tipos = Usuario::whereIn('ID_USUARIO', array_merge([$maestroId], $duplicadosIds))
            ->pluck('USUARIO_TIPO')
            ->unique();

        if ($tipos->count() > 1) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede fusionar usuarios de distinto tipo (médico con paciente).',
            ], 422);
        }

        $preview = [
            'estudios_como_medico' => DB::table('estudios')->whereIn('ID_MEDICO', $duplicadosIds)->count(),
            'estudios_como_paciente' => DB::table('estudios')->whereIn('ID_PACIENTE', $duplicadosIds)->count(),
            'correos_copia' => DB::table('correos_copia')->whereIn('ID_USUARIO', $duplicadosIds)->count(),
            'envios_como_medico' => DB::table('envios_correos')->whereIn('ID_MEDICO', $duplicadosIds)->count(),
            'envios_como_emisor' => DB::table('envios_correos')->whereIn('ID_USUARIO_ENVIO', $duplicadosIds)->count(),
            'solicitudes_cliente' => DB::table('solicitudes_cliente')->whereIn('ID_MEDICO', $duplicadosIds)->count(),
        ];

        return response()->json(['preview' => $preview]);
    }

    /**
     * Ejecutar la fusión de usuarios
     */
    public function fusionarUsuarios(Request $request)
    {
        $request->validate([
            'maestro_id' => 'required|integer|exists:usuarios,ID_USUARIO',
            'duplicados_ids' => 'required|array|min:1',
            'duplicados_ids.*' => 'integer|exists:usuarios,ID_USUARIO|different:maestro_id',
        ]);

        $maestroId = $request->maestro_id;
        $duplicadosIds = $request->duplicados_ids;

        // Candado de seguridad: mismo tipo obligatorio
        $tipos = Usuario::whereIn('ID_USUARIO', array_merge([$maestroId], $duplicadosIds))
            ->pluck('USUARIO_TIPO')
            ->unique();

        if ($tipos->count() > 1) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede fusionar usuarios de distinto tipo (médico con paciente).',
            ], 422);
        }

        \Log::info('🔀 Iniciando fusión de usuarios', [
            'maestro_id' => $maestroId,
            'duplicados_ids' => $duplicadosIds,
            'tipo' => $tipos->first(),
        ]);

        DB::beginTransaction();

        try {
            $reporte = [
                'estudios_medico_reasignados' => DB::table('estudios')
                    ->whereIn('ID_MEDICO', $duplicadosIds)
                    ->update(['ID_MEDICO' => $maestroId]),

                'estudios_paciente_reasignados' => DB::table('estudios')
                    ->whereIn('ID_PACIENTE', $duplicadosIds)
                    ->update(['ID_PACIENTE' => $maestroId]),

                'correos_copia_reasignados' => DB::table('correos_copia')
                    ->whereIn('ID_USUARIO', $duplicadosIds)
                    ->update(['ID_USUARIO' => $maestroId]),

                'envios_medico_reasignados' => DB::table('envios_correos')
                    ->whereIn('ID_MEDICO', $duplicadosIds)
                    ->update(['ID_MEDICO' => $maestroId]),

                'envios_emisor_reasignados' => DB::table('envios_correos')
                    ->whereIn('ID_USUARIO_ENVIO', $duplicadosIds)
                    ->update(['ID_USUARIO_ENVIO' => $maestroId]),

                'solicitudes_reasignadas' => DB::table('solicitudes_cliente')
                    ->whereIn('ID_MEDICO', $duplicadosIds)
                    ->update(['ID_MEDICO' => $maestroId]),
            ];

            $eliminados = DB::table('usuarios')->whereIn('ID_USUARIO', $duplicadosIds)->delete();
            $reporte['usuarios_eliminados'] = $eliminados;

            DB::commit();

            \Log::info('✅ Fusión de usuarios completada', $reporte);

            return response()->json([
                'success' => true,
                'message' => 'Usuarios fusionados exitosamente',
                'reporte' => $reporte,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('❌ Error fusionando usuarios: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error durante la fusión: ' . $e->getMessage(),
            ], 500);
        }
    }
}