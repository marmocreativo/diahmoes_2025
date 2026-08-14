import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Package, AlertTriangle, Calendar, Trash2, PlusCircle, MinusCircle, History } from 'lucide-react';
import { type BreadcrumbItem, SharedData } from '@/types';

interface Insumo {
    ID: number;
    NOMBRE: string;
    DESCRIPCION: string | null;
    UNIDAD_MEDIDA: string;
}

interface Lote {
    ID: number;
    ID_INSUMO: number;
    LOTE: string;
    FECHA_CADUCIDAD: string;
    CANTIDAD_INICIAL: number;
    CANTIDAD_ACTUAL: number;
    COSTO_UNITARIO: number | string | null;
    ESTADO: string;
    NOTAS: string | null;
    created_at: string;
    dias_para_vencer?: number;
}

interface LotesIndexProps extends SharedData {
    insumo: Insumo;
    lotes: Lote[];
}

export default function LotesIndex() {
    const { insumo, lotes } = usePage<LotesIndexProps>().props;
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [modalAgregar, setModalAgregar] = useState<Lote | null>(null);
    const [modalRetirar, setModalRetirar] = useState<Lote | null>(null);
    const [formMovimiento, setFormMovimiento] = useState({ CANTIDAD: 1, MOTIVO: '' });
    const [procesando, setProcesando] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Insumos', href: '/insumos' },
        { title: insumo.NOMBRE, href: `/insumos/${insumo.ID}` },
        { title: 'Lotes', href: `/insumos/${insumo.ID}/lotes` },
    ];

    const formatearFecha = (fecha: string) => {
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

    const getEstadoLabel = (estado: string) => {
        const labels: Record<string, string> = {
            'disponible': 'Disponible',
            'agotado': 'Agotado',
            'proximo_vencer': 'Próximo a Vencer',
            'vencido': 'Vencido'
        };
        return labels[estado] || estado;
    };

    const handleDeleteLote = (lote: Lote) => {
        const confirmMessage = `¿Estás seguro de que deseas eliminar el lote "${lote.LOTE}"?\n\n` +
            `⚠️ ADVERTENCIA: Si este lote fue usado en algún estudio, ese registro de uso también se eliminará. ` +
            `La cantidad NO se devolverá a ningún otro lote.\n\n` +
            `Esta acción NO se puede deshacer.`;
        
        if (window.confirm(confirmMessage)) {
            setDeletingId(lote.ID);
            
            router.delete(`/insumos/${insumo.ID}/lotes/${lote.ID}`, {
                onSuccess: () => {
                    // Éxito
                },
                onError: (errors) => {
                    console.error('Error al eliminar lote:', errors);
                    alert('Error al eliminar el lote. Puede que esté siendo utilizado en estudios.');
                },
                onFinish: () => {
                    setDeletingId(null);
                }
            });
        }
    };

    const abrirModalAgregar = (lote: Lote) => {
        setFormMovimiento({ CANTIDAD: 1, MOTIVO: '' });
        setModalAgregar(lote);
    };

    const abrirModalRetirar = (lote: Lote) => {
        setFormMovimiento({ CANTIDAD: 1, MOTIVO: '' });
        setModalRetirar(lote);
    };

    const cerrarModales = () => {
        setModalAgregar(null);
        setModalRetirar(null);
        setFormMovimiento({ CANTIDAD: 1, MOTIVO: '' });
    };

    const handleAgregarCantidad = () => {
        if (!modalAgregar || procesando) return;
        setProcesando(true);
        router.post(
            `/insumos/${insumo.ID}/lotes/${modalAgregar.ID}/agregar-cantidad`,
            formMovimiento,
            {
                onSuccess: () => cerrarModales(),
                onFinish: () => setProcesando(false),
            }
        );
    };

    const handleRetirarCantidad = () => {
        if (!modalRetirar || procesando) return;
        setProcesando(true);
        router.post(
            `/insumos/${insumo.ID}/lotes/${modalRetirar.ID}/retirar-cantidad`,
            formMovimiento,
            {
                onSuccess: () => cerrarModales(),
                onFinish: () => setProcesando(false),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lotes de ${insumo.NOMBRE} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-[#189BAF] flex-shrink-0" />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    Lotes de {insumo.NOMBRE}
                                </h1>
                                {insumo.DESCRIPCION && (
                                    <p className="text-sm text-gray-600 mt-1">{insumo.DESCRIPCION}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Link href={`/insumos/${insumo.ID}`}>
                                <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver
                                </Button>
                            </Link>
                            <Link href={`/insumos/movimientos?id_insumo=${insumo.ID}`}>
                                <Button variant="outline">
                                    <History className="h-4 w-4 mr-2" />
                                    Ver Movimientos
                                </Button>
                            </Link>
                            <Link href={`/insumos/${insumo.ID}/lotes/create`}>
                                <Button className="bg-[#189BAF] hover:bg-[#157a8c] text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo Lote
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">Total Lotes</div>
                        <div className="text-2xl font-bold text-gray-900">{lotes.length}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">Disponibles</div>
                        <div className="text-2xl font-bold text-green-600">
                            {lotes.filter(l => l.ESTADO === 'disponible').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">Por Vencer</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {lotes.filter(l => l.ESTADO === 'proximo_vencer').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">Stock Total</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {lotes.reduce((sum, l) => sum + l.CANTIDAD_ACTUAL, 0)}
                        </div>
                    </div>
                </div>

                {/* Lista de lotes */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {lotes.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay lotes registrados
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Comienza agregando el primer lote de este insumo
                            </p>
                            <Link href={`/insumos/${insumo.ID}/lotes/create`}>
                                <Button className="bg-[#189BAF] hover:bg-[#157a8c] text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Primer Lote
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Número de Lote
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha Caducidad
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Costo Unit.
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
                                    {lotes.map((lote) => (
                                        <tr key={lote.ID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {lote.LOTE}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Creado: {formatearFecha(lote.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm text-gray-900">
                                                            {formatearFecha(lote.FECHA_CADUCIDAD)}
                                                        </div>
                                                        {lote.dias_para_vencer !== undefined && lote.dias_para_vencer > 0 && (
                                                            <div className="text-xs text-gray-500">
                                                                {lote.dias_para_vencer} días restantes
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {lote.CANTIDAD_ACTUAL}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        de {lote.CANTIDAD_INICIAL} {insumo.UNIDAD_MEDIDA}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm text-gray-900">
                                                    {lote.COSTO_UNITARIO ? (
                                                        <>
                                                            <div className="font-medium">
                                                                ${Number(lote.COSTO_UNITARIO).toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Total: ${(Number(lote.COSTO_UNITARIO) * lote.CANTIDAD_ACTUAL).toFixed(2)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getLoteEstadoClasses(lote.ESTADO)}`}>
                                                    {lote.ESTADO === 'proximo_vencer' && (
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                    )}
                                                    {getEstadoLabel(lote.ESTADO)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={`/insumos/movimientos?id_insumo=${insumo.ID}&id_lote=${lote.ID}`}
                                                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                                        title="Ver movimientos de este lote"
                                                    >
                                                        <History className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => abrirModalAgregar(lote)}
                                                        className="text-green-600 hover:text-green-800 transition-colors"
                                                        title="Agregar cantidad"
                                                    >
                                                        <PlusCircle className="h-5 w-5" />
                                                    </button>

                                                    <button
                                                        onClick={() => abrirModalRetirar(lote)}
                                                        disabled={lote.CANTIDAD_ACTUAL <= 0}
                                                        className="text-orange-500 hover:text-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title="Retirar cantidad"
                                                    >
                                                        <MinusCircle className="h-5 w-5" />
                                                    </button>
                                                    <Link
                                                        href={`/insumos/${insumo.ID}/lotes/${lote.ID}/edit`}
                                                        className="text-[#D68B41] hover:text-[#b8763a] transition-colors"
                                                        title="Editar lote"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Link>
                                                    
                                                    <button
                                                        onClick={() => handleDeleteLote(lote)}
                                                        disabled={deletingId === lote.ID}
                                                        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Eliminar lote"
                                                    >
                                                        {deletingId === lote.ID ? (
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
                    )}
                </div>
            </div>
            {/* Modal Agregar Cantidad */}
            {modalAgregar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Agregar Cantidad</h2>
                        <p className="text-sm text-gray-500 mb-4">Lote: <span className="font-medium text-gray-700">{modalAgregar.LOTE}</span></p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad a agregar *
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={formMovimiento.CANTIDAD}
                                    onChange={e => setFormMovimiento(p => ({ ...p, CANTIDAD: parseInt(e.target.value) || 1 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                                <p className="text-xs text-gray-400 mt-1">Stock actual: {modalAgregar.CANTIDAD_ACTUAL} {insumo.UNIDAD_MEDIDA}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Motivo *
                                </label>
                                <textarea
                                    rows={3}
                                    value={formMovimiento.MOTIVO}
                                    onChange={e => setFormMovimiento(p => ({ ...p, MOTIVO: e.target.value }))}
                                    placeholder="Ej: Reposición de inventario, compra nueva..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={cerrarModales}
                                disabled={procesando}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAgregarCantidad}
                                disabled={procesando || !formMovimiento.MOTIVO.trim() || formMovimiento.CANTIDAD < 1}
                                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {procesando && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                                Confirmar Ingreso
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Retirar Cantidad */}
            {modalRetirar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Retirar Cantidad</h2>
                        <p className="text-sm text-gray-500 mb-4">Lote: <span className="font-medium text-gray-700">{modalRetirar.LOTE}</span></p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad a retirar *
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={modalRetirar.CANTIDAD_ACTUAL}
                                    value={formMovimiento.CANTIDAD}
                                    onChange={e => setFormMovimiento(p => ({ ...p, CANTIDAD: parseInt(e.target.value) || 1 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                                <p className="text-xs text-gray-400 mt-1">Máximo disponible: {modalRetirar.CANTIDAD_ACTUAL} {insumo.UNIDAD_MEDIDA}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Motivo *
                                </label>
                                <textarea
                                    rows={3}
                                    value={formMovimiento.MOTIVO}
                                    onChange={e => setFormMovimiento(p => ({ ...p, MOTIVO: e.target.value }))}
                                    placeholder="Ej: Ajuste de inventario, material dañado..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={cerrarModales}
                                disabled={procesando}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRetirarCantidad}
                                disabled={procesando || !formMovimiento.MOTIVO.trim() || formMovimiento.CANTIDAD < 1 || formMovimiento.CANTIDAD > modalRetirar.CANTIDAD_ACTUAL}
                                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {procesando && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                                Confirmar Retiro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}