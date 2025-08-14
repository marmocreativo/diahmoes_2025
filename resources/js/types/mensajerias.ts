// types/mensajerias.ts - Tipos específicos de mensajerías

import { BaseFilters, PaginatedData } from './index';

export interface Mensajeria {
    ID: number;
    NOMBRE: string;
    ESTADO: 'activo' | 'inactivo';
    
    // Campos calculados del modelo (accessors)
    nombre_formateado: string;
    estado_formateado: string;
    estado_css_class: string;
    activa: boolean;
    
    // Estadísticas del modelo
    estadisticas: {
        total_guias: number;
        guias_normales: number;
        guias_especializadas: number;
        guias_retorno: number;
        estudios_unicos: number;
    };
    
    // Información resumida del modelo (opcional)
    resumen?: {
        id: number;
        nombre: string;
        estado: string;
        activa: boolean;
        total_guias: number;
    };
    
    // Estudios recientes que vienen del controlador (show method)
    estudios_recientes?: Array<{
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_INICIALES: string;
        ESTUDIO_ESTADO?: string;
        FECHA_SOLICITUD_RECOLECCION: string;
        MUESTRA_GUIA?: string;
        MUESTRA_GUIA_ESPECIALIZADA?: string;
        MUESTRA_GUIA_RETORNO?: string;
        tipo_guia: 'normal' | 'especializada' | 'retorno' | 'desconocido';
    }>;
}

// Formulario de mensajería
export interface MensajeriaForm {
    NOMBRE: string;
    ESTADO: 'activo' | 'inactivo';
}

// Filtros específicos para mensajerías
export interface MensajeriaFilters extends BaseFilters {
    estado?: 'activo' | 'inactivo';
}

// Props para componentes de mensajerías
export interface MensajeriaIndexProps {
    mensajerias: PaginatedData<Mensajeria>;
    filters: MensajeriaFilters;
    estados: Record<'activo' | 'inactivo', string>;
}

export interface MensajeriaCreateProps {
    estados: Record<'activo' | 'inactivo', string>;
}

export interface MensajeriaEditProps extends MensajeriaCreateProps {
    mensajeria: Mensajeria;
}

export interface MensajeriaShowProps {
    mensajeria: Mensajeria;
}

// Tipos para API endpoints
export interface MensajeriaAPI {
    value: number;
    label: string;
    estado: string;
    activa: boolean;
    total_guias: number;
}

// Tipo para las estadísticas generales (usado en dashboards)
export interface MensajeriaEstadisticas {
    total: number;
    activas: number;
    inactivas: number;
    mas_utilizadas: Array<{
        nombre: string;
        total_guias: number;
        estadisticas: {
            guias_normales: number;
            guias_especializadas: number;
            guias_retorno: number;
            total_guias: number;
        };
    }>;
    distribucion_guias: Array<{
        nombre: string;
        guias_normales: number;
        guias_especializadas: number;
        guias_retorno: number;
        total: number;
    }>;
}

// Tipos para los diferentes tipos de guías
export type TipoGuia = 'normal' | 'especializada' | 'retorno' | 'desconocido';

// Estados disponibles
export type EstadoMensajeria = 'activo' | 'inactivo';