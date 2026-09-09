import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Plus, Trash2, User } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { type EstudioPrv } from '@/types/estudios-prv';

// SIMPLIFICACIÓN: recepcion.tsx original busca/crea pacientes por nombre y
// apellidos vía /api/pacientes/buscar (con auto-creación al vuelo). Aquí
// uso el mismo patrón de combobox ligero que en Recolección: solo permite
// SELECCIONAR un paciente ya existente del catálogo. Si necesitas dar de
// alta pacientes nuevos desde este paso, lo agregamos después.
//
// SIMPLIFICACIÓN: sin validación de Folio Kit contra folios_kits (el
// original valida disponibilidad/estado en tiempo real). Los campos
// MUESTRA_FOLIO_KIT_BL / CADUCIDAD quedan como texto libre por ahora.

interface Paciente {
    ID_USUARIO: number;
    USUARIO_NOMBRE: string;
    USUARIO_APELLIDOS: string;
}

interface CorreoCopia {
    ID?: number;
    NOMBRE: string;
    CORREO: string;
}

interface EditRecepcionProps {
    estudio: EstudioPrv;
    pacientes: Paciente[];
    correosExistentes: CorreoCopia[];
    tiposEnvio: Record<string, string>;
    [key: string]: any;
}

export default function EditRecepcionPrv() {
    const { estudio, pacientes = [], correosExistentes = [] } = usePage<EditRecepcionProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios PRV', href: '/estudios-prv' },
        { title: estudio.CLAVE_INTERNA, href: `/estudios-prv/${estudio.ID}` },
        { title: 'Recepción', href: `/estudios-prv/${estudio.ID}/edit/recepcion` },
    ];

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [pacienteSearch, setPacienteSearch] = useState<{
        isOpen: boolean;
        searchText: string;
        selectedId: number;
    }>({
        isOpen: false,
        searchText: estudio.paciente ? `${estudio.paciente.USUARIO_NOMBRE} ${estudio.paciente.USUARIO_APELLIDOS}` : '',
        selectedId: estudio.ID_PACIENTE || 0,
    });

    const [listaCorreos, setListaCorreos] = useState<CorreoCopia[]>(correosExistentes);
    const [nuevoCorreo, setNuevoCorreo] = useState({ nombre: '', correo: '' });

    const [formData, setFormData] = useState({
        MUESTRA_CLAVE: estudio.MUESTRA_CLAVE || '',
        MUESTRA_FOLIO_SOBRE: estudio.MUESTRA_FOLIO_SOBRE || '',
        MUESTRA_FOLIO_KIT_BL: estudio.MUESTRA_FOLIO_KIT_BL || '',
        MUESTRA_FOLIO_KIT_BL_CADUCIDAD: estudio.MUESTRA_FOLIO_KIT_BL_CADUCIDAD?.split('T')[0] || '',
        MUESTRA_TIPO: estudio.MUESTRA_TIPO || '',
        MUESTRA_SITIO_LESION: estudio.MUESTRA_SITIO_LESION || '',
        MUESTRA_INICIALES: estudio.MUESTRA_INICIALES || '',
        MUESTRA_GENERO: estudio.MUESTRA_GENERO || '',
        MUESTRA_EDAD: estudio.MUESTRA_EDAD || '',
        MUESTRA_BLOQUES: estudio.MUESTRA_BLOQUES || '',
        MUESTRA_LAMINILLAS: estudio.MUESTRA_LAMINILLAS || '',
        MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA: estudio.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA || '',
        MUESTRA_DIAGNOSTICO_CLINICO: estudio.MUESTRA_DIAGNOSTICO_CLINICO || '',
        MUESTRA_LIQ_CONDICION: estudio.MUESTRA_LIQ_CONDICION || '',
        MUESTRA_LIQ_CONDICION_PRESENCIA: estudio.MUESTRA_LIQ_CONDICION_PRESENCIA || '',
        MUESTRA_LIQ_CANTIDAD_ADECUADA: estudio.MUESTRA_LIQ_CANTIDAD_ADECUADA || '',
        MUESTRA_LIQ_CANTIDAD_ML: estudio.MUESTRA_LIQ_CANTIDAD_ML || '',
        MUESTRA_LIQ_HEMOLISIS: estudio.MUESTRA_LIQ_HEMOLISIS || '',
        MUESTRA_LIQ_AMP_INDICACION: estudio.MUESTRA_LIQ_AMP_INDICACION || '',
        MUESTRA_LIQ_AMP_RAZON: estudio.MUESTRA_LIQ_AMP_RAZON || '',
        MUESTRA_LIQ_LIPEMICA: estudio.MUESTRA_LIQ_LIPEMICA || '',
        FECHA_RECEPCION: estudio.FECHA_RECEPCION ? estudio.FECHA_RECEPCION.split('T')[0] : new Date().toISOString().split('T')[0],
    });

    const esBiopsiaLiquida = estudio.MUESTRA_TIPO_ESTUDIO === 'Biopsia Líquida';

    const handleChange = (campo: keyof typeof formData, valor: string) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
    };

    const pacientesFiltrados = pacientes.filter(p =>
        `${p.USUARIO_NOMBRE} ${p.USUARIO_APELLIDOS}`.toLowerCase().includes(pacienteSearch.searchText.toLowerCase())
    );

    const agregarCorreo = () => {
        if (!nuevoCorreo.nombre.trim() || !nuevoCorreo.correo.trim()) return;
        setListaCorreos(prev => [...prev, { NOMBRE: nuevoCorreo.nombre, CORREO: nuevoCorreo.correo }]);
        setNuevoCorreo({ nombre: '', correo: '' });
    };

    const quitarCorreo = (index: number) => {
        setListaCorreos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        setProcessing(true);
        setErrors({});

        router.patch(`/estudios-prv/${estudio.ID}/recepcion`, {
            ...formData,
            ID_PACIENTE: pacienteSearch.selectedId || null,
        }, {
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recepción ${estudio.CLAVE_INTERNA} - DIAHMOES`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                        <p className="text-gray-600">Paso 2 de 4 · Recepción</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Columna izquierda: Paciente + Muestra */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-[#189BAF]" /> Paciente
                            </h3>
                            <div className="relative">
                                <label className="block text-sm font-medium mb-1">Paciente</label>
                                <input
                                    type="text"
                                    value={pacienteSearch.searchText}
                                    onChange={(e) => setPacienteSearch({ ...pacienteSearch, searchText: e.target.value, isOpen: true })}
                                    onFocus={() => setPacienteSearch({ ...pacienteSearch, isOpen: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    placeholder="Buscar paciente..."
                                />
                                {pacienteSearch.isOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {pacientesFiltrados.map(p => (
                                            <div
                                                key={p.ID_USUARIO}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => setPacienteSearch({
                                                    isOpen: false,
                                                    searchText: `${p.USUARIO_NOMBRE} ${p.USUARIO_APELLIDOS}`,
                                                    selectedId: p.ID_USUARIO,
                                                })}
                                            >
                                                {p.USUARIO_NOMBRE} {p.USUARIO_APELLIDOS}
                                            </div>
                                        ))}
                                        {pacientesFiltrados.length === 0 && (
                                            <div className="px-3 py-2 text-gray-500 italic">Sin resultados</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Iniciales</label>
                                    <input
                                        type="text"
                                        value={formData.MUESTRA_INICIALES}
                                        onChange={(e) => handleChange('MUESTRA_INICIALES', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Edad</label>
                                    <input
                                        type="text"
                                        value={formData.MUESTRA_EDAD}
                                        onChange={(e) => handleChange('MUESTRA_EDAD', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-1">Género</label>
                                <select
                                    value={formData.MUESTRA_GENERO}
                                    onChange={(e) => handleChange('MUESTRA_GENERO', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Datos de la Muestra</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha de Recepción *</label>
                                    <input
                                        type="date"
                                        value={formData.FECHA_RECEPCION}
                                        onChange={(e) => handleChange('FECHA_RECEPCION', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Clave de Muestra</label>
                                    <input
                                        type="text"
                                        value={formData.MUESTRA_CLAVE}
                                        onChange={(e) => handleChange('MUESTRA_CLAVE', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Folio de Sobre</label>
                                        <input
                                            type="text"
                                            value={formData.MUESTRA_FOLIO_SOBRE}
                                            onChange={(e) => handleChange('MUESTRA_FOLIO_SOBRE', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Folio Kit BL</label>
                                        <input
                                            type="text"
                                            value={formData.MUESTRA_FOLIO_KIT_BL}
                                            onChange={(e) => handleChange('MUESTRA_FOLIO_KIT_BL', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Caducidad Kit BL</label>
                                    <input
                                        type="date"
                                        value={formData.MUESTRA_FOLIO_KIT_BL_CADUCIDAD}
                                        onChange={(e) => handleChange('MUESTRA_FOLIO_KIT_BL_CADUCIDAD', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo de Muestra</label>
                                    <input
                                        type="text"
                                        value={formData.MUESTRA_TIPO}
                                        onChange={(e) => handleChange('MUESTRA_TIPO', e.target.value)}
                                        placeholder="Ej: Bloque de parafina, Sangre total..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Sitio de Lesión</label>
                                    <input
                                        type="text"
                                        value={formData.MUESTRA_SITIO_LESION}
                                        onChange={(e) => handleChange('MUESTRA_SITIO_LESION', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    />
                                </div>

                                {!esBiopsiaLiquida && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Bloques</label>
                                            <input
                                                type="text"
                                                value={formData.MUESTRA_BLOQUES}
                                                onChange={(e) => handleChange('MUESTRA_BLOQUES', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Laminillas</label>
                                            <input
                                                type="text"
                                                value={formData.MUESTRA_LAMINILLAS}
                                                onChange={(e) => handleChange('MUESTRA_LAMINILLAS', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                            />
                                        </div>
                                    </div>
                                )}

                                {esBiopsiaLiquida && (
                                    <div className="border-t pt-4 space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-700">Sangre Total / Líquido</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Condición</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_LIQ_CONDICION}
                                                    onChange={(e) => handleChange('MUESTRA_LIQ_CONDICION', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Cantidad (ml)</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_LIQ_CANTIDAD_ML}
                                                    onChange={(e) => handleChange('MUESTRA_LIQ_CANTIDAD_ML', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Hemólisis</label>
                                            <input
                                                type="text"
                                                value={formData.MUESTRA_LIQ_HEMOLISIS}
                                                onChange={(e) => handleChange('MUESTRA_LIQ_HEMOLISIS', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">¿Lipémica?</label>
                                            <select
                                                value={formData.MUESTRA_LIQ_LIPEMICA}
                                                onChange={(e) => handleChange('MUESTRA_LIQ_LIPEMICA', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="Si">Sí</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha: Diagnóstico + Correos de copia */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Información Clínica</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Diagnóstico Clínico</label>
                                    <textarea
                                        value={formData.MUESTRA_DIAGNOSTICO_CLINICO}
                                        onChange={(e) => handleChange('MUESTRA_DIAGNOSTICO_CLINICO', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Diagnóstico Histopatológico de Referencia</label>
                                    <textarea
                                        value={formData.MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA}
                                        onChange={(e) => handleChange('MUESTRA_DIAGNOSTICO_HISTOPATOLOGICO_REFERENCIA', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SIMPLIFICACIÓN: gestión de correos de copia solo
                            en memoria del lado cliente en este paso — se
                            guardan en la BD hasta que conectemos el
                            endpoint api/estudios-prv/{id}/correos-copia
                            (equivalente al storeCorreoCopia/destroyCorreoCopia
                            de Estudio normal). Por ahora, esta lista es
                            informativa; te aviso si quieres que la
                            conectemos ya. */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Correos de Copia</h3>
                            <div className="space-y-2 mb-4">
                                {listaCorreos.map((correo, index) => (
                                    <div key={correo.ID ?? `nuevo-${index}`} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">{correo.NOMBRE}</div>
                                            <div className="text-xs text-gray-500">{correo.CORREO}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => quitarCorreo(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {listaCorreos.length === 0 && (
                                    <p className="text-sm text-gray-400 italic">Sin correos de copia registrados</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={nuevoCorreo.nombre}
                                    onChange={(e) => setNuevoCorreo(prev => ({ ...prev, nombre: e.target.value }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={nuevoCorreo.correo}
                                    onChange={(e) => setNuevoCorreo(prev => ({ ...prev, correo: e.target.value }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                                <button
                                    type="button"
                                    onClick={agregarCorreo}
                                    className="px-3 py-2 bg-[#189BAF] text-white rounded-md hover:bg-[#157a8c]"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href={`/estudios-prv/${estudio.ID}`}>
                        <Button variant="outline" disabled={processing}>Cancelar</Button>
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {processing ? 'Guardando...' : 'Guardar y Continuar'}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}