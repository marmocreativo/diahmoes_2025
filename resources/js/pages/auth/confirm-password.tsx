import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Confirmar Contraseña - DIAHMOES" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#189BAF]/10 to-[#D68B41]/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D68B41]">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-1.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#189BAF] mb-2">
                            DIAHMOES
                        </h2>
                        <p className="text-gray-600 mb-2">
                            Confirmación de Seguridad
                        </p>
                        <p className="text-sm text-gray-500">
                            Confirma tu contraseña para acceder a esta área segura
                        </p>
                    </div>

                    {/* Card de Confirmación */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Alerta de seguridad */}
                        <div className="bg-[#D68B41]/10 border border-[#D68B41]/20 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-[#D68B41] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-[#D68B41]">
                                        Área Protegida
                                    </p>
                                    <p className="text-xs text-[#D68B41]/80 mt-1">
                                        Esta es un área segura de la aplicación que requiere verificación adicional.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contraseña Actual
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        autoFocus
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-[#189BAF] transition-colors duration-200"
                                        placeholder="Ingresa tu contraseña actual"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Información adicional */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-[#189BAF] mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium mb-1">¿Por qué necesitamos esto?</p>
                                        <p className="text-xs text-gray-500">
                                            Por tu seguridad, necesitamos verificar tu identidad antes de permitir el acceso a información sensible o realizar cambios importantes en el sistema.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-[#189BAF] hover:bg-[#157a8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#189BAF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verificando...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Confirmar Contraseña
                                        </div>
                                    )}
                                </button>

                                {/* Botón alternativo para salir */}
                                <Link
                                    href={route('dashboard')}
                                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#189BAF] transition-colors duration-200 text-center"
                                >
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Cancelar y Regresar
                                    </div>
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Links de navegación */}
                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-500">
                            ¿Olvidaste tu contraseña?{' '}
                            <Link
                                href={route('password.request')}
                                className="text-[#189BAF] hover:text-[#157a8c] transition-colors duration-200"
                            >
                                Recupérala aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}