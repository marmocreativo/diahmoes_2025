import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Edit2, 
    ArrowLeft,
    Truck,
    Package,
    BarChart3,
    Eye,
    Trash2,
    ToggleLeft,
    ToggleRight,
    FileText,
    Calendar
} from 'lucide-react';

interface Mensajeria {
    ID: number;
    NOMBRE: string;
    ESTADO: string;
    nombre_formateado: string;
    estado_formateado: string;
    estado_css_class: string;
    activa: boolean;
    estadisticas: {
        total_guias: number;
        guias_normales: number;
        guias_especializadas: number;
        guias_retorno: number;
        estudios_unicos: number;
    };
    estudios_recientes?: Array<{
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_INICIALES: string;
        ESTUDIO_ESTADO?: string;
        FECHA_SOLICITUD_RECOLECCION: string;
        tipo_guia: string;
    }>;
}

interface PageProps extends Record<string, any> {
    mensajeria: Mensajeria;
}

export default function Show() {
    const { mensajeria } = usePage<PageProps>().props;

    // Verificar si los datos están disponibles
    if (!mensajeria) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Mensajería - DIAHMOES" />
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
    ];

    const handleDelete = () => {
        if (mensajeria.estadisticas.total_guias > 0) {
            alert(`No se puede eliminar ${mensajeria.NOMBRE} porque tiene ${mensajeria.estadisticas.total_guias} guías asociadas.`);
            return;
        }

        if (confirm(`¿Estás seguro de que deseas eliminar "${mensajeria.NOMBRE}"?`)) {
            router.delete(`/mensajerias/${mensajeria.ID}`, {
                onSuccess: () => {
                    router.get('/mensajerias');
                }
            });
        }
    };

    const toggleEstado = () => {
        router.patch(`/mensajerias/${mensajeria.ID}/toggle-estado`, {}, {
            preserveState: true,
        });
    };

    const getTipoGuiaColor = (tipo: string) => {
        switch (tipo) {
            case 'normal':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'especializada':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'retorno':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTipoGuiaLabel = (tipo: string) => {
        switch (tipo) {
            case 'normal': return 'Normal';
            case 'especializada': return 'Especializada';
            case 'retorno': return 'Retorno';
            default: return 'Desconocido';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${mensajeria.NOMBRE} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#189BAF]/10">
                            <Truck className="h-8 w-8 text-[#189BAF]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{mensajeria.nombre_formateado}</h1>
                            <div className="flex items-center space-x-3 mt-2">
                                <span className="text-sm text-gray-500">ID: {mensajeria.ID}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${mensajeria.estado_css_class}`}>
                                    {mensajeria.estado_formateado}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/mensajerias/${mensajeria.ID}/edit`}
                            className="bg-[#D68B41] hover:bg-[#b8763a] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            <span>Editar</span>
                        </Link>
                        <Link
                            href="/mensajerias"
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver</span>
                        </Link>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Guías</p>
                                <p className="text-3xl font-bold text-[#189BAF]">{mensajeria.estadisticas.total_guias}</p>
                            </div>
                            <Package className="h-8 w-8 text-[#189BAF]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Guías Normales</p>
                                <p className="text-3xl font-bold text-blue-600">{mensajeria.estadisticas.guias_normales}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Especializadas</p>
                                <p className="text-3xl font-bold text-purple-600">{mensajeria.estadisticas.guias_especializadas}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Retornos</p>
                                <p className="text-3xl font-bold text-orange-600">{mensajeria.estadisticas.guias_retorno}</p>
                            </div>
                            <ArrowLeft className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información y acciones */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Información básica */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600">Nombre:</span>
                                    <p className="font-medium text-gray-900">{mensajeria.NOMBRE}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Estado:</span>
                                    <p className="font-medium text-gray-900">{mensajeria.estado_formateado}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Estudios únicos:</span>
                                    <p className="font-medium text-gray-900">{mensajeria.estadisticas.estudios_unicos}</p>
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={toggleEstado}
                                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        mensajeria.activa
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                    }`}
                                >
                                    {mensajeria.activa ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                                    <span>{mensajeria.activa ? 'Desactivar' : 'Activar'}</span>
                                </button>

                                <button
                                    onClick={handleDelete}
                                    disabled={mensajeria.estadisticas.total_guias > 0}
                                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        mensajeria.estadisticas.total_guias > 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                    }`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Eliminar</span>
                                </button>

                                {mensajeria.estadisticas.total_guias > 0 && (
                                    <p className="text-xs text-gray-500 text-center">
                                        No se puede eliminar porque tiene guías asociadas
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Estudios recientes */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">Estudios Recientes</h3>
                                <p className="text-sm text-gray-600">Últimos estudios que utilizaron esta mensajería</p>
                            </div>

                            {mensajeria.estudios_recientes && mensajeria.estudios_recientes.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Estudio
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tipo Guía
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Fecha
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {mensajeria.estudios_recientes.map((estudio) => (
                                                <tr key={estudio.ID} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{estudio.CLAVE_INTERNA}</p>
                                                            <p className="text-sm text-gray-500">Paciente: {estudio.MUESTRA_INICIALES}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTipoGuiaColor(estudio.tipo_guia)}`}>
                                                            {getTipoGuiaLabel(estudio.tipo_guia)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{estudio.FECHA_SOLICITUD_RECOLECCION}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <Link
                                                            href={`/estudios/${estudio.ID}`}
                                                            className="text-[#189BAF] hover:text-[#157a8c] p-1 rounded transition-colors"
                                                            title="Ver estudio"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudios registrados</h3>
                                    <p className="text-gray-500">Esta mensajería aún no ha sido utilizada en ningún estudio.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}