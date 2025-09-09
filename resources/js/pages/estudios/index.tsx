import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Search, X, Filter, Eye, Edit, Download, ArrowRight, Calendar, FileText, TestTube, Microscope, Plus, MessageCircle } from 'lucide-react';
import { EstudioIndexProps } from '@/types/estudios';
import WhatsAppDialog from '@/components/WhatsAppDialog';

export default function EstudiosIndex() {
    // Tipar correctamente las props
    const { estudios, filters, estados } = usePage<EstudioIndexProps>().props;
    
    // Estados para el buscador
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(filters?.estado || '');
    const [fechaDesde, setFechaDesde] = useState(filters?.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(filters?.fecha_hasta || '');

    // Estado para el dialog de WhatsApp
    const [whatsappDialog, setWhatsappDialog] = useState<{
        isOpen: boolean;
        estudio: any;
    }>({
        isOpen: false,
        estudio: null
    });

    const openWhatsAppDialog = (estudio: any) => {
        setWhatsappDialog({
            isOpen: true,
            estudio
        });
    };

    const closeWhatsAppDialog = () => {
        setWhatsappDialog({
            isOpen: false,
            estudio: null
        });
    };

    // Búsqueda en tiempo real con debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== filters?.search) {
                handleSearch();
            }
        }, 500); // Buscar 500ms después de que el usuario deje de escribir

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSearch = () => {
        router.get('/estudios', {
            search: searchTerm,
            estado: selectedEstado,
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSelectedEstado('');
        setFechaDesde('');
        setFechaHasta('');
        router.get('/estudios', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const hasActiveFilters = searchTerm || selectedEstado || fechaDesde || fechaHasta;

    return (
        <AppLayout>
            <Head title="Estudios - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Gestión de Estudios</h1>
                            <p className="text-white/80 opacity-90">
                                Administra estudios médicos y diagnósticos del sistema DIAHMOES
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/estudios/create"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Nuevo Estudio</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Buscador Principal */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center space-x-4">
                        {/* Campo de búsqueda principal */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por clave, folio Merck, médico, paciente o institución..."
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Botón de filtros adicionales */}
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
                                    {[searchTerm, selectedEstado, fechaDesde, fechaHasta].filter(Boolean).length}
                                </span>
                            )}
                        </button>

                        {/* Botón limpiar */}
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

                    {/* Filtros adicionales colapsables */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                                    <input
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(e) => setFechaDesde(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                                    <input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={handleSearch}
                                    className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Aplicar Filtros
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Indicadores de búsqueda activa */}
                    {searchTerm && (
                        <div className="mt-4 flex items-center text-sm text-gray-600">
                            <Search className="h-4 w-4 mr-1" />
                            <span>Buscando: "{searchTerm}" en clave, folio, médico, paciente e institución</span>
                        </div>
                    )}
                </div>

                {/* Resultados */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Contador de resultados */}
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {estudios?.meta?.total || 0} estudios encontrados
                                {searchTerm && ` para "${searchTerm}"`}
                            </div>
                            <div className="text-xs text-gray-500">
                                Página {estudios?.meta?.current_page || 1} de {estudios?.meta?.last_page || 1}
                            </div>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Clave / Folio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paciente / Institución
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estudio Solicitado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Solicitud
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
                                {estudios?.data?.map((estudio) => (
                                    <tr key={estudio.ID} className="hover:bg-gray-50">
                                        {/* Clave / Folio */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 font-mono">
                                                {estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}
                                            </div>
                                            {estudio.FOLIO_MERCK && (
                                                <div className="text-sm text-gray-500">Merck: {estudio.FOLIO_MERCK}</div>
                                            )}
                                        </td>

                                        {/* Paciente / Institución */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {estudio.paciente?.USUARIO_NOMBRE || 'N/A'} {estudio.paciente?.USUARIO_APELLIDOS || ''} <b>{estudio.MUESTRA_INICIALES || 'N/A'}</b>
                                                </div>
                                                
                                                {estudio.medico && (
                                                    <div className="text-xs text-gray-600">
                                                        Dr. {estudio.medico.USUARIO_NOMBRE} {estudio.medico.USUARIO_APELLIDOS}
                                                    </div>
                                                )}
                                                
                                                {estudio.institucion && (
                                                    <div className="text-xs text-gray-500">
                                                        {estudio.institucion.INSTITUCION_NOMBRE}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Tipo */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-800 border-blue-200">
                                                {estudio.MUESTRA_TIPO_ESTUDIO || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Estudio Solicitado */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {estudio.R_ESTUDIO_SOLICITADO ? 
                                                    (estudio.R_ESTUDIO_SOLICITADO.length > 40 ? 
                                                        estudio.R_ESTUDIO_SOLICITADO.substring(0, 40) + '...' : 
                                                        estudio.R_ESTUDIO_SOLICITADO
                                                    ) : 'No especificado'
                                                }
                                            </div>
                                        </td>

                                        {/* Fecha Solicitud */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {estudio.FECHA_SOLICITUD_RECOLECCION && estudio.FECHA_SOLICITUD_RECOLECCION !== '0000-00-00 00:00:00' 
                                                ? new Date(estudio.FECHA_SOLICITUD_RECOLECCION).toLocaleDateString('es-MX')
                                                : 'N/A'
                                            }
                                        </td>

                                        {/* Estado */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-800 border-gray-200">
                                                {estudio.ESTUDIO_ESTADO || 'Sin estado'}
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/estudios/${estudio.ID}`}
                                                    className="text-[#189BAF] hover:text-[#157a8c] transition-colors"
                                                    title="Ver estudio"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                                
                                                <button 
                                                    onClick={() => window.open(`/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}`, '_blank')}
                                                    className="text-green-600 hover:text-green-700 transition-colors"
                                                    title="Descargar PDF"
                                                >
                                                    <Download className="h-5 w-5" />
                                                </button>

                                                <button 
                                                    onClick={() => openWhatsAppDialog(estudio)}
                                                    className="text-green-600 hover:text-green-700 transition-colors"
                                                    title="Enviar por WhatsApp"
                                                >
                                                    <MessageCircle className="h-5 w-5" />
                                                </button>
                                                
                                                <div className="relative group">
                                                    <button className="text-[#D68B41] hover:text-[#b8763a] transition-colors">
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                        <Link
                                                            href={`/estudios/${estudio.ID}/edit/recoleccion`}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            1. Recolección
                                                        </Link>
                                                        <Link
                                                            href={`/estudios/${estudio.ID}/edit/recepcion`}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            2. Recepción
                                                        </Link>
                                                        <Link
                                                            href={`/estudios/${estudio.ID}/edit/laboratorio`}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <TestTube className="h-4 w-4 mr-2" />
                                                            3. Laboratorio
                                                        </Link>
                                                        <Link
                                                            href={`/estudios/${estudio.ID}/edit/informe`}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Microscope className="h-4 w-4 mr-2" />
                                                            4. Informe
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {estudios?.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {estudios?.meta?.from || 0} - {estudios?.meta?.to || 0} de {estudios?.meta?.total || 0} resultados
                                </div>
                                <div className="flex items-center space-x-2">
                                    {estudios.links.map((link, index) => (
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

            {/* WhatsApp Dialog */}
            {whatsappDialog.isOpen && (
                <WhatsAppDialog
                    estudio={whatsappDialog.estudio}
                    isOpen={whatsappDialog.isOpen}
                    onClose={closeWhatsAppDialog}
                />
            )}
        </AppLayout>
    );
}