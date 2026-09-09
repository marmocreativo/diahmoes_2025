import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, ChevronLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { type EstudioPrv } from '@/types/estudios-prv';

interface EditRecoleccionProps {
    estudio: EstudioPrv;
    medicos: Array<{ ID_USUARIO: number; USUARIO_NOMBRE: string; USUARIO_APELLIDOS: string }>;
    instituciones: Array<{ ID_INSTITUCION: number; INSTITUCION_NOMBRE: string }>;
    mensajerias: Array<{ ID: number; NOMBRE: string }>;
    tiposEstudio: Record<string, string>;
    tiposEnvio: Record<string, string>;
    [key: string]: any;
}

export default function EditRecoleccionPrv() {
    const { estudio, medicos, instituciones, mensajerias, tiposEstudio, tiposEnvio } =
        usePage<EditRecoleccionProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios PRV', href: '/estudios-prv' },
        { title: estudio.CLAVE_INTERNA, href: `/estudios-prv/${estudio.ID}` },
        { title: 'Recolección', href: `/estudios-prv/${estudio.ID}/edit/recoleccion` },
    ];

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [noAplica, setNoAplica] = useState(!estudio.MUESTRA_DIRECCION);

    const [medicoSearch, setMedicoSearch] = useState<{
        isOpen: boolean;
        searchText: string;
        selectedId: number;
    }>({
        isOpen: false,
        searchText: estudio.medico ? `${estudio.medico.USUARIO_NOMBRE} ${estudio.medico.USUARIO_APELLIDOS}` : '',
        selectedId: estudio.ID_MEDICO || 0,
    });

    const [institucionSearch, setInstitucionSearch] = useState<{
        isOpen: boolean;
        searchText: string;
        selectedId: number;
    }>({
        isOpen: false,
        searchText: estudio.institucion?.INSTITUCION_NOMBRE || '',
        selectedId: estudio.ID_INSTITUCION || 0,
    });

    const [formData, setFormData] = useState({
        FOLIO_MERCK: estudio.FOLIO_MERCK || '',
        FECHA_SOLICITUD_RECOLECCION: estudio.FECHA_SOLICITUD_RECOLECCION
            ? estudio.FECHA_SOLICITUD_RECOLECCION.split('T')[0]
            : new Date().toISOString().split('T')[0],
        MUESTRA_TIPO_ESTUDIO: estudio.MUESTRA_TIPO_ESTUDIO || '',
        MUESTRA_ENVIO_TIPO: estudio.MUESTRA_ENVIO_TIPO || 'Local',
        MUESTRA_GUIA_MENSAJERIA: estudio.MUESTRA_GUIA_MENSAJERIA || '',
        MUESTRA_GUIA: estudio.MUESTRA_GUIA || '',
        MUESTRA_DIRECCION: estudio.MUESTRA_DIRECCION || '',
        MUESTRA_NUMERO_EXT: estudio.MUESTRA_NUMERO_EXT || '',
        MUESTRA_NUMERO_INT: estudio.MUESTRA_NUMERO_INT || '',
        MUESTRA_COLONIA: estudio.MUESTRA_COLONIA || '',
        MUESTRA_MUNICIPIO: estudio.MUESTRA_MUNICIPIO || '',
        MUESTRA_CIUDAD: estudio.MUESTRA_CIUDAD || '',
        MUESTRA_ESTADO: estudio.MUESTRA_ESTADO || '',
        MUESTRA_CODIGO_POSTAL: estudio.MUESTRA_CODIGO_POSTAL || '',
        MUESTRA_HORARIOS: estudio.MUESTRA_HORARIOS || '',
        MUESTRA_REFERENCIAS: estudio.MUESTRA_REFERENCIAS || '',
        ESTUDIO_NOTAS: estudio.ESTUDIO_NOTAS || '',
    });

    const handleChange = (campo: keyof typeof formData, valor: string) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
    };

    const medicosFiltrados = medicos.filter(m =>
        `${m.USUARIO_NOMBRE} ${m.USUARIO_APELLIDOS}`.toLowerCase().includes(medicoSearch.searchText.toLowerCase())
    );
    const institucionesFiltradas = instituciones.filter(i =>
        i.INSTITUCION_NOMBRE.toLowerCase().includes(institucionSearch.searchText.toLowerCase())
    );

    const handleSubmit = () => {
        setProcessing(true);
        setErrors({});

        router.patch(`/estudios-prv/${estudio.ID}/recoleccion`, {
            ...formData,
            ID_MEDICO: medicoSearch.selectedId || null,
            ID_INSTITUCION: institucionSearch.selectedId || null,
            MUESTRA_ENVIO: noAplica ? 'no_aplica' : 'aplica',
            MUESTRA_DIRECCION: noAplica ? '' : formData.MUESTRA_DIRECCION,
            MUESTRA_NUMERO_EXT: noAplica ? '' : formData.MUESTRA_NUMERO_EXT,
            MUESTRA_NUMERO_INT: noAplica ? '' : formData.MUESTRA_NUMERO_INT,
            MUESTRA_GUIA: noAplica ? '' : formData.MUESTRA_GUIA,
            MUESTRA_GUIA_MENSAJERIA: noAplica ? '' : formData.MUESTRA_GUIA_MENSAJERIA,
        }, {
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recolección ${estudio.CLAVE_INTERNA} - DIAHMOES`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                        <p className="text-gray-600">Paso 1 de 4 · Recolección</p>
                    </div>
                    <Link href={`/estudios-prv/${estudio.ID}`}>
                        <Button variant="outline">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Volver al estudio
                        </Button>
                    </Link>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Folio</label>
                                        <input
                                            type="text"
                                            value={estudio.CLAVE_INTERNA}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                            disabled
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Folio Merck (opcional)</label>
                                        <input
                                            type="text"
                                            value={formData.FOLIO_MERCK}
                                            onChange={(e) => handleChange('FOLIO_MERCK', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Fecha Solicitud *</label>
                                        <input
                                            type="date"
                                            value={formData.FECHA_SOLICITUD_RECOLECCION}
                                            onChange={(e) => handleChange('FECHA_SOLICITUD_RECOLECCION', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tipo de Estudio *</label>
                                        <select
                                            value={formData.MUESTRA_TIPO_ESTUDIO}
                                            onChange={(e) => handleChange('MUESTRA_TIPO_ESTUDIO', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
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

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Médico</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={medicoSearch.searchText}
                                        onChange={(e) => setMedicoSearch({ ...medicoSearch, searchText: e.target.value, isOpen: true })}
                                        onFocus={() => setMedicoSearch({ ...medicoSearch, isOpen: true })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                        placeholder="Buscar médico..."
                                    />
                                    {medicoSearch.isOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {medicosFiltrados.map(medico => (
                                                <div
                                                    key={medico.ID_USUARIO}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => setMedicoSearch({
                                                        isOpen: false,
                                                        searchText: `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}`,
                                                        selectedId: medico.ID_USUARIO,
                                                    })}
                                                >
                                                    {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                                </div>
                                            ))}
                                            {medicosFiltrados.length === 0 && (
                                                <div className="px-3 py-2 text-gray-500 italic">Sin resultados</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Institución</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={institucionSearch.searchText}
                                        onChange={(e) => setInstitucionSearch({ ...institucionSearch, searchText: e.target.value, isOpen: true })}
                                        onFocus={() => setInstitucionSearch({ ...institucionSearch, isOpen: true })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                        placeholder="Buscar institución..."
                                    />
                                    {institucionSearch.isOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {institucionesFiltradas.map(inst => (
                                                <div
                                                    key={inst.ID_INSTITUCION}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => setInstitucionSearch({
                                                        isOpen: false,
                                                        searchText: inst.INSTITUCION_NOMBRE,
                                                        selectedId: inst.ID_INSTITUCION,
                                                    })}
                                                >
                                                    {inst.INSTITUCION_NOMBRE}
                                                </div>
                                            ))}
                                            {institucionesFiltradas.length === 0 && (
                                                <div className="px-3 py-2 text-gray-500 italic">Sin resultados</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tipo de Envío</label>
                                            <select
                                                value={formData.MUESTRA_ENVIO_TIPO}
                                                onChange={(e) => handleChange('MUESTRA_ENVIO_TIPO', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Número Ext.</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_NUMERO_EXT}
                                                    onChange={(e) => handleChange('MUESTRA_NUMERO_EXT', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Número Int.</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_NUMERO_INT}
                                                    onChange={(e) => handleChange('MUESTRA_NUMERO_INT', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Colonia</label>
                                            <input
                                                type="text"
                                                value={formData.MUESTRA_COLONIA}
                                                onChange={(e) => handleChange('MUESTRA_COLONIA', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Municipio</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_MUNICIPIO}
                                                    onChange={(e) => handleChange('MUESTRA_MUNICIPIO', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Ciudad</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_CIUDAD}
                                                    onChange={(e) => handleChange('MUESTRA_CIUDAD', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Código Postal</label>
                                                <input
                                                    type="text"
                                                    value={formData.MUESTRA_CODIGO_POSTAL}
                                                    onChange={(e) => handleChange('MUESTRA_CODIGO_POSTAL', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Horarios</label>
                                            <input
                                                type="text"
                                                value={formData.MUESTRA_HORARIOS}
                                                onChange={(e) => handleChange('MUESTRA_HORARIOS', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Referencias</label>
                                            <textarea
                                                value={formData.MUESTRA_REFERENCIAS}
                                                onChange={(e) => handleChange('MUESTRA_REFERENCIAS', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Notas</h3>
                                <textarea
                                    value={formData.ESTUDIO_NOTAS}
                                    onChange={(e) => handleChange('ESTUDIO_NOTAS', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                                />
                            </CardContent>
                        </Card>
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
                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>

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