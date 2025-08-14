import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Usuario, type UsuarioEditProps, type UsuarioTipo, type UsuarioEstado } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

// Interfaz que extiende PageProps para usePage
interface PageProps extends UsuarioEditProps {
    [key: string]: any;
}

export default function Edit() {
    const { usuario, tipos_usuario, estados, instituciones } = usePage<PageProps>().props;

    // Verificar si los datos están disponibles
    if (!usuario) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Editar Usuario - DIAHMOES" />
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
        {
            title: 'Editar',
            href: `/usuarios/${usuario.ID_USUARIO}/edit`,
        },
    ];

    const { data, setData, patch, processing, errors, reset } = useForm({
        USUARIO_NOMBRE: usuario.USUARIO_NOMBRE || '',
        USUARIO_APELLIDOS: usuario.USUARIO_APELLIDOS || '',
        USUARIO_CORREO: usuario.USUARIO_CORREO || '',
        USUARIO_TELEFONO: usuario.USUARIO_TELEFONO || '',
        USUARIO_PASS: '',
        USUARIO_PASS_confirmation: '',
        USUARIO_TIPO: usuario.USUARIO_TIPO || 'paciente' as UsuarioTipo,
        ID_INSTITUCION: usuario.ID_INSTITUCION || 0,
        USUARIO_ESTADO: usuario.USUARIO_ESTADO || 'activo' as UsuarioEstado,
    });

    const [showPasswordFields, setShowPasswordFields] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Si no se quiere cambiar la contraseña, omitir los campos
        if (!showPasswordFields || !data.USUARIO_PASS) {
            const { USUARIO_PASS, USUARIO_PASS_confirmation, ...dataWithoutPassword } = data;
            
            // Usar router.patch para enviar datos personalizados
            router.patch(route('usuarios.update', usuario.ID_USUARIO), dataWithoutPassword, {
                onSuccess: () => {
                    reset('USUARIO_PASS', 'USUARIO_PASS_confirmation');
                    setShowPasswordFields(false);
                }
            });
        } else {
            // Usar el método patch del formulario para enviar todos los datos
            patch(route('usuarios.update', usuario.ID_USUARIO), {
                onSuccess: () => {
                    reset('USUARIO_PASS', 'USUARIO_PASS_confirmation');
                    setShowPasswordFields(false);
                }
            });
        }
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${usuario.nombre_completo} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Editar Usuario</h1>
                                <p className="text-white/90 opacity-90">
                                    Modificar información de {usuario.nombre_completo}
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Link
                                href={`/usuarios/${usuario.ID_USUARIO}`}
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Ver Usuario</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Información personal */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <svg className="h-6 w-6 text-[#189BAF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-800">Información Personal</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="USUARIO_NOMBRE" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
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
                                />
                                {errors.USUARIO_NOMBRE && (
                                    <p className="mt-1 text-sm text-red-600">{errors.USUARIO_NOMBRE}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="USUARIO_APELLIDOS" className="block text-sm font-medium text-gray-700 mb-2">
                                    Apellidos *
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
                                />
                                {errors.USUARIO_APELLIDOS && (
                                    <p className="mt-1 text-sm text-red-600">{errors.USUARIO_APELLIDOS}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="USUARIO_CORREO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Correo Electrónico *
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
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <svg className="h-6 w-6 text-[#D68B41] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <h2 className="text-xl font-bold text-gray-800">Contraseña</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPasswordFields(!showPasswordFields)}
                                className="text-[#189BAF] hover:text-[#157a8c] text-sm font-medium transition-colors"
                            >
                                {showPasswordFields ? 'Cancelar cambio' : 'Cambiar contraseña'}
                            </button>
                        </div>

                        {!showPasswordFields ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <p>Haz clic en "Cambiar contraseña" para modificar la contraseña</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="USUARIO_PASS" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nueva Contraseña
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
                                    />
                                    {errors.USUARIO_PASS && (
                                        <p className="mt-1 text-sm text-red-600">{errors.USUARIO_PASS}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="USUARIO_PASS_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        id="USUARIO_PASS_confirmation"
                                        value={data.USUARIO_PASS_confirmation}
                                        onChange={(e) => setData('USUARIO_PASS_confirmation', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF] transition-colors"
                                        placeholder="Repita la contraseña"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Configuración del usuario */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <svg className="h-6 w-6 text-[#189BAF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-800">Configuración</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="USUARIO_TIPO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Usuario *
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
                                    Institución *
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
                                    Estado *
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
                                    href={`/usuarios/${usuario.ID_USUARIO}`}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </Link>
                                <Link
                                    href="/usuarios"
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Volver a Lista
                                </Link>
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
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Guardar Cambios</span>
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