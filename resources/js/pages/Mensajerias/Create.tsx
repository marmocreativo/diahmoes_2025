import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { 
    Plus, 
    ArrowLeft,
    Truck,
    AlertCircle
} from 'lucide-react';

interface PageProps extends Record<string, any> {
    estados: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Mensajerías',
        href: '/mensajerias',
    },
    {
        title: 'Nueva Mensajería',
        href: '/mensajerias/create',
    },
];

export default function Create() {
    const { estados } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        NOMBRE: '',
        ESTADO: 'activo',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('mensajerias.store'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Mensajería - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header simple */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#189BAF]/10">
                            <Plus className="h-6 w-6 text-[#189BAF]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Nueva Mensajería</h1>
                            <p className="text-gray-600">Agregar nueva empresa de mensajería al sistema</p>
                        </div>
                    </div>
                    <Link
                        href="/mensajerias"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </Link>
                </div>

                {/* Vista previa */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10">
                            <Truck className="h-5 w-5 text-[#189BAF]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Creando mensajería:</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {data.NOMBRE || 'Nueva Mensajería'}
                            </p>
                        </div>
                        <div className="ml-auto">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                data.ESTADO === 'activo' 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                                {estados[data.ESTADO] || data.ESTADO}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="space-y-6">
                            {/* Nombre */}
                            <div>
                                <label htmlFor="NOMBRE" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Mensajería <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="NOMBRE"
                                    value={data.NOMBRE}
                                    onChange={(e) => setData('NOMBRE', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.NOMBRE 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="DHL, FedEx, Estafeta, etc."
                                    required
                                />
                                {errors.NOMBRE && (
                                    <div className="mt-2 flex items-center text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.NOMBRE}
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Introduce el nombre completo de la empresa de mensajería
                                </p>
                            </div>

                            {/* Estado */}
                            <div>
                                <label htmlFor="ESTADO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="ESTADO"
                                    value={data.ESTADO}
                                    onChange={(e) => setData('ESTADO', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.ESTADO 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    required
                                >
                                    {Object.entries(estados).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.ESTADO && (
                                    <div className="mt-2 flex items-center text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.ESTADO}
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Las mensajerías activas aparecerán disponibles en los formularios de estudios
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Información importante:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>El nombre debe ser único en el sistema</li>
                                    <li>Se utilizará para identificar guías de envío en los estudios</li>
                                    <li>Puedes cambiar el estado después de crear la mensajería</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/mensajerias"
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                            >
                                Limpiar
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`px-6 py-2 bg-[#189BAF] hover:bg-[#157a8c] text-white rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                                processing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Creando...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    <span>Crear Mensajería</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}