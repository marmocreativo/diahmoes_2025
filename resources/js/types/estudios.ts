// types/estudios.ts - Tipos específicos de estudios

import { BaseFilters, PaginatedData, SharedData } from './index';

export interface Estudio {
    ID: number;
    ID_ALEATORIO: string;
    CLAVE_INTERNA: string;
    CLAVE: string;
    SERIADO: number;
    ANIO: number;
    FOLIO_MERCK: string;
    ID_MEDICO?: number;
    ID_PACIENTE?: number;
    ID_INSTITUCION?: number;
    ID_CLIENTE: number;
    BENEFICIARIO?: string;
    CORREO_COPIA: string;
    
    // Información de muestra
    MUESTRA_CLAVE?: string;
    MUESTRA_FOLIO_SOBRE: string;
    MUESTRA_FOLIO_KIT_BL: string;
    MUESTRA_OTROS_ROTULOS: string;
    MUESTRA_TIPO?: string;
    MUESTRA_SITIO_LESION: string;
    MUESTRA_TIPO_ESTUDIO: string;
    MUESTRA_INICIALES: string;
    MUESTRA_GENERO?: string;
    MUESTRA_EDAD?: string;
    MUESTRA_BLOQUES: string;
    MUESTRA_LAMINILLAS: string;
    MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA: string;
    
    // Información de envío
    MUESTRA_ENVIO: string;
    MUESTRA_ENVIO_TIPO: string;
    MUESTRA_GUIA?: string;
    MUESTRA_GUIA_MENSAJERIA: string;
    MUESTRA_GUIA_ESPECIALIZADA: string;
    MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA: string;
    MUESTRA_GUIA_RETORNO: string;
    MUESTRA_GUIA_RETORNO_MENSAJERIA: string;
    
    // Dirección
    MUESTRA_DIRECCION?: string;
    MUESTRA_NUMERO_EXT: string;
    MUESTRA_NUMERO_INT: string;
    MUESTRA_COLONIA?: string;
    MUESTRA_MUNICIPIO: string;
    MUESTRA_CIUDAD: string;
    MUESTRA_ESTADO?: string;
    MUESTRA_CODIGO_POSTAL: string;
    MUESTRA_REFERENCIAS?: string;
    MUESTRA_HORARIOS?: string;
    
    // Información clínica
    MUESTRA_DIAGNOSTICO_CLINICO: string;
    MUESTRA_LIQ_CONDICION: string;
    MUESTRA_LIQ_CONDICION_PRESENCIA: string;
    MUESTRA_LIQ_CANTIDAD_ADECUADA: string;
    MUESTRA_LIQ_CANTIDAD_ML: string;
    MUESTRA_LIQ_HEMOLISIS: string;
    MUESTRA_LIQ_AMP_INDICACION: string;
    MUESTRA_LIQ_AMP_RAZON: string;
    
    // Resultados
    R_ESTUDIO_SOLICITADO?: string;
    R_METODO_PROCESO: string;
    R_EVALUACION_HISTOPATOLOGICA?: string;
    R_PRESERVACION_H_E?: string;
    R_NUMERO_CELULAS_TUMORALES?: string;
    R_AREA_TUMORAL?: string;
    R_PORCENTAJE_TUMOR_TEJIDO?: string;
    R_ENRIQUECIMIENTO?: string;
    R_ADECUADO_PROCESAMIENTO?: string;
    R_RAZON_ADECUADO_PROCESAMIENTO: string;
    R_ESTATUS_KRAS?: string;
    R_GENOTIPO_KRAS?: string;
    R_ESTATUS_NRAS?: string;
    R_GENOTIPO_NRAS?: string;
    R_ESTATUS_BRAF?: string;
    R_GENOTIPO_BRAF?: string;
    R_RESULTADO_HISTOPATOLOGICO?: string;
    R_INTERPRETACION: string;
    R_COMPLETOS: 'si' | 'no';
    
    // Fechas
    FECHA_SOLICITUD_RECOLECCION: string;
    FECHA_RECOLECCION: string;
    FECHA_RECEPCION: string;
    FECHA_ENVIO_LABORATORIO: string;
    FECHA_RECEPCION_LABORATORIO: string;
    FECHA_ENTREGA_PROCESAMIENTO: string;
    FECHA_OBTENCION_RESULTADOS: string;
    FECHA_INFORME: string;
    FECHA_RESULTADOS_CORREO: string;
    FECHA_RETORNO_MATERIAL: string;
    FECHA_RECEPCION_RESULTADOS_FISICOS: string;
    FECHA_FIN_PROCESO: string;
    
    // Meta información
    ESTUDIO_FACTURADO: string;
    ESTUDIO_NOTAS: string;
    ESTUDIO_COMENTARIOS: string;
    ESTUDIO_ESTADO?: string;
    
    // Relaciones inline
    medico?: {
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
        USUARIO_CORREO: string;
    };
    paciente?: {
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
        USUARIO_CORREO: string;
    };
    institucion?: {
        ID_INSTITUCION: number;
        INSTITUCION_NOMBRE: string;
        INSTITUCION_CIUDAD: string;
    };
    cliente?: {
        ID_CLIENTE: number;
        CLIENTE_NOMBRE: string;
        CLIENTE_CORREO: string;
    };
    adjuntos?: Array<{
        ID: number;
        ARCHIVO: string;
    }>;
}

// Estados de estudio
export type EstudioEstado = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';

// Tipos de estudio
export type TipoEstudio = 'KRAS' | 'NRAS' | 'BRAF' | 'Panel_Completo';

// Formulario de estudio
export interface EstudioForm {
    CLAVE_INTERNA: string;
    FOLIO_MERCK: string;
    ID_MEDICO?: number;
    ID_PACIENTE?: number;
    ID_INSTITUCION?: number;
    ID_CLIENTE: number;
    BENEFICIARIO?: string;
    CORREO_COPIA: string;
    
    // Información básica de muestra
    MUESTRA_FOLIO_SOBRE: string;
    MUESTRA_FOLIO_KIT_BL: string;
    MUESTRA_OTROS_ROTULOS: string;
    MUESTRA_TIPO?: string;
    MUESTRA_SITIO_LESION: string;
    MUESTRA_TIPO_ESTUDIO: string;
    MUESTRA_INICIALES: string;
    MUESTRA_GENERO?: string;
    MUESTRA_EDAD?: string;
    MUESTRA_BLOQUES: string;
    MUESTRA_LAMINILLAS: string;
    MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA: string;
    MUESTRA_DIAGNOSTICO_CLINICO: string;
}

// Filtros específicos para estudios
export interface EstudioFilters extends BaseFilters {
    estado?: EstudioEstado;
    tipo_estudio?: TipoEstudio;
    medico?: number;
    institucion?: number;
    cliente?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    clave?: string;
}

// Props para componentes de estudios
export interface EstudioIndexProps extends SharedData {
    estudios: PaginatedData<Estudio>;
    filters: EstudioFilters;
    medicos: Array<{
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
    }>;
    instituciones: Array<{
        ID_INSTITUCION: number;
        INSTITUCION_NOMBRE: string;
    }>;
    clientes: Array<{
        ID_CLIENTE: number;
        CLIENTE_NOMBRE: string;
    }>;
    estados: Record<string, string>;
    tiposEstudio: Record<string, string>;
}

export interface EstudioCreateProps extends SharedData {
    medicos: Array<{
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
        USUARIO_CORREO: string;
    }>;
    instituciones: Array<{
        ID_INSTITUCION: number;
        INSTITUCION_NOMBRE: string;
    }>;
    clientes: Array<{
        ID_CLIENTE: number;
        CLIENTE_NOMBRE: string;
    }>;
    pacientes: Array<{
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
    }>;
    mensajerias: Array<{
        ID: number;
        NOMBRE: string;
    }>;
    tiposMuestra: Record<string, string>;
    tiposEstudio: Record<string, string>;
    generos: Record<string, string>;
    tiposEnvio: Record<string, string>;
    datosAutomaticos: {
        IdAleatorio: string;
        Prefijo: string;
        Anio: string;
        Seriado: string;
        SiguienteNumero: string;
        ClaveInterna: string;
    };
}

// Formulario de datos para crear estudio (legacy form)
export interface EstudioFormData {
    // Campos hidden
    IdAleatorio: string;
    Seriado: string;
    Anio: string;
    SiguienteNumero: string;
    Prefijo: string;
    
    // Clave y Fecha
    ClaveInterna: string;
    FolioMerck: string;
    FechaSolicitudRecoleccion: string;
    HoraSolicitudRecoleccion: string;
    
    // Clientes
    IdCliente: number;
    NombreCliente?: string;
    CorreoCliente?: string;
    EnviarCorreoCliente?: boolean;
    
    // Médico
    IdMedico: number;
    NombreUsuario?: string;
    ApellidosUsuario?: string;
    CorreoUsuario?: string;
    TelefonoUsuario?: string;
    UsuarioTipo?: string;
    PassUsuario?: string;
    
    // Institución
    IdInstitucion: number;
    NombreInstitucion?: string;
    CorreoInstitucion?: string;
    TelefonoInstitucion?: string;
    
    // Dirección de Recolección
    NoAplica?: boolean;
    MuestraGuiaMensajeria?: string;
    MuestraGuia?: string;
    MuestraDirigirse?: string;
    MuestraPreguntar?: string;
    MuestraDireccion?: string;
    MuestraNumeroExt?: string;
    MuestraNumeroInt?: string;
    MuestraColonia?: string;
    MuestraMunicipio?: string;
    MuestraCiudad?: string;
    MuestraEstado?: string;
    MuestraEnvioTipo?: string;
    MuestraCodigoPostal?: string;
    MuestraHorarios?: string;
    
    // Control de flujo
    Guardar?: string;
    
    // Índice signature requerido por Inertia FormDataType
    [key: string]: string | number | boolean | undefined;
}

export interface EstudioEditProps extends EstudioCreateProps {
    estudio: Estudio;
}

export interface EstudioShowProps {
    estudio: Estudio;
}