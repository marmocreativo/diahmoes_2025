import { useState, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { type EstudioPrvCreateProps } from '@/types/estudios-prv';

// SIMPLIFICACIÓN: a diferencia de estudios/create.tsx, aquí NO hay
// combobox de Cliente (no existe ID_CLIENTE en estudios_prv), ni opción
// de "crear médico/institución nuevos al vuelo" (manejarNuevoCliente,
// obtenerIdMedico, etc. del EstudioController original). El buscador de
// médico/institución solo permite ELEGIR de catálogos existentes.
// Tampoco hay campos de paciente aquí: según el flujo que definiste,
// paciente se captura en el paso 2 (Recepción), no en Recolección.

interface FormularioRecoleccion {
    FOLIO_MERCK: string;
    ID_MEDICO: number;
    ID_INSTITUCION: number;
    FECHA_SOLICITUD_RECOLECCION: string;
    MUESTRA_TIPO_ESTUDIO: string;
    MUESTRA_ENVIO: string;
    MUESTRA_ENVIO_TIPO: string;
    MUESTRA_GUIA_MENSAJERIA: string;
    MUESTRA_GUIA: string;
    MUESTRA_DIRECCION: string;
    MUESTRA_NUMERO_EXT: string;
    MUESTRA_NUMERO_INT: string;
    MUESTRA_COLONIA: string;
    MUESTRA_MUNICIPIO: string;
    MUESTRA_CIUDAD: string;
    MUESTRA_ESTADO: string;
    MUESTRA_CODIGO_POSTAL: string;
    MUESTRA_HORARIOS: string;
    MUESTRA_REFERENCIAS: string;
    ESTUDIO_NOTAS: string;
    [key: string]: any;
}

export default function CrearEstudioPrv() {
    const { medicos, instituciones, mensajerias, tiposEstudio, tiposEnvio, claveInternaPreview } =
        usePage<EstudioPrvCreateProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios PRV', href: '/estudios-prv' },
        { title: 'Nuevo Estudio PRV', href: '/estudios-prv/create' },
    ];

    const formRef = useRef<HTMLFormElement>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [noAplica, setNoAplica] = useState(false);

    const [medicoSearch, setMedicoSearch] = useState<{
        isOpen: boolean;
        searchText: string;
        selectedMedico: { ID_USUARIO: number; USUARIO_NOMBRE: string; USUARIO_APELLIDOS: string } | null;
    }>({ isOpen: false, searchText: '', selectedMedico: null });

    const [institucionSearch, setInstitucionSearch] = useState<{
        isOpen: boolean;
        searchText: string;
        selectedInstitucion: { ID_INSTITUCION: number; INSTITUCION_NOMBRE: string } | null;
    }>({ isOpen: false, searchText: '', selectedInstitucion: null });

    const [formData, setFormData] = useState<FormularioRecoleccion>({
        FOLIO_MERCK: '',
        ID_MEDICO: 0,
        ID_INSTITUCION: 0,
        FECHA_SOLICITUD_RECOLECCION: new Date().toISOString().split('T')[0],
        MUESTRA_TIPO_ESTUDIO: '',
        MUESTRA_ENVIO: 'aplica',
        MUESTRA_ENVIO_TIPO: 'Local',
        MUESTRA_GUIA_MENSAJERIA: '',
        MUESTRA_GUIA: '',
        MUESTRA_DIRECCION: '',
        MUESTRA_NUMERO_EXT: '',
        MUESTRA_NUMERO_INT: '',
        MUESTRA_COLONIA: '',
        MUESTRA_MUNICIPIO: '',
        MUESTRA_CIUDAD: '',
        MUESTRA_ESTADO: '',
        MUESTRA_CODIGO_POSTAL: '',
        MUESTRA_HORARIOS: '',
        MUESTRA_REFERENCIAS: '',
        ESTUDIO_NOTAS: '',
    });

    const handleChange = (campo: keyof FormularioRecoleccion, valor: string | number) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
        if (errors[campo]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[campo];
                return next;
            });
        }
    };

    const handleSubmit = () => {
        setProcessing(true);
        setErrors({});

        const submitData = {
            ...formData,
            // Si "No aplica" está marcado, limpiamos los campos de dirección
            // (igual que hace estudios/create.tsx con NoAplica)
            MUESTRA_DIRECCION: noAplica ? '' : formData.MUESTRA_DIRECCION,
            MUESTRA_NUMERO_EXT: noAplica ? '' : formData.MUESTRA_NUMERO_EXT,
            MUESTRA_NUMERO_INT: noAplica ? '' : formData.MUESTRA_NUMERO_INT,
            MUESTRA_GUIA: noAplica ? '' : formData.MUESTRA_GUIA,
            MUESTRA_GUIA_MENSAJERIA: noAplica ? '' : formData.MUESTRA_GUIA_MENSAJERIA,
        };

        router.post('/estudios-prv', submitData, {
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    const handleCancel = () => router.visit('/estudios-prv');

    const medicosFiltrados = medicos.filter(m =>
        `${m.USUARIO_NOMBRE} ${m.USUARIO_APELLIDOS}`.toLowerCase().includes(medicoSearch.searchText.toLowerCase())
    );

    const institucionesFiltradas = instituciones.filter(i =>
        i.INSTITUCION_NOMBRE.toLowerCase().includes(institucionSearch.searchText.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Estudio PRV - DIAHMOES" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Nuevo Estudio PRV</h1>
                        <p className="text-gray-600">Paso 1 de 4 · Recolección</p>
                    </div>
                    <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                </div>

                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-red-800 mb-2">Corrija los siguientes errores:</h4>
                            <ul className="list-disc list-inside text-red-700">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{String(message)}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Columna Izquierda */}
                        <div className="space-y-6">

                            {/* Información Básica */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Folio (se generará al guardar)</label>
                                            <input
                                                type="text"
                                                value={claveInternaPreview}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                                disabled
                                                readOnly
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Formato PRV-DD-MM-###, se reinicia cada día. El valor final se calcula al guardar.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Folio Merck (opcional)</label>
                                            <input
                                                type="text"
                                                value={formData.FOLIO_MERCK}
                                                onChange={(e) => handleChange('FOLIO_MERCK', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Ingrese folio de referencia"
                                            />
                                            {errors.FOLIO_MERCK && <p className="text-red-500 text-sm mt-1">{errors.FOLIO_MERCK}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Fecha Solicitud *</label>
                                            <input
                                                type="date"
                                                value={formData.FECHA_SOLICITUD_RECOLECCION}
                                                onChange={(e) => handleChange('FECHA_SOLICITUD_RECOLECCION', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                required
                                            />
                                            {errors.FECHA_SOLICITUD_RECOLECCION && (
                                                <p className="text-red-500 text-sm mt-1">{errors.FECHA_SOLICITUD_RECOLECCION}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tipo de Estudio *</label>
                                            <select
                                                value={formData.MUESTRA_TIPO_ESTUDIO}
                                                onChange={(e) => handleChange('MUESTRA_TIPO_ESTUDIO', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                required
                                            >
                                                <option value="">Seleccione...</option>
                                                {Object.entries(tiposEstudio || {}).map(([key, value]) => (
                                                    <option key={key} value={value}>{value}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Médico */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Médico</h3>
                                    <div className="relative">
                                        <label className="block text-sm font-medium mb-1">Médico *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={medicoSearch.searchText}
                                                onChange={(e) => setMedicoSearch({ ...medicoSearch, searchText: e.target.value, isOpen: true })}
                                                onFocus={() => setMedicoSearch({ ...medicoSearch, isOpen: true })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Buscar médico..."
                                                required
                                            />
                                            {medicoSearch.searchText && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMedicoSearch({ isOpen: false, searchText: '', selectedMedico: null });
                                                        handleChange('ID_MEDICO', 0);
                                                    }}
                                                    className="px-3 py-2 text-gray-500 hover:text-red-600 border border-gray-300 rounded-md hover:border-red-300"
                                                    title="Limpiar"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        {medicoSearch.isOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {medicosFiltrados.map(medico => (
                                                    <div
                                                        key={medico.ID_USUARIO}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => {
                                                            setMedicoSearch({
                                                                isOpen: false,
                                                                searchText: `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}`,
                                                                selectedMedico: medico,
                                                            });
                                                            handleChange('ID_MEDICO', medico.ID_USUARIO);
                                                        }}
                                                    >
                                                        {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                                    </div>
                                                ))}
                                                {medicosFiltrados.length === 0 && (
                                                    <div className="px-3 py-2 text-gray-500 italic">No se encontraron médicos</div>
                                                )}
                                            </div>
                                        )}
                                        {errors.ID_MEDICO && <p className="text-red-500 text-sm mt-1">{errors.ID_MEDICO}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Institución */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Institución</h3>
                                    <div className="relative">
                                        <label className="block text-sm font-medium mb-1">Institución *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={institucionSearch.searchText}
                                                onChange={(e) => setInstitucionSearch({ ...institucionSearch, searchText: e.target.value, isOpen: true })}
                                                onFocus={() => setInstitucionSearch({ ...institucionSearch, isOpen: true })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                placeholder="Buscar institución..."
                                                required
                                            />
                                            {institucionSearch.searchText && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setInstitucionSearch({ isOpen: false, searchText: '', selectedInstitucion: null });
                                                        handleChange('ID_INSTITUCION', 0);
                                                    }}
                                                    className="px-3 py-2 text-gray-500 hover:text-red-600 border border-gray-300 rounded-md hover:border-red-300"
                                                    title="Limpiar"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        {institucionSearch.isOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {institucionesFiltradas.map(inst => (
                                                    <div
                                                        key={inst.ID_INSTITUCION}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => {
                                                            setInstitucionSearch({
                                                                isOpen: false,
                                                                searchText: inst.INSTITUCION_NOMBRE,
                                                                selectedInstitucion: inst,
                                                            });
                                                            handleChange('ID_INSTITUCION', inst.ID_INSTITUCION);
                                                        }}
                                                    >
                                                        {inst.INSTITUCION_NOMBRE}
                                                    </div>
                                                ))}
                                                {institucionesFiltradas.length === 0 && (
                                                    <div className="px-3 py-2 text-gray-500 italic">No se encontraron instituciones</div>
                                                )}
                                            </div>
                                        )}
                                        {errors.ID_INSTITUCION && <p className="text-red-500 text-sm mt-1">{errors.ID_INSTITUCION}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Columna Derecha */}
                        <div className="space-y-6">

                            {/* Dirección de Recolección */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Dirección de Recolección</h3>
                                        <label className="flex items-center space-x-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={noAplica}
                                                onChange={(e) => setNoAplica(e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <span>No aplica</span>
                                        </label>
                                    </div>

                                    {!noAplica && (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Mensajería</label>
                                                <select
                                                    value={formData.MUESTRA_GUIA_MENSAJERIA}
                                                    onChange={(e) => handleChange('MUESTRA_GUIA_MENSAJERIA', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                >
                                                    <option value="">Seleccione...</option>
                                                    {mensajerias?.map(m => (
                                                        <option key={m.ID} value={m.NOMBRE}>{m.NOMBRE}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Número de Guía</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_GUIA}
                                                    onChange={(e) => handleChange('MUESTRA_GUIA', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tipo de Envío</label>
                                                <select
                                                    value={formData.MUESTRA_ENVIO_TIPO}
                                                    onChange={(e) => handleChange('MUESTRA_ENVIO_TIPO', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                >
                                                    {Object.entries(tiposEnvio || {}).map(([key, value]) => (
                                                        <option key={key} value={value}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Dirección</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_DIRECCION}
                                                    onChange={(e) => handleChange('MUESTRA_DIRECCION', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Número Ext.</label>
                                                    <input
                                                        type="text"
                                                        value={formData.MUESTRA_NUMERO_EXT}
                                                        onChange={(e) => handleChange('MUESTRA_NUMERO_EXT', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Número Int.</label>
                                                    <input
                                                        type="text"
                                                        value={formData.MUESTRA_NUMERO_INT}
                                                        onChange={(e) => handleChange('MUESTRA_NUMERO_INT', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Colonia</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_COLONIA}
                                                    onChange={(e) => handleChange('MUESTRA_COLONIA', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Municipio</label>
                                                    <input
                                                        type="text"
                                                        value={formData.MUESTRA_MUNICIPIO}
                                                        onChange={(e) => handleChange('MUESTRA_MUNICIPIO', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Ciudad</label>
                                                    <input
                                                        type="text"
                                                        value={formData.MUESTRA_CIUDAD}
                                                        onChange={(e) => handleChange('MUESTRA_CIUDAD', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Estado</label>
                                                    <input
                                                        type="text"
                                                        value={formData.MUESTRA_ESTADO}
                                                        onChange={(e) => handleChange('MUESTRA_ESTADO', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Código Postal</label>
                                                    <input
                                                        type="text"
                                                        value={formData.MUESTRA_CODIGO_POSTAL}
                                                        onChange={(e) => handleChange('MUESTRA_CODIGO_POSTAL', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Horarios de Recolección</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_HORARIOS}
                                                    onChange={(e) => handleChange('MUESTRA_HORARIOS', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Referencias</label>
                                                <textarea
                                                    value={formData.MUESTRA_REFERENCIAS}
                                                    onChange={(e) => handleChange('MUESTRA_REFERENCIAS', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Notas */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Notas</h3>
                                    <textarea
                                        value={formData.ESTUDIO_NOTAS}
                                        onChange={(e) => handleChange('ESTUDIO_NOTAS', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        placeholder="Notas internas del estudio..."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Guardando...' : 'Guardar y Continuar'}
                        </Button>
                    </div>
                </form>

                {/* Overlays para cerrar los dropdowns */}
                <div
                    className={medicoSearch.isOpen ? 'fixed inset-0 z-0' : 'hidden'}
                    onClick={() => setMedicoSearch({ ...medicoSearch, isOpen: false })}
                />
                <div
                    className={institucionSearch.isOpen ? 'fixed inset-0 z-0' : 'hidden'}
                    onClick={() => setInstitucionSearch({ ...institucionSearch, isOpen: false })}
                />
            </div>
        </AppLayout>
    );
}