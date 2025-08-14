// types/instituciones.ts - Tipos específicos de instituciones

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
    
    // Relaciones inline
    usuarios?: Array<{
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
        USUARIO_CORREO: string;
        USUARIO_TIPO: string;
        USUARIO_ESTADO: string;
    }>;
    estudios?: Array<{
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_INICIALES: string;
        ESTUDIO_ESTADO?: string;
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
    rfc?: string;
}

// Props para componentes de instituciones
export interface InstitucionIndexProps {
    instituciones: PaginatedData<Institucion>;
    filters: InstitucionFilters;
}

export interface InstitucionCreateProps {
    // Props específicas si las hay
}

export interface InstitucionEditProps {
    institucion: Institucion;
}

export interface InstitucionShowProps {
    institucion: Institucion;
}