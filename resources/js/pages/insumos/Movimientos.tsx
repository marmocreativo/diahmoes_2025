import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, TrendingUp, TrendingDown, Filter, RotateCcw, Download, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Insumo {
    ID: number;
    NOMBRE: string;
}

interface Lote {
    ID: number;
    LOTE: string;
}

interface Usuario {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
}

interface Movimiento {
    ID: number;
    ID_INSUMO: number;
    ID_LOTE: number;
    TIPO: 'ingreso' | 'retiro';
    CANTIDAD: number;
    MOTIVO: string;
    ID_ESTUDIO: number | null;
    ID_USUARIO: number | null;
    created_at: string;
    insumo: Insumo | null;
    lote: Lote | null;
    usuario: Usuario | null;
}

interface Paginacion {
    data: Movimiento[];
    links: any[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    from: number;
    to: number;
}

interface MovimientosProps {
    movimientos: Paginacion;
    insumos: Insumo[];
    insumoActivo: Insumo | null;
    loteActivo: (Lote & { ID_INSUMO: number }) | null;
    filtros: {
        fecha_desde: string;
        fecha_hasta: string;
        tipo: string | null;
        id_insumo: string | null;
        id_lote: string | null;
    };
    [key: string]: any;
}

export default function Movimientos() {
    const { movimientos, insumos, insumoActivo, loteActivo, filtros } = usePage<MovimientosProps>().props;

    const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde);
    const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta);
    const [tipo, setTipo] = useState(filtros.tipo || '');
    const [idInsumo, setIdInsumo] = useState(filtros.id_insumo || '');
    const [idLote, setIdLote] = useState(filtros.id_lote || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Insumos', href: '/insumos' },
        { title: 'Movimientos', href: '/insumos/movimientos' },
    ];

    const construirParams = () => {
        const params: any = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        if (tipo)     params.tipo      = tipo;
        if (idInsumo) params.id_insumo = idInsumo;
        if (idLote)   params.id_lote   = idLote;
        return params;
    };

    const aplicarFiltros = () => {
        router.get('/insumos/movimientos', construirParams(), { preserveState: true });
    };

    const limpiarFiltros = () => {
        const hoy       = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const desde     = primerDia.toISOString().split('T')[0];
        const hasta     = hoy.toISOString().split('T')[0];
        setFechaDesde(desde);
        setFechaHasta(hasta);
        setTipo('');
        setIdInsumo('');
        setIdLote('');
        router.get('/insumos/movimientos', { fecha_desde: desde, fecha_hasta: hasta });
    };

    const quitarFiltroLote = () => {
        setIdLote('');
        const params: any = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        if (tipo)     params.tipo      = tipo;
        if (idInsumo) params.id_insumo = idInsumo;
        router.get('/insumos/movimientos', params, { preserveState: true });
    };

    const quitarFiltroInsumo = () => {
        setIdInsumo('');
        setIdLote('');
        const params: any = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        if (tipo) params.tipo = tipo;
        router.get('/insumos/movimientos', params, { preserveState: true });
    };

    const handlePaginacion = (url: string) => {
        router.get(url, {}, { preserveState: true, preserveScroll: false });
    };

    const handleExportar = () => {
        const params = new URLSearchParams(construirParams()).toString();
        window.location.href = `/insumos/exportar/movimientos?${params}`;
    };

    const formatearFechaHora = (fecha: string) => {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-MX', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        }) + ' ' + d.toLocaleTimeString('es-MX', {
            hour: '2-digit', minute: '2-digit',
        });
    };

    const totalIngresos = movimientos.data
        .filter(m => m.TIPO === 'ingreso')
        .reduce((s, m) => s + m.CANTIDAD, 0);

    const totalRetiros = movimientos.data
        .filter(m => m.TIPO === 'retiro')
        .reduce((s, m) => s + m.CANTIDAD, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Movimientos de Inventario - DIAHMOES" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Header */}
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                Movimientos de Inventario
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Historial de ingresos y retiros de todos los lotes
                            </p>

                            {/* Contexto del filtro activo (insumo/lote) */}
                            {(insumoActivo || loteActivo) && (
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    {insumoActivo && (
                                        <span className="inline-flex items-center gap-2 bg-[#189BAF]/10 text-[#157a8c] text-xs font-medium px-3 py-1.5 rounded-full border border-[#189BAF]/30">
                                            Insumo: {insumoActivo.NOMBRE}
                                            <button onClick={quitarFiltroInsumo} title="Quitar filtro">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {loteActivo && (
                                        <span className="inline-flex items-center gap-2 bg-[#D68B41]/10 text-[#b8763a] text-xs font-medium px-3 py-1.5 rounded-full border border-[#D68B41]/30">
                                            Lote: {loteActivo.LOTE}
                                            <button onClick={quitarFiltroLote} title="Quitar filtro">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExportar}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                            >
                                <Download className="h-4 w-4" />
                                Exportar Excel
                            </button>
                            <Link href="/insumos">
                                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                                    <ArrowLeft className="h-4 w-4" />
                                    Volver a Insumos
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={e => setFechaDesde(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={e => setFechaHasta(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                            <select
                                value={tipo}
                                onChange={e => setTipo(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                            >
                                <option value="">Todos</option>
                                <option value="ingreso">Ingreso</option>
                                <option value="retiro">Retiro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Insumo</label>
                            <select
                                value={idInsumo}
                                onChange={e => {
                                    setIdInsumo(e.target.value);
                                    setIdLote(''); // al cambiar de insumo, se limpia el filtro de lote específico
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] min-w-[180px]"
                            >
                                <option value="">Todos los insumos</option>
                                {insumos.map(i => (
                                    <option key={i.ID} value={i.ID}>{i.NOMBRE}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={aplicarFiltros}
                            className="flex items-center gap-2 px-4 py-2 bg-[#189BAF] hover:bg-[#157a8c] text-white rounded-md text-sm"
                        >
                            <Filter className="h-4 w-4" />
                            Consultar
                        </button>
                        <button
                            onClick={limpiarFiltros}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gray-300">
                        <p className="text-xs text-gray-500">Total movimientos</p>
                        <p className="text-2xl font-bold text-gray-800">{movimientos.total}</p>
                        <p className="text-xs text-gray-400">en el período</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                        <p className="text-xs text-gray-500">Unidades ingresadas</p>
                        <p className="text-2xl font-bold text-green-600">{totalIngresos}</p>
                        <p className="text-xs text-gray-400">en esta página</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
                        <p className="text-xs text-gray-500">Unidades retiradas</p>
                        <p className="text-2xl font-bold text-orange-500">{totalRetiros}</p>
                        <p className="text-xs text-gray-400">en esta página</p>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            {movimientos.total} movimientos encontrados
                        </span>
                        <span className="text-xs text-gray-400">
                            Página {movimientos.current_page} de {movimientos.last_page}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudio</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {movimientos.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                                            No hay movimientos en el período seleccionado
                                        </td>
                                    </tr>
                                ) : (
                                    movimientos.data.map(mov => (
                                        <tr key={mov.ID} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                                                {formatearFechaHora(mov.created_at)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {mov.TIPO === 'ingreso' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                        <TrendingUp className="h-3 w-3" />
                                                        Ingreso
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                                        <TrendingDown className="h-3 w-3" />
                                                        Retiro
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">
                                                {mov.insumo?.NOMBRE ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-mono text-xs">
                                                {mov.lote?.LOTE ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className={`font-bold ${mov.TIPO === 'ingreso' ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {mov.TIPO === 'ingreso' ? '+' : '-'}{mov.CANTIDAD}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={mov.MOTIVO}>
                                                {mov.MOTIVO}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {mov.ID_ESTUDIO ? (
                                                    <Link
                                                        href={`/estudios/${mov.ID_ESTUDIO}`}
                                                        className="text-[#189BAF] hover:underline text-xs"
                                                    >
                                                        #{mov.ID_ESTUDIO}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                                                {mov.usuario
                                                    ? `${mov.usuario.USUARIO_NOMBRE} ${mov.usuario.USUARIO_APELLIDOS}`
                                                    : '—'
                                                }
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {movimientos.links && movimientos.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Mostrando {movimientos.from ?? 0}–{movimientos.to ?? 0} de {movimientos.total}
                            </span>
                            <div className="flex items-center gap-1">
                                {movimientos.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && handlePaginacion(link.url)}
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
                    )}
                </div>

            </div>
        </AppLayout>
    );
}