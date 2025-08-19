import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Usuario, type UsuarioIndexProps, type UsuarioTipo, type UsuarioEstado } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Users, Plus, CheckCircle, Heart, Building, User, ChevronsUpDown, Eye, Edit, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Usuarios',
        href: '/usuarios',
    },
];

// Interfaz que extiende PageProps para usePage
interface PageProps extends UsuarioIndexProps {
    [key: string]: any;
}

export default function Index() {
    const { usuarios, filters, tipos_usuario, estados, instituciones } = usePage<PageProps>().props;
    
    // Verificar si los datos están disponibles
    if (!usuarios) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Usuarios - DIAHMOES" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#189BAF] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedTipo, setSelectedTipo] = useState(filters?.tipo || '');
    const [selectedEstado, setSelectedEstado] = useState(filters?.estado || '');
    const [selectedInstitucion, setSelectedInstitucion] = useState(filters?.institucion || '');

    // Estadísticas calculadas - Con verificación de datos
    const stats = {
        total: usuarios?.meta?.total || 0,
        activos: usuarios?.data?.filter(u => u.USUARIO_ESTADO === 'activo').length || 0,
        medicos: usuarios?.data?.filter(u => u.USUARIO_TIPO === 'medico').length || 0,
        clientes: usuarios?.data?.filter(u => u.USUARIO_TIPO === 'clientes').length || 0,
    };

    const handleSearch = () => {
        router.get('/usuarios', {
            search: searchTerm,
            tipo: selectedTipo,
            estado: selectedEstado,
            institucion: selectedInstitucion,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedTipo('');
        setSelectedEstado('');
        setSelectedInstitucion('');
        router.get('/usuarios', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (field: string) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get('/usuarios', {
            ...filters,
            sort: field,
            direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const toggleEstado = (usuario: Usuario) => {
        router.patch(`/usuarios/${usuario.ID_USUARIO}/toggle-estado`, {}, {
            preserveState: true,
            onSuccess: () => {
                // Actualizar la lista
            }
        });
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'activo':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'inactivo':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'admin':
                return 'bg-[#189BAF]/10 text-[#189BAF] border-[#189BAF]/20';
            case 'medico':
                return 'bg-[#D68B41]/10 text-[#D68B41] border-[#D68B41]/20';
            case 'clientes':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'paciente':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
                            <p className="text-[#189BAF]/20 opacity-90">
                                Administra usuarios del sistema DIAHMOES
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <Link 
                                href="/usuarios/create"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Nuevo Usuario</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                                <p className="text-3xl font-bold text-[#189BAF]">{stats.total}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#189BAF]/10">
                                <Users className="h-6 w-6 text-[#189BAF]" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Usuarios registrados</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                                <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-green-600">Estados habilitados</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Médicos</p>
                                <p className="text-3xl font-bold text-[#D68B41]">{stats.medicos}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D68B41]/10">
                                <Heart className="h-6 w-6 text-[#D68B41]" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Personal médico</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Clientes</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.clientes}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                <Building className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500">Instituciones clientes</span>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Nombre, apellidos o correo..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario</label>
                            <select
                                value={selectedTipo}
                                onChange={(e) => setSelectedTipo(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Todos los tipos</option>
                                {Object.entries(tipos_usuario).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <select
                                value={selectedEstado}
                                onChange={(e) => setSelectedEstado(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Todos los estados</option>
                                {Object.entries(estados).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Institución</label>
                            <select
                                value={selectedInstitucion}
                                onChange={(e) => setSelectedInstitucion(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Todas las instituciones</option>
                                {instituciones.map((institucion) => (
                                    <option key={institucion.ID_INSTITUCION} value={institucion.ID_INSTITUCION}>
                                        {institucion.INSTITUCION_NOMBRE}
                                    </option>
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

                {/* Tabla de usuarios */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th 
                                        onClick={() => handleSort('USUARIO_NOMBRE')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Usuario</span>
                                            <ChevronsUpDown className="h-4 w-4" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Correo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Institución
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th 
                                        onClick={() => handleSort('FECHA_REGISTRO')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Registro</span>
                                            <ChevronsUpDown className="h-4 w-4" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {usuarios?.data?.map((usuario) => (
                                    <tr key={usuario.ID_USUARIO} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10">
                                                    <User className="h-5 w-5 text-[#189BAF]" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {usuario.nombre_completo}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {usuario.ID_USUARIO}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{usuario.USUARIO_CORREO}</div>
                                            {usuario.USUARIO_TELEFONO && (
                                                <div className="text-sm text-gray-500">{usuario.USUARIO_TELEFONO}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTipoColor(usuario.USUARIO_TIPO)}`}>
                                                {usuario.tipo_nombre}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {usuario.institucion?.INSTITUCION_NOMBRE || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleEstado(usuario)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${getEstadoColor(usuario.USUARIO_ESTADO)}`}
                                            >
                                                {usuario.estado_nombre}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {usuario.FECHA_REGISTRO}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/usuarios/${usuario.ID_USUARIO}`}
                                                    className="text-[#189BAF] hover:text-[#157a8c] transition-colors"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    href={`/usuarios/${usuario.ID_USUARIO}/edit`}
                                                    className="text-[#D68B41] hover:text-[#b8763a] transition-colors"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {usuarios?.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {usuarios?.meta?.from || 0} - {usuarios?.meta?.to || 0} de {usuarios?.meta?.total || 0} resultados
                                </div>
                                <div className="flex items-center space-x-2">
                                    {usuarios.links.map((link: any, index: number) => (
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
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}