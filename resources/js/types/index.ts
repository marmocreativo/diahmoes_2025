import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

// User del sistema de autenticación (Laravel)
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

// Tipos para paginación (Laravel)
export interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    meta: PaginationMeta;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

// Tipos genéricos para filtros
export interface BaseFilters {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    page?: number;
}

// Dashboard types
export interface DashboardStats {
    estudios_pendientes: number;
    estudios_completados: number;
    porcentaje_cambio_completados: number;
    muestras_procesando: number;
    instituciones_activas: number;
}

export interface RecentStudy {
    id: string;
    paciente: string;
    tipo: string;
    estado: string;
    fecha: string;
}

export interface DashboardNotification {
    type: 'warning' | 'info';
    title: string;
    message: string;
    count: number;
}

export interface DashboardProps {
    stats: DashboardStats;
    recentStudies: RecentStudy[];
    notifications: DashboardNotification[];
}

export * from './usuarios';
export * from './instituciones';
export * from './clientes';
export * from './estudios';
export * from './adjuntos';
export * from './mensajerias';
export * from './correos';