import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { type Cliente, type ClienteFilters } from '@/types/clientes';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Plus, 
    Search, 
    Briefcase, 
    Eye, 
    Edit2, 
    Trash2,
    Mail,
    MailCheck,
    MailX,
    UserCog
} from 'lucide-react';

// Cliente extendido con campos calculados del backend
interface ClienteWithStats extends Cliente {
    enviar_correo_boolean?: boolean;
    enviar_correo_text?: string;
    total_estudios?: number;
}

interface Estadisticas {
    total: number;
    activos: number;
    inactivos: number;
}

interface PageProps extends Record<string, any> {
    clientes: PaginatedData<ClienteWithStats>;
    estadisticas: Estadisticas;
    filtros: ClienteFilters;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Clientes',
        href: '/clientes',
    },
];

export default function Index() {
    const { clientes, estadisticas, filtros } = usePage<PageProps>().props;
    
    const [searchTerm, setSearchTerm] = useState(filtros?.search || '');
    const [envioCorreoFilter, setEnvioCorreoFilter] = useState(filtros?.enviar_correo || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/clientes', {
            search: searchTerm || undefined,
            enviar_correo: envioCorreoFilter || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setEnvioCorreoFilter('');
        router.get('/clientes', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (cliente: ClienteWithStats) => {
        if (cliente.total_estudios && cliente.total_estudios > 0) {
            alert(`No se puede eliminar a ${cliente.CLIENTE_NOMBRE} porque tiene ${cliente.total_estudios} estudios asociados.`);
            return;
        }

        if (confirm(`¿Estás seguro de que deseas eliminar el cliente "${cliente.CLIENTE_NOMBRE}"?`)) {
            router.delete(`/clientes/${cliente.ID_CLIENTE}`);
        }
    };

    const toggleEnvioCorreo = (cliente: ClienteWithStats) => {
        router.patch(`/clientes/${cliente.ID_CLIENTE}/toggle-envio-correo`, {}, {
            preserveState: true,
        });
    };

    const getEnvioCorreoIcon = (enviarCorreo?: boolean) => {
        return enviarCorreo ? MailCheck : MailX;
    };

    const getEnvioCorreoClass = (enviarCorreo?: boolean) => {
        return enviarCorreo 
            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
            : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con estadísticas */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Briefcase className="h-7 w-7 text-[#189BAF] mr-3" />
                            Clientes
                        </h1>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>{estadisticas?.total || 0} clientes registrados</span>
                            <span>•</span>
                            <span className="text-green-600">{estadisticas?.activos || 0} activos</span>
                            <span>•</span>
                            <span className="text-red-600">{estadisticas?.inactivos || 0} inactivos</span>
                        </div>
                    </div>
                    <Link
                        href="/clientes/create"
                        className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Cliente</span>
                    </Link>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre o correo..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <select
                                value={envioCorreoFilter}
                                onChange={(e) => setEnvioCorreoFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Todos los estados</option>
                                <option value="si">Con envío de correo</option>
                                <option value="no">Sin envío de correo</option>
                            </select>
                            <button
                                type="submit"
                                className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Buscar
                            </button>
                            {(searchTerm || envioCorreoFilter || filtros?.search || filtros?.enviar_correo) && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm transition-colors"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Lista de clientes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {clientes?.data?.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cliente
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Correo Electrónico
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estudios
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Envío Correo
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {clientes.data.map((cliente) => {
                                            const isEnviarCorreo = cliente.CLIENTE_ENVIAR_CORREO === 'si';
                                            const EnvioIcon = getEnvioCorreoIcon(isEnviarCorreo);
                                            
                                            return (
                                                <tr key={cliente.ID_CLIENTE} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10">
                                                                <UserCog className="h-5 w-5 text-[#189BAF]" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {cliente.CLIENTE_NOMBRE}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    ID: {cliente.ID_CLIENTE}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 flex items-center">
                                                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                            {cliente.CLIENTE_CORREO}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {cliente.total_estudios || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            estudios
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => toggleEnvioCorreo(cliente)}
                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${getEnvioCorreoClass(isEnviarCorreo)}`}
                                                        >
                                                            <EnvioIcon className="h-3 w-3 mr-1" />
                                                            {cliente.enviar_correo_text || (isEnviarCorreo ? 'Sí' : 'No')}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <Link
                                                                href={`/clientes/${cliente.ID_CLIENTE}`}
                                                                className="text-[#189BAF] hover:text-[#157a8c] p-1 rounded transition-colors"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                href={`/clientes/${cliente.ID_CLIENTE}/edit`}
                                                                className="text-[#D68B41] hover:text-[#b8763a] p-1 rounded transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(cliente)}
                                                                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {clientes?.links && (
                                <div className="bg-white px-4 py-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Mostrando {clientes.meta?.from || 0} - {clientes.meta?.to || 0} de {clientes.meta?.total || 0} clientes
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {clientes.links.map((link, index) => (
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
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {filtros?.search || filtros?.enviar_correo ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {filtros?.search || filtros?.enviar_correo
                                    ? 'Intenta con otros términos de búsqueda o filtros' 
                                    : 'Comienza agregando tu primer cliente'
                                }
                            </p>
                            {filtros?.search || filtros?.enviar_correo ? (
                                <button
                                    onClick={clearFilters}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Limpiar filtros
                                </button>
                            ) : (
                                <Link
                                    href="/clientes/create"
                                    className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Agregar Cliente</span>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}