<?php

namespace App\Http\Controllers;

use App\Models\Estudio;
use App\Models\Usuario;
use App\Models\Institucion;
use App\Models\Cliente;
use App\Models\CorreoCopia;
use App\Services\EnvioCorreoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\EstudioReporte;

class EstudioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    $query = Estudio::with(['medico', 'paciente', 'institucion', 'cliente', 'enviosCorreos']);
    
    // Búsqueda global simplificada
    if ($request->filled('search')) {
        $search = $request->get('search');
        $query->where(function($q) use ($search) {
            $q->where('CLAVE_INTERNA', 'like', "%{$search}%")
              ->orWhere('FOLIO_MERCK', 'like', "%{$search}%")
              ->orWhere('MUESTRA_INICIALES', 'like', "%{$search}%")
              // Búsqueda por nombre completo del médico
              ->orWhereHas('medico', function($subQ) use ($search) {
                  $subQ->where('USUARIO_NOMBRE', 'like', "%{$search}%")
                       ->orWhere('USUARIO_APELLIDOS', 'like', "%{$search}%")
                       ->orWhere(\DB::raw('CONCAT(USUARIO_NOMBRE, " ", USUARIO_APELLIDOS)'), 'like', "%{$search}%");
              })
              // Búsqueda por nombre completo del paciente
              ->orWhereHas('paciente', function($subQ) use ($search) {
                  $subQ->where('USUARIO_NOMBRE', 'like', "%{$search}%")
                       ->orWhere('USUARIO_APELLIDOS', 'like', "%{$search}%")
                       ->orWhere(\DB::raw('CONCAT(USUARIO_NOMBRE, " ", USUARIO_APELLIDOS)'), 'like', "%{$search}%");
              })
              // Búsqueda por nombre de institución
              ->orWhereHas('institucion', function($subQ) use ($search) {
                  $subQ->where('INSTITUCION_NOMBRE', 'like', "%{$search}%");
              });
        });
    }
    
    // Filtros adicionales opcionales (mantener solo los esenciales)
    if ($request->filled('estado')) {
        $query->where('ESTUDIO_ESTADO', $request->get('estado'));
    }
    
    if ($request->filled('fecha_desde')) {
        $query->where('FECHA_SOLICITUD_RECOLECCION', '>=', $request->get('fecha_desde'));
    }
    
    if ($request->filled('fecha_hasta')) {
        $query->where('FECHA_SOLICITUD_RECOLECCION', '<=', $request->get('fecha_hasta'));
    }
    
    // Ordenamiento por defecto
    $query->orderBy('ANIO', 'desc')
          ->orderBy('SERIADO', 'desc');
    
    $estudios = $query->paginate(20)->withQueryString();

    $estudios->getCollection()->transform(function ($estudio) {
        $estudio->estadisticas_envios = [
            'total' => $estudio->enviosCorreos->count(),
            'enviados' => $estudio->enviosCorreos->where('ESTADO', 'enviado')->count(),
            'leidos' => $estudio->enviosCorreos->where('ESTADO', 'leido')->count(),
            'porcentaje_lectura' => $estudio->enviosCorreos->count() > 0 
                ? round(($estudio->enviosCorreos->where('ESTADO', 'leido')->count() / $estudio->enviosCorreos->count()) * 100)
                : 0
        ];
        return $estudio;
    });
    
    // Datos mínimos para filtros opcionales
    $estados = Estudio::getEstados() ?? [];
    
    return Inertia::render('estudios/index', [
        'estudios' => $estudios,
        'filters' => $request->only(['search', 'estado', 'fecha_desde', 'fecha_hasta']),
        'estados' => $estados,
    ]);
}

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Obtener datos necesarios para el formulario
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
            
        $clientes = Cliente::select('ID_CLIENTE', 'CLIENTE_NOMBRE')
            ->orderBy('CLIENTE_NOMBRE')
            ->get();
            
        // Obtener mensajerías disponibles
        $mensajerias = \App\Models\Mensajeria::activas()
            ->select('ID', 'NOMBRE')
            ->orderBy('NOMBRE')
            ->get();

        // Generar datos automáticos como en el formulario original
        $prefijo = request()->get('prefijo', 'PRM');
        $ultimoEstudio = Estudio::where('CLAVE', $prefijo)
            ->orderBy('ANIO', 'desc')
            ->orderBy('SERIADO', 'desc')
            ->first();
        $anioActual = date('y');
        $nuevoClave = $ultimoEstudio->SERIADO+1;
        $siguienteConteo = $ultimoEstudio->SERIADO+2;
        
        if ($ultimoEstudio) {
            // Si el último estudio es del mismo año, incrementar
            if (substr($ultimoEstudio->CLAVE_INTERNA, -2) == $anioActual) {
                $nuevoClave = $ultimoEstudio->SERIADO + 1;
                $siguienteConteo = $nuevoClave + 1;
            }
        }
        
        $seriado = str_pad($nuevoClave, 4, "0", STR_PAD_LEFT);
        $claveInterna = $prefijo . '-' . $seriado . '-' . $anioActual;

        return Inertia::render('estudios/create', [
            'medicos' => $medicos,
            'pacientes' => $pacientes,
            'instituciones' => $instituciones,
            'clientes' => $clientes,
            'mensajerias' => $mensajerias,
            'tiposMuestra' => Estudio::getTiposMuestra(),
            'tiposEstudio' => Estudio::getTiposEstudio(),
            'generos' => Estudio::getGeneros(),
            'tiposEnvio' => Estudio::getTiposEnvio(),
            // Datos generados automáticamente
            'datosAutomaticos' => [
                'IdAleatorio' => uniqid(),
                'Prefijo' => $prefijo,
                'Anio' => $anioActual,
                'Seriado' => $seriado,
                'SiguienteNumero' => str_pad($siguienteConteo, 4, "0", STR_PAD_LEFT),
                'ClaveInterna' => $claveInterna,
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    // ===== LOGS PARA DEBUG =====
    \Log::info('🔴 INICIO store method');
    \Log::info('📊 Request completo:', $request->all());
    
    $request->validate([
        // Campos requeridos del formulario original
        'ClaveInterna' => 'required|string|max:255',
        'FolioMerck' => 'nullable|string|max:255',
        'FechaSolicitudRecoleccion' => 'required|date',
        'HoraSolicitudRecoleccion' => 'required',
        'IdCliente' => 'required|integer|min:0',
        'IdMedico' => 'required|integer|min:0',
        'IdInstitucion' => 'required|integer|min:0',
        'NoAplica' => 'nullable|boolean',
        
        // Campos de nuevos registros (si aplica)
        'NombreCliente' => 'nullable|string|max:255',
        'CorreoCliente' => 'nullable|email|max:255',
        'NombreUsuario' => 'nullable|string|max:255',
        'ApellidosUsuario' => 'nullable|string|max:255',
        'CorreoUsuario' => 'nullable|email|max:255',
        'TelefonoUsuario' => 'nullable|string|max:255',
        'NombreInstitucion' => 'nullable|string|max:255',
        'CorreoInstitucion' => 'nullable|email|max:255',
        'TelefonoInstitucion' => 'nullable|string|max:255',
    ]);

    \Log::info('✅ Validación exitosa');

    // Manejar creación de nuevos registros si es necesario
    $idCliente = $this->manejarNuevoCliente($request);
    $idMedico = $this->manejarNuevoMedico($request);
    $idInstitucion = $this->manejarNuevaInstitucion($request);

    \Log::info('🔗 IDs obtenidos:', [
        'idCliente' => $idCliente,
        'idMedico' => $idMedico, 
        'idInstitucion' => $idInstitucion
    ]);

    // Combinar fecha y hora en datetime
    $fechaHoraSolicitud = $request->FechaSolicitudRecoleccion . ' ' . $request->HoraSolicitudRecoleccion;
    \Log::info('📅 Fecha combinada:', ['fechaHoraSolicitud' => $fechaHoraSolicitud]);

    $estudio = new Estudio();
    
    // Asignar campos básicos
    $estudio->ID_ALEATORIO = $request->IdAleatorio;
    $estudio->CLAVE_INTERNA = $request->ClaveInterna;
    $estudio->CLAVE = $request->Prefijo;
    $estudio->SERIADO = (int)$request->Seriado;
    $estudio->ANIO = (int)$request->Anio;
    $estudio->FOLIO_MERCK = $request->FolioMerck;
    $estudio->FECHA_SOLICITUD_RECOLECCION = $fechaHoraSolicitud;
    
    // Asignar relaciones
    $estudio->ID_CLIENTE = $idCliente;
    $estudio->ID_MEDICO = $idMedico;
    $estudio->ID_INSTITUCION = $idInstitucion;
    
    // Asignar campos de dirección (siempre, incluso si NoAplica es true)
    $estudio->MUESTRA_CLAVE = null;
    $estudio->MUESTRA_GUIA_MENSAJERIA = $request->NoAplica ? '' : ($request->MuestraGuiaMensajeria ?: '');
    $estudio->MUESTRA_GUIA = $request->NoAplica ? '' : ($request->MuestraGuia ?: '');
    $estudio->MUESTRA_DIRECCION = $request->NoAplica ? '' : ($request->MuestraDireccion ?: '');
    $estudio->MUESTRA_NUMERO_EXT = $request->NoAplica ? '' : ($request->MuestraNumeroExt ?: '');
    $estudio->MUESTRA_NUMERO_INT = $request->NoAplica ? '' : ($request->MuestraNumeroInt ?: '');
    $estudio->MUESTRA_COLONIA = $request->NoAplica ? '' : ($request->MuestraColonia ?: '');
    $estudio->MUESTRA_MUNICIPIO = $request->NoAplica ? '' : ($request->MuestraMunicipio ?: '');
    $estudio->MUESTRA_CIUDAD = $request->NoAplica ? '' : ($request->MuestraCiudad ?: '');
    $estudio->MUESTRA_ESTADO = $request->NoAplica ? '' : ($request->MuestraEstado ?: '');
    $estudio->MUESTRA_CODIGO_POSTAL = $request->NoAplica ? '' : ($request->MuestraCodigoPostal ?: '');
    $noAplica = $request->has('NoAplica') && $request->NoAplica;
    $estudio->MUESTRA_ENVIO_TIPO = $noAplica ? 'no aplica' : 'aplica';
    $estudio->MUESTRA_HORARIOS = $request->NoAplica ? '' : ($request->MuestraHorarios ?: '');
    
    // Establecer estado inicial y campos requeridos
    $estudio->ESTUDIO_ESTADO = Estudio::ESTADO_PENDIENTE;
    $estudio->R_COMPLETOS = 'no';
    $estudio->ESTUDIO_FACTURADO = 'no';
    $estudio->CORREO_COPIA = ''; // Campo requerido por la BD
    
    // Otros campos que pueden ser requeridos pero están vacíos
    $estudio->MUESTRA_FOLIO_SOBRE = '';
    $estudio->MUESTRA_FOLIO_KIT_BL = '';
    $estudio->MUESTRA_OTROS_ROTULOS = '';
    $estudio->MUESTRA_SITIO_LESION = '';
    $estudio->MUESTRA_TIPO_ESTUDIO = '';
    $estudio->MUESTRA_INICIALES = '';
    $estudio->MUESTRA_BLOQUES = '';
    $estudio->MUESTRA_LAMINILLAS = '';
    $estudio->MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA = '';
    $estudio->MUESTRA_DIAGNOSTICO_CLINICO = '';
    $estudio->MUESTRA_ENVIO = '';
    $estudio->MUESTRA_GUIA_ESPECIALIZADA = '';
    $estudio->MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA = '';
    $estudio->MUESTRA_GUIA_RETORNO = '';
    $estudio->MUESTRA_GUIA_RETORNO_MENSAJERIA = '';
    $estudio->MUESTRA_LIQ_CONDICION = '';
    $estudio->MUESTRA_LIQ_CONDICION_PRESENCIA = '';
    $estudio->MUESTRA_LIQ_CANTIDAD_ADECUADA = '';
    $estudio->MUESTRA_LIQ_CANTIDAD_ML = '';
    $estudio->MUESTRA_LIQ_HEMOLISIS = '';
    $estudio->MUESTRA_LIQ_AMP_INDICACION = '';
    $estudio->MUESTRA_LIQ_AMP_RAZON = '';
    $estudio->R_METODO_PROCESO = '';
    $estudio->R_RAZON_ADECUADO_PROCESAMIENTO = '';
    $estudio->R_INTERPRETACION = '';
    $estudio->ESTUDIO_NOTAS = '';
    $estudio->ESTUDIO_COMENTARIOS = '';
    
    // ===== NO ASIGNAR FECHAS PROBLEMÁTICAS =====
    // Las siguientes líneas están comentadas porque causaban el error
    // $estudio->FECHA_RECOLECCION = '0000-00-00 00:00:00';
    // $estudio->FECHA_RECEPCION = '0000-00-00 00:00:00';
    // etc...
    
    \Log::info('📋 Objeto estudio ANTES de save:', $estudio->toArray());
    
    // ===== VERIFICAR QUE NO HAYA FECHAS PROBLEMÁTICAS =====
    $attributes = $estudio->getAttributes();
    foreach ($attributes as $key => $value) {
        if (strpos($key, 'FECHA_') === 0 && $value !== null) {
            \Log::warning("⚠️ Fecha detectada: {$key} = {$value}");
        }
    }
    
    try {
        $estudio->save();
        \Log::info('✅ Estudio guardado exitosamente con ID: ' . $estudio->ID);
    } catch (\Exception $e) {
        \Log::error('❌ Error al guardar estudio:', [
            'message' => $e->getMessage(),
            'attributes' => $estudio->getAttributes()
        ]);
        throw $e;
    }

    return redirect()->route('estudios.edit.recepcion', ['estudio' => $estudio->ID])
    ->with('success', 'Estudio creado exitosamente. Complete la información de recolección.');
}
    
    private function manejarNuevoCliente(Request $request)
    {
        if ($request->IdCliente == 0 && $request->NombreCliente) {
            $cliente = new Cliente();
            $cliente->CLIENTE_NOMBRE = $request->NombreCliente;
            $cliente->CLIENTE_CORREO = $request->CorreoCliente;
            $cliente->CLIENTE_PASS = bcrypt('123456'); // Password por defecto
            $cliente->CLIENTE_ENVIAR_CORREO = $request->EnviarCorreoCliente ? 'si' : 'no';
            $cliente->save();
            
            return $cliente->ID_CLIENTE;
        }
        
        return $request->IdCliente;
    }
    
    private function manejarNuevoMedico(Request $request)
    {
        if ($request->IdMedico == 0 && $request->NombreUsuario) {
            $medico = new Usuario();
            $medico->USUARIO_NOMBRE = $request->NombreUsuario;
            $medico->USUARIO_APELLIDOS = $request->ApellidosUsuario;
            $medico->USUARIO_CORREO = $request->CorreoUsuario;
            $medico->USUARIO_TELEFONO = $request->TelefonoUsuario;
            $medico->USUARIO_TIPO = 'medico';
            $medico->USUARIO_PASS = bcrypt('135DIAHMOES');
            $medico->USUARIO_ESTADO = 'activo';
            $medico->ID_INSTITUCION = 1; // Institución por defecto
            $medico->save();
            
            return $medico->ID_USUARIO;
        }
        
        return $request->IdMedico;
    }
    
    private function manejarNuevaInstitucion(Request $request)
    {
        if ($request->IdInstitucion == 0 && $request->NombreInstitucion) {
            $institucion = new Institucion();
            $institucion->INSTITUCION_NOMBRE = $request->NombreInstitucion;
            $institucion->INSTITUCION_CORREO = $request->CorreoInstitucion;
            $institucion->INSTITUCION_TELEFONO = $request->TelefonoInstitucion;
            $institucion->INSTITUCION_RFC = 'PENDIENTE';
            $institucion->INSTITUCION_RAZON_SOCIAL = $request->NombreInstitucion;
            $institucion->INSTITUCION_DIRECCION = '';
            $institucion->INSTITUCION_NUMERO_EXT = '';
            $institucion->INSTITUCION_NUMERO_INT = '';
            $institucion->INSTITUCION_COLONIA = '';
            $institucion->INSTITUCION_MUNICIPIO = '';
            $institucion->INSTITUCION_CIUDAD = '';
            $institucion->INSTITUCION_ESTADO = '';
            $institucion->INSTITUCION_CODIGO_POSTAL = '';
            $institucion->INSTITUCION_PIN = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $institucion->save();
            
            return $institucion->ID_INSTITUCION;
        }
        
        return $request->IdInstitucion;
    }

    /**
     * Display the specified resource.
     */
    public function show(Estudio $estudio)
    {
        // Cargar todas las relaciones necesarias
        $estudio->load([
            'medico:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS,USUARIO_CORREO,USUARIO_TELEFONO',
            'paciente:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS,USUARIO_CORREO,USUARIO_TELEFONO',
            'institucion:ID_INSTITUCION,INSTITUCION_NOMBRE,INSTITUCION_RAZON_SOCIAL,INSTITUCION_RFC,INSTITUCION_CORREO,INSTITUCION_TELEFONO',
            'cliente:ID_CLIENTE,CLIENTE_NOMBRE,CLIENTE_CORREO,CLIENTE_ENVIAR_CORREO',
            'correosCopia:ID,ID_ESTUDIO,ID_USUARIO,NOMBRE,CORREO,ENVIAR',
            'adjuntos:ID,MUESTRA_CLAVE,ARCHIVO'
        ]);
        
        return Inertia::render('estudios/show', [
            'estudio' => $estudio,
            'medico' => $estudio->medico,
            'paciente' => $estudio->paciente,
            'institucion' => $estudio->institucion,
            'cliente' => $estudio->cliente,
            'correos_copias' => $estudio->correosCopia,
            'adjuntos' => $estudio->adjuntos
        ]);
    }

    /**
     * Show the form for editing the specified resource - Paso Recolección
     */
    public function editRecoleccion(Estudio $estudio)
    {
        // Datos para selects de IDs (solo campos necesarios para dropdowns)
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
            
        $clientes = Cliente::select('ID_CLIENTE', 'CLIENTE_NOMBRE')
            ->orderBy('CLIENTE_NOMBRE')
            ->get();
        
        $mensajerias = \App\Models\Mensajeria::activas()
            ->select('ID', 'NOMBRE')
            ->orderBy('NOMBRE')
            ->get();

        return Inertia::render('estudios/edit/recoleccion', [
            'estudio' => $estudio,
            'medicos' => $medicos,
            'pacientes' => $pacientes,
            'instituciones' => $instituciones,
            'clientes' => $clientes,
            'mensajerias' => $mensajerias
        ]);
    }

    /**
     * Show the form for editing the specified resource - Paso Recepción
     */
    public function editRecepcion(Estudio $estudio)
    {
        // Cargar solo campos necesarios para recepción
        $estudio = Estudio::select([
            'ID', 'CLAVE_INTERNA', 'FECHA_RECEPCION', 'FECHA_ENVIO_LABORATORIO', 'ID_PACIENTE', 'ID_MEDICO',
            'MUESTRA_FOLIO_SOBRE', 'MUESTRA_FOLIO_KIT_BL', 'MUESTRA_OTROS_ROTULOS', 'MUESTRA_BLOQUES',
            'MUESTRA_LAMINILLAS', 'MUESTRA_ENVIO_TIPO', 'MUESTRA_ENVIO', 'MUESTRA_GUIA', 'MUESTRA_GUIA_MENSAJERIA',
            'MUESTRA_GUIA_ESPECIALIZADA', 'MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA', 'MUESTRA_LIQ_CONDICION',
            'MUESTRA_LIQ_CONDICION_PRESENCIA', 'MUESTRA_LIQ_CANTIDAD_ADECUADA', 'MUESTRA_LIQ_CANTIDAD_ML',
            'MUESTRA_LIQ_HEMOLISIS', 'MUESTRA_LIQ_AMP_INDICACION', 'MUESTRA_LIQ_AMP_RAZON', 'ESTUDIO_COMENTARIOS',
            'MUESTRA_GENERO', 'MUESTRA_EDAD', 'MUESTRA_CLAVE', 'MUESTRA_INICIALES', 'MUESTRA_SITIO_LESION',
            'MUESTRA_TIPO_ESTUDIO', 'MUESTRA_TIPO', 'MUESTRA_DIAGNOSTICO_CLINICO', 'MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA'
        ])->with([
            'medico:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS',
            'paciente:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS',
            'institucion:ID_INSTITUCION,INSTITUCION_NOMBRE',
            'cliente:ID_CLIENTE,CLIENTE_NOMBRE',
            'correosCopia:ID,ID_ESTUDIO,ID_USUARIO,NOMBRE,CORREO,ENVIAR'
        ])->findOrFail($estudio->ID);

        // Obtener pacientes para el formulario (solo campos necesarios)
        $pacientes = Usuario::where('USUARIO_TIPO', 'paciente')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS', 'USUARIO_CORREO', 'USUARIO_TELEFONO')
            ->orderBy('USUARIO_NOMBRE')
            ->get();

        // Si no hay correos_copias para este estudio, buscar los correos_copias que tengan el mismo ID_USUARIO (médico)
        if ($estudio->correosCopia->isEmpty() && $estudio->ID_MEDICO) {
            // Buscar correos_copias que tengan el mismo ID_USUARIO que el médico del estudio
            $correosDelMedico = \App\Models\CorreoCopia::select('ID_USUARIO', 'NOMBRE', 'CORREO', 'ENVIAR')
                ->where('ID_USUARIO', $estudio->ID_MEDICO)
                ->get();
            
            // Si encontramos correos del médico, copiarlos para este estudio
            if ($correosDelMedico->isNotEmpty()) {
                foreach ($correosDelMedico as $correoOriginal) {
                    try {
                        \App\Models\CorreoCopia::create([
                            'ID_ESTUDIO' => $estudio->ID,
                            'ID_USUARIO' => $correoOriginal->ID_USUARIO, // Mantener la referencia al usuario original
                            'NOMBRE' => $correoOriginal->NOMBRE,
                            'CORREO' => $correoOriginal->CORREO,
                            'ENVIAR' => $correoOriginal->ENVIAR,
                        ]);
                    } catch (\Exception $e) {
                        // Continuar con el siguiente si hay error (correo duplicado, etc.)
                        continue;
                    }
                }
                
                // Recargar la relación para obtener los correos recién copiados
                $estudio->load('correosCopia:ID,ID_ESTUDIO,ID_USUARIO,NOMBRE,CORREO,ENVIAR');
            }
        }

        return Inertia::render('estudios/edit/recepcion', [
            'estudio' => $estudio,
            'pacientes' => $pacientes,
            'tiposEnvio' => Estudio::getTiposEnvio(),
            'correosExistentes' => $estudio->correosCopia,
        ]);
    }

    /**
     * Show the form for editing the specified resource - Paso Laboratorio
     */
    public function editLaboratorio(Estudio $estudio)
    {
        // Cargar solo campos necesarios para laboratorio
        $estudio = Estudio::select([
            'ID', 'CLAVE_INTERNA',
            'FECHA_RECEPCION_LABORATORIO',
            'FECHA_ENTREGA_PROCESAMIENTO',
            'FECHA_OBTENCION_RESULTADOS',
            'FECHA_RETORNO_MATERIAL',
            'FECHA_RECEPCION_RESULTADOS_FISICOS',
            'R_ESTUDIO_SOLICITADO',
            'R_METODO_PROCESO',
            'R_EVALUACION_HISTOPATOLOGICA',
            'R_PRESERVACION_H_E',
            'R_NUMERO_CELULAS_TUMORALES',
            'R_AREA_TUMORAL',
            'R_PORCENTAJE_TUMOR_TEJIDO',
            'R_ENRIQUECIMIENTO',
            'R_ADECUADO_PROCESAMIENTO',
            'R_RAZON_ADECUADO_PROCESAMIENTO',
            'R_ESTATUS_KRAS',
            'R_GENOTIPO_KRAS',
            'R_ESTATUS_NRAS',
            'R_GENOTIPO_NRAS',
            'R_ESTATUS_BRAF',
            'R_GENOTIPO_BRAF',
            'R_RESULTADO_HISTOPATOLOGICO',
            'R_INTERPRETACION',
            'R_COMPLETOS',
            'MUESTRA_TIPO',
            'MUESTRA_GUIA_RETORNO',
            'MUESTRA_GUIA_RETORNO_MENSAJERIA',
            'ESTUDIO_NOTAS',
            'ESTUDIO_COMENTARIOS'
        ])->with([
            'medico:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS',
            'paciente:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS',
            'institucion:ID_INSTITUCION,INSTITUCION_NOMBRE',
            'cliente:ID_CLIENTE,CLIENTE_NOMBRE'
        ])->findOrFail($estudio->ID);

        return Inertia::render('estudios/edit/laboratorio', [
            'estudio' => $estudio,
        ]);
    }

    /**
     * Show the form for editing the specified resource - Paso Informe
     */
    public function editInforme(Estudio $estudio)
    {
        // Cargar solo campos necesarios para informe
        $estudio = Estudio::select([
            'ID', 'CLAVE_INTERNA', 'FECHA_INFORME', 'FECHA_RESULTADOS_CORREO', 'ESTUDIO_FACTURADO',
            'ESTUDIO_ESTADO', 'ESTUDIO_COMENTARIOS', 'BENEFICIARIO', 'ID_MEDICO'
        ])->with([
            'medico:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS,USUARIO_CORREO,USUARIO_TELEFONO',
            'paciente:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS',
            'institucion:ID_INSTITUCION,INSTITUCION_NOMBRE',
            'cliente:ID_CLIENTE,CLIENTE_NOMBRE',
            'correosCopia:ID,ID_ESTUDIO,ID_USUARIO,NOMBRE,CORREO,ENVIAR'
        ])->findOrFail($estudio->ID);
        
        // Si no hay correos_copias para este estudio, buscar los correos_copias que tengan el mismo ID_USUARIO (médico)
        if ($estudio->correosCopia->isEmpty() && $estudio->ID_MEDICO) {
            // Buscar correos_copias que tengan el mismo ID_USUARIO que el médico del estudio
            $correosDelMedico = \App\Models\CorreoCopia::select('ID_USUARIO', 'NOMBRE', 'CORREO', 'ENVIAR')
                ->where('ID_USUARIO', $estudio->ID_MEDICO)
                ->get();
            
            // Si encontramos correos del médico, copiarlos para este estudio
            if ($correosDelMedico->isNotEmpty()) {
                foreach ($correosDelMedico as $correoOriginal) {
                    try {
                        \App\Models\CorreoCopia::create([
                            'ID_ESTUDIO' => $estudio->ID,
                            'ID_USUARIO' => $correoOriginal->ID_USUARIO, // Mantener la referencia al usuario original
                            'NOMBRE' => $correoOriginal->NOMBRE,
                            'CORREO' => $correoOriginal->CORREO,
                            'ENVIAR' => $correoOriginal->ENVIAR,
                        ]);
                    } catch (\Exception $e) {
                        // Continuar con el siguiente si hay error (correo duplicado, etc.)
                        continue;
                    }
                }
                
                // Recargar la relación para obtener los correos recién copiados
                $estudio->load('correosCopia:ID,ID_ESTUDIO,ID_USUARIO,NOMBRE,CORREO,ENVIAR');
            }
        }
        
        // Solo campos necesarios para el dropdown de médicos
        $medicos = Usuario::where('USUARIO_TIPO', 'medico')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS', 'USUARIO_CORREO')
            ->orderBy('USUARIO_NOMBRE')
            ->get();

        return Inertia::render('estudios/edit/informe', [
            'estudio' => $estudio,
            'medicos' => $medicos,
            'correos_copias' => $estudio->correosCopia
        ]);
    }

    /**
     * Update the specified resource in storage - Paso Recolección
     */
    public function updateRecoleccion(Request $request, Estudio $estudio)
    {
        // LOGS PARA DEBUG
        \Log::info('🔴 updateRecoleccion ejecutado');
        \Log::info('📊 Request data recibida:', ['data' => $request->all()]);
        \Log::info('🔢 ID del estudio: ' . $estudio->ID);
        \Log::info('📋 Estudio antes de actualizar:', ['estudio' => $estudio->toArray()]);

        $request->validate([
            'FECHA_SOLICITUD_RECOLECCION' => 'nullable|string', // Cambiado a string porque puede venir con hora
            'CLAVE_INTERNA' => 'nullable|string',
            'FOLIO_MERCK' => 'nullable|string',
            'ID_CLIENTE' => 'nullable|integer',
            'ID_INSTITUCION' => 'nullable|integer', 
            'ID_MEDICO' => 'nullable|integer',
            'MUESTRA_GUIA_MENSAJERIA' => 'nullable|string',
            'MUESTRA_GUIA' => 'nullable|string',
            'MUESTRA_REFERENCIAS' => 'nullable|string',
            'MUESTRA_DIRECCION' => 'nullable|string',
            'MUESTRA_NUMERO_EXT' => 'nullable|string',
            'MUESTRA_NUMERO_INT' => 'nullable|string',
            'MUESTRA_COLONIA' => 'nullable|string',
            'MUESTRA_MUNICIPIO' => 'nullable|string',
            'MUESTRA_CIUDAD' => 'nullable|string',
            'MUESTRA_ESTADO' => 'nullable|string',
            'MUESTRA_ENVIO_TIPO' => 'nullable|string',
            'MUESTRA_CODIGO_POSTAL' => 'nullable|string',
            'MUESTRA_HORARIOS' => 'nullable|string',
            'NO_APLICA' => 'nullable|boolean',
        ]);

        // Campos a actualizar
        $fieldsToUpdate = [
            'FECHA_SOLICITUD_RECOLECCION',
            'CLAVE_INTERNA',
            'FOLIO_MERCK', 
            'ID_CLIENTE',
            'ID_INSTITUCION',
            'ID_MEDICO',
            'MUESTRA_GUIA_MENSAJERIA',
            'MUESTRA_GUIA',
            'MUESTRA_REFERENCIAS',
            'MUESTRA_DIRECCION',
            'MUESTRA_NUMERO_EXT',
            'MUESTRA_NUMERO_INT',
            'MUESTRA_COLONIA',
            'MUESTRA_MUNICIPIO',
            'MUESTRA_CIUDAD',
            'MUESTRA_ESTADO',
            'MUESTRA_ENVIO_TIPO',
            'MUESTRA_CODIGO_POSTAL',
            'MUESTRA_HORARIOS'
        ];

        $dataToUpdate = $request->only($fieldsToUpdate);
        
        // Filtrar valores null y convertirlos a cadenas vacías para campos que no permiten null
        $dataToUpdate = array_map(function($value) {
            return $value === null ? '' : $value;
        }, $dataToUpdate);
        
        // Manejar el campo NO_APLICA especial para MUESTRA_ENVIO
        if ($request->has('NO_APLICA')) {
            $dataToUpdate['MUESTRA_ENVIO'] = $request->NO_APLICA ? 'no aplica' : '';
        }
        
        \Log::info('📤 Datos filtrados para actualizar (después de limpiar nulls):', ['datos' => $dataToUpdate]);

        // Actualizar el estudio
        $updated = $estudio->update($dataToUpdate);
        
        \Log::info('💾 Resultado de update: ' . ($updated ? 'éxito' : 'falló'));
        \Log::info('📋 Estudio después de actualizar:', ['estudio_actualizado' => $estudio->fresh()->toArray()]);

        return back()->with('success', 'Información de recolección actualizada.');
    }

    /**
     * Update the specified resource in storage - Paso Recepción
     */
    public function updateRecepcion(Request $request, Estudio $estudio)
    {
        \Log::info('🔴 updateRecepcion iniciado');
        \Log::info('📊 Datos recibidos:', $request->all());
        \Log::info('🔢 ID del estudio: ' . $estudio->ID);

        try {

            $rules = [
                'FECHA_RECEPCION' => 'nullable|date',
                'ID_PACIENTE' => 'nullable|integer',
                'CREAR_NUEVO_PACIENTE' => 'nullable|boolean',
                'NOMBRE_USUARIO' => 'nullable|string|max:255',
                'APELLIDOS_USUARIO' => 'nullable|string|max:255',
                'CORREO_USUARIO' => 'nullable|email|max:255',
                'TELEFONO_USUARIO' => 'nullable|string|max:20',
                'MUESTRA_GENERO' => 'nullable|string|max:50',
                'MUESTRA_EDAD' => 'nullable|string|max:10',
                'MUESTRA_CLAVE' => 'nullable|string|max:255',
                'MUESTRA_FOLIO_SOBRE' => 'nullable|string|max:255',
                'MUESTRA_FOLIO_KIT_BL' => 'nullable|string|max:255',
                'MUESTRA_OTROS_ROTULOS' => 'nullable|string',
                'MUESTRA_INICIALES' => 'nullable|string|max:10',
                'MUESTRA_SITIO_LESION' => 'nullable|string|max:255',
                'MUESTRA_TIPO_ESTUDIO' => 'nullable|string|max:100',
                'MUESTRA_TIPO' => 'nullable|string|max:100',
                'MUESTRA_BLOQUES' => 'nullable|string|max:255',
                'MUESTRA_LAMINILLAS' => 'nullable|string|max:255',
                'MUESTRA_DIAGNOSTICO_CLINICO' => 'nullable|string|max:500',
                'MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA' => 'nullable|string',
                '_next' => 'nullable|string'
            ];

            if ($request->ID_PACIENTE && $request->ID_PACIENTE > 0) {
                $rules['ID_PACIENTE'] .= '|exists:usuarios,ID_USUARIO';
            }

            $request->validate($rules);

            \Log::info('✅ Validación exitosa');

            // Campos a actualizar
            $camposActualizar = [
                'FECHA_RECEPCION',
                'ID_PACIENTE',
                'MUESTRA_GENERO',
                'MUESTRA_EDAD',
                'MUESTRA_CLAVE',
                'MUESTRA_FOLIO_SOBRE',
                'MUESTRA_FOLIO_KIT_BL',
                'MUESTRA_OTROS_ROTULOS',
                'MUESTRA_INICIALES',
                'MUESTRA_SITIO_LESION',
                'MUESTRA_TIPO_ESTUDIO',
                'MUESTRA_TIPO',
                'MUESTRA_BLOQUES',
                'MUESTRA_LAMINILLAS',
                'MUESTRA_DIAGNOSTICO_CLINICO',
                'MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA'
            ];

            $datosActualizar = $request->only($camposActualizar);
            
            // Filtrar valores null para evitar problemas con columnas NOT NULL
            $datosActualizar = array_filter($datosActualizar, function($value) {
                return $value !== null && $value !== '';
            });
            
            \Log::info('📤 Datos a actualizar (filtrados):', $datosActualizar);

            // Crear nuevo paciente si es necesario
            if (($request->ID_PACIENTE === 0 || $request->ID_PACIENTE === null) && 
                    $request->NOMBRE_USUARIO && 
                    $request->APELLIDOS_USUARIO) {
                
                \Log::info('👤 Creando nuevo paciente');
                
                // Generar correo aleatorio si no se proporciona uno
                $correoUsuario = $request->CORREO_USUARIO;
                if (empty($correoUsuario)) {
                    // Generar 10 caracteres alfanuméricos aleatorios
                    $caracteres = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    $correoAleatorio = '';
                    for ($i = 0; $i < 10; $i++) {
                        $correoAleatorio .= $caracteres[rand(0, strlen($caracteres) - 1)];
                    }
                    $correoUsuario = $correoAleatorio . '@sin-correo.com';
                    \Log::info('📧 Correo generado automáticamente: ' . $correoUsuario);
                }
                
                $nuevoPaciente = Usuario::create([
                    'USUARIO_NOMBRE' => $request->NOMBRE_USUARIO,
                    'USUARIO_APELLIDOS' => $request->APELLIDOS_USUARIO,
                    'USUARIO_CORREO' => $correoUsuario,
                    'USUARIO_TELEFONO' => $request->TELEFONO_USUARIO,
                    'USUARIO_TIPO' => 'paciente',
                    'USUARIO_ESTADO' => 'activo',
                    'USUARIO_PASS' => bcrypt('default123'),
                    'ID_INSTITUCION' => 0,
                ]);
                
                $datosActualizar['ID_PACIENTE'] = $nuevoPaciente->ID_USUARIO;
                \Log::info('✅ Nuevo paciente creado con ID: ' . $nuevoPaciente->ID_USUARIO);
            }

            $estudio->update($datosActualizar);
            \Log::info('✅ Estudio actualizado exitosamente');

            // Manejar navegación
            if ($request->_next === 'laboratorio') {
                \Log::info('🔄 Navegando a laboratorio');
                return redirect()->route('estudios.edit.laboratorio', $estudio->ID)->with('success', 'Información de recepción actualizada. Continuando con laboratorio.');
            }

            \Log::info('✅ updateRecepcion completado exitosamente');
            return back()->with('success', 'Información de recepción actualizada.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ Error de validación:', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            \Log::error('❌ Error en updateRecepcion:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Update the specified resource in storage - Paso Laboratorio
     */
public function updateLaboratorio(Request $request, Estudio $estudio)
{
    \Log::info('🔴 updateLaboratorio iniciado');
    \Log::info('📊 Datos recibidos:', $request->all());
    \Log::info('🔢 ID del estudio: ' . $estudio->ID);

    try {
        $request->validate([
            // Fechas del laboratorio
            'FECHA_RECEPCION_LABORATORIO' => 'nullable|string',
            'HORA_RECEPCION_LABORATORIO' => 'nullable|string|max:10',
            'FECHA_OBTENCION_RESULTADOS' => 'nullable|string',
            'HORA_OBTENCION_RESULTADOS' => 'nullable|string|max:10',
            // Estudio solicitado y métodos
            'R_ESTUDIO_SOLICITADO' => 'nullable|string|max:255',
            'R_METODO_PROCESO' => 'nullable|string|max:255',
            'R_OTRO_METODO_PROCESO' => 'nullable|string|max:255',
            // Condiciones de la muestra líquida
            'MUESTRA_LIQ_CONDICION' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CONDICION_PRESENCIA' => 'nullable|string|max:255',
            'MUESTRA_LIQ_CANTIDAD_ADECUADA' => 'nullable|string|max:50',
            'MUESTRA_LIQ_CANTIDAD_ML' => 'nullable|string|max:50',
            'MUESTRA_LIQ_HEMOLISIS' => 'nullable|string|max:50',
            'MUESTRA_LIQ_AMP_INDICACION' => 'nullable|string|max:50',
            'MUESTRA_LIQ_AMP_RAZON' => 'nullable|string|max:255',
            // Análisis histopatológico
            'R_PRESERVACION_H_E' => 'nullable|string|max:100',
            'R_NUMERO_CELULAS_TUMORALES' => 'nullable|string|max:100',
            'R_AREA_TUMORAL' => 'nullable|string|max:100',
            'R_PORCENTAJE_TUMOR_TEJIDO' => 'nullable|string|max:100',
            'R_ENRIQUECIMIENTO' => 'nullable|string|max:100',
            'R_ADECUADO_PROCESAMIENTO' => 'nullable|string|max:100',
            'R_RAZON_ADECUADO_PROCESAMIENTO' => 'nullable|string|max:255',
            // Resultados genéticos
            'R_ESTATUS_KRAS' => 'nullable|string|max:100',
            'R_GENOTIPO_KRAS' => 'nullable|string|max:255',
            'R_ESTATUS_NRAS' => 'nullable|string|max:100',
            'R_GENOTIPO_NRAS' => 'nullable|string|max:255',
            'R_ESTATUS_BRAF' => 'nullable|string|max:100',
            'R_GENOTIPO_BRAF' => 'nullable|string|max:255',
            // Otros resultados
            'R_RESULTADO_HISTOPATOLOGICO' => 'nullable|string',
            'R_COMPLETOS' => 'nullable|string',
            'ESTUDIO_NOTAS' => 'nullable|string',
            'ESTUDIO_COMENTARIOS' => 'nullable|string',
            '_next' => 'nullable|string'
        ]);

        \Log::info('✅ Validación exitosa');

        // Campos a actualizar - usando los nombres reales que envía el frontend
        $camposActualizar = [
            'R_ESTUDIO_SOLICITADO',
            'R_METODO_PROCESO',
            'R_OTRO_METODO_PROCESO',
            'MUESTRA_LIQ_CONDICION',
            'MUESTRA_LIQ_CONDICION_PRESENCIA',
            'MUESTRA_LIQ_CANTIDAD_ADECUADA',
            'MUESTRA_LIQ_CANTIDAD_ML',
            'MUESTRA_LIQ_HEMOLISIS',
            'MUESTRA_LIQ_AMP_INDICACION',
            'MUESTRA_LIQ_AMP_RAZON',
            'R_PRESERVACION_H_E',
            'R_NUMERO_CELULAS_TUMORALES',
            'R_AREA_TUMORAL',
            'R_PORCENTAJE_TUMOR_TEJIDO',
            'R_ENRIQUECIMIENTO',
            'R_ADECUADO_PROCESAMIENTO',
            'R_RAZON_ADECUADO_PROCESAMIENTO',
            'R_ESTATUS_KRAS',
            'R_GENOTIPO_KRAS',
            'R_ESTATUS_NRAS',
            'R_GENOTIPO_NRAS',
            'R_ESTATUS_BRAF',
            'R_GENOTIPO_BRAF',
            'R_RESULTADO_HISTOPATOLOGICO',
            'R_COMPLETOS',
            'ESTUDIO_NOTAS',
            'ESTUDIO_COMENTARIOS'
        ];

        $datosActualizar = $request->only($camposActualizar);

        // MANEJO MEJORADO DE FECHAS Y HORAS
        
        // Fecha de recepción en laboratorio
        if ($request->filled('FECHA_RECEPCION_LABORATORIO')) {
            $fechaRecepcion = $request->FECHA_RECEPCION_LABORATORIO;
            
            // Verificar si ya incluye hora (contiene más de 10 caracteres)
            if (strlen($fechaRecepcion) > 10) {
                // Ya está combinada, usar tal como viene
                $datosActualizar['FECHA_RECEPCION_LABORATORIO'] = $fechaRecepcion;
                \Log::info('📅 Fecha recepción ya combinada: ' . $fechaRecepcion);
            } else if ($request->filled('HORA_RECEPCION_LABORATORIO')) {
                // Combinar fecha y hora
                $datosActualizar['FECHA_RECEPCION_LABORATORIO'] = $fechaRecepcion . ' ' . $request->HORA_RECEPCION_LABORATORIO . ':00';
                \Log::info('📅 Fecha recepción combinada: ' . $datosActualizar['FECHA_RECEPCION_LABORATORIO']);
            } else {
                // Solo fecha, agregar hora por defecto
                $datosActualizar['FECHA_RECEPCION_LABORATORIO'] = $fechaRecepcion . ' 00:00:00';
            }
        }

        // Fecha de obtención de resultados
        if ($request->filled('FECHA_OBTENCION_RESULTADOS')) {
            $fechaResultados = $request->FECHA_OBTENCION_RESULTADOS;
            
            // Verificar si ya incluye hora (contiene más de 10 caracteres)
            if (strlen($fechaResultados) > 10) {
                // Ya está combinada, usar tal como viene
                $datosActualizar['FECHA_OBTENCION_RESULTADOS'] = $fechaResultados;
                \Log::info('📅 Fecha resultados ya combinada: ' . $fechaResultados);
            } else if ($request->filled('HORA_OBTENCION_RESULTADOS')) {
                // Combinar fecha y hora
                $datosActualizar['FECHA_OBTENCION_RESULTADOS'] = $fechaResultados . ' ' . $request->HORA_OBTENCION_RESULTADOS . ':00';
                \Log::info('📅 Fecha resultados combinada: ' . $datosActualizar['FECHA_OBTENCION_RESULTADOS']);
            } else {
                // Solo fecha, agregar hora por defecto
                $datosActualizar['FECHA_OBTENCION_RESULTADOS'] = $fechaResultados . ' 00:00:00';
            }
        }

        // Filtrar valores null para evitar problemas con columnas NOT NULL
        $datosActualizar = array_filter($datosActualizar, function($value) {
            return $value !== null && $value !== '';
        });
        
        \Log::info('📤 Datos a actualizar (filtrados):', $datosActualizar);

        $estudio->update($datosActualizar);
        \Log::info('✅ Estudio actualizado exitosamente');

        // Manejar navegación
        if ($request->_next === 'informe') {
            \Log::info('🔄 Navegando a informe');
            return redirect()->route('estudios.edit.informe', $estudio->ID)->with('success', 'Información de laboratorio actualizada. Continuando con informe.');
        }

        \Log::info('✅ updateLaboratorio completado exitosamente');
        return back()->with('success', 'Información de laboratorio actualizada.');

    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('❌ Error de validación:', $e->errors());
        throw $e;
    } catch (\Exception $e) {
        \Log::error('❌ Error en updateLaboratorio:', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        throw $e;
    }
}

/**
 * Update the specified resource in storage - Paso Informe
 */
public function updateInforme(Request $request, Estudio $estudio)
{
    \Log::info('🚀 Iniciando updateInforme', [
        'estudio_id' => $estudio->ID,
        'request_data' => $request->all(),
        'action' => $request->_action
    ]);

    try {
        // Log de validación
        \Log::info('📋 Iniciando validación de datos');
        
        $request->validate([
            // Fechas del informe
            'FECHA_INFORME' => 'nullable|string',
            'HORA_INFORME' => 'nullable|string',
            'FECHA_RESULTADOS_CORREO' => 'nullable|string', 
            'HORA_RESULTADOS_CORREO' => 'nullable|string',
            // Configuración del estudio
            'ESTUDIO_FACTURADO' => 'nullable|string',
            'ESTUDIO_ESTADO' => 'nullable|string',
            'ESTUDIO_COMENTARIOS' => 'nullable|string',
            'BENEFICIARIO' => 'nullable|string',
            'ENVIAR_ADJUNTO' => 'nullable|boolean',
            // Array de correos de copia
            'correos_copias' => 'nullable|array',
            'correos_copias.*.ID' => 'nullable|integer',
            'correos_copias.*.NOMBRE' => 'nullable|string|max:255',
            'correos_copias.*.CORREO' => 'required|email|max:255',
            'correos_copias.*.ENVIAR' => 'nullable|string',
            'correos_copias.*.ID_ESTUDIO' => 'nullable|integer',
            // Acciones especiales
            '_action' => 'nullable|string'
        ]);

        \Log::info('✅ Validación completada exitosamente');

        // Combinar fecha y hora de informe
        \Log::info('📅 Procesando fecha de informe', [
            'FECHA_INFORME' => $request->FECHA_INFORME,
            'HORA_INFORME' => $request->HORA_INFORME
        ]);
        
        $fechaInforme = null;

        if ($request->FECHA_INFORME) {
            // Si ya tiene hora (formato completo), usarla tal como viene
            if (strlen($request->FECHA_INFORME) > 10) {
                $fechaInforme = $request->FECHA_INFORME;
                \Log::info('🕐 Fecha de informe ya incluye hora', ['fecha_completa' => $fechaInforme]);
            } 
            // Si solo es fecha, agregar la hora
            elseif ($request->HORA_INFORME) {
                $fechaInforme = $request->FECHA_INFORME . ' ' . $request->HORA_INFORME . ':00';
                \Log::info('🕐 Combinando fecha y hora de informe', ['fecha_combinada' => $fechaInforme]);
            }
            else {
                $fechaInforme = $request->FECHA_INFORME;
                \Log::info('📅 Solo fecha de informe proporcionada', ['fecha_solo' => $fechaInforme]);
            }

            // Validar que sea una fecha válida
            $timestamp = strtotime($fechaInforme);
            if ($timestamp === false || $timestamp < 0) {
                // Fecha inválida, usar fecha actual
                \Log::warning('⚠️ Fecha de informe inválida detectada', [
                    'fecha_original' => $fechaInforme,
                    'timestamp' => $timestamp
                ]);
                $fechaInforme = date('Y-m-d H:i:s');
                \Log::info('🔄 Usando fecha actual para informe', ['fecha_nueva' => $fechaInforme]);
            } else {
                // Convertir a formato estándar
                $fechaInforme = date('Y-m-d H:i:s', $timestamp);
                \Log::info('✅ Fecha de informe validada', ['fecha_final' => $fechaInforme]);
            }
        } else {
            // Si no hay fecha, usar la fecha actual
            $fechaInforme = date('Y-m-d H:i:s');
            \Log::info('🔄 No se proporcionó fecha de informe, usando actual', ['fecha_actual' => $fechaInforme]);
        }

        // Combinar fecha y hora de resultados por correo
        \Log::info('📧 Procesando fecha de resultados por correo', [
            'FECHA_RESULTADOS_CORREO' => $request->FECHA_RESULTADOS_CORREO,
            'HORA_RESULTADOS_CORREO' => $request->HORA_RESULTADOS_CORREO
        ]);
        
        $fechaResultadosCorreo = null;

        if ($request->FECHA_RESULTADOS_CORREO) {
            // Si ya tiene hora (formato completo), usarla tal como viene
            if (strlen($request->FECHA_RESULTADOS_CORREO) > 10) {
                $fechaResultadosCorreo = $request->FECHA_RESULTADOS_CORREO;
                \Log::info('🕐 Fecha de resultados ya incluye hora', ['fecha_completa' => $fechaResultadosCorreo]);
            } 
            // Si solo es fecha, agregar la hora
            elseif ($request->HORA_RESULTADOS_CORREO) {
                $fechaResultadosCorreo = $request->FECHA_RESULTADOS_CORREO . ' ' . $request->HORA_RESULTADOS_CORREO . ':00';
                \Log::info('🕐 Combinando fecha y hora de resultados', ['fecha_combinada' => $fechaResultadosCorreo]);
            }
            else {
                $fechaResultadosCorreo = $request->FECHA_RESULTADOS_CORREO;
                \Log::info('📅 Solo fecha de resultados proporcionada', ['fecha_solo' => $fechaResultadosCorreo]);
            }

            // Validar que sea una fecha válida
            $timestamp = strtotime($fechaResultadosCorreo);
            if ($timestamp === false || $timestamp < 0) {
                // Fecha inválida, usar fecha actual
                \Log::warning('⚠️ Fecha de resultados inválida detectada', [
                    'fecha_original' => $fechaResultadosCorreo,
                    'timestamp' => $timestamp
                ]);
                $fechaResultadosCorreo = date('Y-m-d H:i:s');
                \Log::info('🔄 Usando fecha actual para resultados', ['fecha_nueva' => $fechaResultadosCorreo]);
            } else {
                // Convertir a formato estándar
                $fechaResultadosCorreo = date('Y-m-d H:i:s', $timestamp);
                \Log::info('✅ Fecha de resultados validada', ['fecha_final' => $fechaResultadosCorreo]);
            }
        } else {
            // Si no hay fecha, usar la fecha actual
            $fechaResultadosCorreo = date('Y-m-d H:i:s');
            \Log::info('🔄 No se proporcionó fecha de resultados, usando actual', ['fecha_actual' => $fechaResultadosCorreo]);
        }

        // Determinar estado del estudio
        \Log::info('🔄 Determinando estado del estudio', [
            'estado_request' => $request->ESTUDIO_ESTADO,
            'estado_actual' => $estudio->ESTUDIO_ESTADO,
            'action' => $request->_action
        ]);
        
        $estadoEstudio = $request->ESTUDIO_ESTADO ?: $estudio->ESTUDIO_ESTADO;
        if ($request->_action === 'enviar') {
            $estadoEstudio = 'Resultados Enviados';
            $fechaResultadosCorreo = $fechaResultadosCorreo ?: now();
            \Log::info('📧 Acción de envío detectada, cambiando estado', [
                'nuevo_estado' => $estadoEstudio,
                'fecha_resultados_correo' => $fechaResultadosCorreo
            ]);
        }

        // Preparar datos para actualizar el estudio
        \Log::info('📝 Preparando datos para actualización del estudio');
        
        $datosEstudio = array_filter([
            'FECHA_INFORME' => $fechaInforme,
            'FECHA_RESULTADOS_CORREO' => $fechaResultadosCorreo,
            'ESTUDIO_FACTURADO' => $request->ESTUDIO_FACTURADO,
            'ESTUDIO_ESTADO' => $estadoEstudio,
            'ESTUDIO_COMENTARIOS' => $request->ESTUDIO_COMENTARIOS,
            'BENEFICIARIO' => $request->BENEFICIARIO,
        ], function($value) {
            return $value !== null && $value !== '';
        });

        \Log::info('📝 Datos filtrados para actualización', ['datos_estudio' => $datosEstudio]);

        // Actualizar el estudio
        \Log::info('💾 Actualizando estudio en la base de datos');
        $estudio->update($datosEstudio);
        \Log::info('✅ Estudio actualizado exitosamente');

        // Manejar correos de copia
        if ($request->has('correos_copias') && is_array($request->correos_copias)) {
            \Log::info('📧 Procesando correos de copia', [
                'cantidad_correos' => count($request->correos_copias),
                'correos_data' => $request->correos_copias
            ]);
            
            // Obtener IDs de correos existentes para este estudio
            $correosExistentes = CorreoCopia::where('ID_ESTUDIO', $estudio->ID)
                ->pluck('ID')
                ->toArray();

            \Log::info('📧 Correos existentes encontrados', [
                'correos_existentes' => $correosExistentes
            ]);

            $correosEnviados = collect($request->correos_copias)
                ->pluck('ID')
                ->filter()
                ->toArray();

            \Log::info('📧 Correos en el request', [
                'correos_enviados' => $correosEnviados
            ]);

            // Eliminar correos que ya no están en la lista
            $correosAEliminar = array_diff($correosExistentes, $correosEnviados);
            if (!empty($correosAEliminar)) {
                \Log::info('🗑️ Eliminando correos que ya no están en la lista', [
                    'correos_a_eliminar' => $correosAEliminar
                ]);
                CorreoCopia::whereIn('ID', $correosAEliminar)->delete();
                \Log::info('✅ Correos eliminados exitosamente');
            }

            // Actualizar o crear correos de copia
            foreach ($request->correos_copias as $index => $correoData) {
                \Log::info("📧 Procesando correo #{$index}", ['correo_data' => $correoData]);
                
                if (isset($correoData['ID']) && $correoData['ID']) {
                    // Actualizar correo existente
                    \Log::info("🔄 Actualizando correo existente ID: {$correoData['ID']}");
                    $correo = CorreoCopia::find($correoData['ID']);
                    if ($correo) {
                        $correo->update([
                            'NOMBRE' => $correoData['NOMBRE'],
                            'CORREO' => $correoData['CORREO'],
                            'ENVIAR' => $correoData['ENVIAR'] ?? 'si',
                        ]);
                        \Log::info("✅ Correo actualizado exitosamente ID: {$correoData['ID']}");
                    } else {
                        \Log::warning("⚠️ No se encontró el correo con ID: {$correoData['ID']}");
                    }
                } else {
                    // Crear nuevo correo
                    \Log::info('➕ Creando nuevo correo de copia');
                    $nuevoCorreo = CorreoCopia::create([
                        'ID_ESTUDIO' => $estudio->ID,
                        'ID_USUARIO' => $estudio->ID_MEDICO ?? 0,
                        'NOMBRE' => $correoData['NOMBRE'],
                        'CORREO' => $correoData['CORREO'],
                        'ENVIAR' => $correoData['ENVIAR'] ?? 'si',
                    ]);
                    \Log::info('✅ Nuevo correo creado exitosamente', ['nuevo_id' => $nuevoCorreo->ID]);
                }
            }
        } else {
            \Log::info('📧 No se proporcionaron correos de copia o no es un array válido');
        }

        // Enviar correos si se solicita
        if ($request->_action === 'enviar') {
            \Log::info('📤 Enviando correos de reporte', [
                'enviar_adjunto' => $request->ENVIAR_ADJUNTO ?? false
            ]);
            
            try {
                $this->enviarCorreosReporte($estudio, $request->ENVIAR_ADJUNTO ?? false);
                \Log::info('✅ Correos enviados exitosamente');
            } catch (\Exception $e) {
                \Log::error('❌ Error al enviar correos', [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]);
                throw $e;
            }
        }

        // Determinar mensaje de éxito
        $mensaje = 'Información de informe actualizada.';
        if ($request->_action === 'enviar') {
            $mensaje = 'Información guardada y correo enviado exitosamente.';
        }

        \Log::info('🎉 updateInforme completado exitosamente', [
            'mensaje' => $mensaje,
            'estudio_id' => $estudio->ID
        ]);

        return back()->with('success', $mensaje);

    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('❌ Error de validación en updateInforme', [
            'errors' => $e->errors(),
            'estudio_id' => $estudio->ID,
            'request_data' => $request->all()
        ]);
        throw $e;
    } catch (\Exception $e) {
        \Log::error('❌ Error general en updateInforme', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
            'estudio_id' => $estudio->ID,
            'request_data' => $request->all()
        ]);
        throw $e;
    }
}
    /**
     * Enviar correo individual y registrar el envío
     */
    public function enviarCorreoIndividual(Request $request, Estudio $estudio)
{
    try {
        $request->validate([
            'nombre' => 'nullable|string|max:255',
            'correo' => 'required|email|max:255',
            'enviar_adjunto' => 'boolean'
        ]);

        // Procesar el nombre del destinatario
        $nombreDestinatario = $request->nombre;
        
        if (empty($nombreDestinatario)) {
            $nombreDestinatario = explode('@', $request->correo)[0];
        }

        // Cargar relaciones necesarias
        $estudio->load(['medico', 'cliente', 'institucion']);

        // Verificar que el estudio tenga información completa
        if (!$estudio->medico || !$estudio->cliente || !$estudio->institucion) {
            throw new \Exception('El estudio no tiene la información completa necesaria');
        }

        // Enviar el correo usando Mail de Laravel (método original)
        Mail::to($request->correo)->send(new \App\Mail\EstudioReporte($estudio, $request->enviar_adjunto ?? false));

        // Registrar el envío directamente en la base de datos (SIN usar el service por ahora)
        $envio = \App\Models\EnvioCorreo::create([
            'ID_ESTUDIO' => $estudio->ID,
            'ID_MEDICO' => $estudio->ID_MEDICO,
            'ID_USUARIO_ENVIO' => auth()->user()->ID_USUARIO ?? auth()->id(),
            'NOMBRE_DESTINATARIO' => $nombreDestinatario,
            'CORREO_DESTINATARIO' => $request->correo,
            'TIPO_ENVIO' => $request->enviar_adjunto ? 'adjunto' : 'enlace',
            'MENSAJE_HTML' => 'Correo enviado - ' . ($estudio->CLAVE_INTERNA ?? 'Sin clave'),
            'ESTADO' => 'enviado',
            'FECHA_ENVIO' => now()
        ]);

        \Log::info('Correo individual enviado y registrado exitosamente', [
            'estudio_id' => $estudio->ID,
            'destinatario' => $request->correo,
            'nombre_usado' => $nombreDestinatario,
            'envio_id' => $envio->id
        ]);

        return response()->json([
            'success' => true,
            'message' => "Correo enviado exitosamente a {$nombreDestinatario}",
            'envio_id' => $envio->id
        ]);

    } catch (\Exception $e) {
        \Log::error('Error enviando correo individual', [
            'estudio_id' => $estudio->ID ?? null,
            'destinatario' => $request->correo ?? null,
            'nombre_original' => $request->nombre ?? null,
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Error al enviar correo: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Show the form for editing the specified resource - Vista Completa
     */
    public function editFull(Estudio $estudio)
    {
        return Inertia::render('estudios/edit/full', [
            'estudio' => $estudio
        ]);
    }

    /**
     * Update the specified resource in storage - Vista Completa
     */
    public function updateFull(Request $request, Estudio $estudio)
    {
        // Validación de todos los campos
        $request->validate([
            // Campos básicos
            'FECHA_SOLICITUD_RECOLECCION' => 'nullable|string',
            'HORA_SOLICITUD_RECOLECCION' => 'nullable|string',
            'ID_MEDICO' => 'nullable|integer',
            'ID_PACIENTE' => 'nullable|integer',
            'ID_INSTITUCION' => 'nullable|integer',
            'ID_CLIENTE' => 'nullable|integer',
            
            // Campos de muestra
            'MUESTRA_TIPO' => 'nullable|string',
            'MUESTRA_TIPO_ESTUDIO' => 'nullable|string',
            'MUESTRA_INICIALES' => 'nullable|string',
            'MUESTRA_GENERO' => 'nullable|string',
            'MUESTRA_EDAD' => 'nullable|string',
            'MUESTRA_SITIO_LESION' => 'nullable|string',
            'MUESTRA_DIAGNOSTICO_CLINICO' => 'nullable|string',
            
            // Dirección
            'MUESTRA_DIRECCION' => 'nullable|string',
            'MUESTRA_NUMERO_EXT' => 'nullable|string',
            'MUESTRA_NUMERO_INT' => 'nullable|string',
            'MUESTRA_COLONIA' => 'nullable|string',
            'MUESTRA_MUNICIPIO' => 'nullable|string',
            'MUESTRA_CIUDAD' => 'nullable|string',
            'MUESTRA_ESTADO' => 'nullable|string',
            'MUESTRA_CODIGO_POSTAL' => 'nullable|string',
            'MUESTRA_HORARIOS' => 'nullable|string',
            
            // Recepción
            'FECHA_RECEPCION' => 'nullable|string',
            'HORA_RECEPCION' => 'nullable|string',
            'FECHA_ENVIO_LABORATORIO' => 'nullable|string',
            'HORA_ENVIO_LABORATORIO' => 'nullable|string',
            
            // Otros campos que se necesiten...
            'ESTUDIO_COMENTARIOS' => 'nullable|string',
        ]);

        // Combinar fechas y horas si están presentes
        $fechaCompleta = null;
        if ($request->FECHA_SOLICITUD_RECOLECCION && $request->HORA_SOLICITUD_RECOLECCION) {
            $fechaCompleta = $request->FECHA_SOLICITUD_RECOLECCION . ' ' . $request->HORA_SOLICITUD_RECOLECCION . ':00';
        }

        $fechaRecepcion = null;
        if ($request->FECHA_RECEPCION && $request->HORA_RECEPCION) {
            $fechaRecepcion = $request->FECHA_RECEPCION . ' ' . $request->HORA_RECEPCION . ':00';
        }

        $fechaEnvioLab = null;
        if ($request->FECHA_ENVIO_LABORATORIO && $request->HORA_ENVIO_LABORATORIO) {
            $fechaEnvioLab = $request->FECHA_ENVIO_LABORATORIO . ' ' . $request->HORA_ENVIO_LABORATORIO . ':00';
        }

        // Preparar datos para actualización
        $updateData = $request->only([
            'ID_MEDICO', 'ID_PACIENTE', 'ID_INSTITUCION', 'ID_CLIENTE',
            'MUESTRA_TIPO', 'MUESTRA_TIPO_ESTUDIO', 'MUESTRA_INICIALES', 'MUESTRA_GENERO',
            'MUESTRA_EDAD', 'MUESTRA_SITIO_LESION', 'MUESTRA_DIAGNOSTICO_CLINICO',
            'MUESTRA_DIRECCION', 'MUESTRA_NUMERO_EXT', 'MUESTRA_NUMERO_INT',
            'MUESTRA_COLONIA', 'MUESTRA_MUNICIPIO', 'MUESTRA_CIUDAD', 'MUESTRA_ESTADO',
            'MUESTRA_CODIGO_POSTAL', 'MUESTRA_HORARIOS', 'ESTUDIO_COMENTARIOS'
        ]);

        // Agregar fechas combinadas
        if ($fechaCompleta) {
            $updateData['FECHA_SOLICITUD_RECOLECCION'] = $fechaCompleta;
        }
        if ($fechaRecepcion) {
            $updateData['FECHA_RECEPCION'] = $fechaRecepcion;
        }
        if ($fechaEnvioLab) {
            $updateData['FECHA_ENVIO_LABORATORIO'] = $fechaEnvioLab;
        }

        // Actualizar el estudio
        $estudio->update($updateData);

        return back()->with('success', 'Estudio actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Estudio $estudio)
    {
        $estudio->delete();
        
        return redirect()->route('estudios.index')
            ->with('success', 'Estudio eliminado exitosamente.');
    }

    /**
     * Generate PDF for the study (authenticated route)
     */
    public function generatePdf(Estudio $estudio)
    {
        // Cargar relaciones necesarias
        $estudio->load(['medico', 'paciente', 'institucion', 'cliente']);
        
        return $this->_generatePdfResponse($estudio);
    }

    /**
     * Generate PDF for the study (public route with security token)
     */
    public function generatePublicPdf(Request $request)
    {
        // Validar parámetros requeridos
        $request->validate([
            'id' => 'required|integer',
            'aleatorio' => 'required|string',
            'imprimir' => 'nullable|string|in:si,true' // Nuevo parámetro opcional
        ]);

        // Buscar el estudio por ID y token aleatorio
        $estudio = Estudio::where('ID', $request->id)
            ->where('ID_ALEATORIO', $request->aleatorio)
            ->first();

        if (!$estudio) {
            abort(404, 'Estudio no encontrado o token inválido');
        }

        // Cargar relaciones necesarias
        $estudio->load(['medico', 'paciente', 'institucion', 'cliente']);
        
        // Determinar si es para impresión
        $paraImprimir = in_array($request->imprimir, ['si', 'true']);
        
        return $this->_generatePdfResponse($estudio, $paraImprimir);
    }

    /**
     * Private method to generate PDF response
     */
    private function _generatePdfResponse(Estudio $estudio, bool $paraImprimir = false)
    {
        // Preparar datos para la vista
        $data = [
            'estudio' => $estudio,
            'paciente' => $estudio->paciente,
            'medico' => $estudio->medico,
            'institucion' => $estudio->institucion,
            'cliente' => $estudio->cliente,
            'paraImprimir' => $paraImprimir // Nuevo parámetro para la vista
        ];
        
        // Generar PDF usando DomPDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.estudio', $data);
        
        // Configurar opciones del PDF
        $pdf->setPaper('letter', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
            'defaultFont' => 'Arial',
            'isRemoteEnabled' => true, // Permite cargar recursos externos
            'debugKeepTemp' => false,
            'debugCss' => false,
            'debugLayout' => false,
            'debugLayoutLines' => false,
            'debugLayoutBlocks' => false,
            'debugLayoutInline' => false
        ]);
        
        // Nombre del archivo
        $filename = 'DIAHMOES_' . ($estudio->CLAVE_INTERNA ?? $estudio->folio_completo) . '.pdf';
        
        // Descargar o mostrar el PDF
        return $pdf->stream($filename);
    }

    /**
     * Store a new correo copia for the study
     */
    public function storeCorreoCopia(Request $request, Estudio $estudio)
    {
        $request->validate([
            'nombre' => 'nullable|string|max:255',
            'correo' => 'required|email|max:255'
        ]);

        // Crear el correo de copia en la BD
        $correoCopia = $estudio->correosCopia()->create([
            'NOMBRE' => $request->nombre ?? '',
            'CORREO' => $request->correo,
            'ID_ESTUDIO' => $estudio->ID,
            'ID_USUARIO' => auth()->id() // Agregar el ID del usuario logueado
        ]);

        // Redireccionar de vuelta a la página de recepción con mensaje de éxito
        return redirect()->back()->with('success', 'Correo agregado exitosamente');
    }

    /**
     * Remove a correo copia from the study
     */
    public function destroyCorreoCopia(Estudio $estudio, $correoId)
    {
        $correoCopia = $estudio->correosCopia()->findOrFail($correoId);
        $correoCopia->delete();

        // Redireccionar de vuelta a la página de recepción con mensaje de éxito
        return redirect()->back()->with('success', 'Correo eliminado exitosamente');
    }

/**
 * Enviar correos electrónicos del reporte a todos los destinatarios
 */
private function enviarCorreosReporte(Estudio $estudio, bool $enviarAdjunto = true)
{
    try {
        // Cargar relaciones necesarias
        $estudio->load(['correosCopia', 'medico', 'cliente']);
        
        // Lista de correos válidos para enviar
        $correosDestino = [];
        $correosRechazados = [];
        
        // Procesar correos de copia
        foreach ($estudio->correosCopia as $correoCopia) {
            if ($correoCopia->ENVIAR === 'si' && !empty($correoCopia->CORREO)) {
                if (filter_var($correoCopia->CORREO, FILTER_VALIDATE_EMAIL)) {
                    $correosDestino[] = [
                        'email' => $correoCopia->CORREO,
                        'name' => $correoCopia->NOMBRE ?? 'Destinatario'
                    ];
                } else {
                    $correosRechazados[] = $correoCopia->CORREO;
                }
            }
        }
        
        // Si no hay correos de copia válidos, usar médico como fallback
        if (empty($correosDestino) && $estudio->medico && !empty($estudio->medico->USUARIO_CORREO)) {
            if (filter_var($estudio->medico->USUARIO_CORREO, FILTER_VALIDATE_EMAIL)) {
                $correosDestino[] = [
                    'email' => $estudio->medico->USUARIO_CORREO,
                    'name' => $estudio->medico->USUARIO_NOMBRE . ' ' . $estudio->medico->USUARIO_APELLIDOS
                ];
            }
        }
        
        if (empty($correosDestino)) {
            \Log::warning("No hay correos válidos para enviar reporte del estudio {$estudio->CLAVE_INTERNA}");
            return;
        }
        
        // Crear instancia del service
        $envioService = new EnvioCorreoService();
        
        // Preparar el HTML del correo una sola vez
        $mailable = new \App\Mail\EstudioReporte($estudio, $enviarAdjunto);
        $htmlContent = $mailable->render();
        
        // Enviar a cada destinatario y registrar
        $enviadosExitosos = 0;
        $erroresEnvio = [];
        
        foreach ($correosDestino as $destinatario) {
            try {
                // Preparar datos para el registro
                $datosEnvio = [
                    'ID_ESTUDIO' => $estudio->ID,
                    'ID_MEDICO' => $estudio->ID_MEDICO,
                    'ID_USUARIO_ENVIO' => auth()->user()->ID_USUARIO ?? auth()->id(),
                    'NOMBRE_DESTINATARIO' => $destinatario['name'],
                    'CORREO_DESTINATARIO' => $destinatario['email'],
                    'TIPO_ENVIO' => $enviarAdjunto ? 'adjunto' : 'enlace',
                    'MENSAJE_HTML' => $htmlContent,
                    'ASUNTO' => 'Resultados de Estudio - ' . ($estudio->CLAVE_INTERNA ?? 'Sin clave')
                ];

                // Enviar correo y registrar automáticamente
                $resultado = $envioService->enviarYRegistrar($datosEnvio, \App\Mail\EstudioReporte::class);

                if ($resultado['success']) {
                    $enviadosExitosos++;
                    \Log::info("Correo enviado y registrado exitosamente", [
                        'destinatario' => $destinatario['email'],
                        'envio_id' => $resultado['envio']->id,
                        'token_tracking' => $resultado['envio']->TOKEN_LECTURA
                    ]);
                } else {
                    $erroresEnvio[] = "Error enviando a {$destinatario['email']}: {$resultado['message']}";
                    \Log::error("Error enviando correo a {$destinatario['email']}", [
                        'error' => $resultado['error'] ?? $resultado['message']
                    ]);
                }
                
            } catch (\Exception $e) {
                $erroresEnvio[] = "Error enviando a {$destinatario['email']}: {$e->getMessage()}";
                \Log::error("Error enviando correo a {$destinatario['email']}: " . $e->getMessage());
                continue;
            }
        }
        
        \Log::info("Resumen de envío de correos", [
            'estudio' => $estudio->CLAVE_INTERNA,
            'enviados_exitosos' => $enviadosExitosos,
            'total_destinatarios' => count($correosDestino),
            'correos_rechazados' => count($correosRechazados),
            'errores' => count($erroresEnvio)
        ]);
        
        if (!empty($correosRechazados)) {
            \Log::warning("Correos rechazados (formato inválido): " . implode(', ', $correosRechazados));
        }
        
        if (!empty($erroresEnvio)) {
            \Log::warning("Errores en envíos: " . implode('; ', $erroresEnvio));
        }
        
    } catch (\Exception $e) {
        \Log::error('Error general enviando correos para estudio ' . $estudio->CLAVE_INTERNA . ': ' . $e->getMessage());
    }
}

    /**
     * Obtener datos del último estudio de una institución específica
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUltimoEstudioInstitucion(Request $request)
    {
        try {
            $request->validate([
                'id_institucion' => 'required|integer|exists:instituciones,ID_INSTITUCION'
            ]);

            $ultimoEstudio = Estudio::where('ID_INSTITUCION', $request->id_institucion)
                ->with([
                    'medico:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS,USUARIO_CORREO,USUARIO_TELEFONO',
                    'paciente:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS,USUARIO_CORREO,USUARIO_TELEFONO',
                    'institucion:ID_INSTITUCION,INSTITUCION_NOMBRE,INSTITUCION_CORREO,INSTITUCION_TELEFONO,INSTITUCION_DIRECCION,INSTITUCION_NUMERO_EXT,INSTITUCION_NUMERO_INT,INSTITUCION_COLONIA,INSTITUCION_MUNICIPIO,INSTITUCION_CIUDAD,INSTITUCION_ESTADO,INSTITUCION_CODIGO_POSTAL',
                    'cliente:ID_CLIENTE,CLIENTE_NOMBRE,CLIENTE_CORREO'
                ])
                ->orderBy('ANIO', 'desc')
                ->orderBy('SERIADO', 'desc')
                ->first();

            if (!$ultimoEstudio) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron estudios para esta institución',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Último estudio encontrado',
                'data' => [
                    'estudio' => $ultimoEstudio,
                    'medico' => $ultimoEstudio->medico,
                    'paciente' => $ultimoEstudio->paciente,
                    'institucion' => $ultimoEstudio->institucion,
                    'cliente' => $ultimoEstudio->cliente
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error en getUltimoEstudioInstitucion: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos del último estudio de un médico específico
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUltimoEstudioMedico(Request $request)
    {
        try {
            $request->validate([
                'id_medico' => 'required|integer|exists:usuarios,ID_USUARIO'
            ]);

            $ultimoEstudio = Estudio::where('ID_MEDICO', $request->id_medico)
                ->with([
                    'medico:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS,USUARIO_CORREO,USUARIO_TELEFONO',
                    'paciente:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS,USUARIO_CORREO,USUARIO_TELEFONO',
                    'institucion:ID_INSTITUCION,INSTITUCION_NOMBRE,INSTITUCION_CORREO,INSTITUCION_TELEFONO,INSTITUCION_DIRECCION,INSTITUCION_NUMERO_EXT,INSTITUCION_NUMERO_INT,INSTITUCION_COLONIA,INSTITUCION_MUNICIPIO,INSTITUCION_CIUDAD,INSTITUCION_ESTADO,INSTITUCION_CODIGO_POSTAL',
                    'cliente:ID_CLIENTE,CLIENTE_NOMBRE,CLIENTE_CORREO'
                ])
                ->orderBy('ANIO', 'desc')
                ->orderBy('SERIADO', 'desc')
                ->first();

            if (!$ultimoEstudio) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron estudios para este médico',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Último estudio encontrado',
                'data' => [
                    'estudio' => $ultimoEstudio,
                    'medico' => $ultimoEstudio->medico,
                    'paciente' => $ultimoEstudio->paciente,
                    'institucion' => $ultimoEstudio->institucion,
                    'cliente' => $ultimoEstudio->cliente
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error en getUltimoEstudioMedico: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar los envíos de correos de un estudio específico
     */
    public function mostrarEnviosCorreos(Estudio $estudio)
    {
        // Cargar envíos con relaciones
        $envios = $estudio->enviosCorreos()
            ->with(['usuarioEnvio:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS'])
            ->orderBy('FECHA_ENVIO', 'desc')
            ->get();

        // Calcular estadísticas
        $estadisticas = [
            'total' => $envios->count(),
            'enviados' => $envios->where('ESTADO', 'enviado')->count(),
            'leidos' => $envios->where('ESTADO', 'leido')->count(),
            'porcentaje_lectura' => $envios->count() > 0 
                ? round(($envios->where('ESTADO', 'leido')->count() / $envios->count()) * 100, 1)
                : 0
        ];

        return Inertia::render('estudios/envios-correos', compact('estudio', 'envios', 'estadisticas'));
    }
}