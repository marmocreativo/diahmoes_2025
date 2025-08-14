import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Plus, 
    Search, 
    Truck, 
    Eye, 
    Edit2, 
    Trash2,
    Package
} from 'lucide-react';

// Tipos específicos para Mensajerías
interface Mensajeria {
    ID: number;
    NOMBRE: string;
    ESTADO: string;
    nombre_formateado: string;
    estado_formateado: string;
    estado_css_class: string;
    activa: boolean;
    estadisticas: {
        total_guias: number;
        guias_normales: number;
        guias_especializadas: number;
        guias_retorno: number;
    };
}

interface MensajeriaFilters {
    search?: string;
    estado?: string;
}

interface PaginatedMensajerias {
    data: Mensajeria[];
    meta: {
        total: number;
        from: number;
        to: number;
    };
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface PageProps extends Record<string, any> {
    mensajerias: PaginatedMensajerias;
    filters: MensajeriaFilters;
    estados: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Mensajerías',
        href: '/mensajerias',
    },
];

export default function Index() {
    const { mensajerias, filters, estados } = usePage<PageProps>().props;
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/mensajerias', {
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.get('/mensajerias', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (mensajeria: Mensajeria) => {
        if (mensajeria.estadisticas.total_guias > 0) {
            alert(`No se puede eliminar ${mensajeria.NOMBRE} porque tiene ${mensajeria.estadisticas.total_guias} guías asociadas.`);
            return;
        }

        if (confirm(`¿Estás seguro de que deseas eliminar "${mensajeria.NOMBRE}"?`)) {
            router.delete(`/mensajerias/${mensajeria.ID}`);
        }
    };

    const toggleEstado = (mensajeria: Mensajeria) => {
        router.patch(`/mensajerias/${mensajeria.ID}/toggle-estado`, {}, {
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mensajerías - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header simple */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Truck className="h-7 w-7 text-[#189BAF] mr-3" />
                            Mensajerías
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {mensajerias?.meta?.total || 0} empresas de mensajería registradas
                        </p>
                    </div>
                    <Link
                        href="/mensajerias/create"
                        className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nueva Mensajería</span>
                    </Link>
                </div>

                {/* Búsqueda simple */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <form onSubmit={handleSearch} className="flex items-center space-x-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar mensajerías..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Buscar
                        </button>
                        {(searchTerm || filters?.search) && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm transition-colors"
                            >
                                Limpiar
                            </button>
                        )}
                    </form>
                </div>

                {/* Lista de mensajerías */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {mensajerias?.data?.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mensajería
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Guías
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mensajerias.data.map((mensajeria) => (
                                            <tr key={mensajeria.ID} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10">
                                                            <Package className="h-5 w-5 text-[#189BAF]" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {mensajeria.nombre_formateado}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {mensajeria.ID}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {mensajeria.estadisticas.total_guias}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {mensajeria.estadisticas.guias_normales}N + {mensajeria.estadisticas.guias_especializadas}E + {mensajeria.estadisticas.guias_retorno}R
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => toggleEstado(mensajeria)}
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${mensajeria.estado_css_class} hover:opacity-80`}
                                                    >
                                                        {mensajeria.estado_formateado}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Link
                                                            href={`/mensajerias/${mensajeria.ID}`}
                                                            className="text-[#189BAF] hover:text-[#157a8c] p-1 rounded transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/mensajerias/${mensajeria.ID}/edit`}
                                                            className="text-[#D68B41] hover:text-[#b8763a] p-1 rounded transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(mensajeria)}
                                                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación simple */}
                            {mensajerias?.links && (
                                <div className="bg-white px-4 py-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Mostrando {mensajerias.meta?.from || 0} - {mensajerias.meta?.to || 0} de {mensajerias.meta?.total || 0} mensajerías
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {mensajerias.links.map((link, index) => (
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
                            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {filters?.search ? 'No se encontraron mensajerías' : 'No hay mensajerías registradas'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {filters?.search 
                                    ? 'Intenta con otros términos de búsqueda' 
                                    : 'Comienza agregando tu primera empresa de mensajería'
                                }
                            </p>
                            {filters?.search ? (
                                <button
                                    onClick={clearSearch}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Limpiar búsqueda
                                </button>
                            ) : (
                                <Link
                                    href="/mensajerias/create"
                                    className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Agregar Mensajería</span>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}