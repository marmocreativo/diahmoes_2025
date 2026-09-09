import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Search, X, Filter, Eye, Edit, Calendar, FileText, TestTube, Microscope,
    Plus, Trash2, Mail, ChevronDown, ChevronUp, Monitor, Smartphone
} from 'lucide-react';
import { EstudioPrvIndexProps } from '@/types/estudios-prv';

export default function EstudiosPrvIndex() {
    const { estudios, filters, estados, instituciones } = usePage<EstudioPrvIndexProps>().props;

    // Estados para el buscador
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(filters?.estado || '');
    const [fechaDesde, setFechaDesde] = useState(filters?.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(filters?.fecha_hasta || '');
    const [institucionId, setInstitucionId] = useState(filters?.institucion_id || '');
    const [muestraTipoEstudio, setMuestraTipoEstudio] = useState(filters?.muestra_tipo_estudio || '');

    // Estado para detectar móvil y alternar vistas
    const [isMobile, setIsMobile] = useState(false);
    const [forceDesktopView, setForceDesktopView] = useState(false);
    const showMobileView = isMobile && !forceDesktopView;
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // SIMPLIFICACIÓN: no incluyo aquí el dropdown de "Funciones de
    // Mantenimiento" (reparar estudios, finalizar antiguos, cambiar
    // destinatario, vincular folios kits) que tiene estudios/index.tsx —
    // son herramientas específicas del flujo de Estudio normal. Si PRV
    // necesita algo equivalente más adelante, lo agregamos.

    // SIMPLIFICACIÓN: sin WhatsAppDialog ni botones de PDF público /
    // impresión — esos dependían de ID_ALEATORIO (ruta pública
    // estudios.pdf.public), que no existe en estudios_prv. Cuando
    // definamos cómo se genera el PDF/reporte de PRV, los agregamos.

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getEstadoClasses = (estado: string | undefined) => {
        switch (estado) {
            case 'Solicitud Recolección':
                return 'bg-orange-50 text-orange-800 border-orange-200';
            case 'Recepción Laboratorio':
                return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case 'Retorno Material':
                return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'Terminado':
                return 'bg-green-50 text-green-800 border-green-200';
            case 'Cancelado':
                return 'bg-gray-50 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    // SIMPLIFICACIÓN: el "siguiente paso" en Estudio normal tenía 3 saltos
    // (recepción → laboratorio → informe) atados a sus propios ESTADO_*.
    // Aquí el flujo PRV son 4 pasos (recolección → recepción → laboratorio
    // → informe), así que mapeo por ESTUDIO_ESTADO de la misma manera:
    // el estado "Solicitud Recolección" ya se creó en el paso 1, así que
    // el siguiente paso lógico desde el listado es recepción.
    const getSiguientePaso = (estado: string | undefined) => {
        switch (estado) {
            case 'Solicitud Recolección':
                return {
                    href: 'recepcion',
                    texto: 'Recepción',
                    icono: <FileText className="h-4 w-4" />,
                };
            case 'Recepción Laboratorio':
                return {
                    href: 'laboratorio',
                    texto: 'Laboratorio',
                    icono: <TestTube className="h-4 w-4" />,
                };
            case 'Retorno Material':
                return {
                    href: 'informe',
                    texto: 'Informe',
                    icono: <Microscope className="h-4 w-4" />,
                };
            case 'Terminado':
            case 'Cancelado':
            default:
                return null;
        }
    };

    const mostrarBotonesEdicion = (estado: string | undefined) => {
        return estado !== 'Terminado' && estado !== 'Cancelado';
    };

    const formatearFecha = (fechaString: string | null) => {
        if (!fechaString || fechaString === '0000-00-00 00:00:00') return 'N/A';
        try {
            const fecha = fechaString.split('T')[0];
            return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                day: '2-digit', month: '2-digit', year: 'numeric',
            });
        } catch {
            return 'Error';
        }
    };

    const handleSearch = () => {
        setIsSearching(true);
        const searchParams: any = {};
        if (searchTerm) searchParams.search = searchTerm;
        if (selectedEstado) searchParams.estado = selectedEstado;
        if (fechaDesde) searchParams.fecha_desde = fechaDesde;
        if (fechaHasta) searchParams.fecha_hasta = fechaHasta;
        if (institucionId) searchParams.institucion_id = institucionId;
        if (muestraTipoEstudio) searchParams.muestra_tipo_estudio = muestraTipoEstudio;

        router.get('/estudios-prv', searchParams, {
            preserveState: true,
            preserveScroll: true,
            replace: false,
            onFinish: () => setIsSearching(false),
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSelectedEstado('');
        setFechaDesde('');
        setFechaHasta('');
        setInstitucionId('');
        setMuestraTipoEstudio('');
        router.get('/estudios-prv', {}, { preserveState: true, preserveScroll: true, replace: false });
    };

    const handlePaginationClick = (url: string) => {
        setIsSearching(true);
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: false,
            replace: false,
            onFinish: () => setIsSearching(false),
        });
    };

    const toggleCardExpansion = (estudioId: number) => {
        const newExpanded = new Set(expandedCards);
        newExpanded.has(estudioId) ? newExpanded.delete(estudioId) : newExpanded.add(estudioId);
        setExpandedCards(newExpanded);
    };

    const handleDeleteEstudio = (estudio: any) => {
        const confirmMessage = `¿Estás seguro de que deseas eliminar el estudio ${estudio.CLAVE_INTERNA}?\n\nEsta acción NO se puede deshacer.`;
        if (window.confirm(confirmMessage)) {
            setDeletingId(estudio.ID);
            router.delete(`/estudios-prv/${estudio.ID}`, {
                onError: () => alert('Error al eliminar el estudio. Por favor, inténtalo de nuevo.'),
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const renderEstadoEnvios = (estadisticas: any, estudio: any) => {
        if (!estadisticas || estadisticas.total === 0) {
            return (
                <div className="text-center text-gray-400">
                    <Mail className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-xs">Sin envíos</div>
                </div>
            );
        }
        return (
            <Link href={`/estudios-prv/${estudio.ID}/edit/informe`} className="text-center block">
                <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-sm font-medium text-blue-600">{estadisticas.total}</span>
                    <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-xs text-gray-500">
                    {estadisticas.total === 1 ? 'correo enviado' : 'correos enviados'}
                </div>
            </Link>
        );
    };

    const MobileEstudioCard = ({ estudio }: { estudio: any }) => {
        const isExpanded = expandedCards.has(estudio.ID);
        const siguientePaso = getSiguientePaso(estudio.ESTUDIO_ESTADO);

        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
                <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="font-mono text-sm font-bold text-gray-900 mb-1">
                                {estudio.CLAVE_INTERNA}
                            </div>
                            {estudio.FOLIO_MERCK && (
                                <div className="text-xs text-gray-500 mb-2">Folio: {estudio.FOLIO_MERCK}</div>
                            )}
                            <div className="text-sm font-medium text-gray-900">
                                {estudio.paciente?.USUARIO_NOMBRE || 'N/A'} {estudio.paciente?.USUARIO_APELLIDOS || ''}
                                <span className="font-bold ml-1">{estudio.MUESTRA_INICIALES || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoClasses(estudio.ESTUDIO_ESTADO)}`}>
                                {estudio.ESTUDIO_ESTADO || 'Sin estado'}
                            </span>
                            <button onClick={() => toggleCardExpansion(estudio.ID)} className="text-gray-500 hover:text-gray-700">
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-800 border-blue-200">
                                {estudio.MUESTRA_TIPO_ESTUDIO || 'N/A'}
                            </span>
                            <div className="text-xs text-gray-500">
                                {formatearFecha(estudio.FECHA_SOLICITUD_RECOLECCION)}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-3">
                                <Link href={`/estudios-prv/${estudio.ID}`} className="text-[#189BAF] hover:text-[#157a8c]" title="Ver estudio">
                                    <Eye className="h-5 w-5" />
                                </Link>
                                {siguientePaso && (
                                    <Link
                                        href={`/estudios-prv/${estudio.ID}/edit/${siguientePaso.href}`}
                                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        {siguientePaso.icono}
                                        <span>{siguientePaso.texto}</span>
                                    </Link>
                                )}
                            </div>
                            <div className="text-xs">
                                {renderEstadoEnvios(estudio.estadisticas_envios, estudio)}
                            </div>
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="space-y-3">
                            {estudio.medico && (
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Médico</div>
                                    <div className="text-sm text-gray-900">
                                        {estudio.medico.USUARIO_NOMBRE} {estudio.medico.USUARIO_APELLIDOS}
                                    </div>
                                </div>
                            )}
                            {estudio.institucion && (
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Institución</div>
                                    <div className="text-sm text-gray-900">{estudio.institucion.INSTITUCION_NOMBRE}</div>
                                </div>
                            )}

                            <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Todas las Acciones</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href={`/estudios-prv/${estudio.ID}`} className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                                        <Eye className="h-4 w-4" /><span>Ver estudio</span>
                                    </Link>
                                    <Link href={`/estudios-prv/${estudio.ID}/edit/recepcion`} className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                                        <FileText className="h-4 w-4" /><span>Recepción</span>
                                    </Link>
                                    <Link href={`/estudios-prv/${estudio.ID}/edit/laboratorio`} className="flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200">
                                        <TestTube className="h-4 w-4" /><span>Laboratorio</span>
                                    </Link>
                                    <Link href={`/estudios-prv/${estudio.ID}/edit/informe`} className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                                        <Microscope className="h-4 w-4" /><span>Informe</span>
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteEstudio(estudio)}
                                        disabled={deletingId === estudio.ID}
                                        className="col-span-2 flex items-center justify-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 disabled:opacity-50"
                                    >
                                        {deletingId === estudio.ID ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const hasActiveFilters = searchTerm || selectedEstado || fechaDesde || fechaHasta || institucionId || muestraTipoEstudio;

    return (
        <AppLayout>
            <Head title="Estudios PRV - DIAHMOES" />

            <div className="flex flex-1 flex-col gap-6 p-6" style={{ height: 'calc(100vh - 64px)', overflow: 'auto' }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Gestión de Estudios PRV</h1>
                            <p className="text-white/80 opacity-90">
                                Administra estudios PRV del sistema DIAHMOES
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isMobile && (
                                <button
                                    onClick={() => setForceDesktopView(!forceDesktopView)}
                                    className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-white font-medium transition-colors"
                                    title={forceDesktopView ? 'Vista móvil' : 'Vista escritorio'}
                                >
                                    {forceDesktopView ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                </button>
                            )}
                            <Link
                                href="/estudios-prv/create"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span className={showMobileView ? 'hidden sm:inline' : ''}>Nuevo Estudio PRV</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* SIMPLIFICACIÓN: sin las 5 tarjetas de estadísticas por
                    tiempos (detenidos recepción/lab/envío), que en Estudio
                    normal dependen de $estadisticas calculado en el
                    controlador. No lo traje aún para PRV — si quieres ese
                    mismo tablero de alertas aquí, lo agregamos después. */}

                {/* Buscador */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className={`flex items-center ${showMobileView ? 'flex-col space-x-0 space-y-4' : 'space-x-4'}`}>
                        <div className={`${showMobileView ? 'w-full' : 'flex-1'} relative`}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Buscar por clave, folio, médico, paciente o institución..."
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                disabled={isSearching}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        <div className={`flex items-center space-x-2 ${showMobileView ? 'w-full justify-between' : ''}`}>
                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="flex items-center space-x-2 px-4 py-3 bg-[#189BAF] text-white rounded-lg hover:bg-[#157a8c] disabled:opacity-50"
                            >
                                <Search className="h-5 w-5" />
                                <span>{isSearching ? 'Buscando...' : 'Buscar'}</span>
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                                    showFilters ? 'border-[#189BAF] bg-[#189BAF]/5 text-[#189BAF]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="h-5 w-5" />
                                <span>Filtros</span>
                            </button>
                            {hasActiveFilters && (
                                <button onClick={clearSearch} className="px-4 py-3 text-gray-600 hover:text-gray-800" title="Limpiar">
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                <select
                                    value={selectedEstado}
                                    onChange={(e) => setSelectedEstado(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                >
                                    <option value="">Estado</option>
                                    {Object.entries(estados || {}).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                <select
                                    value={institucionId}
                                    onChange={(e) => setInstitucionId(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                >
                                    <option value="">Institución</option>
                                    {instituciones?.map((i) => (
                                        <option key={i.ID_INSTITUCION} value={i.ID_INSTITUCION}>{i.INSTITUCION_NOMBRE}</option>
                                    ))}
                                </select>
                                <select
                                    value={muestraTipoEstudio}
                                    onChange={(e) => setMuestraTipoEstudio(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                >
                                    <option value="">Tipo de estudio</option>
                                    <option value="Biopsia Sólida">Biopsia Sólida</option>
                                    <option value="Biopsia Líquida">Biopsia Líquida</option>
                                </select>
                                <input
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                    title="Fecha desde"
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                />
                                <input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                    title="Fecha hasta"
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                />
                            </div>
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    {isSearching ? 'Buscando...' : 'Aplicar Filtros'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resultados */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    {showMobileView ? (
                        <div className="p-4">
                            {estudios?.data?.map((estudio) => (
                                <MobileEstudioCard key={estudio.ID} estudio={estudio} />
                            ))}
                            {(!estudios?.data || estudios.data.length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No se encontraron estudios PRV</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clave / Paciente</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico / Institución</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Estado</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Envíos</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {estudios?.data?.map((estudio) => {
                                        const siguientePaso = getSiguientePaso(estudio.ESTUDIO_ESTADO);
                                        return (
                                            <tr key={estudio.ID} className="hover:bg-gray-50">
                                                <td className="px-3 py-3">
                                                    <div className="space-y-1">
                                                        <div className="text-lg font-bold text-gray-900 font-mono">{estudio.CLAVE_INTERNA}</div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {estudio.paciente?.USUARIO_NOMBRE || 'N/A'} {estudio.paciente?.USUARIO_APELLIDOS || ''}
                                                            <span className="font-bold ml-1">{estudio.MUESTRA_INICIALES || 'N/A'}</span>
                                                        </div>
                                                        {estudio.FOLIO_MERCK && (
                                                            <div className="text-xs text-gray-500">Folio: {estudio.FOLIO_MERCK}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="space-y-1">
                                                        {estudio.medico && (
                                                            <div className="text-sm text-gray-900">
                                                                {estudio.medico.USUARIO_NOMBRE} {estudio.medico.USUARIO_APELLIDOS}
                                                            </div>
                                                        )}
                                                        {estudio.institucion && (
                                                            <div className="text-xs text-gray-500">
                                                                {estudio.institucion.INSTITUCION_NOMBRE.length > 25
                                                                    ? estudio.institucion.INSTITUCION_NOMBRE.substring(0, 25) + '...'
                                                                    : estudio.institucion.INSTITUCION_NOMBRE}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-800 border-blue-200">
                                                        {estudio.MUESTRA_TIPO_ESTUDIO || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{formatearFecha(estudio.FECHA_SOLICITUD_RECOLECCION)}</span>
                                                        </div>
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getEstadoClasses(estudio.ESTUDIO_ESTADO)}`}>
                                                            {estudio.ESTUDIO_ESTADO || 'Sin estado'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    {renderEstadoEnvios(estudio.estadisticas_envios, estudio)}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-center space-x-1">
                                                            <Link href={`/estudios-prv/${estudio.ID}`} className="text-[#189BAF] hover:text-[#157a8c] p-1" title="Ver estudio">
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                            <Link href={`/estudios-prv/${estudio.ID}/edit/informe`} className="text-blue-600 hover:text-blue-700 p-1" title="Ver / reenviar informe">
                                                                <Mail className="h-4 w-4" />
                                                            </Link>
                                                        </div>
                                                        <div className="flex items-center justify-center space-x-1">
                                                            {siguientePaso ? (
                                                                <Link
                                                                    href={`/estudios-prv/${estudio.ID}/edit/${siguientePaso.href}`}
                                                                    className="inline-flex items-center space-x-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                                    title={`Ir a ${siguientePaso.texto}`}
                                                                >
                                                                    {siguientePaso.icono}
                                                                    <span>{siguientePaso.texto}</span>
                                                                </Link>
                                                            ) : (
                                                                <div className="px-2 py-1 text-xs text-gray-400">Completado</div>
                                                            )}

                                                            {mostrarBotonesEdicion(estudio.ESTUDIO_ESTADO) && (
                                                                <>
                                                                    <div className="relative group">
                                                                        <button className="text-[#D68B41] hover:text-[#b8763a] p-1">
                                                                            <Edit className="h-4 w-4" />
                                                                        </button>
                                                                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                                            <Link href={`/estudios-prv/${estudio.ID}/edit/recoleccion`} className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                                                                <Calendar className="h-3 w-3 mr-2" />1. Recolección
                                                                            </Link>
                                                                            <Link href={`/estudios-prv/${estudio.ID}/edit/recepcion`} className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                                                                <FileText className="h-3 w-3 mr-2" />2. Recepción
                                                                            </Link>
                                                                            <Link href={`/estudios-prv/${estudio.ID}/edit/laboratorio`} className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                                                                <TestTube className="h-3 w-3 mr-2" />3. Laboratorio
                                                                            </Link>
                                                                            <Link href={`/estudios-prv/${estudio.ID}/edit/informe`} className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                                                                <Microscope className="h-3 w-3 mr-2" />4. Informe
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDeleteEstudio(estudio)}
                                                                        disabled={deletingId === estudio.ID}
                                                                        className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1"
                                                                        title="Eliminar estudio"
                                                                    >
                                                                        {deletingId === estudio.ID ? (
                                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                                                        ) : (
                                                                            <Trash2 className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {estudios?.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className={`flex items-center ${showMobileView ? 'flex-col space-y-2' : 'justify-between'}`}>
                                <div className="text-sm text-gray-700">
                                    Mostrando {estudios?.meta?.from || 0} - {estudios?.meta?.to || 0} de {estudios?.meta?.total || 0} resultados
                                </div>
                                <div className={`flex items-center space-x-2 ${showMobileView ? 'flex-wrap justify-center' : ''}`}>
                                    {estudios.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && handlePaginationClick(link.url)}
                                            disabled={!link.url || isSearching}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${showMobileView ? 'text-xs' : ''} ${
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