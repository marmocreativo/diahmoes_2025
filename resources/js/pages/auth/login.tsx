import { FormEventHandler, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    canResetPassword?: boolean;
    status?: string;
}

export default function Login({ canResetPassword, status }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <>
            <Head title="Iniciar Sesión - DIAHMOES" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#189BAF]/10 to-[#D68B41]/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#189BAF]">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#189BAF] mb-2">
                            DIAHMOES
                        </h2>
                        <p className="text-gray-600">
                            Iniciar sesión en el sistema
                        </p>
                    </div>

                    {/* Card de Login */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {status && (
                            <div className="rounded-lg bg-[#189BAF]/10 border border-[#189BAF]/20 p-4 mb-6">
                                <div className="text-sm font-medium text-[#189BAF]">
                                    {status}
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-[#189BAF] transition-colors duration-200"
                                    placeholder="tu@correo.com"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-[#189BAF] transition-colors duration-200"
                                    placeholder="Tu contraseña"
                                />
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked as any)}
                                        className="h-4 w-4 text-[#189BAF] focus:ring-[#189BAF] border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                        Recordarme
                                    </label>
                                </div>

                                {canResetPassword && (
                                    <div className="text-sm">
                                        <Link
                                            href={route('password.request')}
                                            className="font-medium text-[#189BAF] hover:text-[#157a8c] transition-colors duration-200"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
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
                                            Iniciando sesión...
                                        </div>
                                    ) : (
                                        'Iniciar Sesión'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Link para regresar */}
                    <div className="text-center mt-6">
                        <Link
                            href="/"
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Regresar al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}