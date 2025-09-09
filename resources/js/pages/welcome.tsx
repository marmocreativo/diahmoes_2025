import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="DIAHMOES - Sistema de Gestión de Estudios Médicos">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-[#189BAF]/5 to-[#D68B41]/5 p-6 text-gray-800 lg:justify-center lg:p-8">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-lg border border-[#189BAF] bg-[#189BAF] px-6 py-2 text-sm font-medium leading-normal text-white hover:bg-[#157a8c] transition-colors duration-200"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-block rounded-lg bg-[#189BAF] px-6 py-2 text-sm font-medium leading-normal text-white hover:bg-[#157a8c] transition-colors duration-200"
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </nav>
                </header>
                
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow">
                    <main className="flex w-full max-w-[800px] flex-col items-center text-center">
                        {/* Logo Principal */}
                        <div className="mb-8">
                            <div className="flex justify-center mb-6">
                                <div className="flex h-50 w-50 items-center justify-center rounded-full bg-[#189BAF]">
                                    <img src="./assets/logo.png" alt="" />
                                </div>
                            </div>
                            <h1 className="mb-4 text-5xl font-bold text-[#189BAF] lg:text-6xl">
                                DIAHMOES
                            </h1>
                            <p className="text-2xl text-gray-600 mb-4">
                                Sistema de Gestión de Estudios Médicos
                            </p>
                        </div>

                        {/* Características principales en grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-center mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10 mr-4">
                                        <svg className="h-5 w-5 text-[#189BAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Gestión de Estudios</h3>
                                </div>
                                <p className="text-gray-600">
                                    Control completo del flujo de trabajo desde la solicitud hasta la entrega de resultados
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-center mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D68B41]/10 mr-4">
                                        <svg className="h-5 w-5 text-[#D68B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Análisis Genéticos</h3>
                                </div>
                                <p className="text-gray-600">
                                    Soporte para estudios KRAS, NRAS, BRAF y otros marcadores moleculares
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-center mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#189BAF]/10 mr-4">
                                        <svg className="h-5 w-5 text-[#189BAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Gestión de Usuarios</h3>
                                </div>
                                <p className="text-gray-600">
                                    Administración de instituciones médicas y perfiles de usuario
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-center mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D68B41]/10 mr-4">
                                        <svg className="h-5 w-5 text-[#D68B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Trazabilidad Completa</h3>
                                </div>
                                <p className="text-gray-600">
                                    Seguimiento detallado de muestras, envíos y resultados con control de calidad
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="text-center text-sm text-gray-500">
                            <p>&copy; 2025 DIAHMOES. Sistema de Gestión de Estudios Médicos.</p>
                        </footer>
                    </main>
                </div>
            </div>
        </>
    );
}