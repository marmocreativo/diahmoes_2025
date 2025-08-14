import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { 
    Save, 
    ArrowLeft,
    Truck,
    AlertCircle,
    Edit2
} from 'lucide-react';

interface Mensajeria {
    ID: number;
    NOMBRE: string;
    ESTADO: string;
}

interface PageProps extends Record<string, any> {
    mensajeria: Mensajeria;
    estados: Record<string, string>;
}

export default function Edit() {
    const { mensajeria, estados } = usePage<PageProps>().props;

    // Verificar si los datos están disponibles
    if (!mensajeria) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Editar Mensajería - DIAHMOES" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#189BAF] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando mensajería...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
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
            title: mensajeria.NOMBRE,
            href: `/mensajerias/${mensajeria.ID}`,
        },
        {
            title: 'Editar',
            href: `/mensajerias/${mensajeria.ID}/edit`,
        },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        NOMBRE: mensajeria.NOMBRE || '',
        ESTADO: mensajeria.ESTADO || 'activo',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('mensajerias.update', mensajeria.ID));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${mensajeria.NOMBRE} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header simple */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D68B41]/10">
                            <Edit2 className="h-6 w-6 text-[#D68B41]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Editar Mensajería</h1>
                            <p className="text-gray-600">Modificar información de {mensajeria.NOMBRE}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/mensajerias/${mensajeria.ID}`}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver</span>
                        </Link>
                    </div>
                </div>

                {/* Vista previa de cambios */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10">
                                <Truck className="h-5 w-5 text-[#189BAF]" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Editando mensajería:</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {data.NOMBRE}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">ID: {mensajeria.ID}</span>
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
                                    Modifica el nombre de la empresa de mensajería
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
                                    {data.ESTADO === 'activo' 
                                        ? 'Esta mensajería aparecerá disponible en los formularios' 
                                        : 'Esta mensajería no aparecerá en los formularios de nuevos estudios'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Información de cambios */}
                    {(data.NOMBRE !== mensajeria.NOMBRE || data.ESTADO !== mensajeria.ESTADO) && (
                        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">Cambios detectados:</p>
                                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                                        {data.NOMBRE !== mensajeria.NOMBRE && (
                                            <li>Nombre: "{mensajeria.NOMBRE}" → "{data.NOMBRE}"</li>
                                        )}
                                        {data.ESTADO !== mensajeria.ESTADO && (
                                            <li>Estado: {estados[mensajeria.ESTADO]} → {estados[data.ESTADO]}</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advertencia sobre estudios relacionados */}
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Información importante:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Los cambios afectarán todos los estudios futuros</li>
                                    <li>Los estudios existentes mantendrán la información original</li>
                                    <li>Si desactivas la mensajería, no aparecerá en nuevos formularios</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={`/mensajerias/${mensajeria.ID}`}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <Link
                                href="/mensajerias"
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                            >
                                Ver Lista
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`px-6 py-2 bg-[#D68B41] hover:bg-[#b8763a] text-white rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                                processing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>Guardar Cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}