import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    ArrowLeft, 
    AlertTriangle, 
    Package, 
    FileText, 
    Calendar, 
    DollarSign,
    Trash2,
    X
} from 'lucide-react';

interface Lote {
    ID: number;
    LOTE: string;
    CANTIDAD_INICIAL: number;
    CANTIDAD_ACTUAL: number;
    FECHA_CADUCIDAD: string | null;
    ESTADO: string;
    usos_count: number;
}

interface EstudioReciente {
    ID: number;
    CLAVE_INTERNA: string;
    MUESTRA_INICIALES: string;
    ESTUDIO_ESTADO: string;
}

interface Estadisticas {
    total_lotes: number;
    total_usos_estudios: number;
    estudios_afectados: number;
    estudios_afectados_ids: number[];
    stock_total_actual: number;
    valor_inventario: number;
    tiene_stock_disponible: boolean;
    lotes_por_estado: Record<string, number>;
}

interface Insumo {
    ID: number;
    NOMBRE: string;
    DESCRIPCION: string | null;
    UNIDAD_MEDIDA: string;
    STOCK_MINIMO: number;
    ESTADO: string;
}

interface ConfirmDeleteProps {
    insumo: Insumo;
    estadisticas: Estadisticas;
    lotes: Lote[];
    estudios_recientes: EstudioReciente[];
}

export default function ConfirmDelete({ insumo, estadisticas, lotes, estudios_recientes }: ConfirmDeleteProps) {
    const [eliminando, setEliminando] = useState(false);

    const stats = {
        total_lotes: estadisticas?.total_lotes || 0,
        total_usos_estudios: estadisticas?.total_usos_estudios || 0,
        estudios_afectados: estadisticas?.estudios_afectados || 0,
        estudios_afectados_ids: estadisticas?.estudios_afectados_ids || [],
        stock_total_actual: estadisticas?.stock_total_actual || 0,
        valor_inventario: estadisticas?.valor_inventario || 0,
        tiene_stock_disponible: estadisticas?.tiene_stock_disponible || false,
        lotes_por_estado: estadisticas?.lotes_por_estado || {}
    };

    // Validar arrays
    const lotesValidados = Array.isArray(lotes) ? lotes : [];
    const estudiosValidados = Array.isArray(estudios_recientes) ? estudios_recientes : [];

    const handleConfirmDelete = () => {
        setEliminando(true);
        
        router.delete(`/insumos/${insumo.ID}`, {
            onSuccess: () => {
                // La redirección se maneja automáticamente por el controlador
            },
            onError: (errors) => {
                console.error('Error al eliminar insumo:', errors);
                alert('Error al eliminar el insumo: ' + (errors.delete || 'Error desconocido'));
            },
            onFinish: () => {
                setEliminando(false);
            }
        });
    };

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getEstadoClasses = (estado: string) => {
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

    return (
        <AppLayout>
            <Head title={`Confirmar eliminación - ${insumo.NOMBRE} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con advertencia */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-4">
                        <AlertTriangle className="h-12 w-12 text-white" />
                        <div>
                            <h1 className="text-3xl font-bold mb-2">⚠️ Confirmar eliminación</h1>
                            <p className="text-white/90">
                                Estás a punto de eliminar permanentemente el insumo <strong>"{insumo.NOMBRE}"</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información del insumo */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <Package className="h-8 w-8 text-[#189BAF]" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{insumo.NOMBRE}</h2>
                            <p className="text-gray-600">{insumo.DESCRIPCION || 'Sin descripción'}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                                    {insumo.UNIDAD_MEDIDA}
                                </span>
                                <span className="text-sm text-gray-600">
                                    Stock mínimo: {insumo.STOCK_MINIMO}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impacto de la eliminación */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        Impacto de la eliminación
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Lotes */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <Package className="h-6 w-6 text-red-600" />
                                <div>
                                    <div className="text-2xl font-bold text-red-900">
                                        {estadisticas.total_lotes}
                                    </div>
                                    <div className="text-sm text-red-700">
                                        Lote{estadisticas.total_lotes !== 1 ? 's' : ''} a eliminar
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usos en estudios */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <FileText className="h-6 w-6 text-orange-600" />
                                <div>
                                    <div className="text-2xl font-bold text-orange-900">
                                        {estadisticas.total_usos_estudios}
                                    </div>
                                    <div className="text-sm text-orange-700">
                                        Uso{estadisticas.total_usos_estudios !== 1 ? 's' : ''} en estudios
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estudios afectados */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-6 w-6 text-yellow-600" />
                                <div>
                                    <div className="text-2xl font-bold text-yellow-900">
                                        {estadisticas.estudios_afectados}
                                    </div>
                                    <div className="text-sm text-yellow-700">
                                        Estudio{estadisticas.estudios_afectados !== 1 ? 's' : ''} afectado{estadisticas.estudios_afectados !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Valor del inventario */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <DollarSign className="h-6 w-6 text-purple-600" />
                                <div>
                                    <div className="text-2xl font-bold text-purple-900">
                                        ${(estadisticas.valor_inventario || 0).toFixed(2)}
                                    </div>
                                    <div className="text-sm text-purple-700">
                                        Valor del inventario
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advertencias específicas */}
                    <div className="space-y-3">
                        {estadisticas.tiene_stock_disponible && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <span className="text-yellow-800 font-medium">
                                        Este insumo tiene {estadisticas.stock_total_actual} unidades disponibles que se perderán permanentemente.
                                    </span>
                                </div>
                            </div>
                        )}

                        {estadisticas.total_usos_estudios > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    <span className="text-orange-800 font-medium">
                                        Se eliminarán {estadisticas.total_usos_estudios} registros de uso en {estadisticas.estudios_afectados} estudios. 
                                        Esto puede afectar los reportes de costos y trazabilidad.
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <X className="h-5 w-5 text-red-600" />
                                <span className="text-red-800 font-medium">
                                    Esta acción NO se puede deshacer. Todos los datos relacionados se perderán permanentemente.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detalles de lotes */}
                {lotesValidados.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Lotes que serán eliminados ({lotesValidados.length})
                        </h3>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Lote
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Caducidad
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usos
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {lotes.map((lote) => (
                                        <tr key={lote.ID} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {lote.LOTE}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-900">
                                                    {lote.CANTIDAD_ACTUAL} / {lote.CANTIDAD_INICIAL}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-900">
                                                    {formatearFecha(lote.FECHA_CADUCIDAD)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoClasses(lote.ESTADO)}`}>
                                                    {getEstadoLabel(lote.ESTADO)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-900">
                                                    {lote.usos_count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Estudios recientes afectados */}
                {estudiosValidados.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Estudios recientes que usan este insumo (últimos 10)
                        </h3>
                        
                        <div className="space-y-2">
                            {estudios_recientes.map((estudio) => (
                                <div key={estudio.ID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {estudio.CLAVE_INTERNA}
                                        </span>
                                        <span className="text-sm text-gray-600 ml-2">
                                            {estudio.MUESTRA_INICIALES}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {estudio.ESTUDIO_ESTADO}
                                    </span>
                                </div>
                            ))}
                            
                            {estadisticas.estudios_afectados > estudiosValidados.length && (
                                <div className="text-center text-sm text-gray-600 p-2">
                                    ... y {estadisticas.estudios_afectados - estudiosValidados.length} estudios más
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/insumos"
                            className="flex items-center space-x-2 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Cancelar y volver</span>
                        </Link>

                        <button
                            onClick={handleConfirmDelete}
                            disabled={eliminando}
                            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {eliminando ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span>Eliminando...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-5 w-5" />
                                    <span>Confirmar eliminación</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}