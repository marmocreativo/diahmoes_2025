// types/estudios-prv.ts - Tipos específicos de Estudios PRV
// Basado en types/estudios.ts, pero reducido a los campos que sí existen
// en estudios_prv (sin ID_CLIENTE/BENEFICIARIO/CORREO_COPIA, sin R_*,
// sin las fechas y campos de ESTUDIO_FACTURADO/COMENTARIOS que se quitaron).

import { BaseFilters, PaginatedData, SharedData } from './index';

export interface EstadisticasEnviosPrv {
    total: number;
    enviados: number;
    leidos: number;
    porcentaje_lectura: number;
}

export interface EstudioPrv {
    ID: number;
    CLAVE_INTERNA: string; // Formato PRV-DD-MM-SERIADO
    CLAVE: string;         // Siempre 'PRV'
    SERIADO: number;
    ANIO: number;
    FOLIO_MERCK: string;
    ID_MEDICO?: number;
    ID_PACIENTE?: number;
    ID_INSTITUCION?: number;

    // Información de muestra
    MUESTRA_CLAVE?: string;
    MUESTRA_FOLIO_SOBRE: string;
    MUESTRA_FOLIO_KIT_BL: string;
    MUESTRA_FOLIO_KIT_BL_CADUCIDAD?: string;
    MUESTRA_COLON?: 'ASC' | 'DESC';
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
    MUESTRA_LIQ_LIPEMICA?: 'Si' | 'No';

    // Fechas (solo las que sobrevivieron a la simplificación)
    FECHA_SOLICITUD_RECOLECCION: string;
    FECHA_RECOLECCION: string;
    FECHA_RECEPCION: string;
    FECHA_RECEPCION_LABORATORIO: string;
    FECHA_OBTENCION_RESULTADOS: string;
    FECHA_RESULTADOS_CORREO: string;

    // Meta información
    ESTUDIO_NOTAS: string;
    ESTUDIO_ESTADO?: string;

    estadisticas_envios?: EstadisticasEnviosPrv;

    // Relaciones inline
    medico?: {
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
        USUARIO_CORREO: string;
        USUARIO_TELEFONO?: string;
    };
    paciente?: {
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
        USUARIO_CORREO?: string;
    };
    institucion?: {
        ID_INSTITUCION: number;
        INSTITUCION_NOMBRE: string;
        INSTITUCION_CIUDAD?: string;
    };
}

// Filtros específicos para estudios PRV
// SIMPLIFICACIÓN: sin 'clave'/'tipo_estudio' genéricos duplicados de
// EstudioFilters normal — solo lo que EstudioPrvController::index() soporta.
export interface EstudioPrvFilters extends BaseFilters {
    estado?: string;
    muestra_tipo_estudio?: string;
    institucion_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}

// Props del listado
// SIMPLIFICACIÓN: sin 'estadisticas' (tarjetas de detenidos por tiempos)
// ni 'prefijo' (aquí CLAVE siempre es 'PRV', no hay que elegirlo).
export interface EstudioPrvIndexProps extends SharedData {
    estudios: PaginatedData<EstudioPrv>;
    filters: EstudioPrvFilters;
    estados: Record<string, string>;
    instituciones: Array<{
        ID_INSTITUCION: number;
        INSTITUCION_NOMBRE: string;
    }>;
}

// Props del formulario de creación (paso 1: Recolección)
export interface EstudioPrvCreateProps extends SharedData {
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
    claveInternaPreview: string; // Solo previsualización, ver nota en el controlador
}

export interface EstudioPrvEditProps extends EstudioPrvCreateProps {
    estudio: EstudioPrv;
    estados: Record<string, string>;
}

export interface EstudioPrvShowProps extends SharedData {
    estudio: EstudioPrv;
}