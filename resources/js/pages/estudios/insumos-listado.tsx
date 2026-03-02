import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import PlantillasInsumos from '@/components/PlantillasInsumos';
import { 
    Search, 
    Filter, 
    FlaskConical, 
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InsumosListadoProps {
    estudios: {
        data: any[];
        links: any[];
        meta: any;
    };
    filters: {
        fecha_desde?: string;
        fecha_hasta?: string;
        estado?: string;
        tipo_estudio?: string;
        prefijo?: string;
    };
    estados: Record<string, string>;
    tipos_estudio: string[];
    fechas_default: {
        desde: string;
        hasta: string;
    };
}

export default function EstudiosInsumosListado() {
    const { estudios, filters, estados, tipos_estudio, fechas_default } = usePage<InsumosListadoProps>().props;
    
    // Estados para filtros
    const [showFilters, setShowFilters] = useState(false);
    const [fechaDesde, setFechaDesde] = useState(filters.fecha_desde || fechas_default.desde);
    const [fechaHasta, setFechaHasta] = useState(filters.fecha_hasta || fechas_default.hasta);
    const [selectedEstado, setSelectedEstado] = useState(filters.estado || '');
    const [selectedTipoEstudio, setSelectedTipoEstudio] = useState(filters.tipo_estudio || '');
    const [prefijo, setPrefijo] = useState(filters.prefijo || 'PRM');
    
    const handleSearch = () => {
        const searchParams: any = {};
        
        if (fechaDesde) searchParams.fecha_desde = fechaDesde;
        if (fechaHasta) searchParams.fecha_hasta = fechaHasta;
        if (selectedEstado) searchParams.estado = selectedEstado;
        if (selectedTipoEstudio) searchParams.tipo_estudio = selectedTipoEstudio;
        if (prefijo) searchParams.prefijo = prefijo;
        
        router.get('/estudios/insumos-masivos', searchParams, {
            preserveState: true,
            preserveScroll: true
        });
    };
    
    const handleInsumosUpdated = () => {
        // Recargar la página para mostrar cambios
        router.reload();
    };
    
    return (
        <AppLayout>
            <Head title="Gestión Masiva de Insumos - DIAHMOES" />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Gestión Masiva de Insumos
                            </h1>
                            <p className="text-white/80">
                                Administra insumos de múltiples estudios de forma rápida y eficiente
                            </p>
                        </div>
                        <FlaskConical className="h-12 w-12 text-white/60" />
                    </div>
                </div>
                
                {/* Filtros Compactos */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm"
                        >
                            <Filter className="h-4 w-4" />
                            <span>{showFilters ? 'Ocultar' : 'Mostrar'}</span>
                        </button>
                    </div>
                    
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                                <input
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                                <input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    value={selectedEstado}
                                    onChange={(e) => setSelectedEstado(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Todos</option>
                                    {Object.entries(estados).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    value={selectedTipoEstudio}
                                    onChange={(e) => setSelectedTipoEstudio(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Todos</option>
                                    {tipos_estudio.map((tipo) => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-sm px-4 py-1 h-8">
                                    <Search className="h-3 w-3 mr-1" />
                                    Buscar
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {/* Resumen rápido */}
                    <div className="text-xs text-gray-600">
                        Mostrando {estudios.data.length} estudios | 
                        Periodo: {fechaDesde} al {fechaHasta} | 
                        {selectedEstado && `Estado: ${estados[selectedEstado]} | `}
                        {selectedTipoEstudio && `Tipo: ${selectedTipoEstudio} | `}
                        Prefijo: {prefijo}
                    </div>
                </div>
                
                {/* Lista Compacta de Estudios con Insumos */}
                <div className="space-y-4">
                    {estudios.data.map((estudio) => (
                        <div key={estudio.ID} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {/* Header Compacto del Estudio */}
                            <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    {/* Info básica */}
                                    <div className="flex items-center space-x-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 font-mono">
                                                {estudio.CLAVE_INTERNA}
                                            </h3>
                                            <div className="text-sm text-gray-600">
                                                {estudio.paciente?.USUARIO_NOMBRE} {estudio.paciente?.USUARIO_APELLIDOS}
                                                <span className="font-bold ml-2">{estudio.MUESTRA_INICIALES}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium border bg-blue-50 text-blue-800 border-blue-200">
                                                {estudio.MUESTRA_TIPO_ESTUDIO}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1 max-w-48 truncate">
                                                {estudio.R_ESTUDIO_SOLICITADO || 'No especificado'}
                                            </div>
                                        </div>
                                        
                                        {/* Estado compacto */}
                                        <div className="text-center">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                estudio.ESTUDIO_ESTADO === 'Resultados Enviados' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {estudio.ESTUDIO_ESTADO}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {estudio.FECHA_RECEPCION_LABORATORIO 
                                                    ? new Date(estudio.FECHA_RECEPCION_LABORATORIO).toLocaleDateString('es-MX')
                                                    : 'N/A'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Botón ver estudio */}
                                    <Link
                                        href={`/estudios/${estudio.ID}`}
                                        className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded transition-colors"
                                        title="Ver estudio completo"
                                    >
                                        <Eye className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Gestión de Insumos - SIEMPRE VISIBLE */}
                            <div className="p-4">
                                <PlantillasInsumos 
                                    estudiaId={estudio.ID}
                                    onPlantillaAplicada={handleInsumosUpdated}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Mensaje si no hay resultados */}
                {(!estudios.data || estudios.data.length === 0) && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                        <FlaskConical className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No se encontraron estudios
                        </h3>
                        <p className="text-gray-500">
                            Ajusta los filtros de búsqueda para encontrar estudios en el rango de fechas especificado.
                        </p>
                    </div>
                )}
                
                {/* Paginación Compacta */}
                {estudios.links && estudios.data.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {estudios.meta?.from || 0} - {estudios.meta?.to || 0} de {estudios.meta?.total || 0}
                            </div>
                            <div className="flex items-center space-x-1">
                                {estudios.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`px-2 py-1 rounded text-sm transition-colors ${
                                            link.active
                                                ? 'bg-purple-600 text-white'
                                                : link.url
                                                ? 'text-gray-700 hover:bg-gray-100'
                                                : 'text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}