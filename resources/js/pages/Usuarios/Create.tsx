import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type UsuarioCreateProps, type UsuarioTipo, type UsuarioEstado } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Plus, ChevronRight, User, Lock, Settings, Shield, Heart, Building, Check } from 'lucide-react';

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
        title: 'Nuevo Usuario',
        href: '/usuarios/create',
    },
];

// Interfaz que extiende PageProps para usePage
interface PageProps extends UsuarioCreateProps {
    [key: string]: any;
}

export default function Create() {
    const { tipos_usuario, estados, instituciones } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        USUARIO_NOMBRE: '',
        USUARIO_APELLIDOS: '',
        USUARIO_CORREO: '',
        USUARIO_TELEFONO: '',
        USUARIO_PASS: '',
        USUARIO_PASS_confirmation: '',
        USUARIO_TIPO: 'paciente' as UsuarioTipo,
        ID_INSTITUCION: 0,
        USUARIO_ESTADO: 'activo' as UsuarioEstado,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('usuarios.store'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'admin':
                return 'border-[#189BAF] bg-[#189BAF]/5';
            case 'medico':
                return 'border-[#D68B41] bg-[#D68B41]/5';
            case 'clientes':
                return 'border-purple-500 bg-purple-50';
            case 'paciente':
                return 'border-blue-500 bg-blue-50';
            default:
                return 'border-gray-300 bg-gray-50';
        }
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'admin':
                return <Shield className="h-5 w-5 text-[#189BAF]" />;
            case 'medico':
                return <Heart className="h-5 w-5 text-[#D68B41]" />;
            case 'clientes':
                return <Building className="h-5 w-5 text-purple-600" />;
            case 'paciente':
                return <User className="h-5 w-5 text-blue-600" />;
            default:
                return <User className="h-5 w-5 text-gray-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Usuario - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <Plus className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Nuevo Usuario</h1>
                                <p className="text-white/90 opacity-90">
                                    Crear un nuevo usuario en el sistema DIAHMOES
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Link
                                href="/usuarios"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <ChevronRight className="h-5 w-5" />
                                <span>Ver Lista</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Vista previa del tipo seleccionado */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                data.USUARIO_TIPO === 'admin' ? 'bg-[#189BAF]/10' :
                                data.USUARIO_TIPO === 'medico' ? 'bg-[#D68B41]/10' :
                                data.USUARIO_TIPO === 'clientes' ? 'bg-purple-100' :
                                'bg-blue-100'
                            }`}>
                                {getTipoIcon(data.USUARIO_TIPO)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Creando usuario tipo:</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {tipos_usuario?.[data.USUARIO_TIPO] || 'Seleccione un tipo'}
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium border ${
                            data.USUARIO_ESTADO === 'activo' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                            {estados?.[data.USUARIO_ESTADO] || 'Estado'}
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Información personal */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <User className="h-6 w-6 text-[#189BAF] mr-3" />
                            <h2 className="text-xl font-bold text-gray-800">Información Personal</h2>
                            <span className="ml-2 text-red-500">*</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="USUARIO_NOMBRE" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="USUARIO_NOMBRE"
                                    value={data.USUARIO_NOMBRE}
                                    onChange={(e) => setData('USUARIO_NOMBRE', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.USUARIO_NOMBRE 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="Ingrese el nombre"
                                    required
                                />
                                {errors.USUARIO_NOMBRE && (
                                    <p className="mt-1 text-sm text-red-600">{errors.USUARIO_NOMBRE}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="USUARIO_APELLIDOS" className="block text-sm font-medium text-gray-700 mb-2">
                                    Apellidos <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="USUARIO_APELLIDOS"
                                    value={data.USUARIO_APELLIDOS}
                                    onChange={(e) => setData('USUARIO_APELLIDOS', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.USUARIO_APELLIDOS 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="Ingrese los apellidos"
                                    required
                                />
                                {errors.USUARIO_APELLIDOS && (
                                    <p className="mt-1 text-sm text-red-600">{errors.USUARIO_APELLIDOS}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="USUARIO_CORREO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Correo Electrónico <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="USUARIO_CORREO"
                                    value={data.USUARIO_CORREO}
                                    onChange={(e) => setData('USUARIO_CORREO', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.USUARIO_CORREO 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="ejemplo@correo.com"
                                    required
                                />
                                {errors.USUARIO_CORREO && (
                                    <p className="mt-1 text-sm text-red-600">{errors.USUARIO_CORREO}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="USUARIO_TELEFONO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    id="USUARIO_TELEFONO"
                                    value={data.USUARIO_TELEFONO}
                                    onChange={(e) => setData('USUARIO_TELEFONO', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF] transition-colors"
                                    placeholder="Ingrese el teléfono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <Lock className="h-6 w-6 text-[#D68B41] mr-3" />
                            <h2 className="text-xl font-bold text-gray-800">Contraseña</h2>
                            <span className="ml-2 text-red-500">*</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="USUARIO_PASS" className="block text-sm font-medium text-gray-700 mb-2">
                                    Contraseña <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="USUARIO_PASS"
                                    value={data.USUARIO_PASS}
                                    onChange={(e) => setData('USUARIO_PASS', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.USUARIO_PASS 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />
                                {errors.USUARIO_PASS && (
                                    <p className="mt-1 text-sm text-red-600">{errors.USUARIO_PASS}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="USUARIO_PASS_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar Contraseña <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="USUARIO_PASS_confirmation"
                                    value={data.USUARIO_PASS_confirmation}
                                    onChange={(e) => setData('USUARIO_PASS_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF] transition-colors"
                                    placeholder="Repita la contraseña"
                                    required
                                />
                                {data.USUARIO_PASS && data.USUARIO_PASS_confirmation && data.USUARIO_PASS !== data.USUARIO_PASS_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Configuración del usuario */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <Settings className="h-6 w-6 text-[#189BAF] mr-3" />
                            <h2 className="text-xl font-bold text-gray-800">Configuración</h2>
                            <span className="ml-2 text-red-500">*</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="USUARIO_TIPO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Usuario <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="USUARIO_TIPO"
                                    value={data.USUARIO_TIPO}
                                    onChange={(e) => setData('USUARIO_TIPO', e.target.value as UsuarioTipo)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.USUARIO_TIPO 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : `border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF] ${getTipoColor(data.USUARIO_TIPO)}`
                                    }`}
                                    required
                                >
                                    {Object.entries(tipos_usuario || {}).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.USUARIO_TIPO && (
                                    <p className="mt-1 text-sm text-red-600">{errors.USUARIO_TIPO}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="ID_INSTITUCION" className="block text-sm font-medium text-gray-700 mb-2">
                                    Institución <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="ID_INSTITUCION"
                                    value={data.ID_INSTITUCION}
                                    onChange={(e) => setData('ID_INSTITUCION', parseInt(e.target.value))}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.ID_INSTITUCION 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    required
                                >
                                    <option value="">Seleccione una institución</option>
                                    {instituciones?.map((institucion) => (
                                        <option key={institucion.ID_INSTITUCION} value={institucion.ID_INSTITUCION}>
                                            {institucion.INSTITUCION_NOMBRE}
                                        </option>
                                    ))}
                                </select>
                                {errors.ID_INSTITUCION && (
                                    <p className="mt-1 text-sm text-red-600">{errors.ID_INSTITUCION}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="USUARIO_ESTADO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="USUARIO_ESTADO"
                                    value={data.USUARIO_ESTADO}
                                    onChange={(e) => setData('USUARIO_ESTADO', e.target.value as UsuarioEstado)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.USUARIO_ESTADO 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : `border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF] ${
                                                data.USUARIO_ESTADO === 'activo' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                                            }`
                                    }`}
                                    required
                                >
                                    {Object.entries(estados || {}).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.USUARIO_ESTADO && (
                                    <p className="mt-1 text-sm text-red-600">{errors.USUARIO_ESTADO}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/usuarios"
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => reset()}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Limpiar Formulario
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
                                        <span>Creando Usuario...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-5 w-5" />
                                        <span>Crear Usuario</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}