// types/adjuntos.ts - Tipos específicos de adjuntos

import { BaseFilters, PaginatedData } from './index';

export interface Adjunto {
    ID: number;
    MUESTRA_CLAVE: string;
    ARCHIVO: string;
    
    // Relaciones inline
    estudio?: {
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_INICIALES: string;
        ESTUDIO_ESTADO?: string;
    };
}

// Formulario de adjunto
export interface AdjuntoForm {
    MUESTRA_CLAVE: string;
    ARCHIVO: File | string;
}

// Filtros específicos para adjuntos
export interface AdjuntoFilters extends BaseFilters {
    muestra_clave?: string;
    tipo_archivo?: string;
}

// Props para componentes de adjuntos
export interface AdjuntoIndexProps {
    adjuntos: PaginatedData<Adjunto>;
    filters: AdjuntoFilters;
}

export interface AdjuntoCreateProps {
    estudios: Array<{
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_CLAVE?: string;
    }>;
}

export interface AdjuntoEditProps extends AdjuntoCreateProps {
    adjunto: Adjunto;
}

export interface AdjuntoShowProps {
    adjunto: Adjunto;
}