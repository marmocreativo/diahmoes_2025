import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, TrendingUp, TrendingDown, Filter, RotateCcw, Download, X, AlertTriangle } from 'lucide-react';
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

interface LoteDescuadre {
    ID_LOTE: number;
    ID_INSUMO: number;
    LOTE: string;
    INSUMO: string;
    diferencia: number;
}

interface ResumenDescuadres {
    total: number;
    lotes: LoteDescuadre[];
}

interface LoteConDetalle {
    ID: number;
    LOTE: string;
    CANTIDAD_ACTUAL: number;
    saldo_calculado: number;
    diferencia_movimientos: number;
    tiene_descuadre: boolean;
}

interface MovimientosProps {
    movimientos: Paginacion;
    insumos: Insumo[];
    insumoActivo: Insumo | null;
    loteActivo: (Lote & { ID_INSUMO: number }) | null;
    resumenDescuadres: ResumenDescuadres;
    filtros: {
        fecha_desde: string;
        fecha_hasta: string;
        tipo: string | null;
        id_insumo: string | null;
        id_lote: string | null;
    };
    [key: string]: any;
}

interface FormularioAjuste {
    ID_INSUMO: string;
    ID_LOTE: string;
    TIPO: 'ingreso' | 'retiro';
    CANTIDAD: number;
    FECHA: string;
    DETALLE: string;
    [key: string]: any;
}

export default function Movimientos() {
    const { movimientos, insumos, insumoActivo, loteActivo, resumenDescuadres, filtros } = usePage<MovimientosProps>().props;

    const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde);
    const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta);
    const [tipo, setTipo] = useState(filtros.tipo || '');
    const [idInsumo, setIdInsumo] = useState(filtros.id_insumo || '');
    const [idLote, setIdLote] = useState(filtros.id_lote || '');

    // --- Estado para el modal de "Ajuste por movimiento faltante" ---
    const [mostrarModalAjuste, setMostrarModalAjuste] = useState(false);
    const [mostrarListaDescuadres, setMostrarListaDescuadres] = useState(false);
    const [lotesDelInsumo, setLotesDelInsumo] = useState<LoteConDetalle[]>([]);
    const [cargandoLotes, setCargandoLotes] = useState(false);
    const [procesandoAjuste, setProcesandoAjuste] = useState(false);
    const [erroresAjuste, setErroresAjuste] = useState<Record<string, string>>({});
    const [formAjuste, setFormAjuste] = useState<FormularioAjuste>({
        ID_INSUMO: '',
        ID_LOTE: '',
        TIPO: 'ingreso',
        CANTIDAD: 1,
        FECHA: new Date().toISOString().split('T')[0],
        DETALLE: '',
    });

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

        const cargarLotesDelInsumo = async (idInsumoSeleccionado: string) => {
        setLotesDelInsumo([]);
        setFormAjuste(prev => ({ ...prev, ID_INSUMO: idInsumoSeleccionado, ID_LOTE: '' }));

        if (!idInsumoSeleccionado) return;

        setCargandoLotes(true);
        try {
            const res = await fetch(`/insumos/${idInsumoSeleccionado}/lotes-detalle`);
            const data = await res.json();
            if (data.success) {
                setLotesDelInsumo(data.lotes);
            }
        } catch (e) {
            console.error('Error cargando lotes:', e);
        } finally {
            setCargandoLotes(false);
        }
    };

    const abrirModalAjuste = (descuadre?: LoteDescuadre) => {
        setErroresAjuste({});
        setFormAjuste({
            ID_INSUMO: descuadre ? String(descuadre.ID_INSUMO) : '',
            ID_LOTE: descuadre ? String(descuadre.ID_LOTE) : '',
            TIPO: descuadre && descuadre.diferencia > 0 ? 'ingreso' : 'retiro',
            CANTIDAD: descuadre ? Math.abs(descuadre.diferencia) : 1,
            FECHA: new Date().toISOString().split('T')[0],
            DETALLE: '',
        });
        setMostrarListaDescuadres(false);
        setMostrarModalAjuste(true);

        if (descuadre) {
            cargarLotesDelInsumo(String(descuadre.ID_INSUMO));
        } else {
            setLotesDelInsumo([]);
        }
    };

    const cerrarModalAjuste = () => {
        setMostrarModalAjuste(false);
        setLotesDelInsumo([]);
        setErroresAjuste({});
    };

    const loteAjusteSeleccionado = lotesDelInsumo.find(l => String(l.ID) === formAjuste.ID_LOTE);

    const motivoPreview = 'Ajuste por movimiento faltante'
        + (formAjuste.DETALLE.trim() ? `: ${formAjuste.DETALLE.trim()}` : '');

    // Previsualización del efecto del ajuste sobre el saldo de movimientos
    const cantidadIngresada = Number(formAjuste.CANTIDAD) || 0;
    const deltaAjuste = formAjuste.TIPO === 'ingreso' ? cantidadIngresada : -cantidadIngresada;

    const saldoAntes = loteAjusteSeleccionado?.saldo_calculado ?? 0;
    const disponibleActual = loteAjusteSeleccionado?.CANTIDAD_ACTUAL ?? 0;
    const diferenciaAntes = loteAjusteSeleccionado?.diferencia_movimientos ?? 0;

    const saldoDespues = saldoAntes + deltaAjuste;
    const diferenciaDespues = disponibleActual - saldoDespues;

    const guardarAjuste = () => {
        setProcesandoAjuste(true);
        setErroresAjuste({});

        router.post('/insumos/movimientos/ajuste', formAjuste, {
            preserveScroll: true,
            onSuccess: () => {
                cerrarModalAjuste();
                router.reload({ only: ['movimientos', 'resumenDescuadres'] });
            },
            onError: (errors) => {
                setErroresAjuste(errors as Record<string, string>);
            },
            onFinish: () => setProcesandoAjuste(false),
        });
    };

    const formularioAjusteValido =
        formAjuste.ID_INSUMO &&
        formAjuste.ID_LOTE &&
        formAjuste.CANTIDAD > 0 &&
        formAjuste.FECHA;

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
                                onClick={() => abrirModalAjuste()}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                Ajuste por movimiento faltante
                            </button>
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

                    {/* Banner de descuadres detectados */}
                    {resumenDescuadres.total > 0 && (
                        <div className="mt-4 border border-red-300 bg-red-50 rounded-lg p-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {resumenDescuadres.total} lote(s) con descuadre entre stock actual y movimientos registrados
                                    </span>
                                </div>
                                <button
                                    onClick={() => setMostrarListaDescuadres(!mostrarListaDescuadres)}
                                    className="text-xs font-medium text-red-700 underline"
                                >
                                    {mostrarListaDescuadres ? 'Ocultar lista' : 'Ver lista'}
                                </button>
                            </div>

                            {mostrarListaDescuadres && (
                                <div className="mt-3 max-h-64 overflow-y-auto divide-y divide-red-100">
                                    {resumenDescuadres.lotes.map(d => (
                                        <div
                                            key={d.ID_LOTE}
                                            className="flex items-center justify-between py-2 text-sm"
                                        >
                                            <div>
                                                <span className="font-medium text-gray-800">{d.INSUMO}</span>
                                                <span className="text-gray-500"> — Lote {d.LOTE}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold ${d.diferencia > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {d.diferencia > 0
                                                        ? `Falta ingresar ${d.diferencia}`
                                                        : `Sobran ${Math.abs(d.diferencia)} en movs.`}
                                                </span>
                                                <button
                                                    onClick={() => abrirModalAjuste(d)}
                                                    className="text-xs bg-[#189BAF] hover:bg-[#157a8c] text-white px-2 py-1 rounded"
                                                >
                                                    Ajustar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
                            {/* Modal: Ajuste por movimiento faltante */}
            {mostrarModalAjuste && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Ajuste por movimiento faltante
                                </h3>
                                <button onClick={cerrarModalAjuste} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Registra un movimiento histórico que nunca quedó guardado. No modifica el stock actual del lote.
                            </p>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Insumo *</label>
                                <select
                                    value={formAjuste.ID_INSUMO}
                                    onChange={(e) => cargarLotesDelInsumo(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${erroresAjuste.ID_INSUMO ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Selecciona un insumo...</option>
                                    {insumos.map(i => (
                                        <option key={i.ID} value={i.ID}>{i.NOMBRE}</option>
                                    ))}
                                </select>
                                {erroresAjuste.ID_INSUMO && <p className="text-red-500 text-sm mt-1">{erroresAjuste.ID_INSUMO}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lote *</label>
                                <select
                                    value={formAjuste.ID_LOTE}
                                    onChange={(e) => setFormAjuste(prev => ({ ...prev, ID_LOTE: e.target.value }))}
                                    disabled={!formAjuste.ID_INSUMO || cargandoLotes}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] disabled:bg-gray-100 ${erroresAjuste.ID_LOTE ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">
                                        {cargandoLotes ? 'Cargando lotes...' : 'Selecciona un lote...'}
                                    </option>
                                    {lotesDelInsumo.map(l => (
                                        <option key={l.ID} value={l.ID}>
                                            {l.LOTE} {l.tiene_descuadre ? `⚠ (diferencia: ${l.diferencia_movimientos > 0 ? '+' : ''}${l.diferencia_movimientos})` : '✓ cuadra'}
                                        </option>
                                    ))}
                                </select>
                                {erroresAjuste.ID_LOTE && <p className="text-red-500 text-sm mt-1">{erroresAjuste.ID_LOTE}</p>}
                            </div>

                            {loteAjusteSeleccionado && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-2 py-2 text-center font-medium text-gray-500">Disponibles<br/>actualmente</th>
                                                <th className="px-2 py-2 text-center font-medium text-gray-500">Cantidad en<br/>movimientos</th>
                                                <th className="px-2 py-2 text-center font-medium text-gray-500">Sobran /<br/>faltan</th>
                                                <th className="px-2 py-2 text-center font-medium text-gray-500 bg-[#189BAF]/10">Movimientos<br/>después del ajuste</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-t border-gray-100">
                                                <td className="px-2 py-2 text-center font-bold text-gray-800">
                                                    {disponibleActual}
                                                </td>
                                                <td className="px-2 py-2 text-center text-gray-700">
                                                    {saldoAntes}
                                                </td>
                                                <td className={`px-2 py-2 text-center font-bold ${diferenciaAntes === 0 ? 'text-green-600' : diferenciaAntes > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {diferenciaAntes === 0
                                                        ? '✓ 0'
                                                        : diferenciaAntes > 0
                                                            ? `Faltan ${diferenciaAntes}`
                                                            : `Sobran ${Math.abs(diferenciaAntes)}`}
                                                </td>
                                                <td className={`px-2 py-2 text-center font-bold bg-[#189BAF]/5 ${diferenciaDespues === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                                                    {saldoDespues}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className={`px-3 py-2 text-xs border-t border-gray-100 ${diferenciaDespues === 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-800'}`}>
                                        {diferenciaDespues === 0
                                            ? '✓ Con este ajuste, el lote quedará perfectamente cuadrado.'
                                            : diferenciaDespues > 0
                                                ? `Después de este ajuste seguirán faltando ${diferenciaDespues} unidades por registrar.`
                                                : `Después de este ajuste sobrarán ${Math.abs(diferenciaDespues)} unidades en movimientos respecto al stock.`}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                    <select
                                        value={formAjuste.TIPO}
                                        onChange={(e) => setFormAjuste(prev => ({ ...prev, TIPO: e.target.value as 'ingreso' | 'retiro' }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    >
                                        <option value="ingreso">Ingreso</option>
                                        <option value="retiro">Retiro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={formAjuste.CANTIDAD}
                                        onChange={(e) => setFormAjuste(prev => ({ ...prev, CANTIDAD: parseInt(e.target.value) || 1 }))}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${erroresAjuste.CANTIDAD ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {erroresAjuste.CANTIDAD && <p className="text-red-500 text-sm mt-1">{erroresAjuste.CANTIDAD}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha real del movimiento *</label>
                                <input
                                    type="date"
                                    value={formAjuste.FECHA}
                                    onChange={(e) => setFormAjuste(prev => ({ ...prev, FECHA: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] ${erroresAjuste.FECHA ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {erroresAjuste.FECHA && <p className="text-red-500 text-sm mt-1">{erroresAjuste.FECHA}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Detalle adicional (opcional)</label>
                                <textarea
                                    rows={2}
                                    value={formAjuste.DETALLE}
                                    onChange={(e) => setFormAjuste(prev => ({ ...prev, DETALLE: e.target.value }))}
                                    placeholder="Ej: ingreso original de compra antes de usar el sistema"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                                <p className="text-xs text-gray-500 mb-1">El motivo que quedará registrado será:</p>
                                <p className="text-sm font-medium text-gray-800">{motivoPreview}</p>
                            </div>

                            {erroresAjuste.error && (
                                <p className="text-red-500 text-sm">{erroresAjuste.error}</p>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cerrarModalAjuste}
                                    disabled={procesandoAjuste}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarAjuste}
                                    disabled={procesandoAjuste || !formularioAjusteValido}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                                >
                                    {procesandoAjuste && (
                                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    )}
                                    {procesandoAjuste ? 'Guardando...' : 'Registrar Ajuste'}
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