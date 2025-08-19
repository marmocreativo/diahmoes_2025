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

export default function Dashboard() {
    const { auth, stats, recentStudies, notifications } = usePage<{ 
        auth: { user: User }; 
        stats: DashboardProps['stats'];
        recentStudies: DashboardProps['recentStudies'];
        notifications: DashboardProps['notifications'];
    }>().props;

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'Completado':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'En Proceso':
                return 'bg-[#189BAF]/10 text-[#189BAF] border-[#189BAF]/20';
            case 'Pendiente':
                return 'bg-[#D68B41]/10 text-[#D68B41] border-[#D68B41]/20';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
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
                            <p className="text-[#189BAF]/20 opacity-90">
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

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Estudios Pendientes</p>
                                <p className="text-3xl font-bold text-[#D68B41]">{stats.estudios_pendientes}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D68B41]/10">
                                <svg className="h-6 w-6 text-[#D68B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Últimos 30 días</span>
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
                        <div className="mt-4">
                            <span className={`text-sm ${stats.porcentaje_cambio_completados >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.porcentaje_cambio_completados >= 0 ? '↗' : '↘'} {Math.abs(stats.porcentaje_cambio_completados)}% este mes
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Muestras en Proceso</p>
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
                                <p className="text-sm font-medium text-gray-600">Instituciones Activas</p>
                                <p className="text-3xl font-bold text-[#189BAF]">{stats.instituciones_activas}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#189BAF]/10">
                                <svg className="h-6 w-6 text-[#189BAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Red de socios</span>
                        </div>
                    </div>
                </div>

                {/* Grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    {/* Estudios recientes */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Estudios Recientes</h2>
                            <button className="text-[#189BAF] hover:text-[#157a8c] text-sm font-medium">
                                Ver todos →
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {recentStudies.map((study) => (
                                <div key={study.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10">
                                            <svg className="h-5 w-5 text-[#189BAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{study.id}</p>
                                            <p className="text-sm text-gray-600">Paciente: {study.paciente} | Tipo: {study.tipo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(study.estado)}`}>
                                            {study.estado}
                                        </span>
                                        <span className="text-sm text-gray-500">{study.fecha}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panel lateral - Acciones rápidas */}
                    <div className="space-y-6">
                        {/* Acciones rápidas */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#189BAF]/20 hover:bg-[#189BAF]/5 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-[#189BAF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span className="text-sm font-medium">Nuevo Estudio</span>
                                    </div>
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                
                                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#D68B41]/20 hover:bg-[#D68B41]/5 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-[#D68B41] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">Buscar Estudios</span>
                                    </div>
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                
                                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm font-medium">Generar Reporte</span>
                                    </div>
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Notificaciones */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Notificaciones</h3>
                            <div className="space-y-3">
                            {notifications.length > 0 ? (
                                notifications.map((notification: DashboardNotification, index: number) => (
                                    <div key={index} className={`p-3 rounded-lg ${
                                        notification.type === 'warning' 
                                            ? 'bg-[#D68B41]/10 border border-[#D68B41]/20' 
                                            : 'bg-[#189BAF]/10 border border-[#189BAF]/20'
                                    }`}>
                                        <div className="flex items-start">
                                            <svg className={`h-4 w-4 mt-0.5 mr-2 flex-shrink-0 ${
                                                notification.type === 'warning' ? 'text-[#D68B41]' : 'text-[#189BAF]'
                                            }`} fill="currentColor" viewBox="0 0 20 20">
                                                {notification.type === 'warning' ? (
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                ) : (
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                )}
                                            </svg>
                                            <div>
                                                <p className={`text-sm font-medium ${
                                                    notification.type === 'warning' ? 'text-[#D68B41]' : 'text-[#189BAF]'
                                                }`}>
                                                    {notification.title}
                                                </p>
                                                <p className={`text-xs ${
                                                    notification.type === 'warning' ? 'text-[#D68B41]/80' : 'text-[#189BAF]/80'
                                                }`}>
                                                    {notification.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                    <div className="flex items-center justify-center">
                                        <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-500">No hay notificaciones urgentes</p>
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}