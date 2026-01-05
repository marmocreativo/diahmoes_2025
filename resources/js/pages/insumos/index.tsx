import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Search, X, Filter, Edit, Plus, Package, AlertTriangle, TrendingDown, Trash2, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { SharedData } from '@/types';

interface Lote {
    ID: number;
    LOTE: string;
    CANTIDAD_INICIAL: number;
    CANTIDAD_ACTUAL: number;
    FECHA_CADUCIDAD: string | null;
    COSTO_UNITARIO: number | null;
    ESTADO: string;
    NOTAS: string;
    created_at: string;
    dias_para_vencer?: number | null;
    proximo_vencer?: boolean;
}

interface Insumo {
    ID: number;
    NOMBRE: string;
    DESCRIPCION: string | null;
    UNIDAD_MEDIDA: string;
    STOCK_MINIMO: number;
    ESTADO: string;
    stock_total: number;
    stock_bajo: boolean;
    lotes_formateados: Lote[];
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

interface FormularioLoteData {
    LOTE: string;
    FECHA_CADUCIDAD: string;
    CANTIDAD_INICIAL: number;
    COSTO_UNITARIO: string;
    NOTAS: string;
    [key: string]: any;
}

export default function InsumosIndex() {
    const { insumos, filters = {}, estados = {}, unidadesMedida = {} } = usePage<InsumoIndexProps>().props;
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(filters?.estado || '');
    const [soloStockBajo, setSoloStockBajo] = useState(filters?.stock_bajo === 'true');
    const [shouldAutoSearch, setShouldAutoSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [expandedInsumos, setExpandedInsumos] = useState<Set<number>>(new Set());

    const [mostrarDialogoCrear, setMostrarDialogoCrear] = useState(false);
    const [mostrarDialogoEditar, setMostrarDialogoEditar] = useState(false);
    const [loteEnEdicion, setLoteEnEdicion] = useState<Lote | null>(null);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState<Insumo | null>(null);
    const [procesandoLote, setProcesandoLote] = useState(false);
    const [erroresLote, setErroresLote] = useState<Record<string, string>>({});

    const [formularioLote, setFormularioLote] = useState<FormularioLoteData>({
        LOTE: '',
        FECHA_CADUCIDAD: '',
        CANTIDAD_INICIAL: 1,
        COSTO_UNITARIO: '',
        NOTAS: ''
    });

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

    // Función para toggle de expansión
    const toggleExpanded = (insumoId: number) => {
        const newExpanded = new Set(expandedInsumos);
        if (newExpanded.has(insumoId)) {
            newExpanded.delete(insumoId);
        } else {
            newExpanded.add(insumoId);
        }
        setExpandedInsumos(newExpanded);
    };

    // Funciones para formateo
    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getLoteEstadoClasses = (estado: string) => {
        switch (estado) {
            case 'disponible':
                return 'bg-green-50 text-green-800 border-green-200';
            case 'agotado':
                return 'bg-gray-50 text-gray-800 border-gray-200';
            case 'proximo_vencer':
                return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case 'vencido':
                return 'bg-red-50 text-red-800 border-red-200';
            default:
                return 'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    const getEstadoLoteLabel = (estado: string) => {
        const labels: Record<string, string> = {
            'disponible': 'Disponible',
            'agotado': 'Agotado',
            'proximo_vencer': 'Próximo a Vencer',
            'vencido': 'Vencido'
        };
        return labels[estado] || estado;
    };

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

    // Funciones para manejar diálogos
    const abrirDialogoCrear = (insumo: Insumo) => {
        setInsumoSeleccionado(insumo);
        setFormularioLote({
            LOTE: '',
            FECHA_CADUCIDAD: '',
            CANTIDAD_INICIAL: 1,
            COSTO_UNITARIO: '',
            NOTAS: ''
        });
        setErroresLote({});
        setMostrarDialogoCrear(true);
    };

    const abrirDialogoEditar = (lote: Lote, insumo: Insumo) => {
        setLoteEnEdicion(lote);
        setInsumoSeleccionado(insumo);
        setFormularioLote({
            LOTE: lote.LOTE,
            FECHA_CADUCIDAD: lote.FECHA_CADUCIDAD || '',
            CANTIDAD_INICIAL: lote.CANTIDAD_INICIAL,
            COSTO_UNITARIO: lote.COSTO_UNITARIO?.toString() || '',
            NOTAS: lote.NOTAS || ''
        });
        setErroresLote({});
        setMostrarDialogoEditar(true);
    };

    const cerrarDialogos = () => {
        setMostrarDialogoCrear(false);
        setMostrarDialogoEditar(false);
        setLoteEnEdicion(null);
        setInsumoSeleccionado(null);
        setErroresLote({});
    };

    const handleFormularioChange = (campo: keyof FormularioLoteData, valor: string | number) => {
        setFormularioLote(prev => ({
            ...prev,
            [campo]: campo === 'CANTIDAD_INICIAL' ? Number(valor) : valor
        }));
        
        // Limpiar error del campo
        if (erroresLote[campo]) {
            setErroresLote(prev => {
                const nuevosErrores = { ...prev };
                delete nuevosErrores[campo];
                return nuevosErrores;
            });
        }
    };

    const guardarLote = async (esCreacion = true) => {
        if (!insumoSeleccionado) return;
        
        setProcesandoLote(true);
        setErroresLote({});
        
        const url = esCreacion 
            ? `/insumos/${insumoSeleccionado.ID}/lotes`
            : `/insumos/${insumoSeleccionado.ID}/lotes/${loteEnEdicion?.ID}`;
        
        const metodo = esCreacion ? 'post' : 'patch';
        
        // CAMBIO: Convertir formularioLote a un objeto compatible
        const datos = {
            ...formularioLote,
            CANTIDAD_INICIAL: Number(formularioLote.CANTIDAD_INICIAL)
        } as Record<string, any>;
        
        router[metodo](url, datos, {
            onSuccess: () => {
                cerrarDialogos();
                // Recargar la página para actualizar los datos
                router.reload({ only: ['insumos'] });
            },
            onError: (errors) => {
                setErroresLote(errors as Record<string, string>);
            },
            onFinish: () => {
                setProcesandoLote(false);
            }
        });
    };

    // Función para obtener fecha mínima (hoy)
    const getFechaMinima = () => {
        return new Date().toISOString().split('T')[0];
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

                {/* TABLA MODIFICADA: Insumos y Lotes */}
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
                                        Insumo / Lote
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Unidad
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock Actual
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Caducidad
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
                                    <>
                                        {/* Fila del Insumo */}
                                        <tr 
                                            key={`insumo-${insumo.ID}`} 
                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                                                expandedInsumos.has(insumo.ID) 
                                                    ? 'bg-[#189BAF]/10 border-l-4 border-[#189BAF]' // Color de realce cuando está abierto
                                                    : 'bg-gray-50'
                                            }`}
                                            onClick={() => toggleExpanded(insumo.ID)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {expandedInsumos.has(insumo.ID) ? (
                                                        <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                                                    )}
                                                    <Package className="h-5 w-5 text-[#189BAF] mr-3" />
                                                    <div>
                                                        <Link 
                                                            href={`/insumos/${insumo.ID}/lotes`}
                                                            className="text-sm font-bold text-[#189BAF] hover:text-[#157a8c] underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {insumo.NOMBRE}
                                                        </Link>
                                                        <div className="text-xs text-gray-500">
                                                            {insumo.DESCRIPCION || 'Sin descripción'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {insumo.lotes_formateados?.length || 0} lote(s)
                                                        </div>
                                                    </div>
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
                                                <div className="text-xs text-gray-500">
                                                    Min: {insumo.STOCK_MINIMO}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs text-gray-500">
                                                    {insumo.lotes_formateados?.length || 0} lotes
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadgeClasses(insumo.ESTADO)}`}>
                                                        {estados[insumo.ESTADO] || insumo.ESTADO}
                                                    </span>
                                                    {insumo.stock_bajo && (
                                                        <div>
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                Stock Bajo
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {/* NUEVO: Botón para crear lote */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            abrirDialogoCrear(insumo);
                                                        }}
                                                        className="text-green-600 hover:text-green-700 transition-colors"
                                                        title="Nuevo lote"
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </button>
                                                    <Link
                                                        href={`/insumos/${insumo.ID}/lotes`}
                                                        className="text-purple-600 hover:text-purple-700 transition-colors"
                                                        title="Ver lotes"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Package className="h-5 w-5" />
                                                    </Link>
                                                    
                                                    <Link
                                                        href={`/insumos/${insumo.ID}/edit`}
                                                        className="text-[#D68B41] hover:text-[#b8763a] transition-colors"
                                                        title="Editar"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Link>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteInsumo(insumo);
                                                        }}
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

                                        {/* Filas de los Lotes (expandibles) */}
                                        {expandedInsumos.has(insumo.ID) && insumo.lotes_formateados?.map((lote) => (
                                            <tr 
                                                key={`lote-${lote.ID}`} 
                                                className="bg-blue-50/50 hover:bg-blue-100/50 border-l-4 border-[#189BAF]"
                                            >
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <div className="flex items-center ml-12"> {/* Aumentado de ml-6 a ml-12 */}
                                                        <div className="w-3 h-3 bg-[#189BAF] rounded-full mr-4"></div> {/* Aumentado el círculo y margin */}
                                                        <div>
                                                            <Link 
                                                                href={`/insumos/${insumo.ID}/lotes`}
                                                                className="text-sm font-medium text-gray-900 hover:text-[#189BAF]"
                                                            >
                                                                {lote.LOTE}
                                                            </Link>
                                                            <div className="text-xs text-gray-500">
                                                                Creado: {formatearFecha(lote.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <span className="text-xs text-gray-500">-</span>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {lote.CANTIDAD_ACTUAL}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        de {lote.CANTIDAD_INICIAL}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                                        <div className="text-sm text-gray-900">
                                                            {formatearFecha(lote.FECHA_CADUCIDAD)}
                                                        </div>
                                                    </div>
                                                    {lote.dias_para_vencer !== null && lote.dias_para_vencer !== undefined && lote.dias_para_vencer > 0 && (
                                                        <div className="text-xs text-gray-500">
                                                            {lote.dias_para_vencer} días
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLoteEstadoClasses(lote.ESTADO)}`}>
                                                        {lote.ESTADO === 'proximo_vencer' && (
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                        )}
                                                        {getEstadoLoteLabel(lote.ESTADO)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <div className="text-sm text-gray-900">
                                                            {lote.COSTO_UNITARIO ? (
                                                                <>
                                                                    <div>${lote.COSTO_UNITARIO.toFixed(2)}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        Total: ${(lote.COSTO_UNITARIO * lote.CANTIDAD_ACTUAL).toFixed(2)}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                'N/A'
                                                            )}
                                                        </div>
                                                        {/* NUEVO: Botones de acción para lotes */}
                                                        <div className="flex items-center space-x-1 ml-4">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    abrirDialogoEditar(lote, insumo);
                                                                }}
                                                                className="text-[#D68B41] hover:text-[#b8763a] transition-colors"
                                                                title="Editar lote"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Modificar el mensaje cuando no hay lotes */}
                                        {expandedInsumos.has(insumo.ID) && (!insumo.lotes_formateados || insumo.lotes_formateados.length === 0) && (
                                            <tr className="bg-yellow-50/50 border-l-4 border-[#189BAF]">
                                                <td colSpan={6} className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center text-yellow-800 ml-12"> {/* Añadido ml-12 */}
                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                        <span className="text-sm">No hay lotes registrados para este insumo</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                abrirDialogoCrear(insumo);
                                                            }}
                                                            className="ml-2 text-yellow-600 hover:text-yellow-800 underline"
                                                        >
                                                            Crear primer lote
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
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
                
                {/* Diálogo Crear Lote */}
                {mostrarDialogoCrear && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Nuevo Lote - {insumoSeleccionado?.NOMBRE}
                                    </h3>
                                    <button
                                        onClick={cerrarDialogos}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Lote *
                                    </label>
                                    <input
                                        type="text"
                                        value={formularioLote.LOTE}
                                        onChange={(e) => handleFormularioChange('LOTE', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${
                                            erroresLote.LOTE ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Ej: LOT-2024-001"
                                    />
                                    {erroresLote.LOTE && (
                                        <p className="text-red-500 text-sm mt-1">{erroresLote.LOTE}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Caducidad (Opcional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formularioLote.FECHA_CADUCIDAD}
                                        onChange={(e) => handleFormularioChange('FECHA_CADUCIDAD', e.target.value)}
                                        min={getFechaMinima()}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${
                                            erroresLote.FECHA_CADUCIDAD ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {erroresLote.FECHA_CADUCIDAD && (
                                        <p className="text-red-500 text-sm mt-1">{erroresLote.FECHA_CADUCIDAD}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cantidad Inicial * ({insumoSeleccionado?.UNIDAD_MEDIDA})
                                    </label>
                                    <input
                                        type="number"
                                        value={formularioLote.CANTIDAD_INICIAL}
                                        onChange={(e) => handleFormularioChange('CANTIDAD_INICIAL', parseInt(e.target.value) || 1)}
                                        min="1"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${
                                            erroresLote.CANTIDAD_INICIAL ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {erroresLote.CANTIDAD_INICIAL && (
                                        <p className="text-red-500 text-sm mt-1">{erroresLote.CANTIDAD_INICIAL}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Costo Unitario (Opcional)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={formularioLote.COSTO_UNITARIO}
                                            onChange={(e) => handleFormularioChange('COSTO_UNITARIO', e.target.value)}
                                            step="0.01"
                                            min="0"
                                            className={`w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${
                                                erroresLote.COSTO_UNITARIO ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {erroresLote.COSTO_UNITARIO && (
                                        <p className="text-red-500 text-sm mt-1">{erroresLote.COSTO_UNITARIO}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas (Opcional)
                                    </label>
                                    <textarea
                                        value={formularioLote.NOTAS}
                                        onChange={(e) => handleFormularioChange('NOTAS', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                        placeholder="Información adicional..."
                                    />
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={cerrarDialogos}
                                        disabled={procesandoLote}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => guardarLote(true)}
                                        disabled={procesandoLote}
                                        className="px-4 py-2 bg-[#189BAF] text-white rounded-lg hover:bg-[#157a8c] disabled:opacity-50 flex items-center"
                                    >
                                        {procesandoLote && (
                                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        )}
                                        {procesandoLote ? 'Guardando...' : 'Guardar Lote'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Diálogo Editar Lote */}
                {mostrarDialogoEditar && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Editar Lote - {loteEnEdicion?.LOTE}
                                    </h3>
                                    <button
                                        onClick={cerrarDialogos}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Lote *
                                    </label>
                                    <input
                                        type="text"
                                        value={formularioLote.LOTE}
                                        onChange={(e) => handleFormularioChange('LOTE', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${
                                            erroresLote.LOTE ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {erroresLote.LOTE && (
                                        <p className="text-red-500 text-sm mt-1">{erroresLote.LOTE}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Caducidad (Opcional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formularioLote.FECHA_CADUCIDAD}
                                        onChange={(e) => handleFormularioChange('FECHA_CADUCIDAD', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${
                                            erroresLote.FECHA_CADUCIDAD ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {erroresLote.FECHA_CADUCIDAD && (
                                        <p className="text-red-500 text-sm mt-1">{erroresLote.FECHA_CADUCIDAD}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cantidad Inicial * ({insumoSeleccionado?.UNIDAD_MEDIDA})
                                    </label>
                                    <input
                                        type="number"
                                        value={formularioLote.CANTIDAD_INICIAL}
                                        onChange={(e) => handleFormularioChange('CANTIDAD_INICIAL', parseInt(e.target.value) || 1)}
                                        min="1"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${
                                            erroresLote.CANTIDAD_INICIAL ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {erroresLote.CANTIDAD_INICIAL && (
                                        <p className="text-red-500 text-sm mt-1">{erroresLote.CANTIDAD_INICIAL}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Stock actual: {loteEnEdicion?.CANTIDAD_ACTUAL} {insumoSeleccionado?.UNIDAD_MEDIDA}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Costo Unitario (Opcional)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={formularioLote.COSTO_UNITARIO}
                                            onChange={(e) => handleFormularioChange('COSTO_UNITARIO', e.target.value)}
                                            step="0.01"
                                            min="0"
                                            className={`w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${
                                                erroresLote.COSTO_UNITARIO ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {erroresLote.COSTO_UNITARIO && (
                                        <p className="text-red-500 text-sm mt-1">{erroresLote.COSTO_UNITARIO}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas (Opcional)
                                    </label>
                                    <textarea
                                        value={formularioLote.NOTAS}
                                        onChange={(e) => handleFormularioChange('NOTAS', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                        placeholder="Información adicional..."
                                    />
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={cerrarDialogos}
                                        disabled={procesandoLote}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => guardarLote(false)}
                                        disabled={procesandoLote}
                                        className="px-4 py-2 bg-[#189BAF] text-white rounded-lg hover:bg-[#157a8c] disabled:opacity-50 flex items-center"
                                    >
                                        {procesandoLote && (
                                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        )}
                                        {procesandoLote ? 'Actualizando...' : 'Actualizar Lote'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}