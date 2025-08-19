<?php

namespace App\Http\Controllers;

use App\Models\Estudio;
use App\Models\Usuario;
use App\Models\Institucion;
use App\Models\Cliente;
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
        $query = Estudio::with(['medico', 'paciente', 'institucion', 'cliente']);
        
        // Aplicar filtros
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('CLAVE_INTERNA', 'like', "%{$search}%")
                  ->orWhere('FOLIO_MERCK', 'like', "%{$search}%")
                  ->orWhere('MUESTRA_INICIALES', 'like', "%{$search}%")
                  ->orWhere('MUESTRA_CLAVE', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('estado')) {
            $query->where('ESTUDIO_ESTADO', $request->get('estado'));
        }
        
        if ($request->filled('tipo_estudio')) {
            $query->where('MUESTRA_TIPO_ESTUDIO', $request->get('tipo_estudio'));
        }
        
        if ($request->filled('institucion')) {
            $query->where('ID_INSTITUCION', $request->get('institucion'));
        }
        
        if ($request->filled('medico')) {
            $query->where('ID_MEDICO', $request->get('medico'));
        }
        
        if ($request->filled('fecha_desde')) {
            $query->where('FECHA_SOLICITUD_RECOLECCION', '>=', $request->get('fecha_desde'));
        }
        
        if ($request->filled('fecha_hasta')) {
            $query->where('FECHA_SOLICITUD_RECOLECCION', '<=', $request->get('fecha_hasta'));
        }
        
        // Ordenamiento: SIEMPRE por ANIO desc, SERIADO desc como base
        $query->orderBy('ANIO', 'desc')
              ->orderBy('SERIADO', 'desc');
        
        // Si se especifica un ordenamiento adicional, agregarlo como tercer criterio
        if ($request->has('sort') && $request->get('sort') !== 'ANIO') {
            $sortBy = $request->get('sort');
            $direction = $request->get('direction', 'desc');
            $query->orderBy($sortBy, $direction);
        }
        
        $estudios = $query->paginate(15)->withQueryString();
        
        // Obtener datos para filtros
        $medicos = Usuario::where('USUARIO_TIPO', 'medico')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS')
            ->get();
            
        $instituciones = Institucion::select('ID_INSTITUCION', 'INSTITUCION_NOMBRE')
            ->orderBy('INSTITUCION_NOMBRE')
            ->get();
            
        $clientes = Cliente::select('ID_CLIENTE', 'CLIENTE_NOMBRE')
            ->orderBy('CLIENTE_NOMBRE')
            ->get();
        
        return Inertia::render('estudios/index', [
            'estudios' => $estudios,
            'filters' => $request->only(['search', 'estado', 'tipo_estudio', 'institucion', 'medico', 'fecha_desde', 'fecha_hasta', 'sort', 'direction']),
            'medicos' => $medicos,
            'instituciones' => $instituciones,
            'clientes' => $clientes,
            'estados' => Estudio::getEstados() ?? [],
            'tiposEstudio' => Estudio::getTiposEstudio() ?? [],
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
        $request->validate([
            // Campos requeridos del formulario original
            'ClaveInterna' => 'required|string|max:255',
            'FolioMerck' => 'nullable|string|max:255',
            'FechaSolicitudRecoleccion' => 'required|date',
            'HoraSolicitudRecoleccion' => 'required',
            'IdCliente' => 'required|integer|min:1',
            'IdMedico' => 'required|integer|min:1',
            'IdInstitucion' => 'required|integer|min:1',
            
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

        // Manejar creación de nuevos registros si es necesario
        $idCliente = $this->manejarNuevoCliente($request);
        $idMedico = $this->manejarNuevoMedico($request);
        $idInstitucion = $this->manejarNuevaInstitucion($request);

        // Combinar fecha y hora en datetime
        $fechaHoraSolicitud = $request->FechaSolicitudRecoleccion . ' ' . $request->HoraSolicitudRecoleccion;

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
        $estudio->MUESTRA_ENVIO_TIPO = $request->NoAplica ? '' : ($request->MuestraEnvioTipo ?: '');
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
        $estudio->FECHA_RECOLECCION = null;
        $estudio->FECHA_RECEPCION = null;
        $estudio->FECHA_ENVIO_LABORATORIO = null;
        $estudio->FECHA_RECEPCION_LABORATORIO = null;
        $estudio->FECHA_ENTREGA_PROCESAMIENTO = null;
        $estudio->FECHA_OBTENCION_RESULTADOS = null;
        $estudio->FECHA_INFORME = null;
        $estudio->FECHA_RESULTADOS_CORREO = null;
        $estudio->FECHA_RETORNO_MATERIAL = null;
        $estudio->FECHA_RECEPCION_RESULTADOS_FISICOS = null;
        $estudio->FECHA_FIN_PROCESO = null;
        $estudio->ESTUDIO_NOTAS = '';
        $estudio->ESTUDIO_COMENTARIOS = '';
        
        $estudio->save();

        // Crear estudio simple - siempre redirige al index
        return redirect()->route('estudios.index')
            ->with('success', 'Estudio creado exitosamente. Use "Editar" para completar la información adicional.');
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
        $estudio->load(['medico', 'paciente', 'institucion', 'cliente', 'adjuntos']);
        
        return Inertia::render('estudios/show', [
            'estudio' => $estudio
        ]);
    }

    /**
     * Show the form for editing the specified resource - Paso Recolección
     */
    public function editRecoleccion(Estudio $estudio)
    {
        // Cargar solo campos necesarios del estudio y relaciones mínimas
        $estudio = Estudio::select([
            'ID', 'CLAVE_INTERNA', 'FECHA_SOLICITUD_RECOLECCION', 'ID_MEDICO', 'ID_PACIENTE', 
            'ID_INSTITUCION', 'ID_CLIENTE', 'MUESTRA_TIPO', 'MUESTRA_TIPO_ESTUDIO', 'MUESTRA_INICIALES',
            'MUESTRA_GENERO', 'MUESTRA_EDAD', 'MUESTRA_SITIO_LESION', 'MUESTRA_DIAGNOSTICO_CLINICO',
            'MUESTRA_DIRECCION', 'MUESTRA_NUMERO_EXT', 'MUESTRA_NUMERO_INT', 'MUESTRA_COLONIA',
            'MUESTRA_MUNICIPIO', 'MUESTRA_CIUDAD', 'MUESTRA_ESTADO', 'MUESTRA_CODIGO_POSTAL',
            'MUESTRA_HORARIOS', 'ESTUDIO_COMENTARIOS'
        ])->with([
            'medico:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS',
            'paciente:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS',
            'institucion:ID_INSTITUCION,INSTITUCION_NOMBRE',
            'cliente:ID_CLIENTE,CLIENTE_NOMBRE'
        ])->findOrFail($estudio->ID);
        
        // Datos para selects (solo campos necesarios)
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

        return Inertia::render('estudios/edit/recoleccion', [
            'estudio' => $estudio,
            'medicos' => $medicos,
            'pacientes' => $pacientes,
            'instituciones' => $instituciones,
            'clientes' => $clientes,
            'tiposMuestra' => Estudio::getTiposMuestra(),
            'tiposEstudio' => Estudio::getTiposEstudio(),
            'generos' => Estudio::getGeneros(),
        ]);
    }

    /**
     * Show the form for editing the specified resource - Paso Recepción
     */
    public function editRecepcion(Estudio $estudio)
    {
        // Cargar solo campos necesarios para recepción
        $estudio = Estudio::select([
            'ID', 'CLAVE_INTERNA', 'FECHA_RECEPCION', 'FECHA_ENVIO_LABORATORIO', 'ID_PACIENTE',
            'MUESTRA_FOLIO_SOBRE', 'MUESTRA_FOLIO_KIT_BL', 'MUESTRA_OTROS_ROTULOS', 'MUESTRA_BLOQUES',
            'MUESTRA_LAMINILLAS', 'MUESTRA_ENVIO_TIPO', 'MUESTRA_ENVIO', 'MUESTRA_GUIA', 'MUESTRA_GUIA_MENSAJERIA',
            'MUESTRA_GUIA_ESPECIALIZADA', 'MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA', 'MUESTRA_LIQ_CONDICION',
            'MUESTRA_LIQ_CONDICION_PRESENCIA', 'MUESTRA_LIQ_CANTIDAD_ADECUADA', 'MUESTRA_LIQ_CANTIDAD_ML',
            'MUESTRA_LIQ_HEMOLISIS', 'MUESTRA_LIQ_AMP_INDICACION', 'MUESTRA_LIQ_AMP_RAZON', 'ESTUDIO_COMENTARIOS'
        ])->with([
            'medico:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS',
            'paciente:ID_USUARIO,USUARIO_NOMBRE,USUARIO_APELLIDOS',
            'institucion:ID_INSTITUCION,INSTITUCION_NOMBRE',
            'cliente:ID_CLIENTE,CLIENTE_NOMBRE'
        ])->findOrFail($estudio->ID);

        // Obtener pacientes para el formulario (solo campos necesarios)
        $pacientes = Usuario::where('USUARIO_TIPO', 'paciente')
            ->where('USUARIO_ESTADO', 'activo')
            ->select('ID_USUARIO', 'USUARIO_NOMBRE', 'USUARIO_APELLIDOS', 'USUARIO_CORREO', 'USUARIO_TELEFONO')
            ->orderBy('USUARIO_NOMBRE')
            ->get();

        return Inertia::render('estudios/edit/recepcion', [
            'estudio' => $estudio,
            'pacientes' => $pacientes,
            'tiposEnvio' => Estudio::getTiposEnvio(),
        ]);
    }

    /**
     * Show the form for editing the specified resource - Paso Laboratorio
     */
    public function editLaboratorio(Estudio $estudio)
    {
        // Cargar solo campos necesarios para laboratorio
        $estudio = Estudio::select([
            'ID', 'CLAVE_INTERNA', 'FECHA_RECEPCION_LABORATORIO', 'FECHA_ENTREGA_PROCESAMIENTO',
            'FECHA_OBTENCION_RESULTADOS', 'FECHA_RETORNO_MATERIAL', 'FECHA_RECEPCION_RESULTADOS_FISICOS',
            'R_METODO_PROCESO', 'R_RAZON_ADECUADO_PROCESAMIENTO', 'R_INTERPRETACION', 'R_COMPLETOS',
            'MUESTRA_GUIA_RETORNO', 'MUESTRA_GUIA_RETORNO_MENSAJERIA', 'ESTUDIO_COMENTARIOS'
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
            'ESTUDIO_ESTADO', 'ESTUDIO_COMENTARIOS', 'R_BENEFICIARIO', 'ID_MEDICO'
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
            'correosCopia' => $estudio->correosCopia
        ]);
    }

    /**
     * Update the specified resource in storage - Paso Recolección
     */
    public function updateRecoleccion(Request $request, Estudio $estudio)
    {
        $request->validate([
            'FECHA_SOLICITUD_RECOLECCION' => 'nullable|date',
            // Aquí se agregarán más validaciones según los campos específicos
        ]);

        // Actualizar solo los campos del paso de recolección
        $estudio->update($request->only([
            'FECHA_SOLICITUD_RECOLECCION',
            // Más campos se agregarán según especificación
        ]));

        return back()->with('success', 'Información de recolección actualizada.');
    }

    /**
     * Update the specified resource in storage - Paso Recepción
     */
    public function updateRecepcion(Request $request, Estudio $estudio)
    {
        $request->validate([
            'FECHA_RECEPCION' => 'nullable|date',
            // Más validaciones según los campos específicos
        ]);

        $estudio->update($request->only([
            'FECHA_RECEPCION',
            // Más campos se agregarán según especificación
        ]));

        return back()->with('success', 'Información de recepción actualizada.');
    }

    /**
     * Update the specified resource in storage - Paso Laboratorio
     */
    public function updateLaboratorio(Request $request, Estudio $estudio)
    {
        $request->validate([
            'FECHA_ENVIO_LABORATORIO' => 'nullable|date',
            // Más validaciones según los campos específicos
        ]);

        $estudio->update($request->only([
            'FECHA_ENVIO_LABORATORIO',
            // Más campos se agregarán según especificación
        ]));

        return back()->with('success', 'Información de laboratorio actualizada.');
    }

    /**
     * Update the specified resource in storage - Paso Informe
     */
    public function updateInforme(Request $request, Estudio $estudio)
    {
        $request->validate([
            'FechaInforme' => 'nullable|date',
            'HoraInforme' => 'nullable',
            'FechaResultadosCorreo' => 'nullable|date', 
            'HoraResultadosCorreo' => 'nullable',
            'EstudioFacturado' => 'nullable|string',
            'EstudioEstado' => 'nullable|string',
            'EstudioComentarios' => 'nullable|string',
            'Beneficiario' => 'nullable|string',
            'EnviarAdjunto' => 'nullable|boolean',
            '_sendEmail' => 'nullable|boolean',
            '_complete' => 'nullable|boolean'
        ]);

        // Combinar fecha y hora de informe
        if ($request->FechaInforme && $request->HoraInforme) {
            $fechaInforme = $request->FechaInforme . ' ' . $request->HoraInforme . ':00';
        } else {
            $fechaInforme = null;
        }

        // Combinar fecha y hora de resultados por correo
        $fechaResultadosCorreo = null;
        if ($request->_sendEmail && $request->FechaResultadosCorreo && $request->HoraResultadosCorreo) {
            $fechaResultadosCorreo = $request->FechaResultadosCorreo . ' ' . $request->HoraResultadosCorreo . ':00';
        }

        // Determinar estado del estudio
        $estadoEstudio = $request->EstudioEstado ?: $estudio->ESTUDIO_ESTADO;
        if ($request->_complete) {
            $estadoEstudio = 'Resultados Enviados';
        } elseif ($request->_sendEmail) {
            $estadoEstudio = 'Resultados Completos';
        }

        // Actualizar el estudio
        $estudio->update([
            'FECHA_INFORME' => $fechaInforme,
            'FECHA_RESULTADOS_CORREO' => $fechaResultadosCorreo,
            'ESTUDIO_FACTURADO' => $request->EstudioFacturado ?: $estudio->ESTUDIO_FACTURADO,
            'ESTUDIO_ESTADO' => $estadoEstudio,
            'ESTUDIO_COMENTARIOS' => $request->EstudioComentarios ?: $estudio->ESTUDIO_COMENTARIOS,
            'R_BENEFICIARIO' => $request->Beneficiario ?: $estudio->R_BENEFICIARIO,
        ]);

        // Enviar correos electrónicos si se solicita
        if ($request->_sendEmail) {
            $this->enviarCorreosReporte($estudio, $request->EnviarAdjunto ?? false);
        }

        // Determinar mensaje de éxito
        if ($request->_complete) {
            $mensaje = 'Estudio completado exitosamente.';
        } elseif ($request->_sendEmail) {
            $mensaje = 'Información guardada y correo enviado exitosamente.';
        } else {
            $mensaje = 'Información de informe actualizada.';
        }

        return back()->with('success', $mensaje);
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
            'aleatorio' => 'required|string'
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
        
        return $this->_generatePdfResponse($estudio);
    }

    /**
     * Private method to generate PDF response
     */
    private function _generatePdfResponse(Estudio $estudio)
    {
        // Preparar datos para la vista
        $data = [
            'estudio' => $estudio,
            'paciente' => $estudio->paciente,
            'medico' => $estudio->medico,
            'institucion' => $estudio->institucion,
            'cliente' => $estudio->cliente
        ];
        
        // Generar PDF usando DomPDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.estudio', $data);
        
        // Configurar opciones del PDF
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
            'defaultFont' => 'Arial'
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
            'nombre' => 'required|string|max:255',
            'correo' => 'required|email|max:255'
        ]);

        // Crear el correo de copia en la BD
        $correoCopia = $estudio->correosCopia()->create([
            'NOMBRE' => $request->nombre,
            'CORREO' => $request->correo,
            'ID_ESTUDIO' => $estudio->ID
        ]);

        return response()->json($correoCopia, 201);
    }

    /**
     * Remove a correo copia from the study
     */
    public function destroyCorreoCopia(Estudio $estudio, $correoId)
    {
        $correoCopia = $estudio->correosCopia()->findOrFail($correoId);
        $correoCopia->delete();

        return response()->json(['message' => 'Correo eliminado exitosamente']);
    }

    /**
     * Enviar correos electrónicos del reporte a todos los destinatarios
     */
    private function enviarCorreosReporte(Estudio $estudio, bool $enviarAdjunto = false)
    {
        try {
            // Cargar las relaciones necesarias y correos de copia
            $estudio->load(['correosCopia', 'medico', 'cliente']);
            
            // Crear la instancia del Mailable
            $mail = new EstudioReporte($estudio, $enviarAdjunto);
            
            // Lista de correos a enviar
            $correosDestino = [];
            
            // Agregar correos de copia de la base de datos
            foreach ($estudio->correosCopia as $correoCopia) {
                if (!empty($correoCopia->CORREO) && filter_var($correoCopia->CORREO, FILTER_VALIDATE_EMAIL)) {
                    $correosDestino[] = [
                        'email' => $correoCopia->CORREO,
                        'name' => $correoCopia->NOMBRE ?? 'Destinatario'
                    ];
                }
            }
            
            // Si no hay correos de copia, enviar al médico y cliente si tienen correo
            if (empty($correosDestino)) {
                // Correo del médico
                if ($estudio->medico && !empty($estudio->medico->USUARIO_CORREO)) {
                    $correosDestino[] = [
                        'email' => $estudio->medico->USUARIO_CORREO,
                        'name' => $estudio->medico->USUARIO_NOMBRE . ' ' . $estudio->medico->USUARIO_APELLIDOS
                    ];
                }
                
                // Correo del cliente
                if ($estudio->cliente && !empty($estudio->cliente->CLIENTE_CORREO)) {
                    $correosDestino[] = [
                        'email' => $estudio->cliente->CLIENTE_CORREO,
                        'name' => $estudio->cliente->CLIENTE_NOMBRE
                    ];
                }
            }
            
            // Enviar correos
            $enviadosExitosos = 0;
            foreach ($correosDestino as $destinatario) {
                try {
                    Mail::to($destinatario['email'], $destinatario['name'])->send($mail);
                    $enviadosExitosos++;
                } catch (\Exception $e) {
                    \Log::error('Error enviando correo a ' . $destinatario['email'] . ': ' . $e->getMessage());
                    continue; // Continuar con el siguiente destinatario
                }
            }
            
            \Log::info("Correos enviados exitosamente: {$enviadosExitosos} de " . count($correosDestino) . " para estudio {$estudio->CLAVE_INTERNA}");
            
        } catch (\Exception $e) {
            \Log::error('Error general enviando correos para estudio ' . $estudio->CLAVE_INTERNA . ': ' . $e->getMessage());
            // No lanzar la excepción para que no interrumpa el flujo principal
        }
    }
}