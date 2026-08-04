import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PortalReportesNavbar from '@/components/PortalReportesNavbar';
import RepeaterEmails from '@/components/RepeaterEmails';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ClipboardList, Plus, X, CheckCircle, Clock, RefreshCw, ChevronRight, Ban,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface SolicitudCliente {
    id: number;
    folio_merck: string;
    tipo_solicitud: string;
    cantidad: number;
    medico: string;
    institucion: string;
    programar_para_formato: string;
    estado: 'pendiente' | 'confirmada' | 'convertida' | 'cancelada';
    created_at: string;
}

type SolicitudFormData = {
    FOLIO_MERCK: string;
    TIPO_SOLICITUD: string;
    CANTIDAD: number;
    MEDICO_NOMBRE_LIBRE: string;
    INSTITUCION_NOMBRE_LIBRE: string;
    SOLICITA: string;
    PREGUNTAR_POR: string;
    TELEFONO: string;
    CELULAR: string;
    PROGRAMAR_PARA: string;
    HORARIO: string;
    DIRIGIRSE_A: string;
    MUESTRA_CALLE: string;
    MUESTRA_NUMERO_EXT: string;
    MUESTRA_NUMERO_INT: string;
    MUESTRA_COLONIA: string;
    MUESTRA_MUNICIPIO: string;
    MUESTRA_ESTADO: string;
    MUESTRA_CODIGO_POSTAL: string;
    EMAIL_GUIA: string;
    EMAIL_RESULTADOS: string;
    COPIA_SEGUIMIENTO: string;
    KAM: string;
    PAL: string;
    NOTAS: string;
};

const FORM_INICIAL: SolicitudFormData = {
    FOLIO_MERCK: '',
    TIPO_SOLICITUD: '',
    CANTIDAD: 1,
    MEDICO_NOMBRE_LIBRE: '',
    INSTITUCION_NOMBRE_LIBRE: '',
    SOLICITA: '',
    PREGUNTAR_POR: '',
    TELEFONO: '',
    CELULAR: '',
    PROGRAMAR_PARA: '',
    HORARIO: '',
    DIRIGIRSE_A: '',
    MUESTRA_CALLE: '',
    MUESTRA_NUMERO_EXT: '',
    MUESTRA_NUMERO_INT: '',
    MUESTRA_COLONIA: '',
    MUESTRA_MUNICIPIO: '',
    MUESTRA_ESTADO: 'ninguno',
    MUESTRA_CODIGO_POSTAL: '',
    EMAIL_GUIA: '',
    EMAIL_RESULTADOS: '',
    COPIA_SEGUIMIENTO: '',
    KAM: '',
    PAL: '',
    NOTAS: '',
};

const ESTADOS_MX = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México', 'Durango', 'Estado de México',
    'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

interface PageProps {
    solicitudes: SolicitudCliente[];
    sesionInfo: { nombre: string; tipo: 'admin' | 'externo' };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function BadgeEstado({ estado }: { estado: SolicitudCliente['estado'] }) {
    if (estado === 'cancelada') return (
        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <Ban className="h-3 w-3" /> Cancelada
        </span>
    );
    if (estado === 'convertida') return (
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3" /> Convertida
        </span>
    );
    if (estado === 'confirmada') return (
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3" /> Confirmada
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3" /> Pendiente
        </span>
    );
}

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]/30 focus:border-[#189BAF]';
const labelClass = 'text-xs text-gray-500 block mb-1';
const sectionTitle = 'text-xs font-semibold text-[#189BAF] uppercase tracking-wide mt-5 mb-2';

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function ReportesSolicitudesIndex() {
    const { solicitudes: solicitudesIniciales, sesionInfo } = usePage<PageProps & Record<string, any>>().props;

    const [solicitudes] = useState<SolicitudCliente[]>(solicitudesIniciales);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState<SolicitudFormData>(FORM_INICIAL);

    const setField = <K extends keyof SolicitudFormData>(campo: K, valor: SolicitudFormData[K]) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const handleCancelar = () => {
        setForm(FORM_INICIAL);
        setMostrarFormulario(false);
    };

    const handleSubmit = () => {
        setGuardando(true);
        router.post('/reportes/solicitudes', form, {
            preserveScroll: true,
            onSuccess: () => {
                handleCancelar();
                router.reload({ only: ['solicitudes'] });
            },
            onFinish: () => setGuardando(false),
        });
    };

    return (
        <>
            <Head title="Mis Solicitudes — DIAHMOES" />

            <div className="min-h-screen bg-slate-50">
                <PortalReportesNavbar
                    sesionInfo={sesionInfo}
                    subtitulo="Mis Solicitudes"
                    volverA="/reportes"
                    volverLabel="Volver al reporte"
                />

                <div className="space-y-4 p-4 sm:p-6">

                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-[#189BAF]" />
                                Mis Solicitudes
                            </h1>
                            <p className="text-xs text-gray-400">{solicitudes.length} solicitud(es) registrada(s)</p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setMostrarFormulario(!mostrarFormulario)}
                            className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                        >
                            {mostrarFormulario ? <><X className="h-4 w-4 mr-1.5" /> Cancelar</> : <><Plus className="h-4 w-4 mr-1.5" /> Nueva Solicitud</>}
                        </Button>
                    </div>

                    {/* Formulario de nueva solicitud */}
                    {mostrarFormulario && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Nueva Solicitud</CardTitle>
                                <CardDescription>Completa los datos para programar una recolección</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className={sectionTitle}>Datos generales</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    <div>
                                        <label className={labelClass}>Folio Merck</label>
                                        <input className={inputClass} type="text" value={form.FOLIO_MERCK} onChange={e => setField('FOLIO_MERCK', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Tipo de solicitud</label>
                                        <select className={inputClass} value={form.TIPO_SOLICITUD} onChange={e => setField('TIPO_SOLICITUD', e.target.value)}>
                                            <option value="">Selecciona...</option>
                                            <option value="Envío de KIT BL">Envío de KIT BL</option>
                                            <option value="Recolección de muestra">Recolección de muestra</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Cantidad de muestras</label>
                                        <input className={inputClass} type="number" min={1} max={20} value={form.CANTIDAD} onChange={e => setField('CANTIDAD', Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Médico</label>
                                        <input className={inputClass} type="text" value={form.MEDICO_NOMBRE_LIBRE} onChange={e => setField('MEDICO_NOMBRE_LIBRE', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Institución</label>
                                        <input className={inputClass} type="text" value={form.INSTITUCION_NOMBRE_LIBRE} onChange={e => setField('INSTITUCION_NOMBRE_LIBRE', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Solicita</label>
                                        <input className={inputClass} type="text" value={form.SOLICITA} onChange={e => setField('SOLICITA', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Preguntar por</label>
                                        <input className={inputClass} type="text" value={form.PREGUNTAR_POR} onChange={e => setField('PREGUNTAR_POR', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Teléfono</label>
                                        <input className={inputClass} type="text" value={form.TELEFONO} onChange={e => setField('TELEFONO', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Celular</label>
                                        <input className={inputClass} type="text" value={form.CELULAR} onChange={e => setField('CELULAR', e.target.value)} />
                                    </div>
                                </div>

                                <p className={sectionTitle}>Programación</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    <div>
                                        <label className={labelClass}>Programar para</label>
                                        <input className={inputClass} type="date" value={form.PROGRAMAR_PARA} onChange={e => setField('PROGRAMAR_PARA', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Horario</label>
                                        <input className={inputClass} type="text" placeholder="Ej. 9:00 - 14:00" value={form.HORARIO} onChange={e => setField('HORARIO', e.target.value)} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Dirigirse a</label>
                                        <input className={inputClass} type="text" value={form.DIRIGIRSE_A} onChange={e => setField('DIRIGIRSE_A', e.target.value)} />
                                    </div>
                                </div>

                                <p className={sectionTitle}>Dirección de recolección</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Calle</label>
                                        <input className={inputClass} type="text" value={form.MUESTRA_CALLE} onChange={e => setField('MUESTRA_CALLE', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Número exterior</label>
                                        <input className={inputClass} type="text" value={form.MUESTRA_NUMERO_EXT} onChange={e => setField('MUESTRA_NUMERO_EXT', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Número interior</label>
                                        <input className={inputClass} type="text" value={form.MUESTRA_NUMERO_INT} onChange={e => setField('MUESTRA_NUMERO_INT', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Colonia</label>
                                        <input className={inputClass} type="text" value={form.MUESTRA_COLONIA} onChange={e => setField('MUESTRA_COLONIA', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Municipio</label>
                                        <input className={inputClass} type="text" value={form.MUESTRA_MUNICIPIO} onChange={e => setField('MUESTRA_MUNICIPIO', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Estado</label>
                                        <select className={inputClass} value={form.MUESTRA_ESTADO} onChange={e => setField('MUESTRA_ESTADO', e.target.value)}>
                                            <option value="ninguno">Selecciona...</option>
                                            {ESTADOS_MX.map(estado => (
                                                <option key={estado} value={estado}>{estado}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>C.P.</label>
                                        <input className={inputClass} type="text" placeholder="12345" value={form.MUESTRA_CODIGO_POSTAL} onChange={e => setField('MUESTRA_CODIGO_POSTAL', e.target.value)} />
                                    </div>
                                </div>

                                <p className={sectionTitle}>Correos</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className={labelClass}>Email envío de guía</label>
                                        <RepeaterEmails value={form.EMAIL_GUIA} onChange={v => setField('EMAIL_GUIA', v)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Email envío de resultados</label>
                                        <RepeaterEmails value={form.EMAIL_RESULTADOS} onChange={v => setField('EMAIL_RESULTADOS', v)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Seguimiento a</label>
                                        <RepeaterEmails value={form.COPIA_SEGUIMIENTO} onChange={v => setField('COPIA_SEGUIMIENTO', v)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    <div>
                                        <label className={labelClass}>KAM</label>
                                        <input className={inputClass} type="text" value={form.KAM} onChange={e => setField('KAM', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>PAL</label>
                                        <input className={inputClass} type="text" value={form.PAL} onChange={e => setField('PAL', e.target.value)} />
                                    </div>
                                </div>

                                <p className={sectionTitle}>Notas adicionales</p>
                                <textarea className={inputClass} rows={3} placeholder="Indicaciones especiales, referencias, etc." value={form.NOTAS} onChange={e => setField('NOTAS', e.target.value)} />

                                <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                                    <Button variant="outline" onClick={handleCancelar} disabled={guardando}>Cancelar</Button>
                                    <Button onClick={handleSubmit} disabled={guardando} className="bg-[#189BAF] hover:bg-[#157a8c] text-white">
                                        {guardando ? (
                                            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
                                        ) : (
                                            <><ClipboardList className="h-4 w-4 mr-2" /> Enviar Solicitud</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabla de solicitudes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" /> Mis Solicitudes
                            </CardTitle>
                            <CardDescription>Haz clic en una fila para ver el detalle y la línea de tiempo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {solicitudes.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No tienes solicitudes registradas.</p>
                                    <p className="text-xs mt-1">Usa el botón "Nueva Solicitud" para crear una.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Folio</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Tipo</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Cant.</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Médico</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Institución</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Programada para</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Estado</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Enviada</th>
                                                <th className="w-8"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {solicitudes.map((s) => (
                                                <tr
                                                    key={s.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={() => router.visit(`/reportes/solicitudes/${s.id}`)}
                                                >
                                                    <td className="py-2 px-3 font-mono font-semibold text-[#189BAF] whitespace-nowrap">{s.folio_merck || '—'}</td>
                                                    <td className="py-2 px-3 text-xs text-gray-600 whitespace-nowrap">{s.tipo_solicitud}</td>
                                                    <td className="py-2 px-3 text-xs text-center font-semibold">{s.cantidad}</td>
                                                    <td className="py-2 px-3 text-xs whitespace-nowrap">{s.medico}</td>
                                                    <td className="py-2 px-3 text-xs whitespace-nowrap">{s.institucion}</td>
                                                    <td className="py-2 px-3 text-xs whitespace-nowrap">{s.programar_para_formato || '—'}</td>
                                                    <td className="py-2 px-3 whitespace-nowrap"><BadgeEstado estado={s.estado} /></td>
                                                    <td className="py-2 px-3 text-xs text-gray-400 whitespace-nowrap">{s.created_at}</td>
                                                    <td className="py-2 px-3 text-gray-300"><ChevronRight className="h-4 w-4" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}