import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Usuario, type UsuarioShowProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { User, Edit, CheckCircle, Shield, Heart, Building, Users, Settings, ChevronsUpDown, ChevronRight } from 'lucide-react';

// Interfaz que extiende PageProps para usePage
interface PageProps extends UsuarioShowProps {
    [key: string]: any;
}

export default function Show() {
    const { usuario } = usePage<PageProps>().props;

    // Verificar si los datos están disponibles
    if (!usuario) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Usuario - DIAHMOES" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#189BAF] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando usuario...</p>
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
            title: 'Usuarios',
            href: '/usuarios',
        },
        {
            title: usuario.nombre_completo,
            href: `/usuarios/${usuario.ID_USUARIO}`,
        },
    ];

    const [isChangingStatus, setIsChangingStatus] = useState(false);

    const toggleEstado = () => {
        setIsChangingStatus(true);
        router.patch(`/usuarios/${usuario.ID_USUARIO}/toggle-estado`, {}, {
            preserveState: true,
            onFinish: () => setIsChangingStatus(false)
        });
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'activo':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'inactivo':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'admin':
                return 'bg-[#189BAF]/10 text-[#189BAF] border-[#189BAF]/20';
            case 'medico':
                return 'bg-[#D68B41]/10 text-[#D68B41] border-[#D68B41]/20';
            case 'clientes':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'paciente':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'admin':
                return <Shield className="h-5 w-5" />;
            case 'medico':
                return <Heart className="h-5 w-5" />;
            case 'clientes':
                return <Building className="h-5 w-5" />;
            case 'paciente':
                return <User className="h-5 w-5" />;
            default:
                return <User className="h-5 w-5" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${usuario.nombre_completo} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con información principal */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{usuario.nombre_completo}</h1>
                                <p className="text-white/90 opacity-90">
                                    {usuario.tipo_nombre} • ID: {usuario.ID_USUARIO}
                                </p>
                                <p className="text-white/80 text-sm">
                                    {usuario.USUARIO_CORREO}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={toggleEstado}
                                disabled={isChangingStatus}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    usuario.USUARIO_ESTADO === 'activo'
                                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-100 border border-green-300/30'
                                        : 'bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-300/30'
                                } ${isChangingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isChangingStatus ? 'Cambiando...' : usuario.estado_nombre}
                            </button>
                            <Link
                                href={`/usuarios/${usuario.ID_USUARIO}/edit`}
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <Edit className="h-5 w-5" />
                                <span>Editar</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Grid de información */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información personal */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                <User className="h-6 w-6 text-[#189BAF]" />
                                <span>Información Personal</span>
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                                <p className="text-lg font-semibold text-gray-900">{usuario.USUARIO_NOMBRE}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Apellidos</label>
                                <p className="text-lg font-semibold text-gray-900">{usuario.USUARIO_APELLIDOS}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Correo Electrónico</label>
                                <p className="text-lg text-gray-900">{usuario.USUARIO_CORREO}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                                <p className="text-lg text-gray-900">{usuario.USUARIO_TELEFONO || 'No especificado'}</p>
                            </div>
                        </div>

                        {/* Tipo de usuario */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-600 mb-3">Tipo de Usuario</label>
                            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${getTipoColor(usuario.USUARIO_TIPO)}`}>
                                {getTipoIcon(usuario.USUARIO_TIPO)}
                                <span className="font-medium">{usuario.tipo_nombre}</span>
                            </div>
                        </div>

                        {/* Institución */}
                        {usuario.institucion && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-600 mb-3">Institución</label>
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10">
                                        <Building className="h-5 w-5 text-[#189BAF]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{usuario.institucion.INSTITUCION_NOMBRE}</p>
                                        <p className="text-sm text-gray-600">ID: {usuario.institucion.ID_INSTITUCION}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Panel lateral */}
                    <div className="space-y-6">
                        {/* Estado y fechas */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-[#189BAF]" />
                                <span>Estado</span>
                            </h3>
                            <div className="space-y-4">
                                <div className={`px-3 py-2 rounded-lg border text-center ${getEstadoColor(usuario.USUARIO_ESTADO)}`}>
                                    <span className="font-medium">{usuario.estado_nombre}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p><strong>Registrado:</strong> {usuario.FECHA_REGISTRO}</p>
                                    <p className="mt-1"><strong>Actualizado:</strong> {usuario.FECHA_ACTUALIZACION}</p>
                                </div>
                            </div>
                        </div>

                        {/* Acciones rápidas */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Acciones</h3>
                            <div className="space-y-3">
                                <Link
                                    href={`/usuarios/${usuario.ID_USUARIO}/edit`}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-[#189BAF]/20 hover:bg-[#189BAF]/5 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <Edit className="h-5 w-5 text-[#189BAF] mr-3" />
                                        <span className="text-sm font-medium">Editar Usuario</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </Link>
                                
                                <button
                                    onClick={toggleEstado}
                                    disabled={isChangingStatus}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                        usuario.USUARIO_ESTADO === 'activo' 
                                            ? 'border-red-200 hover:bg-red-50' 
                                            : 'border-green-200 hover:bg-green-50'
                                    } ${isChangingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center">
                                        <ChevronsUpDown className={`h-5 w-5 mr-3 ${usuario.USUARIO_ESTADO === 'activo' ? 'text-red-600' : 'text-green-600'}`} />
                                        <span className={`text-sm font-medium ${usuario.USUARIO_ESTADO === 'activo' ? 'text-red-700' : 'text-green-700'}`}>
                                            {usuario.USUARIO_ESTADO === 'activo' ? 'Desactivar' : 'Activar'} Usuario
                                        </span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </button>

                                <Link
                                    href="/usuarios"
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <ChevronRight className="h-5 w-5 text-gray-600 mr-3" />
                                        <span className="text-sm font-medium">Volver a Lista</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}