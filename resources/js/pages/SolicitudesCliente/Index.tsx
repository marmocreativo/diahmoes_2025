import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ClipboardList, CheckCircle, Clock, RefreshCw, ChevronRight, ChevronDown,
    X, ExternalLink, Trash2, Pencil, Plus
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface SolicitudCliente {
    id: number;
    folio_merck: string;
    tipo_solicitud: string;
    cantidad: number;
    medico: string;
    institucion: string;
    solicita: string;
    preguntar_por: string;
    telefono: string;
    celular: string;
    programar_para: string;
    programar_para_formato: string;
    horario: string;
    dirigirse_a: string;
    muestra_calle: string;
    muestra_numero_ext: string;
    muestra_numero_int: string;
    muestra_colonia: string;
    muestra_municipio: string;
    muestra_estado: string;
    muestra_codigo_postal: string;
    email_guia: string;
    email_resultados: string;
    kam: string;
    pal: string;
    estado: 'pendiente' | 'confirmada' | 'convertida';
    estudios_generados: number[] | null;
    notas: string;
    creado_por: string;
    created_at: string;
}

interface PreviewEstudio {
    numero: number;
    incluir: boolean;
    clave_interna: string;
    folio_merck: string;
    tipo_solicitud: string;
    tipo_estudio: string;
    id_medico: number | null;
    medico_nombre: string;
    id_institucion: number | null;
    institucion_nombre: string;
    muestra_calle: string;
    muestra_numero_ext: string;
    muestra_numero_int: string;
    muestra_colonia: string;
    muestra_municipio: string;
    muestra_estado: string;
    muestra_codigo_postal: string;
    muestra_horarios: string;
    correo_copia: string;
}

interface MedicoOption {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
    PREFIJO: string;
}

interface InstitucionOption {
    ID_INSTITUCION: number;
    INSTITUCION_NOMBRE: string;
}

interface PageProps {
    solicitudes: {
        data: SolicitudCliente[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filtros: {
        estado: string;
        fecha_desde: string;
        fecha_hasta: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Solicitudes de Cliente', href: '/solicitudes-cliente' },
];

const ESTADOS_MX = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México', 'Durango', 'Estado de México',
    'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

function BadgeEstado({ estado }: { estado: SolicitudCliente['estado'] }) {
    if (estado === 'convertida') return (
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3" /> Convertida
        </span>
    );
    if (estado === 'confirmada') return (
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3" /> Confirmada
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3" /> Pendiente
        </span>
    );
}

export default function SolicitudesClienteIndex() {
    const { solicitudes, filtros } = usePage<PageProps & Record<string, any>>().props;

    const [estadoFiltro, setEstadoFiltro] = useState(filtros.estado || '');
    const [fechaDesde, setFechaDesde]     = useState(filtros.fecha_desde || '');
    const [fechaHasta, setFechaHasta]     = useState(filtros.fecha_hasta || '');

    // Panel de preview
    const [previewSolicitud, setPreviewSolicitud] = useState<SolicitudCliente | null>(null);
    const [previews, setPreviews]                 = useState<PreviewEstudio[]>([]);
    const [medicos, setMedicos]                   = useState<MedicoOption[]>([]);
    const [instituciones, setInstituciones]       = useState<InstitucionOption[]>([]);
    const [cargandoPreview, setCargandoPreview]   = useState(false);
    const [convirtiendo, setConvirtiendo]         = useState(false);
    const [mensajeConversion, setMensajeConversion] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
    const [expandido, setExpandido]               = useState<number | null>(null);

    // -----------------------------------------------------------------------
    // Filtros
    // -----------------------------------------------------------------------

    const aplicarFiltros = () => {
        const params: any = {};
        if (estadoFiltro) params.estado      = estadoFiltro;
        if (fechaDesde)   params.fecha_desde = fechaDesde;
        if (fechaHasta)   params.fecha_hasta = fechaHasta;
        router.get('/solicitudes-cliente', params, { preserveState: true });
    };

    const limpiarFiltros = () => {
        setEstadoFiltro('');
        setFechaDesde('');
        setFechaHasta('');
        router.get('/solicitudes-cliente');
    };

    const handleConfirmar = (id: number) => {
        router.post(`/solicitudes-cliente/${id}/confirmar`, {}, {
            preserveScroll: true,
        });
    };

    // -----------------------------------------------------------------------
    // Preview
    // -----------------------------------------------------------------------

    const handlePreview = async (solicitud: SolicitudCliente) => {
        setPreviewSolicitud(solicitud);
        setPreviews([]);
        setMensajeConversion(null);
        setExpandido(null);
        setCargandoPreview(true);

        try {
            const res  = await fetch(`/solicitudes-cliente/${solicitud.id}/preview`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            if (data.previews) setPreviews(data.previews);
            if (data.medicos) setMedicos(data.medicos);
            if (data.instituciones) setInstituciones(data.instituciones);
        } catch {
            setMensajeConversion({ tipo: 'error', texto: 'Error al cargar la previsualización.' });
        } finally {
            setCargandoPreview(false);
        }
    };

    const cerrarPreview = () => {
        setPreviewSolicitud(null);
        setPreviews([]);
        setExpandido(null);
        setMensajeConversion(null);
    };

    const actualizarCampo = (numero: number, campo: keyof PreviewEstudio, valor: any) => {
        setPreviews(prev => prev.map(p => p.numero === numero ? { ...p, [campo]: valor } : p));
    };

    const eliminarPreview = (numero: number) => {
        setPreviews(prev => prev.map(p => p.numero === numero ? { ...p, incluir: false } : p));
        if (expandido === numero) setExpandido(null);
    };

    const restaurarPreview = (numero: number) => {
        setPreviews(prev => prev.map(p => p.numero === numero ? { ...p, incluir: true } : p));
    };

    const agregarPreview = () => {
        const siguienteNumero = previews.length > 0
            ? Math.max(...previews.map(p => p.numero)) + 1
            : 1;

        const nuevo: PreviewEstudio = {
            numero: siguienteNumero,
            incluir: true,
            clave_interna: 'Se asigna al convertir',
            folio_merck: previewSolicitud?.folio_merck || '',
            tipo_solicitud: previewSolicitud?.tipo_solicitud || '',
            tipo_estudio: '',
            id_medico: null,
            medico_nombre: '',
            id_institucion: null,
            institucion_nombre: '',
            muestra_calle: '',
            muestra_numero_ext: '',
            muestra_numero_int: '',
            muestra_colonia: '',
            muestra_municipio: '',
            muestra_estado: '',
            muestra_codigo_postal: '',
            muestra_horarios: '',
            correo_copia: previewSolicitud?.email_resultados || '',
        };

        setPreviews(prev => [...prev, nuevo]);
        setExpandido(siguienteNumero);
    };

    const seleccionarMedico = (numero: number, idMedico: string) => {
        const id = idMedico ? parseInt(idMedico) : null;
        const medico = medicos.find(m => m.ID_USUARIO === id);
        const nombre = medico
            ? `${medico.PREFIJO ? medico.PREFIJO + ' ' : ''}${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}`
            : '';
        setPreviews(prev => prev.map(p => p.numero === numero
            ? { ...p, id_medico: id, medico_nombre: nombre }
            : p
        ));
    };

    const seleccionarInstitucion = (numero: number, idInstitucion: string) => {
        const id = idInstitucion ? parseInt(idInstitucion) : null;
        const institucion = instituciones.find(i => i.ID_INSTITUCION === id);
        setPreviews(prev => prev.map(p => p.numero === numero
            ? { ...p, id_institucion: id, institucion_nombre: institucion?.INSTITUCION_NOMBRE || '' }
            : p
        ));
    };

    const handleConvertir = async () => {
        if (!previewSolicitud) return;

        const incluidos = previews.filter(p => p.incluir);
        if (incluidos.length === 0) {
            setMensajeConversion({ tipo: 'error', texto: 'No hay estudios seleccionados para convertir.' });
            return;
        }

        setConvirtiendo(true);
        setMensajeConversion(null);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const res  = await fetch(`/solicitudes-cliente/${previewSolicitud.id}/convertir`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ estudios: incluidos }),
            });
            const data = await res.json();

            if (data.success) {
                setMensajeConversion({ tipo: 'ok', texto: data.mensaje });
                setTimeout(() => {
                    router.reload();
                    cerrarPreview();
                }, 1500);
            } else {
                setMensajeConversion({ tipo: 'error', texto: data.error || 'Error al convertir.' });
            }
        } catch {
            setMensajeConversion({ tipo: 'error', texto: 'Error de conexión.' });
        } finally {
            setConvirtiendo(false);
        }
    };

    const inputClass    = "px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]";
    const inputClassSm  = "w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#189BAF]";
    const labelClassSm  = "block text-xs font-medium text-gray-500 mb-0.5";

    const incluidosCount = previews.filter(p => p.incluir).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitudes de Cliente" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardList className="h-6 w-6 text-[#189BAF]" />
                            Solicitudes de Cliente
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">{solicitudes.total} solicitud(es) en total</p>
                    </div>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                                <select className={inputClass} value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="confirmada">Confirmada</option>
                                    <option value="convertida">Convertida</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                                <input className={inputClass} type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                                <input className={inputClass} type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
                            </div>
                            <Button onClick={aplicarFiltros} className="bg-[#189BAF] hover:bg-[#157a8c] text-white">
                                Filtrar
                            </Button>
                            <Button variant="outline" onClick={limpiarFiltros}>
                                Limpiar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Tabla principal */}
                    <div className={previewSolicitud ? 'lg:col-span-2' : 'lg:col-span-3'}>
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Folio</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Cant.</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Médico</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Institución</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Programada</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Enviada</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {solicitudes.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="text-center py-12 text-gray-400">
                                                        No hay solicitudes con los filtros aplicados.
                                                    </td>
                                                </tr>
                                            ) : solicitudes.data.map((s) => (
                                                <tr
                                                    key={s.id}
                                                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${previewSolicitud?.id === s.id ? 'bg-[#189BAF]/5 border-l-2 border-l-[#189BAF]' : ''}`}
                                                >
                                                    <td className="py-3 px-4 font-mono font-semibold text-[#189BAF] whitespace-nowrap">
                                                        {s.folio_merck || '—'}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{s.tipo_solicitud}</td>
                                                    <td className="py-3 px-4 text-xs text-center font-semibold">{s.cantidad}</td>
                                                    <td className="py-3 px-4 text-xs whitespace-nowrap max-w-[140px] truncate" title={s.medico}>{s.medico}</td>
                                                    <td className="py-3 px-4 text-xs whitespace-nowrap max-w-[140px] truncate" title={s.institucion}>{s.institucion}</td>
                                                    <td className="py-3 px-4 text-xs whitespace-nowrap">{s.programar_para_formato || s.programar_para || '—'}</td>
                                                    <td className="py-3 px-4 whitespace-nowrap"><BadgeEstado estado={s.estado} /></td>
                                                    <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{s.created_at}</td>
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {s.estado === 'pendiente' && (
                                                                <button
                                                                    onClick={() => handleConfirmar(s.id)}
                                                                    className="text-xs px-2 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                                                >
                                                                    Confirmar
                                                                </button>
                                                            )}
                                                            {s.estado !== 'convertida' && (
                                                                <button
                                                                    onClick={() => handlePreview(s)}
                                                                    className="text-xs px-2 py-1 border border-[#189BAF] text-[#189BAF] rounded hover:bg-[#189BAF]/10 transition-colors flex items-center gap-1"
                                                                >
                                                                    Convertir <ChevronRight className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                            {s.estado === 'convertida' && s.estudios_generados && (
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {s.estudios_generados.map(id => (
                                                                        <a
                                                                            key={id}
                                                                            href={`/estudios/${id}`}
                                                                            target="_blank"
                                                                            className="text-xs px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded hover:bg-green-100 flex items-center gap-1"
                                                                        >
                                                                            Ver estudio <ExternalLink className="h-3 w-3" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {solicitudes.last_page > 1 && (
                                    <div className="flex items-center justify-between px-4 py-3 border-t">
                                        <p className="text-xs text-gray-500">
                                            Página {solicitudes.current_page} de {solicitudes.last_page}
                                        </p>
                                        <div className="flex gap-2">
                                            {solicitudes.current_page > 1 && (
                                                <Button variant="outline" size="sm"
                                                    onClick={() => router.get('/solicitudes-cliente', { ...filtros, page: solicitudes.current_page - 1 })}>
                                                    Anterior
                                                </Button>
                                            )}
                                            {solicitudes.current_page < solicitudes.last_page && (
                                                <Button variant="outline" size="sm"
                                                    onClick={() => router.get('/solicitudes-cliente', { ...filtros, page: solicitudes.current_page + 1 })}>
                                                    Siguiente
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel de Preview */}
                    {previewSolicitud && (
                        <div className="lg:col-span-1">
                            <Card className="border-2 border-[#189BAF]/30 sticky top-6">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base text-[#189BAF]">
                                            Previsualización
                                        </CardTitle>
                                        <button onClick={cerrarPreview} className="text-gray-400 hover:text-gray-600">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <CardDescription>
                                        Folio {previewSolicitud.folio_merck || '—'} · {incluidosCount} de {previews.length} estudio(s) a crear
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4 max-h-[75vh] overflow-y-auto">

                                    {/* Estudios a generar */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 mb-2">Estudios que se crearán:</p>

                                        {cargandoPreview ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 py-4 justify-center">
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Calculando...
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {previews.map((p) => (
                                                    <div
                                                        key={p.numero}
                                                        className={`border rounded-lg overflow-hidden transition-opacity ${
                                                            p.incluir ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'
                                                        }`}
                                                    >
                                                        {/* Header de la card */}
                                                        <div className="flex items-center justify-between p-3">
                                                            <button
                                                                onClick={() => p.incluir && setExpandido(expandido === p.numero ? null : p.numero)}
                                                                className="flex items-center gap-2 flex-1 text-left"
                                                                disabled={!p.incluir}
                                                            >
                                                                {p.incluir ? (
                                                                    <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${expandido === p.numero ? 'rotate-180' : ''}`} />
                                                                ) : (
                                                                    <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                                                                )}
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500">Estudio {p.numero}</span>
                                                                        <span className={`font-mono font-bold text-sm ${p.clave_interna === 'Se asigna al convertir' ? 'text-gray-400 italic text-xs' : 'text-[#189BAF]'}`}>
                                                                            {p.clave_interna}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500">{p.tipo_estudio || 'Sin tipo de estudio'}</p>
                                                                </div>
                                                            </button>

                                                            <div className="flex items-center gap-1">
                                                                {!expandido && p.incluir && (
                                                                    <Pencil className="h-3 w-3 text-gray-300" />
                                                                )}
                                                                {p.incluir ? (
                                                                    <button
                                                                        onClick={() => eliminarPreview(p.numero)}
                                                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                        title="Quitar de esta conversión"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => restaurarPreview(p.numero)}
                                                                        className="text-xs px-2 py-1 text-[#189BAF] hover:underline"
                                                                    >
                                                                        Restaurar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Resumen no expandido */}
                                                        {p.incluir && expandido !== p.numero && (
                                                            <div className="px-3 pb-3 -mt-1 space-y-0.5">
                                                                {p.medico_nombre && (
                                                                    <p className="text-xs text-gray-500 truncate">👨‍⚕️ {p.medico_nombre}</p>
                                                                )}
                                                                {p.institucion_nombre && (
                                                                    <p className="text-xs text-gray-500 truncate">🏥 {p.institucion_nombre}</p>
                                                                )}
                                                                {p.muestra_calle && (
                                                                    <p className="text-xs text-gray-400 truncate">
                                                                        📍 {[p.muestra_calle, p.muestra_numero_ext, p.muestra_colonia, p.muestra_municipio, p.muestra_estado].filter(Boolean).join(', ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Panel expandido editable */}
                                                        {p.incluir && expandido === p.numero && (
                                                            <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-100">

                                                                <div>
                                                                    <label className={labelClassSm}>Folio</label>
                                                                    <input
                                                                        className={inputClassSm}
                                                                        value={p.folio_merck || ''}
                                                                        onChange={e => actualizarCampo(p.numero, 'folio_merck', e.target.value)}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className={labelClassSm}>Tipo de estudio</label>
                                                                    <select
                                                                        className={inputClassSm}
                                                                        value={p.tipo_estudio || ''}
                                                                        onChange={e => actualizarCampo(p.numero, 'tipo_estudio', e.target.value)}
                                                                    >
                                                                        <option value="">Selecciona</option>
                                                                        <option value="Biopsia Sólida">Biopsia Sólida</option>
                                                                        <option value="Biopsia Líquida">Biopsia Líquida</option>
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className={labelClassSm}>Médico</label>
                                                                    <select
                                                                        className={inputClassSm}
                                                                        value={p.id_medico ?? ''}
                                                                        onChange={e => seleccionarMedico(p.numero, e.target.value)}
                                                                    >
                                                                        <option value="">Sin médico</option>
                                                                        {medicos.map(m => (
                                                                            <option key={m.ID_USUARIO} value={m.ID_USUARIO}>
                                                                                {m.PREFIJO ? m.PREFIJO + ' ' : ''}{m.USUARIO_NOMBRE} {m.USUARIO_APELLIDOS}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className={labelClassSm}>Institución</label>
                                                                    <select
                                                                        className={inputClassSm}
                                                                        value={p.id_institucion ?? ''}
                                                                        onChange={e => seleccionarInstitucion(p.numero, e.target.value)}
                                                                    >
                                                                        <option value="">Sin institución</option>
                                                                        {instituciones.map(i => (
                                                                            <option key={i.ID_INSTITUCION} value={i.ID_INSTITUCION}>
                                                                                {i.INSTITUCION_NOMBRE}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide pt-1">Dirección de recolección</p>

                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div className="col-span-2">
                                                                        <label className={labelClassSm}>Calle</label>
                                                                        <input
                                                                            className={inputClassSm}
                                                                            value={p.muestra_calle || ''}
                                                                            onChange={e => actualizarCampo(p.numero, 'muestra_calle', e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className={labelClassSm}>Núm. Ext.</label>
                                                                        <input
                                                                            className={inputClassSm}
                                                                            value={p.muestra_numero_ext || ''}
                                                                            onChange={e => actualizarCampo(p.numero, 'muestra_numero_ext', e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className={labelClassSm}>Núm. Int.</label>
                                                                        <input
                                                                            className={inputClassSm}
                                                                            value={p.muestra_numero_int || ''}
                                                                            onChange={e => actualizarCampo(p.numero, 'muestra_numero_int', e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className={labelClassSm}>Colonia</label>
                                                                        <input
                                                                            className={inputClassSm}
                                                                            value={p.muestra_colonia || ''}
                                                                            onChange={e => actualizarCampo(p.numero, 'muestra_colonia', e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className={labelClassSm}>Municipio</label>
                                                                        <input
                                                                            className={inputClassSm}
                                                                            value={p.muestra_municipio || ''}
                                                                            onChange={e => actualizarCampo(p.numero, 'muestra_municipio', e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className={labelClassSm}>C.P.</label>
                                                                        <input
                                                                            className={inputClassSm}
                                                                            value={p.muestra_codigo_postal || ''}
                                                                            onChange={e => actualizarCampo(p.numero, 'muestra_codigo_postal', e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className={labelClassSm}>Estado</label>
                                                                    <select
                                                                        className={inputClassSm}
                                                                        value={p.muestra_estado || ''}
                                                                        onChange={e => actualizarCampo(p.numero, 'muestra_estado', e.target.value)}
                                                                    >
                                                                        <option value="">Selecciona</option>
                                                                        {ESTADOS_MX.map(edo => (
                                                                            <option key={edo} value={edo}>{edo}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className={labelClassSm}>Horario</label>
                                                                    <input
                                                                        className={inputClassSm}
                                                                        value={p.muestra_horarios || ''}
                                                                        onChange={e => actualizarCampo(p.numero, 'muestra_horarios', e.target.value)}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className={labelClassSm}>Correo de copia</label>
                                                                    <input
                                                                        className={inputClassSm}
                                                                        type="email"
                                                                        value={p.correo_copia || ''}
                                                                        onChange={e => actualizarCampo(p.numero, 'correo_copia', e.target.value)}
                                                                    />
                                                                </div>

                                                                <button
                                                                    onClick={() => setExpandido(null)}
                                                                    className="w-full text-xs text-[#189BAF] hover:underline pt-1"
                                                                >
                                                                    Listo, cerrar edición
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {!cargandoPreview && (
                                                    <button
                                                        onClick={agregarPreview}
                                                        className="w-full mt-2 flex items-center justify-center gap-2 text-xs text-[#189BAF] border border-dashed border-[#189BAF]/40 rounded-lg py-2 hover:bg-[#189BAF]/5 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Agregar otro estudio
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Mensaje de resultado */}
                                    {mensajeConversion && (
                                        <div className={`text-xs rounded-lg px-3 py-2 ${
                                            mensajeConversion.tipo === 'ok'
                                                ? 'bg-green-50 border border-green-200 text-green-700'
                                                : 'bg-red-50 border border-red-200 text-red-700'
                                        }`}>
                                            {mensajeConversion.texto}
                                        </div>
                                    )}

                                    {/* Botón convertir */}
                                    {!mensajeConversion && !cargandoPreview && previews.length > 0 && (
                                        <Button
                                            onClick={handleConvertir}
                                            disabled={convirtiendo || incluidosCount === 0}
                                            className="w-full bg-[#D68B41] hover:bg-[#b8722e] text-white"
                                        >
                                            {convirtiendo ? (
                                                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Convirtiendo...</>
                                            ) : (
                                                <><CheckCircle className="h-4 w-4 mr-2" /> Convertir {incluidosCount} estudio(s)</>
                                            )}
                                        </Button>
                                    )}

                                    <p className="text-xs text-gray-400 text-center">
                                        Los datos de recepción deberán llenarse manualmente en cada estudio.
                                    </p>

                                </CardContent>
                            </Card>
                        </div>
                    )}

                </div>
            </div>
        </AppLayout>
    );
}