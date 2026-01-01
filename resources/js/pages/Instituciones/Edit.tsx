import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Institucion, type InstitucionEditProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

// Interfaz que extiende PageProps para usePage
interface PageProps extends InstitucionEditProps {
    [key: string]: any;
}

export default function Edit() {
    const { institucion, estados_mexico } = usePage<PageProps>().props;

    // Verificar si los datos están disponibles
    if (!institucion) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Editar Institución - DIAHMOES" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#189BAF] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando institución...</p>
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
            title: 'Instituciones',
            href: '/instituciones',
        },
        {
            title: institucion.INSTITUCION_NOMBRE,
            href: `/instituciones/${institucion.ID_INSTITUCION}`,
        },
        {
            title: 'Editar',
            href: `/instituciones/${institucion.ID_INSTITUCION}/edit`,
        },
    ];

    const { data, setData, patch, processing, errors, reset } = useForm({
        INSTITUCION_NOMBRE: institucion.INSTITUCION_NOMBRE || '',
        INSTITUCION_CORREO: institucion.INSTITUCION_CORREO || '',
        INSTITUCION_TELEFONO: institucion.INSTITUCION_TELEFONO || '',
        INSTITUCION_RFC: institucion.INSTITUCION_RFC || '',
        INSTITUCION_RAZON_SOCIAL: institucion.INSTITUCION_RAZON_SOCIAL || '',
        INSTITUCION_DIRECCION: institucion.INSTITUCION_DIRECCION || '',
        INSTITUCION_NUMERO_EXT: institucion.INSTITUCION_NUMERO_EXT || '',
        INSTITUCION_NUMERO_INT: institucion.INSTITUCION_NUMERO_INT || '',
        INSTITUCION_COLONIA: institucion.INSTITUCION_COLONIA || '',
        INSTITUCION_MUNICIPIO: institucion.INSTITUCION_MUNICIPIO || '',
        INSTITUCION_CIUDAD: institucion.INSTITUCION_CIUDAD || '',
        INSTITUCION_ESTADO: institucion.INSTITUCION_ESTADO || '',
        INSTITUCION_CODIGO_POSTAL: institucion.INSTITUCION_CODIGO_POSTAL || '',
        INSTITUCION_PIN: institucion.INSTITUCION_PIN || '',
        INSTITUCION_PROCEDENCIA: institucion.INSTITUCION_PROCEDENCIA || '',
    });

    const [showPinField, setShowPinField] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('instituciones.update', institucion.ID_INSTITUCION), {
            onSuccess: () => {
                setShowPinField(false);
            }
        });
    };

    const regenerarPIN = () => {
        router.patch(`/instituciones/${institucion.ID_INSTITUCION}/regenerar-pin`, {}, {
            preserveState: true,
            onSuccess: () => {
                // El PIN se actualizará automáticamente en la respuesta
                setShowPinField(false);
            }
        });
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'activa':
                return 'border-green-500 bg-green-50';
            case 'inactiva':
                return 'border-red-500 bg-red-50';
            case 'suspendida':
                return 'border-yellow-500 bg-yellow-50';
            default:
                return 'border-gray-300 bg-gray-50';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${institucion.INSTITUCION_NOMBRE} - DIAHMOES`} />
            
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
                                <h1 className="text-3xl font-bold mb-2">Editar Institución</h1>
                                <p className="text-white/90 opacity-90">
                                    Modificar información de {institucion.INSTITUCION_NOMBRE}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={`/instituciones/${institucion.ID_INSTITUCION}`}
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Ver Institución</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Información básica */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center mb-6">
                            <svg className="h-6 w-6 text-[#189BAF] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-800">Información Básica</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="INSTITUCION_NOMBRE" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Institución *
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_NOMBRE"
                                    value={data.INSTITUCION_NOMBRE}
                                    onChange={(e) => setData('INSTITUCION_NOMBRE', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_NOMBRE 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="Hospital General, Clínica Santa Fe..."
                                />
                                {errors.INSTITUCION_NOMBRE && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_NOMBRE}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_RAZON_SOCIAL" className="block text-sm font-medium text-gray-700 mb-2">
                                    Razón Social *
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_RAZON_SOCIAL"
                                    value={data.INSTITUCION_RAZON_SOCIAL}
                                    onChange={(e) => setData('INSTITUCION_RAZON_SOCIAL', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_RAZON_SOCIAL 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="Razón social completa"
                                />
                                {errors.INSTITUCION_RAZON_SOCIAL && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_RAZON_SOCIAL}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_RFC" className="block text-sm font-medium text-gray-700 mb-2">
                                    RFC *
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_RFC"
                                    value={data.INSTITUCION_RFC}
                                    onChange={(e) => setData('INSTITUCION_RFC', e.target.value.toUpperCase())}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_RFC 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="ABC123456789"
                                    maxLength={12}
                                />
                                {errors.INSTITUCION_RFC && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_RFC}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_CORREO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Correo Electrónico *
                                </label>
                                <input
                                    type="email"
                                    id="INSTITUCION_CORREO"
                                    value={data.INSTITUCION_CORREO}
                                    onChange={(e) => setData('INSTITUCION_CORREO', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_CORREO 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="contacto@hospital.com"
                                />
                                {errors.INSTITUCION_CORREO && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_CORREO}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="INSTITUCION_TELEFONO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono *
                                </label>
                                <input
                                    type="tel"
                                    id="INSTITUCION_TELEFONO"
                                    value={data.INSTITUCION_TELEFONO}
                                    onChange={(e) => setData('INSTITUCION_TELEFONO', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_TELEFONO 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="(33) 1234-5678"
                                />
                                {errors.INSTITUCION_TELEFONO && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_TELEFONO}</p>
                                )}
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
                                    Calle y Número *
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_DIRECCION"
                                    value={data.INSTITUCION_DIRECCION}
                                    onChange={(e) => setData('INSTITUCION_DIRECCION', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_DIRECCION 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="Av. Principal, Calle Secundaria..."
                                />
                                {errors.INSTITUCION_DIRECCION && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_DIRECCION}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_NUMERO_EXT" className="block text-sm font-medium text-gray-700 mb-2">
                                    Número Exterior *
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_NUMERO_EXT"
                                    value={data.INSTITUCION_NUMERO_EXT}
                                    onChange={(e) => setData('INSTITUCION_NUMERO_EXT', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_NUMERO_EXT 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="123"
                                />
                                {errors.INSTITUCION_NUMERO_EXT && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_NUMERO_EXT}</p>
                                )}
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
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#189BAF] focus:outline-none focus:ring-1 focus:ring-[#189BAF] transition-colors"
                                    placeholder="A, B, 101..."
                                />
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_COLONIA" className="block text-sm font-medium text-gray-700 mb-2">
                                    Colonia *
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_COLONIA"
                                    value={data.INSTITUCION_COLONIA}
                                    onChange={(e) => setData('INSTITUCION_COLONIA', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_COLONIA 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="Centro, Zona Norte..."
                                />
                                {errors.INSTITUCION_COLONIA && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_COLONIA}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_MUNICIPIO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Municipio *
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_MUNICIPIO"
                                    value={data.INSTITUCION_MUNICIPIO}
                                    onChange={(e) => setData('INSTITUCION_MUNICIPIO', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_MUNICIPIO 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="Guadalajara, Zapopan..."
                                />
                                {errors.INSTITUCION_MUNICIPIO && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_MUNICIPIO}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_CIUDAD" className="block text-sm font-medium text-gray-700 mb-2">
                                    Ciudad *
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_CIUDAD"
                                    value={data.INSTITUCION_CIUDAD}
                                    onChange={(e) => setData('INSTITUCION_CIUDAD', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_CIUDAD 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="Guadalajara, Ciudad de México..."
                                />
                                {errors.INSTITUCION_CIUDAD && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_CIUDAD}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_ESTADO" className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado *
                                </label>
                                <select
                                    id="INSTITUCION_ESTADO"
                                    value={data.INSTITUCION_ESTADO}
                                    onChange={(e) => setData('INSTITUCION_ESTADO', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_ESTADO 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                >
                                    <option value="">Seleccione un estado</option>
                                    {Object.entries(estados_mexico || {}).map(([key, value]) => (
                                        <option key={key} value={value}>{value}</option>
                                    ))}
                                </select>
                                {errors.INSTITUCION_ESTADO && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_ESTADO}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="INSTITUCION_CODIGO_POSTAL" className="block text-sm font-medium text-gray-700 mb-2">
                                    Código Postal *
                                </label>
                                <input
                                    type="text"
                                    id="INSTITUCION_CODIGO_POSTAL"
                                    value={data.INSTITUCION_CODIGO_POSTAL}
                                    onChange={(e) => setData('INSTITUCION_CODIGO_POSTAL', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_CODIGO_POSTAL 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                    placeholder="44100"
                                    maxLength={5}
                                />
                                {errors.INSTITUCION_CODIGO_POSTAL && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_CODIGO_POSTAL}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="INSTITUCION_PROCEDENCIA" className="block text-sm font-medium text-gray-700 mb-2">
                                    Procedencia
                                </label>
                                <select
                                    id="INSTITUCION_PROCEDENCIA"
                                    value={data.INSTITUCION_PROCEDENCIA}
                                    onChange={(e) => setData('INSTITUCION_PROCEDENCIA', e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                        errors.INSTITUCION_PROCEDENCIA 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                    }`}
                                >
                                    <option value="">No especificado</option>
                                    <option value="Privado">Privado</option>
                                    <option value="IMSS">IMSS</option>
                                    <option value="ISSSTE">ISSSTE</option>
                                    <option value="SSA">SSA</option>
                                </select>
                                {errors.INSTITUCION_PROCEDENCIA && (
                                    <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_PROCEDENCIA}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PIN de Seguridad */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <svg className="h-6 w-6 text-[#D68B41] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <h2 className="text-xl font-bold text-gray-800">PIN de Seguridad</h2>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPinField(!showPinField)}
                                    className="text-[#189BAF] hover:text-[#157a8c] text-sm font-medium transition-colors"
                                >
                                    {showPinField ? 'Ocultar PIN' : 'Mostrar PIN'}
                                </button>
                                <button
                                    type="button"
                                    onClick={regenerarPIN}
                                    className="bg-[#D68B41] hover:bg-[#b8763a] text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                >
                                    Regenerar PIN
                                </button>
                            </div>
                        </div>

                        {showPinField ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="INSTITUCION_PIN" className="block text-sm font-medium text-gray-700 mb-2">
                                        PIN Actual
                                    </label>
                                    <input
                                        type="text"
                                        id="INSTITUCION_PIN"
                                        value={data.INSTITUCION_PIN}
                                        onChange={(e) => setData('INSTITUCION_PIN', e.target.value)}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
                                            errors.INSTITUCION_PIN 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:border-[#189BAF] focus:ring-[#189BAF]'
                                        }`}
                                        placeholder="PIN de 4 dígitos"
                                        maxLength={4}
                                    />
                                    {errors.INSTITUCION_PIN && (
                                        <p className="mt-1 text-sm text-red-600">{errors.INSTITUCION_PIN}</p>
                                    )}
                                </div>
                                <div className="flex items-end">
                                    <p className="text-sm text-gray-600">
                                        Este PIN se utiliza para autenticación adicional de la institución.
                                        Puede modificarlo manualmente o usar "Regenerar PIN" para crear uno nuevo automáticamente.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <p>Haz clic en "Mostrar PIN" para ver y modificar el PIN de seguridad</p>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={`/instituciones/${institucion.ID_INSTITUCION}`}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </Link>
                                <Link
                                    href="/instituciones"
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