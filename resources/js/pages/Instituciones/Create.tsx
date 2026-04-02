import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type InstitucionCreateProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Instituciones', href: '/instituciones' },
    { title: 'Nueva Institución', href: '/instituciones/create' },
];

interface PageProps extends InstitucionCreateProps {
    [key: string]: any;
}

export default function Create() {
    const { estados_mexico } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        INSTITUCION_NOMBRE:        '',
        INSTITUCION_CORREO:        '',
        INSTITUCION_TELEFONO:      '',
        INSTITUCION_RFC:           '',
        INSTITUCION_RAZON_SOCIAL:  '',
        INSTITUCION_DIRECCION:     '',
        INSTITUCION_NUMERO_EXT:    '',
        INSTITUCION_NUMERO_INT:    '',
        INSTITUCION_COLONIA:       '',
        INSTITUCION_MUNICIPIO:     '',
        INSTITUCION_CIUDAD:        '',
        INSTITUCION_ESTADO:        '',
        INSTITUCION_CODIGO_POSTAL: '',
        INSTITUCION_PROCEDENCIA:   '',
    });

    const inputClass = (field?: string) =>
        `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
            field
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
        }`;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('instituciones.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Institución - DIAHMOES" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#189BAF] to-[#157a8c] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Nueva Institución</h1>
                                <p className="text-white/90">Registrar nueva institución médica en el sistema</p>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Link
                                href="/instituciones"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span>Ver Lista</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Vista previa */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#189BAF]/10">
                                <svg className="h-5 w-5 text-[#189BAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Creando institución:</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {data.INSTITUCION_NOMBRE || 'Nueva Institución Médica'}
                                </p>
                                {data.INSTITUCION_CIUDAD && data.INSTITUCION_ESTADO && (
                                    <p className="text-sm text-gray-500">
                                        {data.INSTITUCION_CIUDAD}, {data.INSTITUCION_ESTADO}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="px-4 py-2 rounded-full text-sm font-medium border bg-gray-100 text-gray-700 border-gray-300">
                            Nueva Institución
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Información Básica */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <svg className="h-6 w-6 text-[#189BAF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-800">Información Básica</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre - ÚNICO OBLIGATORIO */}
                            <div>
                                <label htmlFor="INSTITUCION_NOMBRE" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Institución <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_NOMBRE"
                                    value={data.INSTITUCION_NOMBRE}
                                    onChange={(e) => setData('INSTITUCION_NOMBRE', e.target.value)}
                                    className={inputClass(errors.INSTITUCION_NOMBRE)}
                                    placeholder="Hospital General, Clínica Santa Fe..."
                                />
                                {errors.INSTITUCION_NOMBRE && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_NOMBRE}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_RAZON_SOCIAL" className="block text-sm font-medium text-gray-700 mb-2">
                                    Razón Social
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_RAZON_SOCIAL"
                                    value={data.INSTITUCION_RAZON_SOCIAL}
                                    onChange={(e) => setData('INSTITUCION_RAZON_SOCIAL', e.target.value)}
                                    className={inputClass()}
                                    placeholder="Razón social completa"
                                />
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_RFC" className="block text-sm font-medium text-gray-700 mb-2">
                                    RFC
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_RFC"
                                    value={data.INSTITUCION_RFC}
                                    onChange={(e) => setData('INSTITUCION_RFC', e.target.value.toUpperCase())}
                                    className={inputClass()}
                                    placeholder="ABC123456789"
                                    maxLength={13}
                                />
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_CORREO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    id="INSTITUCION_CORREO"
                                    value={data.INSTITUCION_CORREO}
                                    onChange={(e) => setData('INSTITUCION_CORREO', e.target.value)}
                                    className={inputClass(errors.INSTITUCION_CORREO)}
                                    placeholder="contacto@hospital.com"
                                />
                                {errors.INSTITUCION_CORREO && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_CORREO}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="INSTITUCION_TELEFONO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    id="INSTITUCION_TELEFONO"
                                    value={data.INSTITUCION_TELEFONO}
                                    onChange={(e) => setData('INSTITUCION_TELEFONO', e.target.value)}
                                    className={inputClass()}
                                    placeholder="(33) 1234-5678"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <svg className="h-6 w-6 text-[#D68B41] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-800">Dirección</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="INSTITUCION_DIRECCION" className="block text-sm font-medium text-gray-700 mb-2">
                                    Calle
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_DIRECCION"
                                    value={data.INSTITUCION_DIRECCION}
                                    onChange={(e) => setData('INSTITUCION_DIRECCION', e.target.value)}
                                    className={inputClass()}
                                    placeholder="Av. Principal, Calle Secundaria..."
                                />
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_NUMERO_EXT" className="block text-sm font-medium text-gray-700 mb-2">
                                    Número Exterior
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_NUMERO_EXT"
                                    value={data.INSTITUCION_NUMERO_EXT}
                                    onChange={(e) => setData('INSTITUCION_NUMERO_EXT', e.target.value)}
                                    className={inputClass()}
                                    placeholder="123"
                                />
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_NUMERO_INT" className="block text-sm font-medium text-gray-700 mb-2">
                                    Número Interior
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_NUMERO_INT"
                                    value={data.INSTITUCION_NUMERO_INT}
                                    onChange={(e) => setData('INSTITUCION_NUMERO_INT', e.target.value)}
                                    className={inputClass()}
                                    placeholder="A, B, 101..."
                                />
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_COLONIA" className="block text-sm font-medium text-gray-700 mb-2">
                                    Colonia
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_COLONIA"
                                    value={data.INSTITUCION_COLONIA}
                                    onChange={(e) => setData('INSTITUCION_COLONIA', e.target.value)}
                                    className={inputClass()}
                                    placeholder="Centro, Zona Norte..."
                                />
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_MUNICIPIO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Municipio
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_MUNICIPIO"
                                    value={data.INSTITUCION_MUNICIPIO}
                                    onChange={(e) => setData('INSTITUCION_MUNICIPIO', e.target.value)}
                                    className={inputClass()}
                                    placeholder="Guadalajara, Zapopan..."
                                />
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_CIUDAD" className="block text-sm font-medium text-gray-700 mb-2">
                                    Ciudad
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_CIUDAD"
                                    value={data.INSTITUCION_CIUDAD}
                                    onChange={(e) => setData('INSTITUCION_CIUDAD', e.target.value)}
                                    className={inputClass()}
                                    placeholder="Guadalajara, Ciudad de México..."
                                />
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_ESTADO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    id="INSTITUCION_ESTADO"
                                    value={data.INSTITUCION_ESTADO}
                                    onChange={(e) => setData('INSTITUCION_ESTADO', e.target.value)}
                                    className={inputClass()}
                                >
                                    <option value="">Seleccione un estado</option>
                                    {Object.entries(estados_mexico || {}).map(([key, value]) => (
                                        <option key={key} value={value as string}>{value as string}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_CODIGO_POSTAL" className="block text-sm font-medium text-gray-700 mb-2">
                                    Código Postal
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_CODIGO_POSTAL"
                                    value={data.INSTITUCION_CODIGO_POSTAL}
                                    onChange={(e) => setData('INSTITUCION_CODIGO_POSTAL', e.target.value)}
                                    className={inputClass()}
                                    placeholder="44100"
                                    maxLength={5}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="INSTITUCION_PROCEDENCIA" className="block text-sm font-medium text-gray-700 mb-2">
                                    Procedencia
                                </label>
                                <select
                                    id="INSTITUCION_PROCEDENCIA"
                                    value={data.INSTITUCION_PROCEDENCIA}
                                    onChange={(e) => setData('INSTITUCION_PROCEDENCIA', e.target.value)}
                                    className={inputClass()}
                                >
                                    <option value="">No especificado</option>
                                    <option value="Privado">Privado</option>
                                    <option value="IMSS">IMSS</option>
                                    <option value="ISSSTE">ISSSTE</option>
                                    <option value="SSA">SSA</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/instituciones"
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
                                        <span>Creando Institución...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Crear Institución</span>
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