// types/mensajerias.ts - Tipos específicos de mensajerías

import { BaseFilters, PaginatedData } from './index';

export interface Mensajeria {
    ID: number;
    NOMBRE?: string;
    ESTADO: 'activo' | 'inactivo';
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