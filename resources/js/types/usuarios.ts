// types/usuarios.ts - Tipos específicos de usuarios

import { BaseFilters, PaginatedData } from './index';

// Usuario del sistema DIAHMOES (tabla usuarios)
export interface Usuario {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
    USUARIO_CORREO: string;
    USUARIO_TELEFONO?: string;
    USUARIO_PASS?: string; // Solo para formularios
    USUARIO_TIPO: UsuarioTipo;
    ID_INSTITUCION: number;
    USUARIO_ESTADO: UsuarioEstado;
    FECHA_REGISTRO: string;
    FECHA_ACTUALIZACION: string;
    remember_token?: string;
    
    // Campos calculados/accessors
    nombre_completo: string;
    tipo_nombre: string;
    estado_nombre: string;
    
    // Relaciones (usando tipos inline para evitar dependencias circulares)
    institucion?: {
        ID_INSTITUCION: number;
        INSTITUCION_NOMBRE: string;
    };
    estudios?: Array<{
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_INICIALES: string;
        ESTUDIO_ESTADO?: string;
    }>;
    correosCopias?: Array<{
        ID: number;
        NOMBRE: string;
        CORREO: string;
        ENVIAR: 'si' | 'no';
    }>;
}

// Tipos de usuario
export type UsuarioTipo = 'admin' | 'clientes' | 'medico' | 'paciente';

// Estados de usuario
export type UsuarioEstado = 'activo' | 'inactivo';

// Formulario de usuario
export interface UsuarioForm {
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
    USUARIO_CORREO: string;
    USUARIO_TELEFONO?: string;
    USUARIO_PASS?: string;
    USUARIO_PASS_confirmation?: string;
    USUARIO_TIPO: UsuarioTipo;
    ID_INSTITUCION: number;
    USUARIO_ESTADO: UsuarioEstado;
}

// Filtros específicos para usuarios
export interface UsuarioFilters extends BaseFilters {
    tipo?: UsuarioTipo;
    estado?: UsuarioEstado;
    institucion?: string;
}

// Institución básica (para evitar imports circulares)
export interface InstitucionBasica {
    ID_INSTITUCION: number;
    INSTITUCION_NOMBRE: string;
}

// Props para componentes de usuarios
export interface UsuarioIndexProps {
    usuarios: PaginatedData<Usuario>;
    filters: UsuarioFilters;
    tipos_usuario: Record<UsuarioTipo, string>;
    estados: Record<UsuarioEstado, string>;
    instituciones: InstitucionBasica[];
}

export interface UsuarioCreateProps {
    tipos_usuario: Record<UsuarioTipo, string>;
    estados: Record<UsuarioEstado, string>;
    instituciones: InstitucionBasica[];
}

export interface UsuarioEditProps extends UsuarioCreateProps {
    usuario: Usuario;
}

export interface UsuarioShowProps {
    usuario: Usuario;
}