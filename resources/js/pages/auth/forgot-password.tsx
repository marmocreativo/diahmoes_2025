import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    status?: string;
}

export default function ForgotPassword({ status }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Recuperar Contraseña - DIAHMOES" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#189BAF]/10 to-[#D68B41]/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#189BAF]">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#189BAF] mb-2">
                            DIAHMOES
                        </h2>
                        <p className="text-gray-600 mb-2">
                            Recuperar Contraseña
                        </p>
                        <p className="text-sm text-gray-500">
                            Ingresa tu correo electrónico para recibir un enlace de restablecimiento
                        </p>
                    </div>

                    {/* Card de Recuperación */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {status && (
                            <div className="rounded-lg bg-[#189BAF]/10 border border-[#189BAF]/20 p-4 mb-6">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-[#189BAF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm font-medium text-[#189BAF]">
                                        {status}
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        autoFocus
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-[#189BAF] transition-colors duration-200"
                                        placeholder="tu@correo.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
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
                                            Enviando enlace...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Enviar Enlace de Recuperación
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Información adicional */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium mb-1">¿No recuerdas tu correo?</p>
                                        <p>Contacta al administrador del sistema para obtener ayuda con la recuperación de tu cuenta.</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Links de navegación */}
                    <div className="mt-6 flex justify-center space-x-4 text-sm">
                        <Link
                            href={route('login')}
                            className="text-[#189BAF] hover:text-[#157a8c] transition-colors duration-200 flex items-center"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Regresar al login
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                            href="/"
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        >
                            Ir al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}