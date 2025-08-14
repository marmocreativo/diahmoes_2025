import { BaseFilters, PaginatedData } from './index';

export interface Institucion {
    ID_INSTITUCION: number;
    INSTITUCION_NOMBRE: string;
    INSTITUCION_CORREO: string;
    INSTITUCION_TELEFONO: string;
    INSTITUCION_RFC: string;
    INSTITUCION_RAZON_SOCIAL: string;
    INSTITUCION_DIRECCION: string;
    INSTITUCION_NUMERO_EXT: string;
    INSTITUCION_NUMERO_INT: string;
    INSTITUCION_COLONIA: string;
    INSTITUCION_MUNICIPIO: string;
    INSTITUCION_CIUDAD: string;
    INSTITUCION_ESTADO: string;
    INSTITUCION_CODIGO_POSTAL: string;
    INSTITUCION_PIN: string;
    FECHA_REGISTRO: string;
    FECHA_ACTUALIZACION: string;
    
    // Campos calculados/accessors del modelo
    direccion_completa: string;
    nombre_corto: string;
    contacto_completo: {
        telefono: string;
        correo: string;
        direccion: string;
    };
    activa: boolean;
    
    // Estadísticas calculadas del modelo
    estadisticas?: {
        usuarios_total: number;
        usuarios_activos: number;
        medicos: number;
        clientes: number;
        pacientes: number;
        estudios_total: number;
        estudios_mes_actual: number;
    };
    
    // Información resumida del modelo
    resumen?: {
        id: number;
        nombre: string;
        nombre_corto: string;
        ciudad: string;
        estado: string;
        telefono: string;
        correo: string;
        activa: boolean;
    };
    
    // Datos relacionados que vienen del controlador (show method)
    usuarios_recientes?: Array<{
        ID_USUARIO: number;
        nombre_completo: string;
        USUARIO_TIPO: string;
        USUARIO_ESTADO: string;
        FECHA_REGISTRO: string;
    }>;
    
    estudios_recientes?: Array<{
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_INICIALES: string;
        ESTUDIO_ESTADO?: string;
        FECHA_SOLICITUD_RECOLECCION: string;
    }>;
    
    // Relaciones completas (opcionales)
    usuarios?: Array<{
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
        USUARIO_CORREO: string;
        USUARIO_TIPO: string;
        USUARIO_ESTADO: string;
        FECHA_REGISTRO: string;
        nombre_completo: string;
    }>;
    
    estudios?: Array<{
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_INICIALES: string;
        ESTUDIO_ESTADO?: string;
        FECHA_SOLICITUD_RECOLECCION: string;
    }>;
}

// Formulario de institución
export interface InstitucionForm {
    INSTITUCION_NOMBRE: string;
    INSTITUCION_CORREO: string;
    INSTITUCION_TELEFONO: string;
    INSTITUCION_RFC: string;
    INSTITUCION_RAZON_SOCIAL: string;
    INSTITUCION_DIRECCION: string;
    INSTITUCION_NUMERO_EXT: string;
    INSTITUCION_NUMERO_INT: string;
    INSTITUCION_COLONIA: string;
    INSTITUCION_MUNICIPIO: string;
    INSTITUCION_CIUDAD: string;
    INSTITUCION_ESTADO: string;
    INSTITUCION_CODIGO_POSTAL: string;
    INSTITUCION_PIN: string;
}

// Filtros específicos para instituciones
export interface InstitucionFilters extends BaseFilters {
    estado?: string;
    ciudad?: string;
    estado_geografico?: string;
    rfc?: string;
}

// Props para componentes de instituciones
export interface InstitucionIndexProps {
    instituciones: PaginatedData<Institucion>;
    filters: InstitucionFilters;
    ciudades: string[];
    estados_geograficos: string[];
}

export interface InstitucionCreateProps {
    estados_mexico: Record<string, string>;
}

export interface InstitucionEditProps extends InstitucionCreateProps {
    institucion: Institucion;
}

export interface InstitucionShowProps {
    institucion: Institucion;
}

// Tipos para las estadísticas (usado en dashboards)
export interface InstitucionEstadisticas {
    total: number;
    activas: number;
    inactivas: number;
    por_ciudad: Array<{
        INSTITUCION_CIUDAD: string;
        total: number;
    }>;
    por_estado: Array<{
        INSTITUCION_ESTADO: string;
        total: number;
    }>;
}

// Tipo para los endpoints API
export interface InstitucionAPI {
    value: number;
    label: string;
    ciudad: string;
    estado: string;
    rfc: string;
}