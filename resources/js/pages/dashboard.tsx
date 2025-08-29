import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DashboardProps, type DashboardNotification } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface User {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
    USUARIO_CORREO: string;
    USUARIO_TIPO: string;
    USUARIO_ESTADO: string;
}

interface ExtendedStats {
    // Estados de estudios
    estudios_pendientes: number;
    estudios_laboratorio_recepcion: number;
    estudios_laboratorio_completo: number;
    estudios_completados: number;
    estudios_cancelados: number;
    total_estudios: number;
    
    // Usuarios
    usuarios_pacientes: number;
    usuarios_medicos: number;
    usuarios_administradores: number;
    total_usuarios: number;
    
    // Entidades
    instituciones: number;
    instituciones_activas: number;
    mensajerias: number;
    
    // Métricas
    estudios_por_clave: Record<string, number>;
    estudios_urgentes: number;
    muestras_procesando: number;
}

export default function Dashboard() {
    const { auth, stats, recentStudies, notifications } = usePage<{ 
        auth: { user: User }; 
        stats: ExtendedStats;
        recentStudies: any[];
        notifications: DashboardNotification[];
    }>().props;

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'Resultados Enviados':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Recepción Laboratorio':
            case 'Resultados Completos':
                return 'bg-[#189BAF]/10 text-[#189BAF] border-[#189BAF]/20';
            case 'Solicitud Recolección':
                return 'bg-[#D68B41]/10 text-[#D68B41] border-[#D68B41]/20';
            case 'Retorno Material':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Terminado':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Cancelado':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getClaveLabel = (clave: string) => {
        const labels: Record<string, string> = {
            'KRS': 'KRAS',
            'NRS': 'NRAS', 
            'BRF': 'BRAF',
            'PAN': 'PANEL'
        };
        return labels[clave] || clave;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header de bienvenida */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                ¡Bienvenido, {auth.user.USUARIO_NOMBRE}!
                            </h1>
                            <p className="text-white/80 opacity-90">
                                Sistema de Gestión de Estudios Médicos - {auth.user.USUARIO_TIPO}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de estadísticas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Estudios</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.total_estudios}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Registrados en el sistema</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Estudios Completados</p>
                                <p className="text-3xl font-bold text-[#189BAF]">{stats.estudios_completados}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#189BAF]/10">
                                <svg className="h-6 w-6 text-[#189BAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                                <p className="text-3xl font-bold text-[#D68B41]">{stats.muestras_procesando}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D68B41]/10">
                                <svg className="h-6 w-6 text-[#D68B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">En laboratorio</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Estudios Urgentes</p>
                                <p className="text-3xl font-bold text-red-600">{stats.estudios_urgentes}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Más de 7 días</span>
                        </div>
                    </div>
                </div>

                {/* Cuarta fila - Datos de Sistema en Cartas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Médicos</p>
                                <p className="text-3xl font-bold text-[#189BAF]">{stats.usuarios_medicos}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#189BAF]/10">
                                <svg className="h-6 w-6 text-[#189BAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Profesionales registrados</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pacientes</p>
                                <p className="text-3xl font-bold text-[#D68B41]">{stats.usuarios_pacientes}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D68B41]/10">
                                <svg className="h-6 w-6 text-[#D68B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">En el sistema</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Instituciones</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.instituciones}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">{stats.instituciones_activas} activas</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Mensajerías</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.mensajerias}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Servicios de envío</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}