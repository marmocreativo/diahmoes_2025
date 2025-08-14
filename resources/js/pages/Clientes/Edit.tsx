import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Cliente } from '@/types/clientes';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { 
    ArrowLeft,
    Save,
    User,
    Mail,
    Lock,
    MailCheck,
    MailX,
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff
} from 'lucide-react';
import { useState } from 'react';

interface PageProps extends Record<string, any> {
    cliente: Cliente;
}

export default function Edit({ cliente }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Clientes',
            href: '/clientes',
        },
        {
            title: cliente.CLIENTE_NOMBRE,
            href: `/clientes/${cliente.ID_CLIENTE}`,
        },
        {
            title: 'Editar',
            href: `/clientes/${cliente.ID_CLIENTE}/edit`,
        },
    ];

    const { data, setData, patch, processing, errors, reset } = useForm({
        CLIENTE_NOMBRE: cliente.CLIENTE_NOMBRE || '',
        CLIENTE_CORREO: cliente.CLIENTE_CORREO || '',
        CLIENTE_PASS: '',
        CLIENTE_PASS_confirmation: '',
        CLIENTE_ENVIAR_CORREO: cliente.CLIENTE_ENVIAR_CORREO || 'si' as 'si' | 'no',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Si no se quiere cambiar la contraseña, limpiar esos campos antes de enviar
        if (!changePassword) {
            setData('CLIENTE_PASS', '');
            setData('CLIENTE_PASS_confirmation', '');
        }
        
        patch(`/clientes/${cliente.ID_CLIENTE}`, {
            onSuccess: () => {
                if (changePassword) {
                    setChangePassword(false);
                    setData('CLIENTE_PASS', '');
                    setData('CLIENTE_PASS_confirmation', '');
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${cliente.CLIENTE_NOMBRE} - DIAHMOES`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <User className="h-7 w-7 text-[#189BAF] mr-3" />
                            Editar Cliente
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Modifica la información de <span className="font-medium">{cliente.CLIENTE_NOMBRE}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/clientes/${cliente.ID_CLIENTE}`}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                            <Eye className="h-4 w-4" />
                            <span>Ver Cliente</span>
                        </Link>
                        <Link
                            href="/clientes"
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Volver</span>
                        </Link>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Información básica */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nombre del cliente */}
                                <div className="md:col-span-2">
                                    <label htmlFor="CLIENTE_NOMBRE" className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="h-4 w-4 inline mr-2" />
                                        Nombre del Cliente *
                                    </label>
                                    <input
                                        id="CLIENTE_NOMBRE"
                                        type="text"
                                        value={data.CLIENTE_NOMBRE}
                                        onChange={(e) => setData('CLIENTE_NOMBRE', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                                            errors.CLIENTE_NOMBRE
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                        }`}
                                        placeholder="Ingresa el nombre completo del cliente"
                                        required
                                    />
                                    {errors.CLIENTE_NOMBRE && (
                                        <div className="flex items-center mt-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.CLIENTE_NOMBRE}
                                        </div>
                                    )}
                                </div>

                                {/* Correo electrónico */}
                                <div className="md:col-span-2">
                                    <label htmlFor="CLIENTE_CORREO" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="h-4 w-4 inline mr-2" />
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        id="CLIENTE_CORREO"
                                        type="email"
                                        value={data.CLIENTE_CORREO}
                                        onChange={(e) => setData('CLIENTE_CORREO', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                                            errors.CLIENTE_CORREO
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                        }`}
                                        placeholder="cliente@ejemplo.com"
                                        required
                                    />
                                    {errors.CLIENTE_CORREO && (
                                        <div className="flex items-center mt-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.CLIENTE_CORREO}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Configuración de seguridad */}
                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <Lock className="h-5 w-5 text-gray-500 mr-2" />
                                        Configuración de Seguridad
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setChangePassword(!changePassword);
                                            if (!changePassword) {
                                                setData('CLIENTE_PASS', '');
                                                setData('CLIENTE_PASS_confirmation', '');
                                            }
                                        }}
                                        className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                                            changePassword
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        }`}
                                    >
                                        {changePassword ? 'Cancelar cambio' : 'Cambiar contraseña'}
                                    </button>
                                </div>
                                
                                {changePassword && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Nueva contraseña */}
                                        <div>
                                            <label htmlFor="CLIENTE_PASS" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nueva Contraseña *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="CLIENTE_PASS"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.CLIENTE_PASS}
                                                    onChange={(e) => setData('CLIENTE_PASS', e.target.value)}
                                                    className={`w-full px-4 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                        errors.CLIENTE_PASS
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                                    }`}
                                                    placeholder="Mínimo 6 caracteres"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.CLIENTE_PASS && (
                                                <div className="flex items-center mt-2 text-sm text-red-600">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.CLIENTE_PASS}
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirmar nueva contraseña */}
                                        <div>
                                            <label htmlFor="CLIENTE_PASS_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirmar Nueva Contraseña *
                                            </label>
                                            <input
                                                id="CLIENTE_PASS_confirmation"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.CLIENTE_PASS_confirmation}
                                                onChange={(e) => setData('CLIENTE_PASS_confirmation', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                    errors.CLIENTE_PASS_confirmation
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                        : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                                }`}
                                                placeholder="Repite la nueva contraseña"
                                                required
                                            />
                                            {errors.CLIENTE_PASS_confirmation && (
                                                <div className="flex items-center mt-2 text-sm text-red-600">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.CLIENTE_PASS_confirmation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {!changePassword && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <Lock className="h-4 w-4 mr-2" />
                                            La contraseña actual se mantendrá sin cambios. Haz clic en "Cambiar contraseña" para modificarla.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Configuración de notificaciones */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Mail className="h-5 w-5 text-gray-500 mr-2" />
                                    Configuración de Notificaciones
                                </h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Envío de Correos *
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="CLIENTE_ENVIAR_CORREO"
                                                value="si"
                                                checked={data.CLIENTE_ENVIAR_CORREO === 'si'}
                                                onChange={(e) => setData('CLIENTE_ENVIAR_CORREO', e.target.value as 'si' | 'no')}
                                                className="h-4 w-4 text-[#189BAF] border-gray-300 focus:ring-[#189BAF]"
                                            />
                                            <div className="ml-3">
                                                <div className="flex items-center">
                                                    <MailCheck className="h-4 w-4 text-green-600 mr-2" />
                                                    <span className="text-sm font-medium text-gray-700">Enviar correos</span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    El cliente recibirá notificaciones por correo electrónico sobre sus estudios
                                                </p>
                                            </div>
                                        </label>
                                        
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="CLIENTE_ENVIAR_CORREO"
                                                value="no"
                                                checked={data.CLIENTE_ENVIAR_CORREO === 'no'}
                                                onChange={(e) => setData('CLIENTE_ENVIAR_CORREO', e.target.value as 'si' | 'no')}
                                                className="h-4 w-4 text-[#189BAF] border-gray-300 focus:ring-[#189BAF]"
                                            />
                                            <div className="ml-3">
                                                <div className="flex items-center">
                                                    <MailX className="h-4 w-4 text-red-600 mr-2" />
                                                    <span className="text-sm font-medium text-gray-700">No enviar correos</span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    El cliente no recibirá notificaciones por correo electrónico
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                    {errors.CLIENTE_ENVIAR_CORREO && (
                                        <div className="flex items-center mt-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.CLIENTE_ENVIAR_CORREO}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="border-t pt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Los campos marcados con * son obligatorios
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Link
                                        href="/clientes"
                                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                                            processing
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-[#189BAF] hover:bg-[#157a8c] text-white'
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
                            </div>
                        </form>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-amber-800 mb-1">
                                Notas sobre la edición
                            </h4>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li>• La contraseña es opcional al editar, se mantendrá la actual si no se especifica una nueva</li>
                                <li>• El correo electrónico debe seguir siendo único en el sistema</li>
                                <li>• Los cambios se aplicarán inmediatamente después de guardar</li>
                                <li>• Se notificará al cliente si tiene el envío de correos habilitado</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}