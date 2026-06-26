<?php

namespace App\Http\Controllers;

use App\Models\SolicitudCliente;
use App\Models\Estudio;
use App\Models\Usuario;
use App\Models\Institucion;
use App\Models\ReporteAcceso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\SolicitudClienteRecibida;
use Inertia\Inertia;
use Carbon\Carbon;

class SolicitudClienteController extends Controller
{
    // -------------------------------------------------------------------------
    // VISTA INTERNA (admin) — lista de todas las solicitudes
    // -------------------------------------------------------------------------

    public function index(Request $request)
    {
        $query = SolicitudCliente::with(['medico', 'institucion', 'accesoCreador'])
            ->orderByDesc('created_at');

        if ($request->filled('estado')) {
            $query->where('ESTADO', $request->estado);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        $solicitudes = $query->paginate(25)->withQueryString();

        return Inertia::render('SolicitudesCliente/Index', [
            'solicitudes' => $solicitudes->through(fn($s) => $this->formatearSolicitud($s)),
            'filtros'     => $request->only(['estado', 'fecha_desde', 'fecha_hasta']),
        ]);
    }

    // -------------------------------------------------------------------------
    // STORE — captura desde el portal cliente (middleware reporte.access)
    // -------------------------------------------------------------------------

    public function store(Request $request)
    {
        $request->validate([
            'TIPO_SOLICITUD' => 'required|string|max:255',
            'CANTIDAD'       => 'required|integer|min:1|max:20',
            'PROGRAMAR_PARA' => 'required|date',
        ]);

        $accesoId = session('reporte_acceso_id');

        $solicitud = SolicitudCliente::create([
            'FOLIO_MERCK'             => $request->FOLIO_MERCK,
            'TIPO_SOLICITUD'          => $request->TIPO_SOLICITUD,
            'CANTIDAD'                => $request->CANTIDAD,
            'ID_MEDICO'               => $request->ID_MEDICO ?: null,
            'MEDICO_NOMBRE_LIBRE'     => $request->MEDICO_NOMBRE_LIBRE,
            'ID_INSTITUCION'          => $request->ID_INSTITUCION ?: null,
            'INSTITUCION_NOMBRE_LIBRE'=> $request->INSTITUCION_NOMBRE_LIBRE,
            'SOLICITA'                => $request->SOLICITA,
            'PREGUNTAR_POR'           => $request->PREGUNTAR_POR,
            'TELEFONO'                => $request->TELEFONO,
            'CELULAR'                 => $request->CELULAR,
            'PROGRAMAR_PARA'          => $request->PROGRAMAR_PARA,
            'HORARIO'                 => $request->HORARIO,
            'DIRIGIRSE_A'             => $request->DIRIGIRSE_A,
            'MUESTRA_CALLE'           => $request->MUESTRA_CALLE,
            'MUESTRA_NUMERO_EXT'      => $request->MUESTRA_NUMERO_EXT,
            'MUESTRA_NUMERO_INT'      => $request->MUESTRA_NUMERO_INT,
            'MUESTRA_COLONIA'         => $request->MUESTRA_COLONIA,
            'MUESTRA_MUNICIPIO'       => $request->MUESTRA_MUNICIPIO,
            'MUESTRA_ESTADO'          => $request->MUESTRA_ESTADO,
            'MUESTRA_CODIGO_POSTAL'   => $request->MUESTRA_CODIGO_POSTAL,
            'EMAIL_GUIA'              => $request->EMAIL_GUIA,
            'EMAIL_RESULTADOS'        => $request->EMAIL_RESULTADOS,
            'KAM'                     => $request->KAM,
            'PAL'                     => $request->PAL,
            'NOTAS'                   => $request->NOTAS,
            'ESTADO'                  => 'pendiente',
            'CREADO_POR_ACCESO_ID'    => $accesoId,
        ]);

        // Notificar internamente (lo haremos en el paso del Mailable)
        Mail::to(config('mail.from.address'))->send(new SolicitudClienteRecibida($solicitud));

        return back()->with('success', 'Solicitud enviada correctamente. En breve nos pondremos en contacto.');
    }

    // -------------------------------------------------------------------------
    // SOLICITUDES DEL ACCESO ACTUAL — para la pestaña en el portal cliente
    // -------------------------------------------------------------------------

    public function misSOlicitudes(Request $request)
    {
        $accesoId = session('reporte_acceso_id');

        $solicitudes = SolicitudCliente::with(['medico', 'institucion'])
            ->where('CREADO_POR_ACCESO_ID', $accesoId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($s) => $this->formatearSolicitud($s));

        return response()->json($solicitudes);
    }

    // -------------------------------------------------------------------------
    // PREVIEW — qué estudios se van a generar (sin guardar)
    // -------------------------------------------------------------------------

    public function previewConvertir(SolicitudCliente $solicitud)
    {
        if ($solicitud->isConvertida()) {
            return response()->json(['error' => 'Esta solicitud ya fue convertida.'], 422);
        }

        $previews = [];

        for ($i = 1; $i <= $solicitud->CANTIDAD; $i++) {
            $previews[] = [
                'numero'                 => $i,
                'incluir'                => true,
                'clave_interna'          => $this->calcularSiguienteClave($i - 1),
                'folio_merck'            => $solicitud->FOLIO_MERCK,
                'tipo_solicitud'         => $solicitud->TIPO_SOLICITUD,
                'tipo_estudio'           => $solicitud->TIPO_SOLICITUD === 'Envío de KIT BL' ? 'Biopsia Líquida' : 'Biopsia Sólida',
                'id_medico'              => $solicitud->ID_MEDICO,
                'medico_nombre'          => $solicitud->nombre_medico,
                'id_institucion'         => $solicitud->ID_INSTITUCION,
                'institucion_nombre'     => $solicitud->nombre_institucion,
                'muestra_calle'          => $solicitud->MUESTRA_CALLE,
                'muestra_numero_ext'     => $solicitud->MUESTRA_NUMERO_EXT,
                'muestra_numero_int'     => $solicitud->MUESTRA_NUMERO_INT,
                'muestra_colonia'        => $solicitud->MUESTRA_COLONIA,
                'muestra_municipio'      => $solicitud->MUESTRA_MUNICIPIO,
                'muestra_estado'         => $solicitud->MUESTRA_ESTADO,
                'muestra_codigo_postal'  => $solicitud->MUESTRA_CODIGO_POSTAL,
                'muestra_horarios'       => $solicitud->HORARIO,
                'correo_copia'           => $solicitud->EMAIL_RESULTADOS,
            ];
        }

        return response()->json([
            'solicitud'   => $this->formatearSolicitud($solicitud),
            'previews'    => $previews,
            'medicos'     => Usuario::where('USUARIO_TIPO', 'medico')
                ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS', 'PREFIJO')
                ->orderBy('USUARIO_NOMBRE')
                ->get(),
            'instituciones' => Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
                ->orderBy('INSTITUCION_NOMBRE')
                ->get(),
        ]);
    }

    // -------------------------------------------------------------------------
    // CONVERTIR — crear los estudios reales
    // -------------------------------------------------------------------------

    public function convertir(Request $request, SolicitudCliente $solicitud)
    {
        if ($solicitud->isConvertida()) {
            return response()->json(['error' => 'Esta solicitud ya fue convertida.'], 422);
        }

        $request->validate([
            'estudios'                       => 'required|array|min:1',
            'estudios.*.tipo_estudio'        => 'nullable|string',
            'estudios.*.folio_merck'         => 'nullable|string',
            'estudios.*.id_medico'           => 'nullable|integer',
            'estudios.*.id_institucion'      => 'nullable|integer',
            'estudios.*.muestra_calle'       => 'nullable|string',
            'estudios.*.muestra_numero_ext'  => 'nullable|string',
            'estudios.*.muestra_numero_int'  => 'nullable|string',
            'estudios.*.muestra_colonia'     => 'nullable|string',
            'estudios.*.muestra_municipio'   => 'nullable|string',
            'estudios.*.muestra_estado'      => 'nullable|string',
            'estudios.*.muestra_codigo_postal' => 'nullable|string',
            'estudios.*.muestra_horarios'    => 'nullable|string',
            'estudios.*.correo_copia'        => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $estudiosCreados = [];

            foreach ($request->estudios as $datosEstudio) {
                $estudio = $this->crearEstudioDesdeDatos($datosEstudio);
                $estudiosCreados[] = $estudio->ID;
            }

            $solicitud->update([
                'ESTADO'             => 'convertida',
                'ESTUDIOS_GENERADOS' => $estudiosCreados,
            ]);

            DB::commit();

            return response()->json([
                'success'          => true,
                'estudios_creados' => $estudiosCreados,
                'mensaje'          => count($estudiosCreados) . ' estudio(s) creado(s) correctamente.',
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al convertir: ' . $e->getMessage()], 500);
        }
    }

    // -------------------------------------------------------------------------
    // CONFIRMAR — marcar como confirmada (opcional, uso interno)
    // -------------------------------------------------------------------------

    public function confirmar(SolicitudCliente $solicitud)
    {
        if (! $solicitud->isPendiente()) {
            return back()->with('error', 'Solo se pueden confirmar solicitudes pendientes.');
        }

        $solicitud->update(['ESTADO' => 'confirmada']);

        return back()->with('success', 'Solicitud confirmada.');
    }

    // -------------------------------------------------------------------------
    // HELPERS PRIVADOS
    // -------------------------------------------------------------------------

    private function formatearSolicitud(SolicitudCliente $s): array
    {
        return [
            'id'                       => $s->ID,
            'folio_merck'              => $s->FOLIO_MERCK,
            'tipo_solicitud'           => $s->TIPO_SOLICITUD,
            'cantidad'                 => $s->CANTIDAD,
            'medico'                   => $s->nombre_medico,
            'id_medico'                => $s->ID_MEDICO,
            'institucion'              => $s->nombre_institucion,
            'id_institucion'           => $s->ID_INSTITUCION,
            'solicita'                 => $s->SOLICITA,
            'preguntar_por'            => $s->PREGUNTAR_POR,
            'telefono'                 => $s->TELEFONO,
            'celular'                  => $s->CELULAR,
            'programar_para'           => $s->PROGRAMAR_PARA?->format('Y-m-d'),
            'programar_para_formato'   => $s->PROGRAMAR_PARA?->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY'),
            'horario'                  => $s->HORARIO,
            'dirigirse_a'              => $s->DIRIGIRSE_A,
            'muestra_calle'            => $s->MUESTRA_CALLE,
            'muestra_numero_ext'       => $s->MUESTRA_NUMERO_EXT,
            'muestra_numero_int'       => $s->MUESTRA_NUMERO_INT,
            'muestra_colonia'          => $s->MUESTRA_COLONIA,
            'muestra_municipio'        => $s->MUESTRA_MUNICIPIO,
            'muestra_estado'           => $s->MUESTRA_ESTADO,
            'muestra_codigo_postal'    => $s->MUESTRA_CODIGO_POSTAL,
            'email_guia'               => $s->EMAIL_GUIA,
            'email_resultados'         => $s->EMAIL_RESULTADOS,
            'kam'                      => $s->KAM,
            'pal'                      => $s->PAL,
            'estado'                   => $s->ESTADO,
            'estudios_generados'       => $s->ESTUDIOS_GENERADOS,
            'notas'                    => $s->NOTAS,
            'creado_por'               => $s->accesoCreador?->nombre,
            'created_at'               => $s->created_at?->format('d/m/Y H:i'),
        ];
    }

    private function calcularSiguienteClave(int $offset = 0): string
    {
        $anio    = (int) date('Y');
        $anioCorto = (int) date('y'); 
        $prefijo = 'PRM';

        $ultimo = Estudio::where('ANIO', $anioCorto)
            ->where('CLAVE', $prefijo)
            ->max('SERIADO');

        $siguiente = ($ultimo ?? 0) + 1 + $offset;

        return $prefijo . '-' . str_pad($siguiente, 4, '0', STR_PAD_LEFT) . '-' . $anioCorto;
    }

    private function crearEstudioDesdeDatos(array $datos): Estudio
    {
        $anioCorto = (int) date('y');
        $prefijo   = 'PRM';

        // Obtener el siguiente seriado de forma atómica
        $ultimoSeriado = Estudio::where('ANIO', $anioCorto)
            ->where('CLAVE', $prefijo)
            ->lockForUpdate()
            ->max('SERIADO');

        $seriado      = ($ultimoSeriado ?? 0) + 1;
        $claveInterna = $prefijo . '-' . str_pad($seriado, 4, '0', STR_PAD_LEFT) . '-' . $anioCorto;

        return Estudio::create([
            'CLAVE'                                      => $prefijo,
            'CLAVE_INTERNA'                              => $claveInterna,
            'SERIADO'                                    => $seriado,
            'ANIO'                                       => $anioCorto,
            'ID_ALEATORIO'                               => uniqid(),
            'FOLIO_MERCK'                                => $datos['folio_merck'] ?? '',
            'ID_CLIENTE'                                 => 3,
            'ID_MEDICO'                                  => $datos['id_medico'] ?? null,
            'ID_INSTITUCION'                             => $datos['id_institucion'] ?? null,
            'CORREO_COPIA'                               => $datos['correo_copia'] ?? '',
            // Muestra
            'MUESTRA_CLAVE'                              => '',
            'MUESTRA_FOLIO_SOBRE'                        => '',
            'MUESTRA_FOLIO_KIT_BL'                       => '',
            'MUESTRA_OTROS_ROTULOS'                      => '',
            'MUESTRA_SITIO_LESION'                       => '',
            'MUESTRA_TIPO_ESTUDIO'                       => $datos['tipo_estudio'] ?? '',
            'MUESTRA_INICIALES'                          => '',
            'MUESTRA_BLOQUES'                            => '',
            'MUESTRA_LAMINILLAS'                         => '',
            'MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA' => '',
            'MUESTRA_DIAGNOSTICO_CLINICO'                => '',
            'MUESTRA_ENVIO'                              => 'aplica',
            'MUESTRA_ENVIO_TIPO'                         => 'Local',
            'MUESTRA_GUIA'                               => '',
            'MUESTRA_GUIA_MENSAJERIA'                    => '',
            'MUESTRA_GUIA_ESPECIALIZADA'                 => '',
            'MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA'      => '',
            'MUESTRA_GUIA_RETORNO'                       => '',
            'MUESTRA_GUIA_RETORNO_MENSAJERIA'            => '',
            // Dirección (editada por estudio)
            'MUESTRA_DIRECCION'                          => $datos['muestra_calle'] ?? '',
            'MUESTRA_NUMERO_EXT'                         => $datos['muestra_numero_ext'] ?? '',
            'MUESTRA_NUMERO_INT'                         => $datos['muestra_numero_int'] ?? '',
            'MUESTRA_COLONIA'                            => $datos['muestra_colonia'] ?? '',
            'MUESTRA_MUNICIPIO'                          => $datos['muestra_municipio'] ?? '',
            'MUESTRA_CIUDAD'                             => $datos['muestra_municipio'] ?? '',
            'MUESTRA_ESTADO'                             => $datos['muestra_estado'] ?? '',
            'MUESTRA_CODIGO_POSTAL'                      => $datos['muestra_codigo_postal'] ?? '',
            'MUESTRA_HORARIOS'                           => $datos['muestra_horarios'] ?? '',
            'MUESTRA_REFERENCIAS'                        => '',
            // Biopsia líquida (vacíos)
            'MUESTRA_LIQ_CONDICION'                      => '',
            'MUESTRA_LIQ_CONDICION_PRESENCIA'            => '',
            'MUESTRA_LIQ_CANTIDAD_ADECUADA'              => '',
            'MUESTRA_LIQ_CANTIDAD_ML'                    => '',
            'MUESTRA_LIQ_HEMOLISIS'                      => '',
            'MUESTRA_LIQ_AMP_INDICACION'                 => '',
            'MUESTRA_LIQ_AMP_RAZON'                      => '',
            // Resultados (vacíos)
            'R_METODO_PROCESO'                           => '',
            'R_RAZON_ADECUADO_PROCESAMIENTO'             => '',
            'R_INTERPRETACION'                           => '',
            'R_COMPLETOS'                                => 'no',
            // Estado
            'ESTUDIO_ESTADO'                             => Estudio::ESTADO_PENDIENTE,
            'ESTUDIO_FACTURADO'                          => 'no',
            'ESTUDIO_NOTAS'                              => '',
            'ESTUDIO_COMENTARIOS'                        => '',
            'FECHA_SOLICITUD_RECOLECCION'                => now(),
        ]);
    }
}