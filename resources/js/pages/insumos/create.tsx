import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface CreateInsumoProps {
    unidadesMedida: Record<string, string>;
    [key: string]: any;
}

export default function CreateInsumo() {
    const { unidadesMedida } = usePage<CreateInsumoProps>().props;
    
    const [formData, setFormData] = useState({
        NOMBRE: '',
        DESCRIPCION: '',
        UNIDAD_MEDIDA: '',
        STOCK_MINIMO: 10,
        ESTADO: 'activo'
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Insumos', href: '/insumos' },
        { title: 'Nuevo Insumo', href: '/insumos/create' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'STOCK_MINIMO' ? parseInt(value) || 0 : value
        }));
        
        // Limpiar error del campo
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
        
        router.post('/insumos', formData, {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Insumo - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-[#189BAF] flex-shrink-0" />
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                Nuevo Insumo
                            </h1>
                        </div>
                        
                        <Link href="/insumos">
                            <Button variant="outline" className="w-full sm:w-auto">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a Insumos
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-6">Información del Insumo</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Insumo *
                                </label>
                                <input
                                    type="text"
                                    name="NOMBRE"
                                    value={formData.NOMBRE}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${
                                        errors.NOMBRE ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Ej: Kit de extracción DNA"
                                    required
                                />
                                {errors.NOMBRE && (
                                    <p className="text-red-500 text-sm mt-1">{errors.NOMBRE}</p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    name="DESCRIPCION"
                                    value={formData.DESCRIPCION}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${
                                        errors.DESCRIPCION ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Descripción detallada del insumo..."
                                />
                                {errors.DESCRIPCION && (
                                    <p className="text-red-500 text-sm mt-1">{errors.DESCRIPCION}</p>
                                )}
                            </div>

                            {/* Unidad de Medida */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unidad de Medida *
                                </label>
                                <select
                                    name="UNIDAD_MEDIDA"
                                    value={formData.UNIDAD_MEDIDA}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${
                                        errors.UNIDAD_MEDIDA ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="">Selecciona una unidad</option>
                                    {Object.entries(unidadesMedida || {}).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.UNIDAD_MEDIDA && (
                                    <p className="text-red-500 text-sm mt-1">{errors.UNIDAD_MEDIDA}</p>
                                )}
                            </div>

                            {/* Stock Mínimo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock Mínimo *
                                </label>
                                <input
                                    type="number"
                                    name="STOCK_MINIMO"
                                    value={formData.STOCK_MINIMO}
                                    onChange={handleChange}
                                    min="0"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${
                                        errors.STOCK_MINIMO ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.STOCK_MINIMO && (
                                    <p className="text-red-500 text-sm mt-1">{errors.STOCK_MINIMO}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Se generará una alerta cuando el stock esté por debajo de este número
                                </p>
                            </div>

                            {/* Estado */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado *
                                </label>
                                <select
                                    name="ESTADO"
                                    value={formData.ESTADO}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                    required
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">📝 Nota importante</h4>
                            <p className="text-sm text-blue-700">
                                Después de crear el insumo, podrás agregar lotes con fechas de caducidad y costos específicos.
                            </p>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="bg-white rounded-lg p-4 shadow-sm mt-6">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <Link href="/insumos">
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
                                        Guardar Insumo
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