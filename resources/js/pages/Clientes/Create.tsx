import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ClienteForm } from '@/types/clientes';
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
    CheckCircle2
} from 'lucide-react';

interface PageProps extends Record<string, any> {
    // Props específicas si las hay
}

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
        title: 'Nuevo Cliente',
        href: '/clientes/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        CLIENTE_NOMBRE: '',
        CLIENTE_CORREO: '',
        CLIENTE_PASS: '',
        CLIENTE_PASS_confirmation: '',
        CLIENTE_ENVIAR_CORREO: 'si' as 'si' | 'no',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/clientes', {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Cliente - DIAHMOES" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <User className="h-7 w-7 text-[#189BAF] mr-3" />
                            Nuevo Cliente
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Agrega un nuevo cliente al sistema
                        </p>
                    </div>
                    <Link
                        href="/clientes"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </Link>
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
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Lock className="h-5 w-5 text-gray-500 mr-2" />
                                    Configuración de Seguridad
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Contraseña */}
                                    <div>
                                        <label htmlFor="CLIENTE_PASS" className="block text-sm font-medium text-gray-700 mb-2">
                                            Contraseña *
                                        </label>
                                        <input
                                            id="CLIENTE_PASS"
                                            type="password"
                                            value={data.CLIENTE_PASS}
                                            onChange={(e) => setData('CLIENTE_PASS', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                errors.CLIENTE_PASS
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                    : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                            }`}
                                            placeholder="Mínimo 6 caracteres"
                                            required
                                        />
                                        {errors.CLIENTE_PASS && (
                                            <div className="flex items-center mt-2 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.CLIENTE_PASS}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirmar contraseña */}
                                    <div>
                                        <label htmlFor="CLIENTE_PASS_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmar Contraseña *
                                        </label>
                                        <input
                                            id="CLIENTE_PASS_confirmation"
                                            type="password"
                                            value={data.CLIENTE_PASS_confirmation}
                                            onChange={(e) => setData('CLIENTE_PASS_confirmation', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                errors.CLIENTE_PASS_confirmation
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                                                    : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                            }`}
                                            placeholder="Repite la contraseña"
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
                                                <span>Crear Cliente</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-800 mb-1">
                                Información importante
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• El correo electrónico debe ser único en el sistema</li>
                                <li>• La contraseña debe tener al menos 6 caracteres</li>
                                <li>• La configuración de envío de correos se puede cambiar posteriormente</li>
                                <li>• El cliente podrá iniciar sesión con su correo y contraseña</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}