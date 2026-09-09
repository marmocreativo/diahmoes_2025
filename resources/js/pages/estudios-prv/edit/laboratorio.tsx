import { useState, useMemo } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { type EstudioPrv } from '@/types/estudios-prv';

// Formulario 100% dinámico: lee la definición de campos (CAMPOS) de la
// plantilla seleccionada y renderiza los inputs correspondientes. Agregar
// una plantilla nueva NO requiere tocar este archivo — solo insertar una
// fila en estudios_prv_plantillas_resultado.

interface CampoDefinicion {
    key: string;
    label: string;
    tipo: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'tabla';
    opciones?: string[];
    placeholder?: string;
    requerido?: boolean;
    columnas?: string[];
    filas_fijas?: string[][];
}

interface SeccionDefinicion {
    seccion: string;
    campos: CampoDefinicion[];
}

interface Plantilla {
    ID: number;
    CODIGO: string;
    NOMBRE: string;
    DESCRIPCION: string | null;
    CAMPOS: SeccionDefinicion[];
}

interface Resultado {
    ID: number;
    CODIGO_PLANTILLA: string;
    DATOS: Record<string, any>;
}

interface EditLaboratorioProps {
    estudio: EstudioPrv;
    plantillas: Plantilla[];
    resultado: Resultado | null;
    [key: string]: any;
}

export default function EditLaboratorioPrv() {
    const { estudio, plantillas, resultado } = usePage<EditLaboratorioProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios PRV', href: '/estudios-prv' },
        { title: estudio.CLAVE_INTERNA, href: `/estudios-prv/${estudio.ID}` },
        { title: 'Laboratorio', href: `/estudios-prv/${estudio.ID}/edit/laboratorio` },
    ];

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [codigoPlantilla, setCodigoPlantilla] = useState(resultado?.CODIGO_PLANTILLA || '');
    const [datos, setDatos] = useState<Record<string, any>>(resultado?.DATOS || {});

    const [fechaRecepcionLab, setFechaRecepcionLab] = useState(
        estudio.FECHA_RECEPCION_LABORATORIO ? estudio.FECHA_RECEPCION_LABORATORIO.split('T')[0] : new Date().toISOString().split('T')[0]
    );
    const [fechaResultados, setFechaResultados] = useState(
        estudio.FECHA_OBTENCION_RESULTADOS ? estudio.FECHA_OBTENCION_RESULTADOS.split('T')[0] : ''
    );

    const plantillaActiva = useMemo(
        () => plantillas.find(p => p.CODIGO === codigoPlantilla) || null,
        [codigoPlantilla, plantillas]
    );

    const handleCambiarPlantilla = (codigo: string) => {
        setCodigoPlantilla(codigo);
        // Si cambias de plantilla, reiniciamos los datos capturados para
        // evitar mezclar campos de una plantilla con otra.
        if (codigo !== resultado?.CODIGO_PLANTILLA) {
            setDatos({});
        } else {
            setDatos(resultado?.DATOS || {});
        }
    };

    const handleCampoChange = (key: string, valor: any) => {
        setDatos(prev => ({ ...prev, [key]: valor }));
    };

    // --- Manejo de campos tipo "tabla" (filas dinámicas) ---
    const getFilasTabla = (campo: CampoDefinicion): string[][] => {
        const valorGuardado = datos[campo.key];
        if (Array.isArray(valorGuardado) && valorGuardado.length > 0) return valorGuardado;
        if (campo.filas_fijas) return campo.filas_fijas.map(fila => [...fila]);
        return [campo.columnas!.map(() => '')];
    };

    const handleTablaCambio = (campo: CampoDefinicion, filaIndex: number, colIndex: number, valor: string) => {
        const filas = getFilasTabla(campo).map(f => [...f]);
        filas[filaIndex][colIndex] = valor;
        handleCampoChange(campo.key, filas);
    };

    const agregarFilaTabla = (campo: CampoDefinicion) => {
        const filas = getFilasTabla(campo);
        handleCampoChange(campo.key, [...filas, campo.columnas!.map(() => '')]);
    };

    const quitarFilaTabla = (campo: CampoDefinicion, index: number) => {
        const filas = getFilasTabla(campo).filter((_, i) => i !== index);
        handleCampoChange(campo.key, filas);
    };

    const guardar = (marcarListo: boolean) => {
        if (!codigoPlantilla) {
            alert('Selecciona una plantilla de resultado antes de guardar.');
            return;
        }

        setProcessing(true);
        setErrors({});

        router.patch(`/estudios-prv/${estudio.ID}/laboratorio`, {
            CODIGO_PLANTILLA: codigoPlantilla,
            DATOS: datos,
            FECHA_RECEPCION_LABORATORIO: fechaRecepcionLab,
            FECHA_OBTENCION_RESULTADOS: fechaResultados,
            marcar_listo: marcarListo,
        }, {
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    const renderCampo = (campo: CampoDefinicion) => {
        const valor = datos[campo.key] ?? '';

        switch (campo.tipo) {
            case 'textarea':
                return (
                    <textarea
                        value={valor}
                        onChange={(e) => handleCampoChange(campo.key, e.target.value)}
                        rows={3}
                        placeholder={campo.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={valor}
                        onChange={(e) => handleCampoChange(campo.key, e.target.value)}
                        placeholder={campo.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={valor}
                        onChange={(e) => handleCampoChange(campo.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                    />
                );
            case 'select':
                return (
                    <select
                        value={valor}
                        onChange={(e) => handleCampoChange(campo.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                    >
                        <option value="">Seleccione...</option>
                        {campo.opciones?.map(op => (
                            <option key={op} value={op}>{op}</option>
                        ))}
                    </select>
                );
            case 'tabla': {
                const filas = getFilasTabla(campo);
                return (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {campo.columnas!.map(col => (
                                        <th key={col} className="px-2 py-2 text-left font-medium text-gray-600">{col}</th>
                                    ))}
                                    <th className="w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filas.map((fila, filaIndex) => (
                                    <tr key={filaIndex} className="border-t border-gray-100">
                                        {fila.map((celda, colIndex) => (
                                            <td key={colIndex} className="px-2 py-1">
                                                <input
                                                    type="text"
                                                    value={celda}
                                                    onChange={(e) => handleTablaCambio(campo, filaIndex, colIndex, e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#189BAF]"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-2 py-1">
                                            <button
                                                type="button"
                                                onClick={() => quitarFilaTabla(campo, filaIndex)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            type="button"
                            onClick={() => agregarFilaTabla(campo)}
                            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-[#189BAF] hover:bg-[#189BAF]/5 border-t border-gray-100"
                        >
                            <Plus className="h-3 w-3" /> Agregar fila
                        </button>
                    </div>
                );
            }
            case 'text':
            default:
                return (
                    <input
                        type="text"
                        value={valor}
                        onChange={(e) => handleCampoChange(campo.key, e.target.value)}
                        placeholder={campo.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                    />
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Laboratorio ${estudio.CLAVE_INTERNA} - DIAHMOES`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                        <p className="text-gray-600">Paso 3 de 4 · Laboratorio</p>
                    </div>
                    <Link href={`/estudios-prv/${estudio.ID}`}>
                        <Button variant="outline">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Volver al estudio
                        </Button>
                    </Link>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-2">Corrija los siguientes errores:</h4>
                        <ul className="list-disc list-inside text-red-700 text-sm">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field}>{String(message)}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl">
                    <h3 className="text-lg font-semibold mb-4">Plantilla de Resultado</h3>
                    <select
                        value={codigoPlantilla}
                        onChange={(e) => handleCambiarPlantilla(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                    >
                        <option value="">Selecciona el tipo de estudio de laboratorio...</option>
                        {plantillas.map(p => (
                            <option key={p.CODIGO} value={p.CODIGO}>{p.NOMBRE}</option>
                        ))}
                    </select>
                    {plantillaActiva?.DESCRIPCION && (
                        <p className="text-xs text-gray-500 mt-1">{plantillaActiva.DESCRIPCION}</p>
                    )}
                    <p className="text-xs text-[#189BAF] mt-2">
                        Al guardar, el "Tipo de Estudio" del expediente se actualizará automáticamente a: <strong>{plantillaActiva?.NOMBRE || estudio.MUESTRA_TIPO_ESTUDIO || '—'}</strong>
                    </p>
                </div>

                {plantillaActiva && (
                    <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl space-y-6">
                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                            <div>
                                <label className="block text-sm font-medium mb-1">Recepción en Laboratorio</label>
                                <input
                                    type="date"
                                    value={fechaRecepcionLab}
                                    onChange={(e) => setFechaRecepcionLab(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Obtención de Resultados</label>
                                <input
                                    type="date"
                                    value={fechaResultados}
                                    onChange={(e) => setFechaResultados(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                            </div>
                        </div>

                        {plantillaActiva.CAMPOS.map((seccion, i) => (
                            <div key={i}>
                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                    {seccion.seccion}
                                </h4>
                                <div className="space-y-4">
                                    {seccion.campos.map(campo => (
                                        <div key={campo.key}>
                                            <label className="block text-sm font-medium mb-1">
                                                {campo.label} {campo.requerido && <span className="text-red-500">*</span>}
                                            </label>
                                            {renderCampo(campo)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end gap-3 max-w-3xl">
                    <Button
                        variant="outline"
                        onClick={() => guardar(false)}
                        disabled={processing || !codigoPlantilla}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar sin avanzar
                    </Button>
                    <Button
                        onClick={() => guardar(true)}
                        disabled={processing || !codigoPlantilla}
                        className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {processing ? 'Guardando...' : 'Marcar como Listo para Informe'}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}