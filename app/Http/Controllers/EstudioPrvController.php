<?php

namespace App\Http\Controllers;

use App\Models\EstudioPrv;
use App\Models\Usuario;
use App\Models\Institucion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EstudioPrvController extends Controller
{
    /**
     * Listado de estudios PRV
     */
    public function index(Request $request)
    {
        $query = EstudioPrv::with(['medico', 'paciente', 'institucion']);

        // SIMPLIFICACIÓN: en EstudioController el listado se filtra siempre
        // por CLAVE=$prefijo (PRM, GLC, etc. — variable). Aquí no hace falta:
        // CLAVE siempre es 'PRV' en esta tabla, así que no filtramos por ella.

        // Búsqueda rápida
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('CLAVE_INTERNA', 'like', "%{$search}%")
                    ->orWhere('FOLIO_MERCK', 'like', "%{$search}%")
                    ->orWhere('MUESTRA_FOLIO_KIT_BL', 'like', "%{$search}%")
                    ->orWhere('MUESTRA_INICIALES', 'like', "%{$search}%")
                    ->orWhereHas('medico', function ($subQ) use ($search) {
                        $subQ->where('USUARIO_NOMBRE', 'like', "%{$search}%")
                            ->orWhere('USUARIO_APELLIDOS', 'like', "%{$search}%");
                    })
                    ->orWhereHas('institucion', function ($subQ) use ($search) {
                        $subQ->where('INSTITUCION_NOMBRE', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('estado')) {
            $query->where('ESTUDIO_ESTADO', $request->get('estado'));
        }

        if ($request->filled('muestra_tipo_estudio')) {
            $query->where('MUESTRA_TIPO_ESTUDIO', $request->get('muestra_tipo_estudio'));
        }

        if ($request->filled('institucion_id')) {
            $query->where('ID_INSTITUCION', $request->get('institucion_id'));
        }

        if ($request->filled('fecha_desde')) {
            $query->where('FECHA_SOLICITUD_RECOLECCION', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->where('FECHA_SOLICITUD_RECOLECCION', '<=', $request->get('fecha_hasta'));
        }

        // SIMPLIFICACIÓN: EstudioController ordena por ANIO desc, SERIADO desc
        // (tenía sentido porque el SERIADO ahí era anual). Aquí el SERIADO se
        // reinicia cada día, así que no sirve como criterio de orden global;
        // usamos ID desc (orden de creación) para ver primero lo más reciente.
        $estudios = $query->orderBy('ID', 'desc')
            ->paginate(20)
            ->withQueryString();

        // SIMPLIFICACIÓN: no traigo aquí las "estadisticas" tipo tarjetas
        // (detenidos en recepción, en laboratorio, etc.) que sí tiene
        // EstudioController. Se pueden agregar después si el flujo PRV
        // necesita ese mismo tablero de alertas por tiempos.

        $instituciones = Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
            ->orderBy('INSTITUCION_NOMBRE')
            ->get();

        return Inertia::render('estudios-prv/index', [
            'estudios' => $estudios,
            'filters' => $request->only([
                'search', 'estado', 'muestra_tipo_estudio', 'institucion_id',
                'fecha_desde', 'fecha_hasta',
            ]),
            'estados' => EstudioPrv::getEstados(),
            'instituciones' => $instituciones,
        ]);
    }

    /**
     * Formulario de creación
     */
    public function create()
    {
        $medicos = Usuario::where('USUARIO_TIPO', 'medico')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS', 'USUARIO_CORREO')
            ->orderBy('USUARIO_NOMBRE')
            ->get();

        $pacientes = Usuario::where('USUARIO_TIPO', 'paciente')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS')
            ->orderBy('USUARIO_NOMBRE')
            ->get();

        $instituciones = Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
            ->orderBy('INSTITUCION_NOMBRE')
            ->get();

        $mensajerias = \App\Models\Mensajeria::activas()
            ->select('ID', 'NOMBRE')
            ->orderBy('NOMBRE')
            ->get();

        // SIMPLIFICACIÓN: EstudioController arma aquí un formulario para
        // poder DAR DE ALTA un cliente/médico/institución nuevos al vuelo
        // (manejarNuevoCliente, obtenerIdMedico, etc.), porque el estudio va
        // ligado a un ID_CLIENTE que puede no existir todavía. Como PRV no
        // tiene ID_CLIENTE y por ahora asumimos que médico/institución ya
        // existen en el catálogo, no incluyo esa lógica de alta rápida.
        // Si luego se necesita, la agregamos igual que allá.

        // SIMPLIFICACIÓN: solo genero una PREVISUALIZACIÓN del folio del día
        // aquí (para mostrarlo en el formulario). El valor real y definitivo
        // se recalcula dentro de store(), dentro del evento `creating` del
        // modelo, para evitar que dos personas creando un estudio al mismo
        // tiempo terminen con el mismo folio (condición de carrera).
        $dia = date('d');
        $mes = date('m');
        $prefijoFolio = "PRV-{$dia}-{$mes}-";
        $ultimoSeriado = EstudioPrv::where('CLAVE_INTERNA', 'like', $prefijoFolio . '%')
            ->max('SERIADO') ?: 0;
        $claveInternaPreview = $prefijoFolio . str_pad($ultimoSeriado + 1, 2, '0', STR_PAD_LEFT);

        // El "tipo de estudio" ya no es un catálogo fijo (KRAS/NRAS/BRAF):
        // las opciones son los nombres de las plantillas de resultado
        // activas, para que coincidan 1:1 con lo que se selecciona en el
        // paso de Laboratorio.
        $tiposEstudio = \App\Models\PlantillaResultadoPrv::activas()
            ->orderBy('NOMBRE')
            ->pluck('NOMBRE', 'CODIGO');

        return Inertia::render('estudios-prv/create', [
            'medicos' => $medicos,
            'pacientes' => $pacientes,
            'instituciones' => $instituciones,
            'mensajerias' => $mensajerias,
            'tiposMuestra' => EstudioPrv::getTiposMuestra(),
            'tiposEstudio' => $tiposEstudio,
            'generos' => EstudioPrv::getGeneros(),
            'tiposEnvio' => EstudioPrv::getTiposEnvio(),
            'claveInternaPreview' => $claveInternaPreview,
        ]);
    }

    /**
     * Guardar nuevo estudio PRV
     */
    public function store(Request $request)
    {
        // SIMPLIFICACIÓN: EstudioController valida y espera nombres de campo
        // "amigables" (ClaveInterna, FolioMerck, IdCliente, FechaSolicitudRecoleccion
        // + HoraSolicitudRecoleccion por separado, etc.) porque así los manda
        // su formulario actual. Para PRV valido directo con los nombres reales
        // de columna (mismo estilo MAYÚSCULAS que usa el resto del sistema)
        // para simplificar — ajustamos esto si el formulario del frontend
        // termina necesitando otro contrato.
        $validated = $request->validate([
            'FOLIO_MERCK' => 'nullable|string|max:255',
            'ID_MEDICO' => 'nullable|integer',
            'ID_PACIENTE' => 'nullable|integer',
            'ID_INSTITUCION' => 'nullable|integer',
            'FECHA_SOLICITUD_RECOLECCION' => 'nullable|date',
            'MUESTRA_FOLIO_SOBRE' => 'nullable|string|max:255',
            'MUESTRA_FOLIO_KIT_BL' => 'nullable|string|max:255',
            'MUESTRA_FOLIO_KIT_BL_CADUCIDAD' => 'nullable|date',
            'MUESTRA_COLON' => 'nullable|in:ASC,DESC',
            'MUESTRA_OTROS_ROTULOS' => 'nullable|string',
            'MUESTRA_TIPO' => 'nullable|string|max:255',
            'MUESTRA_SITIO_LESION' => 'nullable|string|max:255',
            'MUESTRA_TIPO_ESTUDIO' => 'nullable|string|max:255',
            'MUESTRA_INICIALES' => 'nullable|string|max:255',
            'MUESTRA_GENERO' => 'nullable|string|max:255',
            'MUESTRA_EDAD' => 'nullable|string|max:255',
            'MUESTRA_BLOQUES' => 'nullable|string|max:255',
            'MUESTRA_LAMINILLAS' => 'nullable|string|max:255',
            'MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA' => 'nullable|string',
            'MUESTRA_ENVIO' => 'nullable|string|max:255',
            'MUESTRA_ENVIO_TIPO' => 'nullable|string|max:255',
            'MUESTRA_GUIA' => 'nullable|string|max:255',
            'MUESTRA_GUIA_MENSAJERIA' => 'nullable|string|max:255',
            'MUESTRA_GUIA_ESPECIALIZADA' => 'nullable|string|max:255',
            'MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA' => 'nullable|string|max:255',
            'MUESTRA_GUIA_RETORNO' => 'nullable|string|max:255',
            'MUESTRA_GUIA_RETORNO_MENSAJERIA' => 'nullable|string|max:255',
            'MUESTRA_DIRECCION' => 'nullable|string',
            'MUESTRA_NUMERO_EXT' => 'nullable|string|max:255',
            'MUESTRA_NUMERO_INT' => 'nullable|string|max:255',
            'MUESTRA_COLONIA' => 'nullable|string|max:255',
            'MUESTRA_MUNICIPIO' => 'nullable|string|max:255',
            'MUESTRA_CIUDAD' => 'nullable|string|max:255',
            'MUESTRA_ESTADO' => 'nullable|string|max:255',
            'MUESTRA_CODIGO_POSTAL' => 'nullable|string|max:255',
            'MUESTRA_REFERENCIAS' => 'nullable|string',
            'MUESTRA_HORARIOS' => 'nullable|string',
            'MUESTRA_DIAGNOSTICO_CLINICO' => 'nullable|string',
            'MUESTRA_LIQ_CONDICION' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CONDICION_PRESENCIA' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CANTIDAD_ADECUADA' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CANTIDAD_ML' => 'nullable|string|max:255',
            'MUESTRA_LIQ_HEMOLISIS' => 'nullable|string|max:255',
            'MUESTRA_LIQ_AMP_INDICACION' => 'nullable|string|max:255',
            'MUESTRA_LIQ_AMP_RAZON' => 'nullable|string|max:255',
            'MUESTRA_LIQ_LIPEMICA' => 'nullable|in:Si,No',
            'ESTUDIO_NOTAS' => 'nullable|string',
        ]);

        // SIMPLIFICACIÓN: no hay manejarNuevoCliente()/obtenerIdMedico()/
        // obtenerIdInstitucion() aquí — asumo que ID_MEDICO/ID_INSTITUCION
        // ya vienen de catálogos existentes seleccionados en el formulario.

        $estudio = new EstudioPrv($validated);

        // El folio (CLAVE_INTERNA / CLAVE / SERIADO / ANIO) se genera solo,
        // dentro del evento `creating` del modelo (ver EstudioPrv::boot()),
        // así que no lo tocamos manualmente aquí.
        $estudio->save();

        return redirect()
            ->route('estudios-prv.show', $estudio->ID)
            ->with('success', "Estudio {$estudio->CLAVE_INTERNA} creado correctamente.");
    }

        /**
     * Formulario de edición del paso 1: Recolección
     */
    public function editRecoleccion(EstudioPrv $estudioPrv)
    {
        $medicos = Usuario::where('USUARIO_TIPO', 'medico')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS', 'USUARIO_CORREO')
            ->orderBy('USUARIO_NOMBRE')
            ->get();

        $instituciones = Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
            ->orderBy('INSTITUCION_NOMBRE')
            ->get();

        $mensajerias = \App\Models\Mensajeria::activas()
            ->select('ID', 'NOMBRE')
            ->orderBy('NOMBRE')
            ->get();

        $tiposEstudio = \App\Models\PlantillaResultadoPrv::activas()
            ->orderBy('NOMBRE')
            ->pluck('NOMBRE', 'CODIGO');

        return Inertia::render('estudios-prv/edit/recoleccion', [
            'estudio' => $estudioPrv->load(['medico', 'institucion']),
            'medicos' => $medicos,
            'instituciones' => $instituciones,
            'mensajerias' => $mensajerias,
            'tiposEstudio' => $tiposEstudio,
            'tiposEnvio' => EstudioPrv::getTiposEnvio(),
        ]);
    }

    /**
     * Guardar edición del paso 1: Recolección
     */
    public function updateRecoleccion(Request $request, EstudioPrv $estudioPrv)
    {
        // SIMPLIFICACIÓN: reutilizo prácticamente las mismas reglas de
        // store(), sin CLAVE_INTERNA/SERIADO/ANIO (el folio no se
        // recalcula al editar, una vez generado se mantiene fijo).
        $validated = $request->validate([
            'FOLIO_MERCK' => 'nullable|string|max:255',
            'ID_MEDICO' => 'nullable|integer',
            'ID_INSTITUCION' => 'nullable|integer',
            'FECHA_SOLICITUD_RECOLECCION' => 'nullable|date',
            'MUESTRA_TIPO_ESTUDIO' => 'nullable|string|max:255',
            'MUESTRA_ENVIO' => 'nullable|string|max:255',
            'MUESTRA_ENVIO_TIPO' => 'nullable|string|max:255',
            'MUESTRA_GUIA_MENSAJERIA' => 'nullable|string|max:255',
            'MUESTRA_GUIA' => 'nullable|string|max:255',
            'MUESTRA_DIRECCION' => 'nullable|string',
            'MUESTRA_NUMERO_EXT' => 'nullable|string|max:255',
            'MUESTRA_NUMERO_INT' => 'nullable|string|max:255',
            'MUESTRA_COLONIA' => 'nullable|string|max:255',
            'MUESTRA_MUNICIPIO' => 'nullable|string|max:255',
            'MUESTRA_CIUDAD' => 'nullable|string|max:255',
            'MUESTRA_ESTADO' => 'nullable|string|max:255',
            'MUESTRA_CODIGO_POSTAL' => 'nullable|string|max:255',
            'MUESTRA_HORARIOS' => 'nullable|string',
            'MUESTRA_REFERENCIAS' => 'nullable|string',
            'ESTUDIO_NOTAS' => 'nullable|string',
        ]);

        $estudioPrv->update($validated);

        return redirect()
            ->route('estudios-prv.show', $estudioPrv->ID)
            ->with('success', 'Recolección actualizada correctamente.');
    }

        /**
     * Formulario del paso 2: Recepción
     */
    public function editRecepcion(EstudioPrv $estudioPrv)
    {
        $pacientes = Usuario::where('USUARIO_TIPO', 'paciente')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS')
            ->orderBy('USUARIO_NOMBRE')
            ->get();

        $correosExistentes = $estudioPrv->correosCopia()->orderBy('NOMBRE')->get();

        return Inertia::render('estudios-prv/edit/recepcion', [
            'estudio' => $estudioPrv,
            'pacientes' => $pacientes,
            'correosExistentes' => $correosExistentes,
            'tiposEnvio' => EstudioPrv::getTiposEnvio(),
        ]);
    }

    /**
     * Guardar el paso 2: Recepción
     */
    public function updateRecepcion(Request $request, EstudioPrv $estudioPrv)
    {
        // SIMPLIFICACIÓN: EstudioController valida además folio kit contra
        // la tabla folios_kits (validación de disponibilidad/estado). Aquí
        // no la incluyo todavía — si vas a usar folios kit en PRV también,
        // lo agregamos como una función aparte reutilizando FolioKitController.
        $validated = $request->validate([
            'ID_PACIENTE' => 'nullable|integer',
            'MUESTRA_CLAVE' => 'nullable|string|max:255',
            'MUESTRA_FOLIO_SOBRE' => 'nullable|string|max:255',
            'MUESTRA_FOLIO_KIT_BL' => 'nullable|string|max:255',
            'MUESTRA_FOLIO_KIT_BL_CADUCIDAD' => 'nullable|date',
            'MUESTRA_TIPO' => 'nullable|string|max:255',
            'MUESTRA_SITIO_LESION' => 'nullable|string|max:255',
            'MUESTRA_INICIALES' => 'nullable|string|max:255',
            'MUESTRA_GENERO' => 'nullable|string|max:255',
            'MUESTRA_EDAD' => 'nullable|string|max:255',
            'MUESTRA_BLOQUES' => 'nullable|string|max:255',
            'MUESTRA_LAMINILLAS' => 'nullable|string|max:255',
            'MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA' => 'nullable|string',
            'MUESTRA_DIAGNOSTICO_CLINICO' => 'nullable|string',
            'MUESTRA_LIQ_CONDICION' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CONDICION_PRESENCIA' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CANTIDAD_ADECUADA' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CANTIDAD_ML' => 'nullable|string|max:255',
            'MUESTRA_LIQ_HEMOLISIS' => 'nullable|string|max:255',
            'MUESTRA_LIQ_AMP_INDICACION' => 'nullable|string|max:255',
            'MUESTRA_LIQ_AMP_RAZON' => 'nullable|string|max:255',
            'MUESTRA_LIQ_LIPEMICA' => 'nullable|in:Si,No',
            'FECHA_RECEPCION' => 'nullable|date',
        ]);

        $estudioPrv->update($validated);

        // El estado avanza automáticamente al completar recepción, igual
        // que en Estudio normal (ESTADO_LABORATORIO_RECEPCION).
        if ($estudioPrv->ESTUDIO_ESTADO === EstudioPrv::ESTADO_PENDIENTE) {
            $estudioPrv->update(['ESTUDIO_ESTADO' => EstudioPrv::ESTADO_LABORATORIO_RECEPCION]);
        }

        return redirect()
            ->route('estudios-prv.show', $estudioPrv->ID)
            ->with('success', 'Recepción registrada correctamente.');
    }

        /**
     * Formulario del paso 3: Laboratorio (dinámico por plantilla)
     */
    public function editLaboratorio(EstudioPrv $estudioPrv)
    {
        $plantillas = \App\Models\PlantillaResultadoPrv::activas()
            ->select('ID', 'CODIGO', 'NOMBRE', 'DESCRIPCION', 'CAMPOS')
            ->orderBy('NOMBRE')
            ->get();

        // Si ya existe un resultado capturado para este estudio, lo mandamos
        // para precargar el formulario (y saber qué plantilla estaba activa).
        $resultado = \App\Models\ResultadoPrv::where('ID_ESTUDIO', $estudioPrv->ID)
            ->latest('ID')
            ->first();

        return Inertia::render('estudios-prv/edit/laboratorio', [
            'estudio' => $estudioPrv,
            'plantillas' => $plantillas,
            'resultado' => $resultado,
        ]);
    }

    /**
     * Guardar el paso 3: Laboratorio (dinámico por plantilla)
     */
    public function updateLaboratorio(Request $request, EstudioPrv $estudioPrv)
    {
        $validated = $request->validate([
            'CODIGO_PLANTILLA' => 'required|string|exists:estudios_prv_plantillas_resultado,CODIGO',
            'DATOS' => 'required|array',
            'FECHA_RECEPCION_LABORATORIO' => 'nullable|date',
            'FECHA_OBTENCION_RESULTADOS' => 'nullable|date',
            'marcar_listo' => 'nullable|boolean',
        ]);

        // Sincronizamos el "tipo de estudio" del estudio con el nombre de
        // la plantilla seleccionada, para que ambos queden siempre
        // consistentes (el tipo de estudio YA NO se elige libremente en
        // Recolección de forma independiente al resultado real capturado).
        $plantilla = \App\Models\PlantillaResultadoPrv::where('CODIGO', $validated['CODIGO_PLANTILLA'])->first();

        $estudioPrv->update([
            'FECHA_RECEPCION_LABORATORIO' => $validated['FECHA_RECEPCION_LABORATORIO'] ?? null,
            'FECHA_OBTENCION_RESULTADOS' => $validated['FECHA_OBTENCION_RESULTADOS'] ?? null,
            'MUESTRA_TIPO_ESTUDIO' => $plantilla->NOMBRE ?? $estudioPrv->MUESTRA_TIPO_ESTUDIO,
        ]);

        // Un resultado "activo" por estudio: si ya existe uno, lo actualizamos
        // en vez de acumular históricos (ver nota de diseño en la migración,
        // esto lo dejamos así por simplicidad mientras no haya necesidad real
        // de versionar resultados).
        \App\Models\ResultadoPrv::updateOrCreate(
            ['ID_ESTUDIO' => $estudioPrv->ID],
            [
                'CODIGO_PLANTILLA' => $validated['CODIGO_PLANTILLA'],
                'DATOS' => $validated['DATOS'],
            ]
        );

        if ($request->boolean('marcar_listo')) {
            $estudioPrv->update(['ESTUDIO_ESTADO' => EstudioPrv::ESTADO_RETORNO]);
        }

        return redirect()
            ->route('estudios-prv.show', $estudioPrv->ID)
            ->with('success', 'Resultados de laboratorio guardados correctamente.');
    }

        /**
     * Formulario del paso 4: Informe
     */
    public function editInforme(EstudioPrv $estudioPrv)
    {
        $estudioPrv->load(['medico', 'correosCopia', 'enviosCorreos']);

        $resultado = \App\Models\ResultadoPrv::where('ID_ESTUDIO', $estudioPrv->ID)->latest('ID')->first();

        return Inertia::render('estudios-prv/edit/informe', [
            'estudio' => $estudioPrv,
            'medico' => $estudioPrv->medico,
            'correos_copias' => $estudioPrv->correosCopia,
            'envios' => $estudioPrv->enviosCorreos()->orderByDesc('created_at')->get(),
            'tieneResultado' => $resultado !== null,
            'nombrePlantilla' => $resultado?->plantilla?->NOMBRE,
        ]);
    }

    /**
     * Agregar un correo de copia (paso 4, pero reutilizable desde Recepción)
     */
    public function storeCorreoCopiaPrv(Request $request, EstudioPrv $estudioPrv)
    {
        $validated = $request->validate([
            'NOMBRE' => 'required|string|max:255',
            'CORREO' => 'required|email|max:255',
            'ENVIAR' => 'nullable|in:si,no',
        ]);

        try {
            \App\Models\CorreoCopiaPrv::agregarCorreo(
                $estudioPrv->ID,
                auth()->user()->ID_USUARIO ?? auth()->id(),
                $validated['NOMBRE'],
                $validated['CORREO'],
                $validated['ENVIAR'] ?? 'si'
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['CORREO' => $e->getMessage()]);
        }

        return back()->with('success', 'Correo de copia agregado.');
    }

    /**
     * Eliminar un correo de copia
     */
    public function destroyCorreoCopiaPrv(EstudioPrv $estudioPrv, $correoId)
    {
        \App\Models\CorreoCopiaPrv::where('ID_ESTUDIO', $estudioPrv->ID)
            ->where('ID', $correoId)
            ->delete();

        return back()->with('success', 'Correo de copia eliminado.');
    }

    /**
     * Registrar el envío del informe PRV y cerrar el estudio.
     *
     * SIMPLIFICACIÓN IMPORTANTE: esto NO envía correos reales todavía.
     * EstudioController usa EnvioCorreoService + un Mailable (EstudioReporte)
     * que arma el PDF y lo manda por SMTP. Para PRV no tenemos ni el PDF ni
     * el Mailable definidos aún (dependen de las plantillas de resultados
     * que vamos a construir en el paso de Laboratorio). Por ahora este
     * método solo REGISTRA en envios_correos_prv qué se habría enviado a
     * quién, para que puedas probar el flujo completo de principio a fin.
     * Cuando tengamos el PDF/Mailable de PRV, conectamos el envío real.
     */
    public function enviarInformePrv(Request $request, EstudioPrv $estudioPrv)
    {
        $correos = $estudioPrv->correosCopia()->where('ENVIAR', 'si')->get();

        if ($correos->isEmpty()) {
            return back()->withErrors(['error' => 'No hay correos de copia activos para enviar.']);
        }

        foreach ($correos as $correo) {
            \App\Models\EnvioCorreoPrv::create([
                'ID_ESTUDIO' => $estudioPrv->ID,
                'ID_MEDICO' => $estudioPrv->ID_MEDICO,
                'ID_USUARIO_ENVIO' => auth()->user()->ID_USUARIO ?? auth()->id(),
                'NOMBRE_DESTINATARIO' => $correo->NOMBRE,
                'CORREO_DESTINATARIO' => $correo->CORREO,
                'TIPO_ENVIO' => \App\Models\EnvioCorreoPrv::TIPO_ADJUNTO,
                'MENSAJE_HTML' => 'Envío simulado - PDF/Mailable de PRV pendiente de implementar',
                'ESTADO' => \App\Models\EnvioCorreoPrv::ESTADO_ENVIADO,
            ]);
        }

        $estudioPrv->update([
            'FECHA_RESULTADOS_CORREO' => now(),
            'ESTUDIO_ESTADO' => EstudioPrv::ESTADO_TERMINADO,
        ]);

        return back()->with('success', "Informe registrado como enviado a {$correos->count()} destinatario(s). El PDF ya se genera correctamente; el envío real por correo (adjuntando este PDF) sigue pendiente de implementar.");
    }

    /**
     * Mostrar un estudio PRV
     */
    public function show(EstudioPrv $estudioPrv)
    {
        $estudioPrv->load(['medico', 'paciente', 'institucion', 'correosCopia', 'enviosCorreos']);

        // SIMPLIFICACIÓN: EstudioController::show() arma bloques adicionales
        // (insumos usados, adjuntos, historial de correos con estadísticas
        // detalladas, datos para el PDF, etc.). Por ahora solo mando el
        // estudio con sus relaciones básicas + correos/envíos, ya que es lo
        // que pediste habilitar en este paso.

        return Inertia::render('estudios-prv/show', [
            'estudio' => $estudioPrv,
        ]);
    }

    /**
     * Formulario de edición
     */
    public function edit(EstudioPrv $estudioPrv)
    {
        $medicos = Usuario::where('USUARIO_TIPO', 'medico')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS')
            ->orderBy('USUARIO_NOMBRE')
            ->get();

        $pacientes = Usuario::where('USUARIO_TIPO', 'paciente')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS')
            ->orderBy('USUARIO_NOMBRE')
            ->get();

        $instituciones = Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
            ->orderBy('INSTITUCION_NOMBRE')
            ->get();

        return Inertia::render('estudios-prv/edit', [
            'estudio' => $estudioPrv,
            'medicos' => $medicos,
            'pacientes' => $pacientes,
            'instituciones' => $instituciones,
            'tiposMuestra' => EstudioPrv::getTiposMuestra(),
            'tiposEstudio' => EstudioPrv::getTiposEstudio(),
            'generos' => EstudioPrv::getGeneros(),
            'tiposEnvio' => EstudioPrv::getTiposEnvio(),
            'estados' => EstudioPrv::getEstados(),
        ]);
    }

    /**
     * Actualizar estudio PRV
     */
    public function update(Request $request, EstudioPrv $estudioPrv)
    {
        // SIMPLIFICACIÓN: reutilizo las mismas reglas de store(), agregando
        // ESTUDIO_ESTADO porque en edición sí se puede cambiar el estado.
        // Nota para más adelante (memoria del proyecto): si cualquiera de
        // estos campos llega a agregarse a un $fieldsToUpdate explícito,
        // hay que revisar que esté en esa lista o se ignorará al guardar.
        $validated = $request->validate([
            'FOLIO_MERCK' => 'nullable|string|max:255',
            'ID_MEDICO' => 'nullable|integer',
            'ID_PACIENTE' => 'nullable|integer',
            'ID_INSTITUCION' => 'nullable|integer',
            'FECHA_SOLICITUD_RECOLECCION' => 'nullable|date',
            'FECHA_RECOLECCION' => 'nullable|date',
            'FECHA_RECEPCION' => 'nullable|date',
            'FECHA_RECEPCION_LABORATORIO' => 'nullable|date',
            'FECHA_OBTENCION_RESULTADOS' => 'nullable|date',
            'FECHA_RESULTADOS_CORREO' => 'nullable|date',
            'MUESTRA_FOLIO_SOBRE' => 'nullable|string|max:255',
            'MUESTRA_FOLIO_KIT_BL' => 'nullable|string|max:255',
            'MUESTRA_FOLIO_KIT_BL_CADUCIDAD' => 'nullable|date',
            'MUESTRA_COLON' => 'nullable|in:ASC,DESC',
            'MUESTRA_OTROS_ROTULOS' => 'nullable|string',
            'MUESTRA_TIPO' => 'nullable|string|max:255',
            'MUESTRA_SITIO_LESION' => 'nullable|string|max:255',
            'MUESTRA_TIPO_ESTUDIO' => 'nullable|string|max:255',
            'MUESTRA_INICIALES' => 'nullable|string|max:255',
            'MUESTRA_GENERO' => 'nullable|string|max:255',
            'MUESTRA_EDAD' => 'nullable|string|max:255',
            'MUESTRA_BLOQUES' => 'nullable|string|max:255',
            'MUESTRA_LAMINILLAS' => 'nullable|string|max:255',
            'MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA' => 'nullable|string',
            'MUESTRA_ENVIO' => 'nullable|string|max:255',
            'MUESTRA_ENVIO_TIPO' => 'nullable|string|max:255',
            'MUESTRA_GUIA' => 'nullable|string|max:255',
            'MUESTRA_GUIA_MENSAJERIA' => 'nullable|string|max:255',
            'MUESTRA_GUIA_ESPECIALIZADA' => 'nullable|string|max:255',
            'MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA' => 'nullable|string|max:255',
            'MUESTRA_GUIA_RETORNO' => 'nullable|string|max:255',
            'MUESTRA_GUIA_RETORNO_MENSAJERIA' => 'nullable|string|max:255',
            'MUESTRA_DIRECCION' => 'nullable|string',
            'MUESTRA_NUMERO_EXT' => 'nullable|string|max:255',
            'MUESTRA_NUMERO_INT' => 'nullable|string|max:255',
            'MUESTRA_COLONIA' => 'nullable|string|max:255',
            'MUESTRA_MUNICIPIO' => 'nullable|string|max:255',
            'MUESTRA_CIUDAD' => 'nullable|string|max:255',
            'MUESTRA_ESTADO' => 'nullable|string|max:255',
            'MUESTRA_CODIGO_POSTAL' => 'nullable|string|max:255',
            'MUESTRA_REFERENCIAS' => 'nullable|string',
            'MUESTRA_HORARIOS' => 'nullable|string',
            'MUESTRA_DIAGNOSTICO_CLINICO' => 'nullable|string',
            'MUESTRA_LIQ_CONDICION' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CONDICION_PRESENCIA' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CANTIDAD_ADECUADA' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CANTIDAD_ML' => 'nullable|string|max:255',
            'MUESTRA_LIQ_HEMOLISIS' => 'nullable|string|max:255',
            'MUESTRA_LIQ_AMP_INDICACION' => 'nullable|string|max:255',
            'MUESTRA_LIQ_AMP_RAZON' => 'nullable|string|max:255',
            'MUESTRA_LIQ_LIPEMICA' => 'nullable|in:Si,No',
            'ESTUDIO_NOTAS' => 'nullable|string',
            'ESTUDIO_ESTADO' => 'nullable|string|max:255',
        ]);

        $estudioPrv->update($validated);

        return back()->with('success', "Estudio {$estudioPrv->CLAVE_INTERNA} actualizado correctamente.");
    }

    /**
     * Eliminar estudio PRV
     */
    public function destroy(EstudioPrv $estudioPrv)
    {
        // SIMPLIFICACIÓN: EstudioController probablemente valida que no haya
        // insumos/adjuntos asociados antes de borrar. Como PRV todavía no
        // tiene insumos/adjuntos conectados, no hay nada que validar aquí
        // aún — cuando conectemos EstudioInsumo/Adjunto a PRV, agregamos esa
        // verificación igual que en el estudio normal.
        $clave = $estudioPrv->CLAVE_INTERNA;
        $estudioPrv->delete();

        return redirect()
            ->route('estudios-prv.index')
            ->with('success', "Estudio {$clave} eliminado correctamente.");
    }

        /**
     * Mapeo de CODIGO de plantilla -> vista Blade específica.
     * Si un código no aparece aquí (o la vista no existe), se usa
     * pdf.prv.generico automáticamente.
     */
    private const VISTAS_PDF_PLANTILLA = [
        'VPH_AMPLIO' => 'pdf.prv.vph',
        'VPH_ALTO_RIESGO' => 'pdf.prv.vph',
        'FISH_HER2' => 'pdf.prv.fish-her2',
        'CELTUM' => 'pdf.prv.celtum',
        'HER2_GASTRICO_IHQ' => 'pdf.prv.her2-gastrico',
        'IDYLLA_MSI' => 'pdf.prv.idylla-msi',
        'PANEL_GENEFUSION_BRCA' => 'pdf.prv.genefusion-brca',
        'PDL1_IHQ' => 'pdf.prv.pdl1',
    ];

    /**
     * Generar el PDF del informe de un estudio PRV
     */
    public function generatePdf(EstudioPrv $estudioPrv)
    {
        $estudioPrv->load(['medico', 'paciente', 'institucion']);

        $resultado = \App\Models\ResultadoPrv::where('ID_ESTUDIO', $estudioPrv->ID)->latest('ID')->first();

        if (!$resultado) {
            abort(404, 'Este estudio todavía no tiene resultados de laboratorio capturados.');
        }

        $plantilla = \App\Models\PlantillaResultadoPrv::where('CODIGO', $resultado->CODIGO_PLANTILLA)->first();

        if (!$plantilla) {
            abort(404, 'La plantilla de resultado ya no existe.');
        }

        // Resolver la vista: específica si está mapeada y existe, si no, genérica.
        $vistaEspecifica = self::VISTAS_PDF_PLANTILLA[$plantilla->CODIGO] ?? null;
        $vista = ($vistaEspecifica && view()->exists($vistaEspecifica))
            ? $vistaEspecifica
            : 'pdf.prv.generico';

        $data = [
            'estudio' => $estudioPrv,
            'plantilla' => $plantilla,
            'datos' => $resultado->DATOS,
            'paraImprimir' => request()->boolean('imprimir'),
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($vista, $data);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
            'defaultFont' => 'Arial',
            'isRemoteEnabled' => true,
        ]);

        $filename = 'DIAHMOES_PRV_' . $estudioPrv->CLAVE_INTERNA . '.pdf';

        return $pdf->stream($filename);
    }
}