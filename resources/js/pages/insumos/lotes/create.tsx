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

interface CreateLoteProps extends SharedData {
    insumo: Insumo;
}

export default function CreateLote() {
    const { insumo } = usePage<CreateLoteProps>().props;
    
    const [formData, setFormData] = useState({
        LOTE: '',
        FECHA_CADUCIDAD: '',
        CANTIDAD_INICIAL: 0,
        COSTO_UNITARIO: '',
        NOTAS: ''
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Insumos', href: '/insumos' },
        { title: insumo.NOMBRE, href: `/insumos/${insumo.ID}` },
        { title: 'Lotes', href: `/insumos/${insumo.ID}/lotes` },
        { title: 'Nuevo Lote', href: `/insumos/${insumo.ID}/lotes/create` },
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
        
        router.post(`/insumos/${insumo.ID}/lotes`, formData, {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Nuevo Lote - ${insumo.NOMBRE} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-[#189BAF] flex-shrink-0" />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    Nuevo Lote
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Insumo: {insumo.NOMBRE}
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
                                    placeholder="Ej: LOT-2024-001"
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Dejar vacío si el insumo no tiene fecha de caducidad
                                </p>
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Esta será la cantidad disponible del lote
                                </p>
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Costo por cada {insumo.UNIDAD_MEDIDA}
                                </p>
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

                        {/* Información adicional */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800 mb-1">📝 Nota importante</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• El lote se creará con estado "Disponible"</li>
                                        <li>• La cantidad actual será igual a la cantidad inicial</li>
                                        <li>• El sistema alertará automáticamente cuando el lote esté próximo a vencer (30 días)</li>
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
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Lote
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