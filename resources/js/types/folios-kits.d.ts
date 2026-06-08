export interface GrupoFolioKit {
    id: number;
    nombre: string;
    fecha_envio: string | null;
    medico: {
        id: number;
        nombre: string;
    } | null;
    estadisticas: {
        total: number;
        enviados: number;
        retornados: number;
        caducados: number;
    };
}

export interface FolioKit {
    id: number;
    folio: string;
    estado: 'enviado' | 'retornado' | 'caducado';
    id_grupo: number | null;
    id_estudio: number | null;
    fecha_caducidad: string | null;
    grupo: { id: number; nombre: string } | null;
    estudio: { id: number; clave_interna: string } | null;
    created_at: string | null;
}

export interface MedicoOption {
    id: number;
    nombre: string;
}

export interface GrupoOption {
    id: number;
    nombre: string;
}

export interface GruposIndexProps {
    grupos: {
        data: GrupoFolioKit[];
        links: any[];
        meta: {
            from: number;
            to: number;
            total: number;
            current_page: number;
            last_page: number;
        };
    };
    medicos: MedicoOption[];
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

export interface FoliosIndexProps {
    folios: {
        data: FolioKit[];
        links: any[];
        meta: {
            from: number;
            to: number;
            total: number;
        };
    };
    grupos: GrupoOption[];
    filters: {
        search?: string;
        estado?: string;
        id_grupo?: string;
        sort?: string;
        direction?: string;
    };
    estados: string[];
}