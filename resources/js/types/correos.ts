// types/correos.ts - Tipos específicos de correos

import { BaseFilters, PaginatedData } from './index';

export interface CorreoCopia {
    ID: number;
    ID_USUARIO: number;
    ID_ESTUDIO: string;
    NOMBRE: string;
    CORREO: string;
    ENVIAR: 'si' | 'no';
    
    // Relaciones inline
    usuario?: {
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
        USUARIO_CORREO: string;
    };
    estudio?: {
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_INICIALES: string;
    };
}

// Formulario de correo copia
export interface CorreoCopiaForm {
    ID_USUARIO: number;
    ID_ESTUDIO: string;
    NOMBRE: string;
    CORREO: string;
    ENVIAR: 'si' | 'no';
}

// Filtros específicos para correos
export interface CorreoFilters extends BaseFilters {
    usuario?: number;
    estudio?: string;
    enviar?: 'si' | 'no';
}

// Props para componentes de correos
export interface CorreoIndexProps {
    correos: PaginatedData<CorreoCopia>;
    filters: CorreoFilters;
    usuarios: Array<{
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
    }>;
    estudios: Array<{
        ID: number;
        CLAVE_INTERNA: string;
    }>;
}

export interface CorreoCreateProps {
    usuarios: Array<{
        ID_USUARIO: number;
        USUARIO_NOMBRE: string;
        USUARIO_APELLIDOS: string;
    }>;
    estudios: Array<{
        ID: number;
        CLAVE_INTERNA: string;
    }>;
}

export interface CorreoEditProps extends CorreoCreateProps {
    correo: CorreoCopia;
}

export interface CorreoShowProps {
    correo: CorreoCopia;
}