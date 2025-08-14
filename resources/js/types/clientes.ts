// types/clientes.ts - Tipos específicos de clientes

import { BaseFilters, PaginatedData } from './index';

export interface Cliente {
    ID_CLIENTE: number;
    CLIENTE_NOMBRE: string;
    CLIENTE_CORREO: string;
    CLIENTE_PASS?: string;
    CLIENTE_ENVIAR_CORREO: 'si' | 'no';
    
    // Relaciones inline
    estudios?: Array<{
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_INICIALES: string;
        ESTUDIO_ESTADO?: string;
        FECHA_SOLICITUD_RECOLECCION: string;
    }>;
}

// Formulario de cliente
export interface ClienteForm {
    CLIENTE_NOMBRE: string;
    CLIENTE_CORREO: string;
    CLIENTE_PASS?: string;
    CLIENTE_PASS_confirmation?: string;
    CLIENTE_ENVIAR_CORREO: 'si' | 'no';
}

// Filtros específicos para clientes
export interface ClienteFilters extends BaseFilters {
    enviar_correo?: 'si' | 'no';
}

// Props para componentes de clientes
export interface ClienteIndexProps {
    clientes: PaginatedData<Cliente>;
    filters: ClienteFilters;
}

export interface ClienteCreateProps {
    // Props específicas si las hay
}

export interface ClienteEditProps {
    cliente: Cliente;
}

export interface ClienteShowProps {
    cliente: Cliente;
}