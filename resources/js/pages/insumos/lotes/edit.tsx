import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Package, AlertTriangle } from 'lucide-react';
import { type BreadcrumbItem, SharedData } from '@/types';

interface Insumo {
    ID: number;
    NOMBRE: string;
    DESCRIPCION: string | null;
    UNIDAD_MEDIDA: string;
}

interface Lote {
    ID: number;
    LOTE: string;
    FECHA_CADUCIDAD: string | null;
    CANTIDAD_INICIAL: number;
    CANTIDAD_ACTUAL: number;
    COSTO_UNITARIO: number | null;
    ESTADO: string;
    NOTAS: string | null;
}

interface EditLoteProps extends SharedData {
    insumo: Insumo;
    lote: Lote;
}

export default function EditLote() {
    const { insumo, lote } = usePage<EditLoteProps>().props;
    
    const [formData, setFormData] = useState({
        LOTE: lote.LOTE,
        FECHA_CADUCIDAD: lote.FECHA_CADUCIDAD ? lote.FECHA_CADUCIDAD.split('T')[0] : '', // Formato YYYY-MM-DD
        CANTIDAD_INICIAL: lote.CANTIDAD_INICIAL,
        COSTO_UNITARIO: lote.COSTO_UNITARIO?.toString() || '',
        NOTAS: lote.NOTAS || ''
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Insumos', href: '/insumos' },
        { title: insumo.NOMBRE, href: `/insumos/${insumo.ID}` },
        { title: 'Lotes', href: `/insumos/${insumo.ID}/lotes` },
        { title: `Editar ${lote.LOTE}`, href: `/insumos/${insumo.ID}/lotes/${lote.ID}/edit` },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'CANTIDAD_INICIAL' ? parseInt(value) || 0 : value
        }));
        
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (processing) return;
        
        setProcessing(true);
        setErrors({});
        
        router.patch(`/insumos/${insumo.ID}/lotes/${lote.ID}`, formData, {
            onSuccess: () => {
                // Redirigirá automáticamente
            },
            onError: (serverErrors) => {
                setErrors(serverErrors as Record<string, string>);
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    // Calcular fecha mínima (hoy)
    const today = new Date().toISOString().split('T')[0];

    // Calcular diferencia de cantidad
    const diferenciaStock = formData.CANTIDAD_INICIAL - lote.CANTIDAD_INICIAL;
    const mostrarAdvertenciaStock = diferenciaStock < 0 && Math.abs(diferenciaStock) > lote.CANTIDAD_ACTUAL;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${lote.LOTE} - ${insumo.NOMBRE} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-[#189BAF] flex-shrink-0" />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    Editar Lote
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {lote.LOTE} - {insumo.NOMBRE}
                                </p>
                            </div>
                        </div>
                        
                        <Link href={`/insumos/${insumo.ID}/lotes`}>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a Lotes
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Info actual del lote */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">Estado Actual del Lote</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-xs text-blue-700 mb-1">Cantidad Actual</div>
                            <div className="text-lg font-bold text-blue-900">
                                {lote.CANTIDAD_ACTUAL} {insumo.UNIDAD_MEDIDA}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-blue-700 mb-1">Cantidad Inicial Original</div>
                            <div className="text-lg font-bold text-blue-900">
                                {lote.CANTIDAD_INICIAL} {insumo.UNIDAD_MEDIDA}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-blue-700 mb-1">Estado</div>
                            <div className="text-sm font-medium text-blue-900">
                                {lote.ESTADO === 'disponible' && '✅ Disponible'}
                                {lote.ESTADO === 'agotado' && '❌ Agotado'}
                                {lote.ESTADO === 'proximo_vencer' && '⚠️ Próximo a Vencer'}
                                {lote.ESTADO === 'vencido' && '🚫 Vencido'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-blue-700 mb-1">Consumido</div>
                            <div className="text-lg font-bold text-blue-900">
                                {lote.CANTIDAD_INICIAL - lote.CANTIDAD_ACTUAL} {insumo.UNIDAD_MEDIDA}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-6">Información del Lote</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Número de Lote */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número de Lote *
                                </label>
                                <input
                                    type="text"
                                    name="LOTE"
                                    value={formData.LOTE}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${
                                        errors.LOTE ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.LOTE && (
                                    <p className="text-red-500 text-sm mt-1">{errors.LOTE}</p>
                                )}
                            </div>

                            {/* Fecha de Caducidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Caducidad (Opcional)
                                </label>
                                <input
                                    type="date"
                                    name="FECHA_CADUCIDAD"
                                    value={formData.FECHA_CADUCIDAD}
                                    onChange={handleChange}
                                    min={today}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${
                                        errors.FECHA_CADUCIDAD ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.FECHA_CADUCIDAD && (
                                    <p className="text-red-500 text-sm mt-1">{errors.FECHA_CADUCIDAD}</p>
                                )}
                            </div>

                            {/* Cantidad Inicial */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad Inicial * ({insumo.UNIDAD_MEDIDA})
                                </label>
                                <input
                                    type="number"
                                    name="CANTIDAD_INICIAL"
                                    value={formData.CANTIDAD_INICIAL}
                                    onChange={handleChange}
                                    min="1"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${
                                        errors.CANTIDAD_INICIAL ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.CANTIDAD_INICIAL && (
                                    <p className="text-red-500 text-sm mt-1">{errors.CANTIDAD_INICIAL}</p>
                                )}
                                {diferenciaStock !== 0 && (
                                    <p className={`text-xs mt-1 ${diferenciaStock > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                        {diferenciaStock > 0 ? '↑' : '↓'} Diferencia: {Math.abs(diferenciaStock)} {insumo.UNIDAD_MEDIDA}
                                    </p>
                                )}
                            </div>

                            {/* Costo Unitario */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Costo Unitario (Opcional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        name="COSTO_UNITARIO"
                                        value={formData.COSTO_UNITARIO}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className={`w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${
                                            errors.COSTO_UNITARIO ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.COSTO_UNITARIO && (
                                    <p className="text-red-500 text-sm mt-1">{errors.COSTO_UNITARIO}</p>
                                )}
                            </div>

                            {/* Notas */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas (Opcional)
                                </label>
                                <textarea
                                    name="NOTAS"
                                    value={formData.NOTAS}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                    placeholder="Información adicional sobre este lote..."
                                />
                            </div>
                        </div>

                        {/* Advertencias */}
                        {mostrarAdvertenciaStock && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-red-800 mb-1">⚠️ Advertencia</h4>
                                        <p className="text-sm text-red-700">
                                            No puedes reducir la cantidad inicial por debajo de la cantidad actual ({lote.CANTIDAD_ACTUAL} {insumo.UNIDAD_MEDIDA}).
                                            Esto causaría inconsistencias en el inventario.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Información adicional */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800 mb-1">📝 Notas importantes</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• La cantidad actual ({lote.CANTIDAD_ACTUAL} {insumo.UNIDAD_MEDIDA}) no se puede modificar directamente aquí</li>
                                        <li>• Para ajustar el stock actual, usa la función de "Ajustar Cantidad" en la lista de lotes</li>
                                        <li>• Modificar la cantidad inicial solo afecta el registro histórico, no el stock disponible</li>
                                        <li>• El estado del lote se actualiza automáticamente según la fecha de caducidad</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="bg-white rounded-lg p-4 shadow-sm mt-6">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <Link href={`/insumos/${insumo.ID}/lotes`}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    disabled={processing}
                                >
                                    Cancelar
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto bg-[#189BAF] hover:bg-[#157a8c] text-white"
                                disabled={processing || mostrarAdvertenciaStock}
                            >
                                {processing ? (
                                    <>
                                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}