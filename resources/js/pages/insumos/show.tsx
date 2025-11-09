import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Package, Plus, AlertTriangle, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Lote {
    ID: number;
    LOTE: string;
    FECHA_CADUCIDAD: string;
    CANTIDAD_INICIAL: number;
    CANTIDAD_ACTUAL: number;
    COSTO_UNITARIO: number | null;
    ESTADO: string;
    created_at: string;
}

interface Insumo {
    ID: number;
    NOMBRE: string;
    DESCRIPCION: string | null;
    UNIDAD_MEDIDA: string;
    STOCK_MINIMO: number;
    ESTADO: string;
    stock_total: number;
    stock_bajo: boolean;
    created_at: string;
    updated_at: string;
    lotes?: Lote[];
}

interface ShowInsumoProps {
    insumo: Insumo;
    unidadesMedida: Record<string, string>;
    [key: string]: any;
}



export default function ShowInsumo() {
    const { insumo, unidadesMedida } = usePage<ShowInsumoProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Insumos', href: '/insumos' },
        { title: insumo.NOMBRE, href: `/insumos/${insumo.ID}` },
    ];

    // Función helper para obtener la unidad de medida
    const getUnidadMedida = (unidad: string) => {
        return unidadesMedida?.[unidad] || unidad || 'N/A';
    };

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

    const getTotalCosto = () => {
        if (!insumo.lotes) return 0;
        return insumo.lotes.reduce((total, lote) => {
            return total + (lote.CANTIDAD_ACTUAL * (lote.COSTO_UNITARIO || 0));
        }, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${insumo.NOMBRE} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-[#189BAF] flex-shrink-0" />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    {insumo.NOMBRE}
                                </h1>
                                {insumo.DESCRIPCION && (
                                    <p className="text-sm text-gray-600 mt-1">{insumo.DESCRIPCION}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Link href="/insumos">
                                <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver
                                </Button>
                            </Link>
                            <Link href={`/insumos/${insumo.ID}/edit`}>
                                <Button className="bg-[#D68B41] hover:bg-[#b8763a] text-white">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Información General */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stock Actual */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Stock Actual</h3>
                            {insumo.stock_bajo ? (
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                        <div className={`text-3xl font-bold ${insumo.stock_bajo ? 'text-red-600' : 'text-green-600'}`}>
                            {insumo.stock_total}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{getUnidadMedida(insumo.UNIDAD_MEDIDA)}</p>
                        {insumo.stock_bajo && (
                            <div className="mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                ⚠️ Stock bajo
                            </div>
                        )}
                    </div>

                    {/* Stock Mínimo */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Stock Mínimo</h3>
                            <TrendingDown className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {insumo.STOCK_MINIMO}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{getUnidadMedida(insumo.UNIDAD_MEDIDA)}</p>
                    </div>

                    {/* Lotes Activos */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Lotes Disponibles</h3>
                            <Package className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                            {insumo.lotes?.filter(l => l.ESTADO === 'disponible').length || 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">lotes activos</p>
                    </div>

                    {/* Valor Total */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
                            <span className="text-xl">💰</span>
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                            ${getTotalCosto().toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">inventario actual</p>
                    </div>
                </div>

                {/* Detalles del Insumo */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Detalles del Insumo</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Unidad de Medida</label>
                            <p className="text-base text-gray-900 mt-1">
                                {getUnidadMedida(insumo.UNIDAD_MEDIDA)}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Estado</label>
                            <p className="mt-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                    insumo.ESTADO === 'activo'
                                        ? 'bg-green-50 text-green-800 border-green-200'
                                        : 'bg-gray-50 text-gray-800 border-gray-200'
                                }`}>
                                    {insumo.ESTADO === 'activo' ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                            <p className="text-base text-gray-900 mt-1">
                                {formatearFecha(insumo.created_at)}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Última Actualización</label>
                            <p className="text-base text-gray-900 mt-1">
                                {formatearFecha(insumo.updated_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lotes del Insumo */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Lotes del Insumo</h3>
                        <Link href={`/insumos/${insumo.ID}/lotes/create`}>
                            <Button className="bg-[#189BAF] hover:bg-[#157a8c] text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Lote
                            </Button>
                        </Link>
                    </div>

                    {!insumo.lotes || insumo.lotes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hay lotes registrados para este insumo</p>
                            <Link href={`/insumos/${insumo.ID}/lotes/create`}>
                                <Button className="mt-4 bg-[#189BAF] hover:bg-[#157a8c] text-white">
                                    Agregar Primer Lote
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Lote
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Fecha Caducidad
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                            Costo Unit.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {insumo.lotes.map((lote) => (
                                        <tr key={lote.ID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {lote.LOTE}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                    {formatearFecha(lote.FECHA_CADUCIDAD)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {lote.CANTIDAD_ACTUAL} / {lote.CANTIDAD_INICIAL}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm text-gray-900">
                                                    {lote.COSTO_UNITARIO ? `$${lote.COSTO_UNITARIO.toFixed(2)}` : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLoteEstadoClasses(lote.ESTADO)}`}>
                                                    {lote.ESTADO.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/insumos/${insumo.ID}/lotes/${lote.ID}/edit`}
                                                    className="text-[#189BAF] hover:text-[#157a8c]"
                                                >
                                                    Editar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}