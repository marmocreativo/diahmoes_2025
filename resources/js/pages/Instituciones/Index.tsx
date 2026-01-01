import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Institucion, type InstitucionIndexProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Building, Plus, Users, MapPin, ChevronsUpDown, ArrowUp, ArrowDown, Eye, Edit, RotateCw, FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Instituciones',
        href: '/instituciones',
    },
];

// Interfaz que extiende PageProps para usePage
interface PageProps extends InstitucionIndexProps {
    [key: string]: any;
}

export default function Index() {
    const { instituciones, filters, ciudades, estados_geograficos } = usePage<PageProps>().props;
    
    // Verificar si los datos están disponibles
    if (!instituciones) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Instituciones - DIAHMOES" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#189BAF] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando instituciones...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedCiudad, setSelectedCiudad] = useState(filters?.ciudad || '');
    const [selectedEstadoGeografico, setSelectedEstadoGeografico] = useState(filters?.estado_geografico || '');

    // Estadísticas calculadas - Con verificación de datos
    const stats = {
        total: instituciones?.meta?.total || 0,
        con_usuarios: instituciones?.data?.filter(i => (i.estadisticas?.usuarios_activos || 0) > 0).length || 0,
        con_estudios: instituciones?.data?.filter(i => (i.estadisticas?.estudios_total || 0) > 0).length || 0,
        por_ciudad: ciudades?.length || 0,
    };

    const handleSearch = () => {
        router.get('/instituciones', {
            search: searchTerm,
            ciudad: selectedCiudad,
            estado_geografico: selectedEstadoGeografico,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCiudad('');
        setSelectedEstadoGeografico('');
        router.get('/instituciones', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (field: string) => {
        const direction = filters?.sort === field && filters?.direction === 'asc' ? 'desc' : 'asc';
        router.get('/instituciones', {
            ...filters,
            sort: field,
            direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (institucion: Institucion) => {
        if (confirm(`¿Estás seguro de que deseas eliminar la institución "${institucion.INSTITUCION_NOMBRE}"?`)) {
            router.delete(`/instituciones/${institucion.ID_INSTITUCION}`, {
                preserveState: true,
            });
        }
    };

    const getSortIcon = (field: string) => {
        if (filters?.sort !== field) {
            return <ChevronsUpDown className="h-4 w-4" />;
        }
        return filters.direction === 'asc' ? 
            <ArrowUp className="h-4 w-4" /> : 
            <ArrowDown className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Instituciones - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Gestión de Instituciones</h1>
                            <p className="text-white/90 opacity-90">
                                Administra instituciones médicas y centros de salud
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                    <Building className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <Link 
                                href="/instituciones/create"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Nueva Institución</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Instituciones</p>
                                <p className="text-3xl font-bold text-[#189BAF]">{stats.total}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#189BAF]/10">
                                <Building className="h-6 w-6 text-[#189BAF]" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Centros registrados</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Con Usuarios</p>
                                <p className="text-3xl font-bold text-green-600">{stats.con_usuarios}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-green-600">Con personal activo</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Con Estudios</p>
                                <p className="text-3xl font-bold text-[#D68B41]">{stats.con_estudios}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D68B41]/10">
                                <svg className="h-6 w-6 text-[#D68B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Con estudios registrados</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Ciudades</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.por_ciudad}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Ubicaciones diferentes</span>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Nombre, RFC, ciudad o razón social..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                            <select
                                value={selectedCiudad}
                                onChange={(e) => setSelectedCiudad(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Todas las ciudades</option>
                                {ciudades?.map((ciudad) => (
                                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado Geográfico</label>
                            <select
                                value={selectedEstadoGeografico}
                                onChange={(e) => setSelectedEstadoGeografico(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Todos los estados</option>
                                {estados_geograficos?.map((estado) => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end space-x-2">
                            <button
                                onClick={handleSearch}
                                className="flex-1 bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Buscar
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla de instituciones */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th 
                                        onClick={() => handleSort('INSTITUCION_NOMBRE')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Institución</span>
                                            {getSortIcon('INSTITUCION_NOMBRE')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ubicación
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Procedencia
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuarios
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estudios
                                    </th>
                                    <th 
                                        onClick={() => handleSort('FECHA_REGISTRO')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Registro</span>
                                            {getSortIcon('FECHA_REGISTRO')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {instituciones?.data?.map((institucion) => (
                                    <tr key={institucion.ID_INSTITUCION} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10">
                                                    <svg className="h-5 w-5 text-[#189BAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {institucion.nombre_corto || institucion.INSTITUCION_NOMBRE}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        RFC: {institucion.INSTITUCION_RFC}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{institucion.INSTITUCION_CORREO}</div>
                                            <div className="text-sm text-gray-500">{institucion.INSTITUCION_TELEFONO}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{institucion.INSTITUCION_CIUDAD}</div>
                                            <div className="text-sm text-gray-500">{institucion.INSTITUCION_ESTADO}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {institucion.INSTITUCION_PROCEDENCIA || 'No especificado'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm font-medium text-gray-900">
                                                {institucion.estadisticas?.usuarios_activos || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                de {institucion.estadisticas?.usuarios_total || 0} total
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm font-medium text-gray-900">
                                                {institucion.estadisticas?.estudios_total || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {institucion.estadisticas?.estudios_mes_actual || 0} este mes
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {institucion.FECHA_REGISTRO}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/instituciones/${institucion.ID_INSTITUCION}`}
                                                    className="text-[#189BAF] hover:text-[#157a8c] transition-colors p-1 rounded hover:bg-[#189BAF]/10"
                                                    title="Ver detalles"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={`/instituciones/${institucion.ID_INSTITUCION}/edit`}
                                                    className="text-[#D68B41] hover:text-[#b8763a] transition-colors p-1 rounded hover:bg-[#D68B41]/10"
                                                    title="Editar"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(institucion)}
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
                    {instituciones?.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {instituciones?.meta?.from || 0} - {instituciones?.meta?.to || 0} de {instituciones?.meta?.total || 0} resultados
                                </div>
                                <div className="flex items-center space-x-2">
                                    {instituciones.links.map((link: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-[#189BAF] text-white'
                                                    : link.url
                                                    ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
                </div>

                {/* Mensaje si no hay resultados */}
                {instituciones?.data?.length === 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                        <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron instituciones</h3>
                        <p className="text-gray-500 mb-4">No hay instituciones que coincidan con los filtros aplicados.</p>
                        <button
                            onClick={clearFilters}
                            className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}