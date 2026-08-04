import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, CheckCircle, Clock, ChevronRight, Filter, X, Ban } from 'lucide-react';
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
    programar_para_formato: string;
    estado: 'pendiente' | 'confirmada' | 'convertida' | 'cancelada';
    creado_por: string;
    created_at: string;
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

function BadgeEstado({ estado }: { estado: SolicitudCliente['estado'] }) {
    if (estado === 'cancelada') return (
        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <Ban className="h-3 w-3" /> Cancelada
        </span>
    );
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
    const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta || '');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const aplicarFiltros = () => {
        router.get('/solicitudes-cliente', {
            estado: estadoFiltro || undefined,
            fecha_desde: fechaDesde || undefined,
            fecha_hasta: fechaHasta || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const limpiarFiltros = () => {
        setEstadoFiltro('');
        setFechaDesde('');
        setFechaHasta('');
        router.get('/solicitudes-cliente', {}, { preserveState: true, preserveScroll: true });
    };

    const hayFiltrosActivos = !!(filtros.estado || filtros.fecha_desde || filtros.fecha_hasta);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitudes de Cliente — DIAHMOES" />

            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-[#189BAF]" />
                            Solicitudes de Cliente
                        </h1>
                        <p className="text-xs text-gray-400">{solicitudes.total} solicitud(es) registrada(s)</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                        <Filter className="h-4 w-4 mr-1.5" /> Filtros
                        {hayFiltrosActivos && <span className="ml-1.5 w-2 h-2 rounded-full bg-[#189BAF]" />}
                    </Button>
                </div>

                {/* Filtros */}
                {mostrarFiltros && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Estado</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
                                        value={estadoFiltro}
                                        onChange={(e) => setEstadoFiltro(e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="confirmada">Confirmada</option>
                                        <option value="cancelada">Cancelada</option>
                                        <option value="convertida">Convertida</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Desde</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
                                        value={fechaDesde}
                                        onChange={(e) => setFechaDesde(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Hasta</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
                                        value={fechaHasta}
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={aplicarFiltros} className="bg-[#189BAF] hover:bg-[#157a8c] text-white flex-1">
                                        Aplicar
                                    </Button>
                                    {hayFiltrosActivos && (
                                        <Button size="sm" variant="outline" onClick={limpiarFiltros}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabla */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Listado</CardTitle>
                        <CardDescription>Haz clic en una fila para ver el detalle y la línea de tiempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {solicitudes.data.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No hay solicitudes registradas.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Folio</th>
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Tipo</th>
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Cant.</th>
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Médico</th>
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Institución</th>
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Programada para</th>
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Estado</th>
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Creada por</th>
                                            <th className="w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solicitudes.data.map((s) => (
                                            <tr
                                                key={s.id}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => router.visit(`/solicitudes-cliente/${s.id}`)}
                                            >
                                                <td className="py-2 px-3 font-mono font-semibold text-[#189BAF] whitespace-nowrap">
                                                    {s.folio_merck || '—'}
                                                </td>
                                                <td className="py-2 px-3 text-xs text-gray-600 whitespace-nowrap">{s.tipo_solicitud}</td>
                                                <td className="py-2 px-3 text-xs text-center font-semibold">{s.cantidad}</td>
                                                <td className="py-2 px-3 text-xs whitespace-nowrap">{s.medico}</td>
                                                <td className="py-2 px-3 text-xs whitespace-nowrap">{s.institucion}</td>
                                                <td className="py-2 px-3 text-xs whitespace-nowrap">{s.programar_para_formato || '—'}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">
                                                    <BadgeEstado estado={s.estado} />
                                                </td>
                                                <td className="py-2 px-3 text-xs text-gray-400 whitespace-nowrap">{s.creado_por}</td>
                                                <td className="py-2 px-3 text-gray-300">
                                                    <ChevronRight className="h-4 w-4" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Paginación simple */}
                        {solicitudes.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {Array.from({ length: solicitudes.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={page === solicitudes.current_page ? 'default' : 'outline'}
                                        className={page === solicitudes.current_page ? 'bg-[#189BAF] hover:bg-[#157a8c] text-white' : ''}
                                        onClick={() => router.get('/solicitudes-cliente', { ...filtros, page }, { preserveState: true, preserveScroll: true })}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}