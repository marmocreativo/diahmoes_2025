import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type EstudioIndexProps } from '@/types';
import { Users, Plus, CheckCircle, FileText, AlertTriangle, Microscope, Building, ChevronsUpDown, Eye, Edit, Download, ArrowRight, Calendar, TestTube } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Estudios',
        href: '/estudios',
    },
];

interface PageProps extends EstudioIndexProps {
    [key: string]: any;
}

export default function EstudiosIndex() {
    const { estudios, filters, medicos, instituciones, clientes, estados, tiposEstudio } = usePage<PageProps>().props;
    
    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedEstado, setSelectedEstado] = useState(filters?.estado || '');
    const [selectedTipoEstudio, setSelectedTipoEstudio] = useState(filters?.tipo_estudio || '');
    const [selectedInstitucion, setSelectedInstitucion] = useState(filters?.institucion || '');
    const [selectedMedico, setSelectedMedico] = useState(filters?.medico || '');
    const [fechaDesde, setFechaDesde] = useState(filters?.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(filters?.fecha_hasta || '');
    const [mostrarUrgentes, setMostrarUrgentes] = useState((filters as any)?.urgentes === '1');
    const [mostrarCompletos, setMostrarCompletos] = useState((filters as any)?.resultados_completos === '1');

    // Verificar si los datos están disponibles
    if (!estudios) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Estudios - DIAHMOES" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#189BAF] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando estudios...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Estadísticas calculadas
    
    const stats = {
        total: estudios?.meta?.total || 0,
        pendientes: estudios?.data?.filter(e => e.ESTUDIO_ESTADO === 'Solicitud Recolección').length || 0,
        laboratorio: estudios?.data?.filter(e => ['Recepción Laboratorio', 'Resultados Completos'].includes(e.ESTUDIO_ESTADO || '')).length || 0,
        completados: estudios?.data?.filter(e => e.ESTUDIO_ESTADO === 'Resultados Enviados').length || 0,
    };

    const handleSearch = () => {
        router.get('/estudios', {
            search: searchTerm,
            estado: selectedEstado,
            tipo_estudio: selectedTipoEstudio,
            institucion: selectedInstitucion,
            medico: selectedMedico,
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
            urgentes: mostrarUrgentes ? '1' : '',
            resultados_completos: mostrarCompletos ? '1' : '',
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedEstado('');
        setSelectedTipoEstudio('');
        setSelectedInstitucion('');
        setSelectedMedico('');
        setFechaDesde('');
        setFechaHasta('');
        setMostrarUrgentes(false);
        setMostrarCompletos(false);
        router.get('/estudios', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (field: string) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get('/estudios', {
            ...filters,
            sort: field,
            direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'solicitud_recoleccion':
                return 'bg-[#D68B41]/10 text-[#D68B41] border-[#D68B41]/20';
            case 'recepcion_laboratorio':
                return 'bg-[#189BAF]/10 text-[#189BAF] border-[#189BAF]/20';
            case 'resultados_completos':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'resultados_enviados':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'retorno_material':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'terminado':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelado':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getProgressValue = (estado: string) => {
        switch (estado) {
            case 'Solicitud Recolección':
                return 0;
            case 'Recepción Laboratorio':
                return 25;
            case 'Resultados Completos':
                return 75;
            case 'Resultados Enviados':
                return 100;
            case 'Cancelado':
                return 100;
            default:
                return 0;
        }
    };

    const getProgressColor = (estado: string) => {
        return estado === 'cancelado' ? 'bg-red-500' : 'bg-green-500';
    };

    const getEstadoLabel = (estado: string) => {
        const labels: Record<string, string> = {
            'solicitud_recoleccion': 'Solicitud Recolección',
            'recepcion_laboratorio': 'Recepción Laboratorio',
            'resultados_completos': 'Resultados Completos',
            'resultados_enviados': 'Resultados Enviados',
            'retorno_material': 'Retorno Material',
            'terminado': 'Terminado',
            'cancelado': 'Cancelado'
        };
        return labels[estado] || estado;
    };

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === '0000-00-00 00:00:00') return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX');
    };

    // Función para determinar el siguiente paso
    const getNextStep = (estado: string | undefined) => {
        if (!estado) return null;
        switch (estado) {
            case 'solicitud_recoleccion':
                return 'recepcion';
            case 'recepcion_laboratorio':
                return 'laboratorio';
            case 'resultados_completos':
                return 'informe';
            default:
                return null;
        }
    };

    const canContinue = (estudio: any) => {
        return !estudio.FECHA_RESULTADOS_CORREO || estudio.FECHA_RESULTADOS_CORREO === '0000-00-00 00:00:00';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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
                            <div className="hidden md:block">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                    <FileText className="h-8 w-8 text-white" />
                                </div>
                            </div>
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

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Clave, folio, muestra, médico, institución..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            />
                        </div>

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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Estudio</label>
                            <select
                                value={selectedTipoEstudio}
                                onChange={(e) => setSelectedTipoEstudio(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Todos los tipos</option>
                                {Object.entries(tiposEstudio || {}).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Médico</label>
                            <select
                                value={selectedMedico}
                                onChange={(e) => setSelectedMedico(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                            >
                                <option value="">Todos los médicos</option>
                                {(medicos || []).map((medico) => (
                                    <option key={medico.ID_USUARIO} value={medico.ID_USUARIO}>
                                        {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                    </option>
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
                                {(instituciones || []).map((institucion) => (
                                    <option key={institucion.ID_INSTITUCION} value={institucion.ID_INSTITUCION}>
                                        {institucion.INSTITUCION_NOMBRE}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filtros adicionales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filtros Especiales</label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={mostrarUrgentes}
                                        onChange={(e) => setMostrarUrgentes(e.target.checked)}
                                        className="rounded border-gray-300 text-[#189BAF] focus:ring-[#189BAF]"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Urgentes</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={mostrarCompletos}
                                        onChange={(e) => setMostrarCompletos(e.target.checked)}
                                        className="rounded border-gray-300 text-[#189BAF] focus:ring-[#189BAF]"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Completos</span>
                                </label>
                            </div>
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

                {/* Tabla de estudios */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th 
                                        onClick={() => handleSort('CLAVE_INTERNA')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Clave / Folio</span>
                                            <ChevronsUpDown className="h-4 w-4" />
                                        </div>
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
                                    <th 
                                        onClick={() => handleSort('FECHA_SOLICITUD_RECOLECCION')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Fecha Solicitud</span>
                                            <ChevronsUpDown className="h-4 w-4" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progreso
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estudios?.data?.map((estudio) => (
                                    <tr key={estudio.ID} className="hover:bg-gray-50">
                                        {/* Columna 1: Clave / Folio */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 font-mono">
                                                {estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}
                                            </div>
                                            {estudio.FOLIO_MERCK && (
                                                <div className="text-sm text-gray-500">Merck: {estudio.FOLIO_MERCK}</div>
                                            )}
                                        </td>

                                        {/* Columna 2: Paciente / Institución */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {/* Iniciales del paciente */}
                                                <div className="text-sm font-medium text-gray-900">
                                                    {estudio.MUESTRA_INICIALES || 
                                                     (estudio.paciente ? `${estudio.paciente.USUARIO_NOMBRE} ${estudio.paciente.USUARIO_APELLIDOS}` : 'N/A')}
                                                </div>
                                                
                                                {/* Médico */}
                                                {estudio.medico && (
                                                    <div className="text-xs text-gray-600">
                                                        Dr. {truncateText(`${estudio.medico.USUARIO_NOMBRE} ${estudio.medico.USUARIO_APELLIDOS}`, 25)}
                                                    </div>
                                                )}
                                                
                                                {/* Institución */}
                                                {estudio.institucion && (
                                                    <div className="text-xs text-gray-500">
                                                        {truncateText(estudio.institucion.INSTITUCION_NOMBRE, 30)}
                                                    </div>
                                                )}
                                                
                                                {/* Cliente */}
                                                {estudio.cliente && (
                                                    <div className="text-xs text-gray-400">
                                                        {truncateText(estudio.cliente.CLIENTE_NOMBRE, 25)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Columna 3: Tipo */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-800 border-blue-200">
                                                {estudio.MUESTRA_TIPO_ESTUDIO || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Columna 4: Estudio Solicitado */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {truncateText(estudio.R_ESTUDIO_SOLICITADO || 'No especificado', 40)}
                                            </div>
                                        </td>

                                        {/* Columna 5: Fecha Solicitud */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(estudio.FECHA_SOLICITUD_RECOLECCION)}
                                        </td>

                                        {/* Columna 6: Progreso con barra */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-full">
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                    <span>{getProgressValue(estudio.ESTUDIO_ESTADO || 'Solicitud Recolección')}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(estudio.ESTUDIO_ESTADO || 'Solicitud Recolección')}`}
                                                        style={{ 
                                                            width: `${getProgressValue(estudio.ESTUDIO_ESTADO || 'Solicitud Recolección')}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {getEstadoLabel(estudio.ESTUDIO_ESTADO || 'Solicitud Recolección')}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Columna 7: Acciones */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {/* Botón de siguiente paso */}
                                                {(() => {
                                                    const nextStep = canContinue(estudio) ? getNextStep(estudio.ESTUDIO_ESTADO) : null;
                                                    return nextStep && (
                                                        <Link href={`/estudios/${estudio.ID}/edit/${nextStep}`}>
                                                            <button 
                                                                className="text-orange-600 hover:text-orange-700 transition-colors"
                                                                title="Siguiente Paso"
                                                            >
                                                                <ArrowRight className="h-5 w-5" />
                                                            </button>
                                                        </Link>
                                                    );
                                                })()}
                                                
                                                <Link
                                                    href={`/estudios/${estudio.ID}`}
                                                    className="text-[#189BAF] hover:text-[#157a8c] transition-colors"
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
                                    {estudios.links.map((link: any, index: number) => (
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