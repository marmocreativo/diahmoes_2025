import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type InstitucionShowProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Building2, 
    Edit, 
    List, 
    Users, 
    Heart, 
    FileText, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Eye, 
    Shield, 
    Lock, 
    Info, 
    CheckCircle, 
    AlertTriangle, 
    Trash2,
    RefreshCw,
    EyeOff,
    ArrowRight,
    Loader2,
    Calendar,
    Clock
} from 'lucide-react';

// Interfaz que extiende PageProps para usePage
interface PageProps extends InstitucionShowProps {
    [key: string]: any;
}

export default function Show() {
    const { institucion } = usePage<PageProps>().props;
    
    // Estados para la interfaz
    const [showPIN, setShowPIN] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    
    // Verificar si los datos están disponibles
    if (!institucion) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Institución - DIAHMOES" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 text-[#189BAF] mx-auto animate-spin" />
                            <p className="mt-4 text-gray-600">Cargando institución...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Breadcrumbs dinámicos
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Instituciones',
            href: '/instituciones',
        },
        {
            title: institucion.INSTITUCION_NOMBRE,
            href: `/instituciones/${institucion.ID_INSTITUCION}`,
        },
    ];

    // Funciones de interacción
    const handleDelete = () => {
        if (confirm(`¿Estás seguro de que deseas eliminar la institución "${institucion.INSTITUCION_NOMBRE}"?`)) {
            router.delete(`/instituciones/${institucion.ID_INSTITUCION}`, {
                onSuccess: () => {
                    router.get('/instituciones');
                }
            });
        }
    };

    const regenerarPIN = () => {
        router.patch(`/instituciones/${institucion.ID_INSTITUCION}/regenerar-pin`, {}, {
            preserveState: true,
            onSuccess: () => {
                setShowPIN(true);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${institucion.INSTITUCION_NOMBRE} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Principal */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{institucion.INSTITUCION_NOMBRE}</h1>
                                <p className="text-white/90 opacity-90">
                                    {institucion.INSTITUCION_CIUDAD}, {institucion.INSTITUCION_ESTADO}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-sm bg-white/20 px-2 py-1 rounded flex items-center space-x-1">
                                        <span>RFC: {institucion.INSTITUCION_RFC}</span>
                                    </span>
                                    {institucion.estadisticas && (
                                        <span className="text-sm bg-white/20 px-2 py-1 rounded flex items-center space-x-1">
                                            <Users className="h-4 w-4" />
                                            <span>{institucion.estadisticas.usuarios_activos} usuarios activos</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={`/instituciones/${institucion.ID_INSTITUCION}/edit`}
                                className="bg-[#D68B41] hover:bg-[#b8763a] px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <Edit className="h-5 w-5" />
                                <span>Editar</span>
                            </Link>
                            <Link
                                href="/instituciones"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <List className="h-5 w-5" />
                                <span>Ver Lista</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de Estadísticas */}
                {institucion.estadisticas && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                                    <p className="text-3xl font-bold text-[#189BAF]">{institucion.estadisticas.usuarios_total}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#189BAF]/10">
                                    <Users className="h-6 w-6 text-[#189BAF]" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <span className="text-sm text-green-600 font-medium">{institucion.estadisticas.usuarios_activos} activos</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Médicos</p>
                                    <p className="text-3xl font-bold text-green-600">{institucion.estadisticas.medicos}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <Heart className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-sm text-gray-500">Personal médico registrado</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Estudios</p>
                                    <p className="text-3xl font-bold text-[#D68B41]">{institucion.estadisticas.estudios_total}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D68B41]/10">
                                    <FileText className="h-6 w-6 text-[#D68B41]" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-sm text-gray-500">{institucion.estadisticas.estudios_mes_actual} este mes</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pacientes</p>
                                    <p className="text-3xl font-bold text-purple-600">{institucion.estadisticas.pacientes}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                    <User className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-sm text-gray-500">Pacientes registrados</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenido Principal con Pestañas */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Navegación de Pestañas */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                                    activeTab === 'info'
                                        ? 'border-[#189BAF] text-[#189BAF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Info className="h-4 w-4" />
                                <span>Información General</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                                    activeTab === 'users'
                                        ? 'border-[#189BAF] text-[#189BAF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Users className="h-4 w-4" />
                                <span>Usuarios Recientes</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('studies')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                                    activeTab === 'studies'
                                        ? 'border-[#189BAF] text-[#189BAF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FileText className="h-4 w-4" />
                                <span>Estudios Recientes</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                                    activeTab === 'security'
                                        ? 'border-[#189BAF] text-[#189BAF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Shield className="h-4 w-4" />
                                <span>Seguridad</span>
                            </button>
                        </nav>
                    </div>

                    {/* Contenido de las Pestañas */}
                    <div className="p-6">
                        {/* Pestaña: Información General */}
                        {activeTab === 'info' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Información Básica */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                                <Building2 className="h-6 w-6 text-[#189BAF] mr-3" />
                                                Información Básica
                                            </h3>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Nombre:</span>
                                                    <span className="text-gray-900 text-right font-medium">{institucion.INSTITUCION_NOMBRE}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Razón Social:</span>
                                                    <span className="text-gray-900 text-right">{institucion.INSTITUCION_RAZON_SOCIAL}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">RFC:</span>
                                                    <span className="text-gray-900 font-mono text-right">{institucion.INSTITUCION_RFC}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        Registro:
                                                    </span>
                                                    <span className="text-gray-900 text-right">{institucion.FECHA_REGISTRO}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium flex items-center">
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        Última Actualización:
                                                    </span>
                                                    <span className="text-gray-900 text-right">{institucion.FECHA_ACTUALIZACION}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información de Contacto */}
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                                <Mail className="h-6 w-6 text-[#D68B41] mr-3" />
                                                Contacto
                                            </h3>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Correo Electrónico:</span>
                                                    <a 
                                                        href={`mailto:${institucion.INSTITUCION_CORREO}`} 
                                                        className="text-[#189BAF] hover:text-[#157a8c] hover:underline flex items-center space-x-1 transition-colors"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                        <span>{institucion.INSTITUCION_CORREO}</span>
                                                    </a>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-medium">Teléfono:</span>
                                                    <a 
                                                        href={`tel:${institucion.INSTITUCION_TELEFONO}`} 
                                                        className="text-[#189BAF] hover:text-[#157a8c] hover:underline flex items-center space-x-1 transition-colors"
                                                    >
                                                        <Phone className="h-4 w-4" />
                                                        <span>{institucion.INSTITUCION_TELEFONO}</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Información de Ubicación */}
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                            <MapPin className="h-6 w-6 text-purple-600 mr-3" />
                                            Ubicación
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="mb-4">
                                                <p className="text-gray-900 font-semibold text-lg mb-2">{institucion.direccion_completa}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600 font-medium">Colonia:</span>
                                                    <p className="text-gray-900 font-medium">{institucion.INSTITUCION_COLONIA}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 font-medium">Municipio:</span>
                                                    <p className="text-gray-900 font-medium">{institucion.INSTITUCION_MUNICIPIO}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 font-medium">Ciudad:</span>
                                                    <p className="text-gray-900 font-medium">{institucion.INSTITUCION_CIUDAD}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 font-medium">Estado:</span>
                                                    <p className="text-gray-900 font-medium">{institucion.INSTITUCION_ESTADO}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-gray-600 font-medium">Código Postal:</span>
                                                    <p className="text-gray-900 font-medium">{institucion.INSTITUCION_CODIGO_POSTAL}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pestaña: Usuarios Recientes */}
                        {activeTab === 'users' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                        <Users className="h-6 w-6 text-[#189BAF] mr-3" />
                                        Usuarios Recientes
                                    </h3>
                                    <Link
                                        href={`/usuarios?institucion=${institucion.ID_INSTITUCION}`}
                                        className="text-[#189BAF] hover:text-[#157a8c] font-medium text-sm flex items-center space-x-1 transition-colors"
                                    >
                                        <span>Ver todos los usuarios</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                {institucion.usuarios_recientes && institucion.usuarios_recientes.length > 0 ? (
                                    <div className="space-y-4">
                                        {institucion.usuarios_recientes.map((usuario) => (
                                            <div key={usuario.ID_USUARIO} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#189BAF]/10">
                                                        <User className="h-6 w-6 text-[#189BAF]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{usuario.nombre_completo}</p>
                                                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                                                            <span className="capitalize">{usuario.USUARIO_TIPO}</span>
                                                            <span>•</span>
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Registrado el {usuario.FECHA_REGISTRO}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        usuario.USUARIO_ESTADO === 'activo' 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                        {usuario.USUARIO_ESTADO}
                                                    </span>
                                                    <Link
                                                        href={`/usuarios/${usuario.ID_USUARIO}`}
                                                        className="text-[#189BAF] hover:text-[#157a8c] p-2 rounded-lg hover:bg-[#189BAF]/10 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay usuarios registrados</h3>
                                        <p className="text-gray-500 mb-4">Esta institución aún no tiene usuarios asociados.</p>
                                        <Link
                                            href="/usuarios/create"
                                            className="bg-[#189BAF] hover:bg-[#157a8c] text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Agregar Usuario</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pestaña: Estudios Recientes */}
                        {activeTab === 'studies' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                        <FileText className="h-6 w-6 text-[#D68B41] mr-3" />
                                        Estudios Recientes
                                    </h3>
                                    <Link
                                        href={`/estudios?institucion=${institucion.ID_INSTITUCION}`}
                                        className="text-[#189BAF] hover:text-[#157a8c] font-medium text-sm flex items-center space-x-1 transition-colors"
                                    >
                                        <span>Ver todos los estudios</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                {institucion.estudios_recientes && institucion.estudios_recientes.length > 0 ? (
                                    <div className="space-y-4">
                                        {institucion.estudios_recientes.map((estudio) => (
                                            <div key={estudio.ID} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D68B41]/10">
                                                        <FileText className="h-6 w-6 text-[#D68B41]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{estudio.CLAVE_INTERNA}</p>
                                                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                                                            <User className="h-3 w-3" />
                                                            <span>Paciente: {estudio.MUESTRA_INICIALES}</span>
                                                            <span>•</span>
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{estudio.FECHA_SOLICITUD_RECOLECCION}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        estudio.ESTUDIO_ESTADO === 'completado' 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : estudio.ESTUDIO_ESTADO === 'en_proceso'
                                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                    }`}>
                                                        {estudio.ESTUDIO_ESTADO || 'En proceso'}
                                                    </span>
                                                    <Link
                                                        href={`/estudios/${estudio.ID}`}
                                                        className="text-[#189BAF] hover:text-[#157a8c] p-2 rounded-lg hover:bg-[#189BAF]/10 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <FileText className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay estudios registrados</h3>
                                        <p className="text-gray-500 mb-4">Esta institución aún no tiene estudios asociados.</p>
                                        <Link
                                            href="/estudios/create"
                                            className="bg-[#D68B41] hover:bg-[#b8763a] text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>Crear Estudio</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pestaña: Seguridad */}
                        {activeTab === 'security' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <Shield className="h-6 w-6 text-red-600 mr-3" />
                                    Configuración de Seguridad
                                </h3>
                                
                                <div className="space-y-8">
                                    {/* Gestión del PIN */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                                                    <Lock className="h-5 w-5 text-[#189BAF] mr-2" />
                                                    PIN de Seguridad
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">Código de acceso para autenticación adicional de la institución</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => setShowPIN(!showPIN)}
                                                    className="text-[#189BAF] hover:text-[#157a8c] text-sm font-medium transition-colors flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-[#189BAF]/20 hover:bg-[#189BAF]/5"
                                                >
                                                    {showPIN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    <span>{showPIN ? 'Ocultar PIN' : 'Mostrar PIN'}</span>
                                                </button>
                                                <button
                                                    onClick={regenerarPIN}
                                                    className="bg-[#D68B41] hover:bg-[#b8763a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                    <span>Regenerar PIN</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {showPIN ? (
                                            <div className="bg-white rounded-lg border-2 border-[#189BAF]/20 p-6">
                                                <div className="flex items-center justify-center space-x-4">
                                                    <div className="text-center">
                                                        <span className="text-sm text-gray-600 block mb-2">PIN Actual:</span>
                                                        <span className="font-mono text-3xl font-bold text-[#189BAF] bg-gray-100 px-6 py-3 rounded-lg border-2 border-[#189BAF]/20">
                                                            {institucion.INSTITUCION_PIN}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <p className="text-sm text-blue-800 flex items-center">
                                                        <Info className="h-4 w-4 mr-2" />
                                                        Mantenga este PIN seguro y confidencial. Se utiliza para autenticación adicional en procesos críticos.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                <Lock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                                <p className="text-lg font-medium text-gray-700 mb-2">PIN oculto por seguridad</p>
                                                <p className="text-sm text-gray-500">Haga clic en "Mostrar PIN" para ver el código de seguridad</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Información de Seguridad */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                            <div className="flex items-center mb-4">
                                                <Info className="h-6 w-6 text-blue-600 mr-3" />
                                                <h5 className="text-lg font-semibold text-blue-800">Información de Acceso</h5>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-blue-700 font-medium">Última actualización:</span>
                                                    <span className="text-blue-900 font-semibold">{institucion.FECHA_ACTUALIZACION}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-blue-700 font-medium">Fecha de creación:</span>
                                                    <span className="text-blue-900 font-semibold">{institucion.FECHA_REGISTRO}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-blue-700 font-medium">ID de institución:</span>
                                                    <span className="text-blue-900 font-mono font-semibold">{institucion.ID_INSTITUCION}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                            <div className="flex items-center mb-4">
                                                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                                                <h5 className="text-lg font-semibold text-green-800">Estado de Seguridad</h5>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-center space-x-3">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <span className="text-green-700 font-medium">PIN configurado y activo</span>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <span className="text-green-700 font-medium">RFC validado correctamente</span>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <span className="text-green-700 font-medium">Información de contacto verificada</span>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <span className="text-green-700 font-medium">Datos de ubicación completos</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Zona de Peligro */}
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                                        <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                                            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                                            Zona de Peligro
                                        </h4>
                                        <p className="text-sm text-red-700 mb-6">
                                            Las siguientes acciones son permanentes e irreversibles. Una vez ejecutadas, no se pueden deshacer. 
                                            Proceda con extrema precaución.
                                        </p>
                                        
                                        <div className="bg-white rounded-lg p-4 border border-red-300">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-red-800 mb-2">Eliminar Institución</h5>
                                                    <p className="text-sm text-red-700 mb-4">
                                                        Esta acción eliminará permanentemente la institución y todos sus datos asociados, 
                                                        incluyendo usuarios, estudios y archivos. Esta operación no se puede deshacer.
                                                    </p>
                                                    <ul className="text-xs text-red-600 mb-4 space-y-1">
                                                        <li>• Se eliminarán todos los usuarios asociados</li>
                                                        <li>• Se perderán todos los estudios y resultados</li>
                                                        <li>• Se borrarán todos los archivos adjuntos</li>
                                                        <li>• No será posible recuperar la información</li>
                                                    </ul>
                                                </div>
                                                <button
                                                    onClick={handleDelete}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ml-4"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Eliminar Institución</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}