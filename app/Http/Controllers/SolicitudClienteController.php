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
use App\Mail\EnvioGuiaSolicitud;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\SolicitudClienteEvento;
use Illuminate\Support\Facades\Auth;

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
    // SHOW — vista de detalle para el administrador (solo lectura + comentarios)
    // -------------------------------------------------------------------------

    public function show(SolicitudCliente $solicitud)
    {
        $solicitud->load('eventos');

        return Inertia::render('SolicitudesCliente/Show', [
            'solicitud' => $this->formatearSolicitud($solicitud),
            'eventos'   => $solicitud->eventos->map(fn($e) => $this->formatearEvento($e)),
        ]);
    }

    // -------------------------------------------------------------------------
    // SHOW CLIENTE — detalle para el portal externo (solo su propia solicitud)
    // -------------------------------------------------------------------------

    public function showCliente(SolicitudCliente $solicitud, Request $request)
    {
        $accesoId = session('reporte_acceso_id');

        if ($accesoId && $solicitud->CREADO_POR_ACCESO_ID !== $accesoId) {
            abort(403, 'No tienes acceso a esta solicitud.');
        }

        $solicitud->load('eventos');

        return Inertia::render('Reportes/Solicitudes/Show', [
            'solicitud'  => $this->formatearSolicitud($solicitud),
            'eventos'    => $solicitud->eventos->map(fn($e) => $this->formatearEvento($e)),
            'sesionInfo' => $this->sesionInfoActual($request),
        ]);
    }

    // -------------------------------------------------------------------------
    // INDEX CLIENTE — listado dedicado del portal externo
    // -------------------------------------------------------------------------

    public function indexCliente(Request $request)
    {
        $accesoId = session('reporte_acceso_id');

        $solicitudes = SolicitudCliente::with(['medico', 'institucion'])
            ->where('CREADO_POR_ACCESO_ID', $accesoId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($s) => $this->formatearSolicitud($s));

        return Inertia::render('Reportes/Solicitudes/Index', [
            'solicitudes' => $solicitudes,
            'sesionInfo'  => $this->sesionInfoActual($request),
        ]);
    }

    // -------------------------------------------------------------------------
    // UPDATE — editar datos de la solicitud (solo si sigue pendiente)
    // -------------------------------------------------------------------------

    private const CAMPOS_EDITABLES = [
        'FOLIO_MERCK', 'TIPO_SOLICITUD', 'CANTIDAD', 'MEDICO_NOMBRE_LIBRE',
        'INSTITUCION_NOMBRE_LIBRE', 'SOLICITA', 'PREGUNTAR_POR', 'TELEFONO',
        'CELULAR', 'PROGRAMAR_PARA', 'HORARIO', 'DIRIGIRSE_A',
        'MUESTRA_CALLE', 'MUESTRA_NUMERO_EXT', 'MUESTRA_NUMERO_INT',
        'MUESTRA_COLONIA', 'MUESTRA_MUNICIPIO', 'MUESTRA_ESTADO',
        'MUESTRA_CODIGO_POSTAL', 'EMAIL_GUIA', 'EMAIL_RESULTADOS',
        'KAM', 'PAL', 'NOTAS', 'COPIA_SEGUIMIENTO',
    ];

    public function update(Request $request, SolicitudCliente $solicitud)
    {
        $esAdmin  = $request->session()->get('reporte_tipo') === 'admin';
        $accesoId = $request->session()->get('reporte_acceso_id');

        if (! $esAdmin && $solicitud->CREADO_POR_ACCESO_ID !== $accesoId) {
            abort(403, 'No tienes acceso a esta solicitud.');
        }

        if (! $solicitud->isPendiente()) {
            return back()->with('error', 'Solo se pueden editar solicitudes pendientes.');
        }

        $request->validate([
            'TIPO_SOLICITUD'     => 'required|string|max:255',
            'CANTIDAD'           => 'required|integer|min:1|max:20',
            'PROGRAMAR_PARA'     => 'required|date',
            'EMAIL_GUIA'         => 'nullable|string',
            'EMAIL_RESULTADOS'   => 'nullable|string',
            'COPIA_SEGUIMIENTO'  => 'nullable|string',
        ]);

        $request->merge([
            'EMAIL_GUIA'        => $this->limpiarListaCorreos($request->EMAIL_GUIA),
            'EMAIL_RESULTADOS'  => $this->limpiarListaCorreos($request->EMAIL_RESULTADOS),
            'COPIA_SEGUIMIENTO' => $this->limpiarListaCorreos($request->COPIA_SEGUIMIENTO),
        ]);

        $this->validarListaCorreos($request->EMAIL_GUIA, 'EMAIL_GUIA');
        $this->validarListaCorreos($request->EMAIL_RESULTADOS, 'EMAIL_RESULTADOS');
        $this->validarListaCorreos($request->COPIA_SEGUIMIENTO, 'COPIA_SEGUIMIENTO');

        $cambios = [];

        foreach (self::CAMPOS_EDITABLES as $campo) {
            if (! $request->has($campo)) {
                continue;
            }

            $valorNuevo    = $request->input($campo);
            $valorAnterior = $solicitud->{$campo};

            if ((string) $valorAnterior !== (string) $valorNuevo) {
                $cambios[$campo] = [
                    'anterior' => $valorAnterior,
                    'nuevo'    => $valorNuevo,
                ];
            }
        }

        if (empty($cambios)) {
            return back()->with('success', 'No hubo cambios que guardar.');
        }

        $solicitud->update($request->only(self::CAMPOS_EDITABLES));

        SolicitudClienteEvento::registrar($solicitud, [
            'TIPO'         => 'edicion',
            'AUTOR_TIPO'   => $esAdmin ? 'admin' : 'cliente',
            'AUTOR_NOMBRE' => $esAdmin ? $this->nombreAdminActual() : $request->session()->get('reporte_nombre'),
            'CAMBIOS'      => $cambios,
        ]);

        return back()->with('success', 'Solicitud actualizada correctamente.');
    }

    // -------------------------------------------------------------------------
    // COMENTAR — agregar un comentario a la línea de tiempo
    // -------------------------------------------------------------------------

    public function comentar(Request $request, SolicitudCliente $solicitud)
    {
        $esAdmin  = $request->session()->get('reporte_tipo') === 'admin';
        $accesoId = $request->session()->get('reporte_acceso_id');

        if (! $esAdmin && $solicitud->CREADO_POR_ACCESO_ID !== $accesoId) {
            abort(403, 'No tienes acceso a esta solicitud.');
        }

        $request->validate([
            'mensaje' => 'required|string|max:2000',
        ]);

        SolicitudClienteEvento::registrar($solicitud, [
            'TIPO'         => 'comentario',
            'AUTOR_TIPO'   => $esAdmin ? 'admin' : 'cliente',
            'AUTOR_NOMBRE' => $esAdmin ? $this->nombreAdminActual() : $request->session()->get('reporte_nombre'),
            'MENSAJE'      => $request->mensaje,
        ]);

        return back()->with('success', 'Comentario agregado.');
    }

    // -------------------------------------------------------------------------
    // STORE — captura desde el portal cliente (middleware reporte.access)
    // -------------------------------------------------------------------------

    public function store(Request $request)
    {
        $request->validate([
            'TIPO_SOLICITUD'     => 'required|string|max:255',
            'CANTIDAD'           => 'required|integer|min:1|max:20',
            'PROGRAMAR_PARA'     => 'required|date',
            'EMAIL_GUIA'         => 'nullable|string',
            'EMAIL_RESULTADOS'   => 'nullable|string',
            'COPIA_SEGUIMIENTO'  => 'nullable|string',
        ]);

        $request->merge([
            'EMAIL_GUIA'        => $this->limpiarListaCorreos($request->EMAIL_GUIA),
            'EMAIL_RESULTADOS'  => $this->limpiarListaCorreos($request->EMAIL_RESULTADOS),
            'COPIA_SEGUIMIENTO' => $this->limpiarListaCorreos($request->COPIA_SEGUIMIENTO),
        ]);

        $this->validarListaCorreos($request->EMAIL_GUIA, 'EMAIL_GUIA');
        $this->validarListaCorreos($request->EMAIL_RESULTADOS, 'EMAIL_RESULTADOS');
        $this->validarListaCorreos($request->COPIA_SEGUIMIENTO, 'COPIA_SEGUIMIENTO');

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
            'COPIA_SEGUIMIENTO'       => $request->COPIA_SEGUIMIENTO,
            'KAM'                     => $request->KAM,
            'PAL'                     => $request->PAL,
            'NOTAS'                   => $request->NOTAS,
            'ESTADO'                  => 'pendiente',
            'CREADO_POR_ACCESO_ID'    => $accesoId,
        ]);

        SolicitudClienteEvento::registrar($solicitud, [
            'TIPO'         => 'creacion',
            'AUTOR_TIPO'   => 'cliente',
            'AUTOR_NOMBRE' => session('reporte_nombre'),
        ]);

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
    // ENVIAR GUÍA — solo admin, solo si está confirmada, adjunta PDF por correo
    // -------------------------------------------------------------------------

    public function enviarGuia(Request $request, SolicitudCliente $solicitud)
    {
        if (! $solicitud->isConfirmada()) {
            return back()->withErrors(['guia' => 'Solo se puede enviar guía en solicitudes confirmadas.']);
        }

        $request->validate([
            'guia' => 'required|file|mimes:pdf|max:10240', // 10MB
        ]);

        $correos = array_filter(array_map('trim', explode(',', (string) $solicitud->EMAIL_GUIA)));

        if (empty($correos)) {
            return back()->withErrors(['guia' => 'La solicitud no tiene correos registrados para envío de guía.']);
        }

        $archivo = $request->file('guia');
        $nombreArchivo = 'Guia_' . ($solicitud->FOLIO_MERCK ?: $solicitud->ID) . '.pdf';

        foreach ($correos as $correo) {
            Mail::to($correo)->send(
                new EnvioGuiaSolicitud($solicitud, $archivo->getRealPath(), $nombreArchivo)
            );
        }

        SolicitudClienteEvento::create([
            'ID_SOLICITUD' => $solicitud->ID,
            'TIPO'         => 'envio_guia',
            'AUTOR_TIPO'   => 'admin',
            'AUTOR_NOMBRE' => $this->nombreAdminActual(),
            'MENSAJE'      => 'Guía enviada a: ' . implode(', ', $correos),
            'created_at'   => now(),
        ]);

        return back()->with('success', 'Guía enviada correctamente a ' . count($correos) . ' correo(s).');
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

        SolicitudClienteEvento::registrar($solicitud, [
            'TIPO'         => 'confirmacion',
            'AUTOR_TIPO'   => 'admin',
            'AUTOR_NOMBRE' => $this->nombreAdminActual(),
        ]);

        return back()->with('success', 'Solicitud confirmada.');
    }

    // -------------------------------------------------------------------------
    // CANCELAR — solo admin
    // -------------------------------------------------------------------------

    public function cancelar(Request $request, SolicitudCliente $solicitud)
    {
        if ($solicitud->isCancelada()) {
            return back()->with('error', 'La solicitud ya está cancelada.');
        }

        $request->validate([
            'motivo' => 'nullable|string|max:500',
        ]);

        $solicitud->update(['ESTADO' => 'cancelada']);

        SolicitudClienteEvento::registrar($solicitud, [
            'TIPO'         => 'cancelacion',
            'AUTOR_TIPO'   => 'admin',
            'AUTOR_NOMBRE' => $this->nombreAdminActual(),
            'MENSAJE'      => $request->motivo,
        ]);

        return back()->with('success', 'Solicitud cancelada.');
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
            'copia_seguimiento'       => $s->COPIA_SEGUIMIENTO,
            'kam'                      => $s->KAM,
            'pal'                      => $s->PAL,
            'estado'                   => $s->ESTADO,
            'notas'                    => $s->NOTAS,
            'creado_por'               => $s->accesoCreador?->nombre,
            'created_at'               => $s->created_at?->format('d/m/Y H:i'),
        ];
    }

    /**
     * Limpia una lista de correos separados por coma: quita vacíos y espacios.
     */
    private function limpiarListaCorreos(?string $correos): string
    {
        if (! $correos) {
            return '';
        }

        $lista = array_filter(array_map('trim', explode(',', $correos)));

        return implode(',', $lista);
    }

    /**
     * Valida que cada correo en la lista separada por coma tenga formato válido.
     */
    private function validarListaCorreos(?string $correos, string $campo): void
    {
        if (! $correos) {
            return;
        }

        foreach (explode(',', $correos) as $correo) {
            if (! filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    $campo => "El correo \"{$correo}\" no tiene un formato válido.",
                ]);
            }
        }
    }

    private function formatearEvento(SolicitudClienteEvento $e): array
    {
        return [
            'id'          => $e->ID,
            'tipo'        => $e->TIPO,
            'autor_tipo'  => $e->AUTOR_TIPO,
            'autor_nombre'=> $e->AUTOR_NOMBRE,
            'mensaje'     => $e->MENSAJE,
            'cambios'     => $e->CAMBIOS,
            'created_at'  => $e->created_at?->format('d/m/Y H:i'),
        ];
    }

    private function nombreAdminActual(): ?string
    {
        return Auth::check() ? Auth::user()->name : null;
    }

    private function sesionInfoActual(Request $request): array
    {
        return [
            'nombre' => $request->session()->get('reporte_nombre'),
            'tipo'   => $request->session()->get('reporte_tipo'),
        ];
    }

    
}