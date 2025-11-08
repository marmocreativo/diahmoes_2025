import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Search, X, Filter, Eye, Edit, Plus, Package, AlertTriangle, TrendingDown, Trash2 } from 'lucide-react';
import { SharedData } from '@/types';

interface Insumo {
    ID: number;
    NOMBRE: string;
    DESCRIPCION: string | null;
    UNIDAD_MEDIDA: string;
    STOCK_MINIMO: number;
    ESTADO: string;
    stock_total: number;
    stock_bajo: boolean;
    created_at: string;
    updated_at: string;
}

interface InsumoIndexProps extends SharedData {
    insumos: {
        data: Insumo[];
        links: any[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
    };
    filters?: {
        search?: string;
        estado?: string;
        stock_bajo?: string;
    };
    estados?: Record<string, string>;
    unidadesMedida?: Record<string, string>;
}

export default function InsumosIndex() {
    const { insumos, filters = {}, estados = {}, unidadesMedida = {} } = usePage<InsumoIndexProps>().props;
    
    // Estados para el buscador
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(filters?.estado || '');
    const [soloStockBajo, setSoloStockBajo] = useState(filters?.stock_bajo === 'true');
    const [shouldAutoSearch, setShouldAutoSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Estado para detectar móvil
    const [isMobile, setIsMobile] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Búsqueda automática con debounce
    useEffect(() => {
        if (!shouldAutoSearch || searchTerm === filters?.search) {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (searchTerm !== filters?.search) {
                handleSearch(true);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, shouldAutoSearch]);

    const handleSearch = (isAutoSearch = false) => {
        setIsSearching(true);
        
        const searchParams = {
            search: searchTerm,
            estado: selectedEstado,
            stock_bajo: soloStockBajo ? 'true' : '',
            ...(isAutoSearch ? {} : { page: insumos?.meta?.current_page || 1 })
        };

        router.get('/insumos', searchParams, {
            preserveState: true,
            preserveScroll: true,
            replace: false,
            onFinish: () => {
                setIsSearching(false);
                setShouldAutoSearch(true);
            }
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSelectedEstado('');
        setSoloStockBajo(false);
        setShouldAutoSearch(false);
        
        router.get('/insumos', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: false,
            onFinish: () => {
                setTimeout(() => setShouldAutoSearch(true), 100);
            }
        });
    };

    const handleSearchInputChange = (value: string) => {
        setSearchTerm(value);
        if (!shouldAutoSearch) {
            setShouldAutoSearch(true);
        }
    };

    const handlePaginationClick = (url: string) => {
        setIsSearching(true);
        
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: false,
            replace: false,
            onFinish: () => {
                setIsSearching(false);
            }
        });
    };

    const handleDeleteInsumo = (insumo: Insumo) => {
        const confirmMessage = `¿Estás seguro de que deseas eliminar el insumo "${insumo.NOMBRE}"?\n\nEsta acción NO se puede deshacer.`;
        
        if (window.confirm(confirmMessage)) {
            setDeletingId(insumo.ID);
            
            router.delete(`/insumos/${insumo.ID}`, {
                onSuccess: () => {
                    // Éxito
                },
                onError: (errors) => {
                    console.error('Error al eliminar insumo:', errors);
                    alert('Error al eliminar el insumo. Puede que tenga lotes asociados.');
                },
                onFinish: () => {
                    setDeletingId(null);
                }
            });
        }
    };

    const getEstadoBadgeClasses = (estado: string) => {
        return estado === 'activo'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-gray-50 text-gray-800 border-gray-200';
    };

    const hasActiveFilters = searchTerm || selectedEstado || soloStockBajo;

    return (
        <AppLayout>
            <Head title="Inventario de Insumos - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Inventario de Insumos</h1>
                            <p className="text-white/80 opacity-90">
                                Gestiona el inventario de insumos utilizados en estudios
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/insumos/stock-bajo"
                                className="bg-yellow-500/20 hover:bg-yellow-500/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <AlertTriangle className="h-5 w-5" />
                                <span className={isMobile ? "hidden sm:inline" : ""}>Stock Bajo</span>
                            </Link>
                            <Link 
                                href="/insumos/create"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span className={isMobile ? "hidden sm:inline" : ""}>Nuevo Insumo</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Buscador */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className={`flex items-center ${isMobile ? 'flex-col' : ''} space-x-4 ${isMobile ? 'space-x-0 space-y-4' : ''}`}>
                        <div className={`${isMobile ? 'w-full' : 'flex-1'} relative`}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                placeholder="Buscar por nombre o descripción..."
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                disabled={isSearching}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => handleSearchInputChange('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        <div className={`flex items-center space-x-2 ${isMobile ? 'w-full justify-between' : ''}`}>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                                    showFilters || hasActiveFilters
                                        ? 'border-[#189BAF] bg-[#189BAF]/5 text-[#189BAF]'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="h-5 w-5" />
                                <span>Filtros</span>
                                {hasActiveFilters && (
                                    <span className="bg-[#189BAF] text-white text-xs px-2 py-1 rounded-full">
                                        {[searchTerm, selectedEstado, soloStockBajo].filter(Boolean).length}
                                    </span>
                                )}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearSearch}
                                    className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                                    title="Limpiar filtros"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filtros colapsables */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-4'}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                    <select
                                        value={selectedEstado}
                                        onChange={(e) => setSelectedEstado(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                    >
                                        <option value="">Todos los estados</option>
                                        {Object.entries(estados || {}).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={soloStockBajo}
                                            onChange={(e) => setSoloStockBajo(e.target.checked)}
                                            className="w-4 h-4 text-[#189BAF] border-gray-300 rounded focus:ring-[#189BAF]"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Solo con stock bajo
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={() => handleSearch(false)}
                                    disabled={isSearching}
                                    className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? 'Buscando...' : 'Aplicar Filtros'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabla de resultados */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {insumos?.meta?.total || 0} insumos encontrados
                            </div>
                            <div className="text-xs text-gray-500">
                                Página {insumos?.meta?.current_page || 1} de {insumos?.meta?.last_page || 1}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Insumo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Unidad
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock Actual
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock Mínimo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {insumos?.data?.map((insumo) => (
                                    <tr key={insumo.ID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {insumo.NOMBRE}
                                                </div>
                                                {insumo.DESCRIPCION && (
                                                    <div className="text-sm text-gray-500">
                                                        {insumo.DESCRIPCION}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                                                {insumo.UNIDAD_MEDIDA}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className={`text-sm font-bold ${insumo.stock_bajo ? 'text-red-600' : 'text-green-600'}`}>
                                                {insumo.stock_total}
                                                {insumo.stock_bajo && (
                                                    <AlertTriangle className="inline-block h-4 w-4 ml-1" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm text-gray-900">
                                                {insumo.STOCK_MINIMO}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadgeClasses(insumo.ESTADO)}`}>
                                                {estados[insumo.ESTADO] || insumo.ESTADO}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/insumos/${insumo.ID}`}
                                                    className="text-[#189BAF] hover:text-[#157a8c] transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                                
                                                <Link
                                                    href={`/insumos/${insumo.ID}/lotes`}
                                                    className="text-purple-600 hover:text-purple-700 transition-colors"
                                                    title="Ver lotes"
                                                >
                                                    <Package className="h-5 w-5" />
                                                </Link>
                                                
                                                <Link
                                                    href={`/insumos/${insumo.ID}/edit`}
                                                    className="text-[#D68B41] hover:text-[#b8763a] transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>

                                                <button
                                                    onClick={() => handleDeleteInsumo(insumo)}
                                                    disabled={deletingId === insumo.ID}
                                                    className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Eliminar"
                                                >
                                                    {deletingId === insumo.ID ? (
                                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                                    ) : (
                                                        <Trash2 className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {insumos?.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
                                <div className="text-sm text-gray-700">
                                    Mostrando {insumos?.meta?.from || 0} - {insumos?.meta?.to || 0} de {insumos?.meta?.total || 0} resultados
                                </div>
                                <div className={`flex items-center space-x-2 ${isMobile ? 'flex-wrap justify-center' : ''}`}>
                                    {insumos.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && handlePaginationClick(link.url)}
                                            disabled={!link.url || isSearching}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-[#189BAF] text-white'
                                                    : link.url && !isSearching
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