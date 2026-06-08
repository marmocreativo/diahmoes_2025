import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type GruposIndexProps } from '@/types/folios-kits';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Package, Plus, Users, Calendar, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Grupos Folios Kits', href: '/grupos-folios-kits' },
];

interface PageProps extends GruposIndexProps {
    [key: string]: any;
}

const ESTADO_COLORS = {
    enviado:   'bg-blue-100 text-blue-800',
    retornado: 'bg-green-100 text-green-800',
    caducado:  'bg-red-100 text-red-800',
};

export default function GruposIndex() {
    const { grupos, filters } = usePage<PageProps>().props;

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearch = () => {
        router.get('/grupos-folios-kits', { search: searchTerm }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        router.get('/grupos-folios-kits', {}, { preserveState: true, replace: true });
    };

    const handleSort = (field: string) => {
        const direction = filters?.sort === field && filters?.direction === 'asc' ? 'desc' : 'asc';
        router.get('/grupos-folios-kits', { ...filters, sort: field, direction }, {
            preserveState: true,
            replace: true,
        });
    };

    const getSortIcon = (field: string) => {
        if (filters?.sort !== field) return <ChevronsUpDown className="h-4 w-4" />;
        return filters.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const handleDelete = (id: number, nombre: string) => {
        if (confirm(`¿Eliminar el grupo "${nombre}"? Los folios asociados quedarán sin grupo.`)) {
            router.delete(`/grupos-folios-kits/${id}`, { preserveState: true });
        }
    };

    const stats = {
        total:       grupos?.meta?.total || 0,
        con_folios:  grupos?.data?.filter(g => g.estadisticas.total > 0).length || 0,
        total_enviados:  grupos?.data?.reduce((acc, g) => acc + g.estadisticas.enviados, 0) || 0,
        total_retornados: grupos?.data?.reduce((acc, g) => acc + g.estadisticas.retornados, 0) || 0,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos Folios Kits - DIAHMOES" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Grupos de Folios Kits</h1>
                            <p className="text-white/90 opacity-90">
                                Administra grupos de folios y su seguimiento
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <Package className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/grupos-folios-kits/create"
                                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Nuevo Grupo</span>
                                </Link>
                                <Link
                                    href="/folios-kits"
                                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm text-center"
                                >
                                    Ver todos los folios
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Grupos', value: stats.total, color: '[#189BAF]', icon: <Package className="h-6 w-6" /> },
                        { label: 'Con Folios', value: stats.con_folios, color: 'purple', icon: <Users className="h-6 w-6" /> },
                        { label: 'Folios Enviados', value: stats.total_enviados, color: 'blue', icon: <Calendar className="h-6 w-6" /> },
                        { label: 'Folios Retornados', value: stats.total_retornados, color: 'green', icon: <Package className="h-6 w-6" /> },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                                </div>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Nombre del grupo o médico..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            />
                        </div>
                        <div className="flex items-end space-x-2">
                            <button onClick={handleSearch} className="flex-1 bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Buscar
                            </button>
                            <button onClick={clearFilters} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th onClick={() => handleSort('nombre')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                        <div className="flex items-center space-x-1"><span>Nombre</span>{getSortIcon('nombre')}</div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                                    <th onClick={() => handleSort('fecha_envio')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                        <div className="flex items-center space-x-1"><span>Fecha Envío</span>{getSortIcon('fecha_envio')}</div>
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Folios</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estados</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {grupos?.data?.map((grupo) => (
                                    <tr key={grupo.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10">
                                                    <Package className="h-5 w-5 text-[#189BAF]" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{grupo.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {grupo.medico?.nombre ?? <span className="text-gray-400 text-xs">Sin médico</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {grupo.fecha_envio ?? <span className="text-gray-400 text-xs">—</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm font-bold text-gray-900">{grupo.estadisticas.total}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                                {(['enviado', 'retornado', 'caducado'] as const).map(estado => (
                                                    grupo.estadisticas[`${estado}s` as keyof typeof grupo.estadisticas] > 0 && (
                                                        <span key={estado} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ESTADO_COLORS[estado]}`}>
                                                            {grupo.estadisticas[`${estado}s` as keyof typeof grupo.estadisticas]} {estado}
                                                        </span>
                                                    )
                                                ))}
                                                {grupo.estadisticas.total === 0 && <span className="text-gray-400 text-xs">Sin folios</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/grupos-folios-kits/${grupo.id}`}
                                                    className="text-[#189BAF] hover:text-[#157a8c] transition-colors p-1 rounded hover:bg-[#189BAF]/10"
                                                    title="Ver detalle"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={`/grupos-folios-kits/${grupo.id}/edit`}
                                                    className="text-[#D68B41] hover:text-[#b8763a] transition-colors p-1 rounded hover:bg-[#D68B41]/10"
                                                    title="Editar"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(grupo.id, grupo.nombre)}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-100"
                                                    title="Eliminar"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {grupos?.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {grupos?.meta?.from || 0} - {grupos?.meta?.to || 0} de {grupos?.meta?.total || 0} resultados
                                </div>
                                <div className="flex items-center space-x-2">
                                    {grupos.links.map((link: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                link.active ? 'bg-[#189BAF] text-white'
                                                : link.url ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {grupos?.data?.length === 0 && (
                        <div className="p-12 text-center">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron grupos</h3>
                            <p className="text-gray-500 mb-4">No hay grupos que coincidan con la búsqueda.</p>
                            <button onClick={clearFilters} className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}