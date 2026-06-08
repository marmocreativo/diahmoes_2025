<?php

namespace App\Http\Controllers;

use App\Models\ReporteAcceso;
use App\Models\ReporteLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReporteController extends Controller
{
    // -------------------------------------------------------------------------
    // LOGIN
    // -------------------------------------------------------------------------

    public function loginForm(Request $request)
    {
        if (Auth::check()) {
            $usuario = \App\Models\Usuario::where('USUARIO_CORREO', Auth::user()->email)
                ->where('USUARIO_TIPO', 'admin')
                ->where('USUARIO_ESTADO', 'activo')
                ->first();

            if ($usuario) {
                $this->establecerSesionAdmin($request, Auth::user());
                return redirect()->route('reportes.index');
            }
        }

        if ($request->session()->get('reporte_autenticado') === true) {
            return redirect()->route('reportes.index');
        }

        return Inertia::render('Reportes/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $acceso = ReporteAcceso::where('email', $request->email)
            ->where('activo', 1)
            ->first();

        if (! $acceso || ! $acceso->verificarPassword($request->password)) {
            return back()->withErrors([
                'email' => 'Credenciales incorrectas o acceso desactivado.',
            ]);
        }

        $request->session()->put('reporte_autenticado', true);
        $request->session()->put('reporte_acceso_id', $acceso->id);
        $request->session()->put('reporte_user_id', null);
        $request->session()->put('reporte_nombre', $acceso->nombre);
        $request->session()->put('reporte_tipo', 'externo');

        ReporteLog::registrar($request, 'login', "Inicio de sesión: {$acceso->nombre} ({$acceso->email})");

        return redirect()->route('reportes.index');
    }

    public function logout(Request $request)
    {
        $request->session()->forget([
            'reporte_autenticado',
            'reporte_acceso_id',
            'reporte_user_id',
            'reporte_nombre',
            'reporte_tipo',
        ]);

        return redirect()->route('reportes.login');
    }

    // -------------------------------------------------------------------------
    // REPORTE PRINCIPAL
    // -------------------------------------------------------------------------

    public function index(Request $request)
    {
        if (Auth::check() && ! $request->session()->has('reporte_autenticado')) {
            $this->establecerSesionAdmin($request, Auth::user());
        }

        $fechaDesde    = $request->get('fecha_desde', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $fechaHasta    = $request->get('fecha_hasta', Carbon::now()->format('Y-m-d'));
        $muestraEstado = $request->get('muestra_estado');
        $tipoEstudio   = $request->get('tipo_estudio');
        $prefijo       = 'PRM';
        $institucion   = $request->get('institucion');

        if ($request->hasAny(['fecha_desde', 'fecha_hasta', 'muestra_estado', 'tipo_estudio', 'institucion'])) {
            $descripcion = "Filtros aplicados — Desde: {$fechaDesde}, Hasta: {$fechaHasta}";
            if ($muestraEstado) $descripcion .= ", Estado: {$muestraEstado}";
            if ($tipoEstudio)   $descripcion .= ", Tipo: {$tipoEstudio}";
            if ($institucion)   $descripcion .= ", Institución ID: {$institucion}";

            ReporteLog::registrar($request, 'filtro', $descripcion);
        }

        $filtros = $this->getFiltros();

        $datos = [
            'metricas_principales'   => $this->getMetricasPrincipales($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'graficas_pie'           => $this->getGraficasPie($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'top_instituciones'      => $this->getTopInstituciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'todas_instituciones'    => $this->getTodasInstituciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'top_estados'            => $this->getTopEstados($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'todos_estados'          => $this->getTodosEstados($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'tendencia_5_anios'      => $this->getEstudiosUltimos5Anios($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'comparativa_tipos'      => $this->getComparativaTiposEstudio($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'comparativa_mutacion'   => $this->getComparativaMutacion($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'comparacion_3_periodos' => $this->getComparacion3Periodos($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'predicciones'           => $this->getPredicciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'estudios_faltantes'     => $this->getEstudiosFaltantes($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
            'estudios_periodo' => $this->getEstudiosPeriodo($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion),
        ];

        return Inertia::render('Reportes/Index', [
            'filtros'        => $filtros,
            'datos'          => $datos,
            'filtrosActivos' => [
                'fecha_desde'    => $fechaDesde,
                'fecha_hasta'    => $fechaHasta,
                'muestra_estado' => $muestraEstado,
                'tipo_estudio'   => $tipoEstudio,
                'institucion'    => $institucion,
            ],
            'sesionInfo' => [
                'nombre' => $request->session()->get('reporte_nombre'),
                'tipo'   => $request->session()->get('reporte_tipo'),
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // EXPORTACIÓN EXCEL
    // -------------------------------------------------------------------------

    public function exportExcel(Request $request)
    {
        $filters = $request->all();

        $descripcion = "Exportación Excel — Desde: " . ($filters['fecha_inicio'] ?? 'N/A') . ", Hasta: " . ($filters['fecha_fin'] ?? 'N/A');
        if (! empty($filters['muestra_estado'])) $descripcion .= ", Estado: {$filters['muestra_estado']}";
        if (! empty($filters['tipo_estudio']))   $descripcion .= ", Tipo: {$filters['tipo_estudio']}";
        if (! empty($filters['prefijo']))        $descripcion .= ", Prefijo: {$filters['prefijo']}";

        ReporteLog::registrar($request, 'exportacion', $descripcion);

        $spreadsheet = new Spreadsheet();
        $this->createHojaGeneral($spreadsheet, $filters);
        $this->createHojaDetallada($spreadsheet, $filters);

        $fileName = 'reporte_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
        $writer   = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    // -------------------------------------------------------------------------
    // HELPERS DE SESIÓN
    // -------------------------------------------------------------------------

    private function establecerSesionAdmin(Request $request, $user): void
    {
        $request->session()->put('reporte_autenticado', true);
        $request->session()->put('reporte_acceso_id', null);
        $request->session()->put('reporte_user_id', $user->id);
        $request->session()->put('reporte_nombre', $user->name);
        $request->session()->put('reporte_tipo', 'admin');

        ReporteLog::registrar($request, 'login', "Acceso admin del sistema: {$user->name} ({$user->email})");
    }

    // -------------------------------------------------------------------------
    // QUERIES — copiadas del DashboardController
    // -------------------------------------------------------------------------

    private function getFiltros(): array
    {
        return [
            'muestra_estados' => DB::table('estudios')
                ->select('MUESTRA_ESTADO')
                ->whereNotNull('MUESTRA_ESTADO')
                ->where('MUESTRA_ESTADO', '!=', '')
                ->distinct()
                ->orderBy('MUESTRA_ESTADO')
                ->pluck('MUESTRA_ESTADO'),
            'tipos_estudio' => DB::table('estudios')
                ->select('MUESTRA_TIPO_ESTUDIO')
                ->whereNotNull('MUESTRA_TIPO_ESTUDIO')
                ->where('MUESTRA_TIPO_ESTUDIO', '!=', '')
                ->distinct()
                ->orderBy('MUESTRA_TIPO_ESTUDIO')
                ->pluck('MUESTRA_TIPO_ESTUDIO'),
            'instituciones' => DB::table('instituciones')
                ->select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
                ->orderBy('INSTITUCION_NOMBRE')
                ->get()
                ->map(fn($i) => [
                    'id'     => $i->ID_INSTITUCION,
                    'nombre' => $i->INSTITUCION_NOMBRE,
                ]),
        ];
    }

    private function getQueryBase($fechaDesde, $fechaHasta, $muestraEstado = null, $tipoEstudio = null, $prefijo = null, $institucion = null)
    {
        $query = DB::table('estudios')
            ->whereBetween('FECHA_RECEPCION', [$fechaDesde . ' 00:00:00', $fechaHasta . ' 23:59:59'])
            ->whereNotNull('FECHA_RECEPCION')
            ->where('FECHA_RECEPCION', '>', '1000-01-01 00:00:00');

        if ($muestraEstado) $query->where('MUESTRA_ESTADO', $muestraEstado);
        if ($tipoEstudio)   $query->where('MUESTRA_TIPO_ESTUDIO', $tipoEstudio);
        if ($prefijo)       $query->where('CLAVE', $prefijo);
        if ($institucion)   $query->where('ID_INSTITUCION', $institucion);

        return $query;
    }

    private function getMetricasPrincipales($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion): array
    {
        $totalEstudios = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)->count();

        $pendientes = (clone $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo))
            ->where(function ($q) {
                $q->where('ESTUDIO_ESTADO', '!=', 'Resultados Enviados')
                  ->orWhereNull('ESTUDIO_ESTADO')
                  ->orWhere('ESTUDIO_ESTADO', '');
            })->count();

        return [
            'total_estudios' => $totalEstudios,
            'pendientes'     => $pendientes,
            'completados'    => $totalEstudios - $pendientes,
        ];
    }

    private function getGraficasPie($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo): array
    {
        $muestraTipoEstudio = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->select('MUESTRA_TIPO_ESTUDIO', DB::raw('COUNT(*) as total'))
            ->groupBy('MUESTRA_TIPO_ESTUDIO')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'name'  => empty($item->MUESTRA_TIPO_ESTUDIO) ? 'N/D' : $item->MUESTRA_TIPO_ESTUDIO,
                'value' => $item->total,
            ]);

        return ['tipo_estudio' => $this->agruparPorcentajesBajos($muestraTipoEstudio)];
    }

    private function getTopInstituciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->join('instituciones', 'estudios.ID_INSTITUCION', '=', 'instituciones.ID_INSTITUCION')
            ->select('instituciones.INSTITUCION_NOMBRE as nombre', DB::raw('COUNT(*) as total'))
            ->groupBy('estudios.ID_INSTITUCION', 'instituciones.INSTITUCION_NOMBRE')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn($item) => ['name' => $item->nombre, 'value' => $item->total]);
    }

    private function getTodasInstituciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->join('instituciones', 'estudios.ID_INSTITUCION', '=', 'instituciones.ID_INSTITUCION')
            ->select('instituciones.INSTITUCION_NOMBRE as nombre', DB::raw('COUNT(*) as total'))
            ->groupBy('estudios.ID_INSTITUCION', 'instituciones.INSTITUCION_NOMBRE')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => ['name' => $item->nombre, 'value' => $item->total]);
    }

    private function getTopEstados($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->select('MUESTRA_ESTADO as estado', DB::raw('COUNT(*) as total'))
            ->whereNotNull('MUESTRA_ESTADO')
            ->where('MUESTRA_ESTADO', '!=', '')
            ->groupBy('MUESTRA_ESTADO')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn($item) => ['name' => $item->estado, 'value' => $item->total]);
    }

    private function getTodosEstados($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->select('MUESTRA_ESTADO as estado', DB::raw('COUNT(*) as total'))
            ->whereNotNull('MUESTRA_ESTADO')
            ->where('MUESTRA_ESTADO', '!=', '')
            ->groupBy('MUESTRA_ESTADO')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => ['name' => $item->estado, 'value' => $item->total]);
    }

    private function getEstudiosUltimos5Anios($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
    {
        $fechaLimite = Carbon::now()->subYears(5)->startOfYear()->format('Y-m-d');

        $query = DB::table('estudios')
            ->select(
                DB::raw('YEAR(FECHA_RECEPCION) as anio'),
                DB::raw('MONTH(FECHA_RECEPCION) as mes'),
                DB::raw('COUNT(*) as total')
            )
            ->where('FECHA_RECEPCION', '>=', $fechaLimite)
            ->whereNotNull('FECHA_RECEPCION')
            ->where('FECHA_RECEPCION', '>', '1000-01-01 00:00:00');

        if ($muestraEstado) $query->where('MUESTRA_ESTADO', $muestraEstado);
        if ($tipoEstudio)   $query->where('MUESTRA_TIPO_ESTUDIO', $tipoEstudio);
        if ($prefijo)       $query->where('CLAVE', $prefijo);

        return $query
            ->groupBy(DB::raw('YEAR(FECHA_RECEPCION)'), DB::raw('MONTH(FECHA_RECEPCION)'))
            ->orderBy(DB::raw('YEAR(FECHA_RECEPCION)'))
            ->orderBy(DB::raw('MONTH(FECHA_RECEPCION)'))
            ->get()
            ->map(function ($item) {
                $fecha = Carbon::createFromDate($item->anio, $item->mes, 1);
                return [
                    'mes'            => $fecha->format('M Y'),
                    'total'          => $item->total,
                    'fecha_completa' => $fecha->format('Y-m'),
                ];
            });
    }

    private function getComparativaTiposEstudio($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo): array
    {
        $fechaLimite = Carbon::now()->subYears(5)->startOfYear()->format('Y-m-d');

        $tipos = DB::table('estudios')
            ->select('MUESTRA_TIPO_ESTUDIO')
            ->where('FECHA_RECEPCION', '>=', $fechaLimite)
            ->whereNotNull('MUESTRA_TIPO_ESTUDIO')
            ->where('MUESTRA_TIPO_ESTUDIO', '!=', '')
            ->distinct()
            ->pluck('MUESTRA_TIPO_ESTUDIO')
            ->toArray();

        $query = DB::table('estudios')
            ->select(
                DB::raw('YEAR(FECHA_RECEPCION) as anio'),
                DB::raw('MONTH(FECHA_RECEPCION) as mes'),
                'MUESTRA_TIPO_ESTUDIO',
                DB::raw('COUNT(*) as total')
            )
            ->where('FECHA_RECEPCION', '>=', $fechaLimite)
            ->whereNotNull('FECHA_RECEPCION')
            ->where('FECHA_RECEPCION', '>', '1000-01-01 00:00:00')
            ->whereNotNull('MUESTRA_TIPO_ESTUDIO')
            ->where('MUESTRA_TIPO_ESTUDIO', '!=', '');

        if ($muestraEstado) $query->where('MUESTRA_ESTADO', $muestraEstado);
        if ($tipoEstudio)   $query->where('MUESTRA_TIPO_ESTUDIO', $tipoEstudio);
        if ($prefijo)       $query->where('CLAVE', $prefijo);

        $datos = $query
            ->groupBy(DB::raw('YEAR(FECHA_RECEPCION)'), DB::raw('MONTH(FECHA_RECEPCION)'), 'MUESTRA_TIPO_ESTUDIO')
            ->orderBy(DB::raw('YEAR(FECHA_RECEPCION)'))
            ->orderBy(DB::raw('MONTH(FECHA_RECEPCION)'))
            ->get();

        $mesesMap = [];
        foreach ($datos as $item) {
            $fecha    = Carbon::createFromDate($item->anio, $item->mes, 1);
            $mesKey   = $fecha->format('Y-m');
            $mesLabel = $fecha->format('M Y');

            if (! isset($mesesMap[$mesKey])) {
                $mesesMap[$mesKey] = ['mes' => $mesLabel, 'fecha_completa' => $mesKey];
                foreach ($tipos as $t) {
                    $mesesMap[$mesKey][$t] = 0;
                }
            }

            if ($item->MUESTRA_TIPO_ESTUDIO) {
                $mesesMap[$mesKey][$item->MUESTRA_TIPO_ESTUDIO] = $item->total;
            }
        }

        ksort($mesesMap);

        return [
            'datos'         => array_values($mesesMap),
            'tipos_estudio' => $tipos,
        ];
    }

    private function getComparativaMutacion($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo): array
    {
        $base = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo);

        $mutado = (clone $base)
            ->where(function ($q) {
                $q->where('R_ESTATUS_KRAS', 'Mutado')
                  ->orWhere('R_ESTATUS_NRAS', 'Mutado')
                  ->orWhere('R_ESTATUS_BRAF', 'Mutado');
            })->count();

        $noMutado = (clone $base)
            ->where('R_ESTATUS_KRAS', 'No Mutado')
            ->where('R_ESTATUS_NRAS', 'No Mutado')
            ->where(function ($q) {
                $q->where('R_ESTATUS_BRAF', 'No Mutado')->orWhereNull('R_ESTATUS_BRAF');
            })->count();

        $total    = (clone $base)->count();
        $invalido = $total - $mutado - $noMutado;

        return [
            'mutado'    => $mutado,
            'no_mutado' => $noMutado,
            'invalido'  => max(0, $invalido),
        ];
    }

    private function getComparacion3Periodos($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo): array
    {
        $actual = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)->count();

        $fd1   = Carbon::parse($fechaDesde)->subYear()->format('Y-m-d');
        $fh1   = Carbon::parse($fechaHasta)->subYear()->format('Y-m-d');
        $hace1 = $this->getQueryBase($fd1, $fh1, $muestraEstado, $tipoEstudio, $prefijo)->count();

        $fd2   = Carbon::parse($fechaDesde)->subYears(2)->format('Y-m-d');
        $fh2   = Carbon::parse($fechaHasta)->subYears(2)->format('Y-m-d');
        $hace2 = $this->getQueryBase($fd2, $fh2, $muestraEstado, $tipoEstudio, $prefijo)->count();

        return [
            'actual'              => $actual,
            'hace_1_anio'         => $hace1,
            'hace_2_anios'        => $hace2,
            'cambio_1_anio'       => $hace1 > 0 ? round((($actual - $hace1) / $hace1) * 100, 1) : 0,
            'cambio_2_anios'      => $hace2 > 0 ? round((($actual - $hace2) / $hace2) * 100, 1) : 0,
            'comparacion_mensual' => $this->getComparacionMensual3Periodos($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
        ];
    }

    private function getComparacionMensual3Periodos($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo): array
    {
        $fechaInicio = Carbon::parse($fechaDesde);
        $fechaFin    = Carbon::parse($fechaHasta);
        $meses       = [];
        $fechaActual = $fechaInicio->copy();

        while ($fechaActual->lte($fechaFin)) {
            $ini = $fechaActual->copy()->startOfMonth();
            $fin = $fechaActual->copy()->endOfMonth();

            if ($ini->lt($fechaInicio)) $ini = $fechaInicio->copy();
            if ($fin->gt($fechaFin))    $fin = $fechaFin->copy();

            $meses[] = [
                'mes'              => $fechaActual->format('M Y'),
                'estudios_actual'  => $this->getQueryBase($ini->format('Y-m-d'), $fin->format('Y-m-d'), $muestraEstado, $tipoEstudio, $prefijo)->count(),
                'estudios_1_anio'  => $this->getQueryBase($ini->copy()->subYear()->format('Y-m-d'), $fin->copy()->subYear()->format('Y-m-d'), $muestraEstado, $tipoEstudio, $prefijo)->count(),
                'estudios_2_anios' => $this->getQueryBase($ini->copy()->subYears(2)->format('Y-m-d'), $fin->copy()->subYears(2)->format('Y-m-d'), $muestraEstado, $tipoEstudio, $prefijo)->count(),
            ];

            $fechaActual->addMonth();
        }

        return $meses;
    }

    private function getPredicciones($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo): array
    {
        $mesSiguiente       = Carbon::now()->addMonth();
        $mesSiguienteNumero = $mesSiguiente->month;

        $datos = DB::table('estudios')
            ->select(DB::raw('YEAR(FECHA_RECEPCION) as anio'), DB::raw('COUNT(*) as total'))
            ->whereNotNull('FECHA_RECEPCION')
            ->where('FECHA_RECEPCION', '>', '1000-01-01 00:00:00')
            ->whereRaw('MONTH(FECHA_RECEPCION) = ?', [$mesSiguienteNumero]);

        if ($muestraEstado) $datos->where('MUESTRA_ESTADO', $muestraEstado);
        if ($tipoEstudio)   $datos->where('MUESTRA_TIPO_ESTUDIO', $tipoEstudio);
        if ($prefijo)       $datos->where('CLAVE', $prefijo);

        $historico = $datos->groupBy(DB::raw('YEAR(FECHA_RECEPCION)'))->get();

        $prediccion      = $historico->isNotEmpty() ? (int) round($historico->avg('total')) : 0;
        $aniosAnalizados = $historico->count();

        return [
            'mes_siguiente'            => $mesSiguiente->locale('es')->isoFormat('MMMM YYYY'),
            'mes_siguiente_numero'     => $mesSiguienteNumero,
            'prediccion_mes_siguiente' => $prediccion,
            'datos_historicos_mes'     => $historico->toArray(),
            'anios_analizados'         => $aniosAnalizados,
        ];
    }

    private function getEstudiosFaltantes($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo): array
    {
        $estudiosEncontrados = $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo)
            ->select('ID', 'CLAVE', 'ANIO', 'SERIADO', 'CLAVE_INTERNA')
            ->orderBy('CLAVE')->orderBy('ANIO')->orderBy('SERIADO')
            ->get();

        $gruposClave       = $estudiosEncontrados->groupBy(fn($e) => $e->CLAVE . '_' . $e->ANIO);
        $estudiosFaltantes = [];

        foreach ($gruposClave as $grupoKey => $estudios) {
            [$clave, $anio]    = explode('_', $grupoKey);
            $seriados          = $estudios->pluck('SERIADO')->toArray();
            $seriadosFaltantes = array_diff(range(min($seriados), max($seriados)), $seriados);

            foreach ($seriadosFaltantes as $seriado) {
                $e = DB::table('estudios')
                    ->select('ID', 'CLAVE_INTERNA', 'CLAVE', 'ANIO', 'SERIADO', 'FECHA_RECEPCION', 'MUESTRA_TIPO_ESTUDIO', 'ESTUDIO_ESTADO', 'MUESTRA_ESTADO')
                    ->where('CLAVE', $clave)->where('ANIO', $anio)->where('SERIADO', $seriado)
                    ->first();

                if ($e) {
                    $estudiosFaltantes[] = [
                        'id'              => $e->ID,
                        'clave_interna'   => $e->CLAVE_INTERNA,
                        'clave'           => $e->CLAVE,
                        'anio'            => $e->ANIO,
                        'seriado'         => $e->SERIADO,
                        'fecha_recepcion' => $e->FECHA_RECEPCION,
                        'tipo_estudio'    => $e->MUESTRA_TIPO_ESTUDIO ?: 'N/D',
                        'estado'          => $e->ESTUDIO_ESTADO ?: 'Sin estado',
                        'url'             => "/estudios/{$e->ID}",
                        'razon_faltante'  => $this->determinarRazonFaltante($e, $fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo),
                    ];
                }
            }
        }

        return collect($estudiosFaltantes)->sortBy(['clave', 'anio', 'seriado'])->values()->all();
    }

    private function determinarRazonFaltante($estudio, $fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo): string
    {
        $razones = [];

        if ($estudio->FECHA_RECEPCION) {
            $f = date('Y-m-d', strtotime($estudio->FECHA_RECEPCION));
            if ($f < $fechaDesde || $f > $fechaHasta) $razones[] = 'Fecha fuera del rango';
        } else {
            $razones[] = 'Sin fecha de recepción';
        }

        if ($muestraEstado && $estudio->MUESTRA_ESTADO !== $muestraEstado) {
            $razones[] = "Estado: {$estudio->MUESTRA_ESTADO} (filtrado: {$muestraEstado})";
        }
        if ($tipoEstudio && $estudio->MUESTRA_TIPO_ESTUDIO !== $tipoEstudio) {
            $razones[] = "Tipo: {$estudio->MUESTRA_TIPO_ESTUDIO} (filtrado: {$tipoEstudio})";
        }
        if ($prefijo && $estudio->CLAVE !== $prefijo) {
            $razones[] = "Prefijo: {$estudio->CLAVE} (filtrado: {$prefijo})";
        }

        return empty($razones) ? 'Datos incompletos' : implode(', ', $razones);
    }

    // -------------------------------------------------------------------------
    // EXCEL
    // -------------------------------------------------------------------------

    private function createHojaGeneral($spreadsheet, $filters): void
    {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Reporte General');

        $fechaInicio = $filters['fecha_inicio'] ?? 'No especificada';
        $fechaFin    = $filters['fecha_fin'] ?? 'No especificada';

        $sheet->setCellValue('A1', 'REPORTE GENERAL DE ESTUDIOS');
        $sheet->setCellValue('A2', "Periodo: {$fechaInicio} al {$fechaFin}");
        $sheet->setCellValue('A3', 'Este reporte muestra información general de los estudios procesados en el periodo seleccionado');

        $headers = [
            'A5' => 'Año', 'B5' => 'Fecha Solicitud', 'C5' => 'Hora De Solicitud',
            'D5' => 'Persona Que Solicita', 'E5' => 'Médico De Recolección', 'F5' => 'Hospital',
            'G5' => 'Ciudad', 'H5' => 'Estado', 'I5' => 'Tipo de Muestra Solicitada',
            'J5' => 'No. De Muestras Recibidas', 'K5' => 'Estatus', 'L5' => 'Num Guía',
            'M5' => 'Mensajería', 'N5' => 'Fecha de Recolección', 'O5' => 'Motivo de estatus',
            'P5' => 'FOLIO MERCK',
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        $row = 6;
        foreach ($this->getDataGeneral($filters) as $dato) {
            $fs = $dato->FECHA_SOLICITUD_RECOLECCION ? Carbon::parse($dato->FECHA_SOLICITUD_RECOLECCION) : null;
            $fr = $dato->FECHA_RECOLECCION            ? Carbon::parse($dato->FECHA_RECOLECCION) : null;

            $sheet->setCellValue('A' . $row, $dato->ANIO ?? '');
            $sheet->setCellValue('B' . $row, $fs ? $fs->format('Y-m-d') : '');
            $sheet->setCellValue('C' . $row, $fs ? $fs->format('H:i:s') : '');
            $sheet->setCellValue('D' . $row, '');
            $sheet->setCellValue('E' . $row, $dato->medico_completo ?? '');
            $sheet->setCellValue('F' . $row, $dato->INSTITUCION_NOMBRE ?? '');
            $sheet->setCellValue('G' . $row, $dato->MUESTRA_CIUDAD ?? '');
            $sheet->setCellValue('H' . $row, $dato->MUESTRA_ESTADO ?? '');
            $sheet->setCellValue('I' . $row, '');
            $sheet->setCellValue('J' . $row, '');
            $sheet->setCellValue('K' . $row, $dato->ESTUDIO_ESTADO ?? '');
            $sheet->setCellValue('L' . $row, $dato->MUESTRA_GUIA ?? '');
            $sheet->setCellValue('M' . $row, $dato->mensajeria_nombre ?? '');
            $sheet->setCellValue('N' . $row, $fr ? $fr->format('Y-m-d') : '');
            $sheet->setCellValue('O' . $row, '');
            $sheet->setCellValue('P' . $row, $dato->FOLIO_MERCK ?? '');
            $row++;
        }

        $sheet->getStyle('A1:P1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A5:P5')->getFont()->setBold(true);
        $sheet->getStyle('A5:P5')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFE2E8F0');

        foreach (range('A', 'P') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    private function createHojaDetallada($spreadsheet, $filters): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Reporte Detallado');

        // SIN títulos — encabezados directamente en fila 1
        $headers = [
            'A1' => 'CODIGO INTERNO',
            'B1' => 'MU',
            'C1' => 'RECEPCION LAB',
            'D1' => 'ESTATUS',
            'E1' => 'SITIO DE LESION',
            'F1' => 'COLON/ASCEN-DESC',
            'G1' => 'BLOQUE',
            'H1' => 'LAMINILLA',
            'I1' => 'TIPO DE MUESTRA',
            'J1' => 'REPORTE DEL DIAGNOSTICO HISTOPATOLOGICO',
            'K1' => 'MEDICO TRATANTE',
            'L1' => 'HOSPITAL',
            'M1' => 'PROCEDENCIA',
            'N1' => 'TELÉFONO',
            'O1' => 'E-MAIL',
            'P1' => 'CIUDAD',
            'Q1' => 'ESTADO',
            'R1' => 'FECHA DE ANALISIS',
            'S1' => 'NOTAS',
            'T1' => 'RESULTADOS KRAS',
            'U1' => 'RESULTADOS NRAS',
            'V1' => 'INTERPRETACION RESULTADOS',
            'W1' => 'BRAF',
            'X1' => 'FECHA ENVIO REPORTE E-MAIL',
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        $row = 2;
        foreach ($this->getDataDetallada($filters) as $dato) {
            $frl = $dato->FECHA_RECEPCION_LABORATORIO ? Carbon::parse($dato->FECHA_RECEPCION_LABORATORIO) : null;
            $fe  = $dato->FECHA_RESULTADOS_CORREO      ? Carbon::parse($dato->FECHA_RESULTADOS_CORREO) : null;

            $kras = trim(($dato->R_ESTATUS_KRAS ?? '') . ' ' . ($dato->R_GENOTIPO_KRAS ?? ''));
            $nras = trim(($dato->R_ESTATUS_NRAS ?? '') . ' ' . ($dato->R_GENOTIPO_NRAS ?? ''));
            $braf = trim(($dato->R_ESTATUS_BRAF ?? '') . ' ' . ($dato->R_GENOTIPO_BRAF ?? ''));

            $sitio    = strtoupper(trim($dato->MUESTRA_SITIO_LESION ?? ''));
            $colonCol = match ($sitio) {
                'COLON DESCENDENTE' => 'DESC',
                'COLON ASCENDENTE'  => 'ASC',
                'COLON'             => 'ND',
                default             => 'ND',
            };

            $sheet->setCellValue('A' . $row, $dato->CLAVE_INTERNA ?? '');
            $sheet->setCellValue('B' . $row, $dato->FOLIO_MERCK ?? '');
            $sheet->setCellValue('C' . $row, $frl ? $frl->format('Y-m-d') : '');
            $sheet->setCellValue('D' . $row, $dato->ESTUDIO_ESTADO ?? '');
            $sheet->setCellValue('E' . $row, $dato->MUESTRA_SITIO_LESION ?? '');
            $sheet->setCellValue('F' . $row, $colonCol);
            $sheet->setCellValue('G' . $row, $dato->MUESTRA_BLOQUES ?? '');
            $sheet->setCellValue('H' . $row, $dato->MUESTRA_LAMINILLAS ?? '');
            $sheet->setCellValue('I' . $row, $dato->MUESTRA_TIPO_ESTUDIO ?? '');
            $sheet->setCellValue('J' . $row, $dato->MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA ?? '');
            $sheet->setCellValue('K' . $row, $dato->medico_completo ?? '');
            $sheet->setCellValue('L' . $row, $dato->INSTITUCION_NOMBRE ?? '');
            $sheet->setCellValue('M' . $row, $dato->INSTITUCION_PROCEDENCIA ?? '');
            $sheet->setCellValue('N' . $row, $dato->USUARIO_TELEFONO ?? '');
            $sheet->setCellValue('O' . $row, $dato->USUARIO_CORREO ?? '');
            $sheet->setCellValue('P' . $row, $dato->MUESTRA_CIUDAD ?? '');
            $sheet->setCellValue('Q' . $row, $dato->MUESTRA_ESTADO ?? '');
            $sheet->setCellValue('R' . $row, $frl ? $frl->format('Y-m-d') : '');
            $sheet->setCellValue('S' . $row, $dato->R_NOTAS_ESPECIALES ?? '');
            $sheet->setCellValue('T' . $row, $kras ?: '');
            $sheet->setCellValue('U' . $row, $nras ?: '');
            $sheet->setCellValue('V' . $row, $dato->R_INTERPRETACION ?? '');
            $sheet->setCellValue('W' . $row, $braf ?: '');
            $sheet->setCellValue('X' . $row, $fe ? $fe->format('Y-m-d') : '');
            $row++;
        }

        $sheet->getStyle('A1:X1')->getFont()->setBold(true);
        $sheet->getStyle('A1:X1')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFE2E8F0');

        foreach (range('A', 'X') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    private function getDataGeneral($filters)
    {
        $query = DB::table('estudios as e')
            ->leftJoin('usuarios as u', 'e.ID_MEDICO', '=', 'u.ID_USUARIO')
            ->leftJoin('instituciones as i', 'e.ID_INSTITUCION', '=', 'i.ID_INSTITUCION')
            ->leftJoin('mensajerias as m', 'e.MUESTRA_GUIA_MENSAJERIA', '=', 'm.ID')
            ->select(
                'e.ANIO', 'e.FECHA_SOLICITUD_RECOLECCION',
                DB::raw('CONCAT(u.USUARIO_NOMBRE, " ", u.USUARIO_APELLIDOS) as medico_completo'),
                'i.INSTITUCION_NOMBRE', 'e.MUESTRA_CIUDAD', 'e.MUESTRA_ESTADO',
                'e.ESTUDIO_ESTADO', 'e.MUESTRA_GUIA', 'm.NOMBRE as mensajeria_nombre',
                'e.FECHA_RECOLECCION', 'e.FOLIO_MERCK'
            );

        if (! empty($filters['fecha_inicio']))    $query->where('e.FECHA_RECEPCION', '>=', $filters['fecha_inicio']);
        if (! empty($filters['fecha_fin']))        $query->where('e.FECHA_RECEPCION', '<=', $filters['fecha_fin']);
        if (! empty($filters['muestra_estado']))   $query->where('e.MUESTRA_ESTADO', $filters['muestra_estado']);
        if (! empty($filters['tipo_estudio']))     $query->where('e.MUESTRA_TIPO_ESTUDIO', $filters['tipo_estudio']);
        if (! empty($filters['prefijo']))          $query->where('e.CLAVE', $filters['prefijo']);

        return $query->get();
    }

    private function getDataDetallada($filters)
    {
        $query = DB::table('estudios as e')
            ->leftJoin('usuarios as u', 'e.ID_MEDICO', '=', 'u.ID_USUARIO')
            ->leftJoin('instituciones as i', 'e.ID_INSTITUCION', '=', 'i.ID_INSTITUCION')
            ->select(
                'e.CLAVE_INTERNA', 'e.FOLIO_MERCK', 'e.MUESTRA_CLAVE',
                'e.FECHA_RECEPCION_LABORATORIO', 'e.ESTUDIO_ESTADO',
                'e.MUESTRA_SITIO_LESION', 'e.MUESTRA_BLOQUES', 'e.MUESTRA_LAMINILLAS',
                'e.MUESTRA_TIPO_ESTUDIO', 'e.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA',
                DB::raw('CONCAT(u.USUARIO_NOMBRE, " ", u.USUARIO_APELLIDOS) as medico_completo'),
                'i.INSTITUCION_NOMBRE', 'i.INSTITUCION_PROCEDENCIA',
                'u.USUARIO_TELEFONO', 'u.USUARIO_CORREO',
                'e.MUESTRA_CIUDAD', 'e.MUESTRA_ESTADO',
                'e.R_ESTATUS_KRAS', 'e.R_GENOTIPO_KRAS',
                'e.R_ESTATUS_NRAS', 'e.R_GENOTIPO_NRAS',
                'e.R_INTERPRETACION',
                'e.R_ESTATUS_BRAF', 'e.R_GENOTIPO_BRAF',
                'e.FECHA_RESULTADOS_CORREO'
            );

        if (! empty($filters['fecha_inicio']))    $query->where('e.FECHA_RECEPCION', '>=', $filters['fecha_inicio']);
        if (! empty($filters['fecha_fin']))        $query->where('e.FECHA_RECEPCION', '<=', $filters['fecha_fin']);
        if (! empty($filters['muestra_estado']))   $query->where('e.MUESTRA_ESTADO', $filters['muestra_estado']);
        if (! empty($filters['tipo_estudio']))     $query->where('e.MUESTRA_TIPO_ESTUDIO', $filters['tipo_estudio']);
        if (! empty($filters['prefijo']))          $query->where('e.CLAVE', $filters['prefijo']);

        return $query->get();
    }

    private function agruparPorcentajesBajos($coleccion)
    {
        $total = $coleccion->sum('value');
        if ($total === 0) return $coleccion;

        $principales = $coleccion->filter(fn($item) => ($item['value'] / $total) >= 0.05);
        $otros       = $coleccion->filter(fn($item) => ($item['value'] / $total) < 0.05);

        if ($otros->isNotEmpty()) {
            $principales->push(['name' => 'Otros', 'value' => $otros->sum('value')]);
        }

        return $principales->values();
    }

    private function getEstudiosPeriodo($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion)
    {
        return $this->getQueryBase($fechaDesde, $fechaHasta, $muestraEstado, $tipoEstudio, $prefijo, $institucion)
            ->select(
                'ID', 'CLAVE_INTERNA', 'CLAVE', 'MUESTRA_TIPO_ESTUDIO', 'ESTUDIO_ESTADO',
                'FECHA_SOLICITUD_RECOLECCION', 'FECHA_RECEPCION', 'FECHA_RECEPCION_LABORATORIO',
                'FECHA_OBTENCION_RESULTADOS', 'FECHA_RESULTADOS_CORREO'
            )
            ->orderBy('CLAVE')->orderBy('ANIO')->orderBy('SERIADO')
            ->get()
            ->map(fn($e) => [
                'id'                          => $e->ID,
                'clave_interna'               => $e->CLAVE_INTERNA,
                'clave'                       => $e->CLAVE,
                'tipo_estudio'                => $e->MUESTRA_TIPO_ESTUDIO ?: 'N/D',
                'estado'                      => $e->ESTUDIO_ESTADO ?: 'Sin estado',
                'fecha_solicitud_recoleccion' => $e->FECHA_SOLICITUD_RECOLECCION,
                'fecha_recepcion'             => $e->FECHA_RECEPCION,
                'fecha_recepcion_laboratorio' => $e->FECHA_RECEPCION_LABORATORIO,
                'fecha_obtencion_resultados'  => $e->FECHA_OBTENCION_RESULTADOS,
                'fecha_resultados_correo'     => $e->FECHA_RESULTADOS_CORREO,
            ]);
    }
}