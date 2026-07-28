import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PortalReportesNavbar from '@/components/PortalReportesNavbar';
import RepeaterEmails from '@/components/RepeaterEmails';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ClipboardList, CheckCircle, Clock, MapPin, Phone, Pencil, X, RefreshCw,
} from 'lucide-react';
import TimelineSolicitud, { type EventoSolicitud } from '@/components/TimelineSolicitud';

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
    solicita: string;
    preguntar_por: string;
    telefono: string;
    celular: string;
    programar_para: string;
    programar_para_formato: string;
    horario: string;
    dirigirse_a: string;
    muestra_calle: string;
    muestra_numero_ext: string;
    muestra_numero_int: string;
    muestra_colonia: string;
    muestra_municipio: string;
    muestra_estado: string;
    muestra_codigo_postal: string;
    email_guia: string;
    email_resultados: string;
    kam: string;
    pal: string;
    estado: 'pendiente' | 'confirmada' | 'convertida';
    notas: string;
    created_at: string;
}

type SolicitudFormData = {
    FOLIO_MERCK: string;
    TIPO_SOLICITUD: string;
    CANTIDAD: number;
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
    KAM: string;
    PAL: string;
    NOTAS: string;
};

interface PageProps {
    solicitud: SolicitudCliente;
    eventos: EventoSolicitud[];
    sesionInfo: { nombre: string; tipo: 'admin' | 'externo' };
}

const ESTADOS_MX = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México', 'Durango', 'Estado de México',
    'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

function BadgeEstado({ estado }: { estado: SolicitudCliente['estado'] }) {
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

function Dato({ label, value }: { label: string; value: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-800 font-medium text-right">{value}</span>
        </div>
    );
}

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]/30 focus:border-[#189BAF]';
const labelClass = 'text-xs text-gray-500 block mb-1';
const sectionTitle = 'text-xs font-semibold text-[#189BAF] uppercase tracking-wide mt-5 mb-2';

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function ReportesSolicitudesShow() {
    const { solicitud, eventos: eventosIniciales, sesionInfo } = usePage<PageProps & Record<string, any>>().props;

    const [eventos, setEventos] = useState<EventoSolicitud[]>(eventosIniciales);
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [form, setForm] = useState<SolicitudFormData>({
        FOLIO_MERCK: solicitud.folio_merck || '',
        TIPO_SOLICITUD: solicitud.tipo_solicitud || '',
        CANTIDAD: solicitud.cantidad || 1,
        SOLICITA: solicitud.solicita || '',
        PREGUNTAR_POR: solicitud.preguntar_por || '',
        TELEFONO: solicitud.telefono || '',
        CELULAR: solicitud.celular || '',
        PROGRAMAR_PARA: solicitud.programar_para || '',
        HORARIO: solicitud.horario || '',
        DIRIGIRSE_A: solicitud.dirigirse_a || '',
        MUESTRA_CALLE: solicitud.muestra_calle || '',
        MUESTRA_NUMERO_EXT: solicitud.muestra_numero_ext || '',
        MUESTRA_NUMERO_INT: solicitud.muestra_numero_int || '',
        MUESTRA_COLONIA: solicitud.muestra_colonia || '',
        MUESTRA_MUNICIPIO: solicitud.muestra_municipio || '',
        MUESTRA_ESTADO: solicitud.muestra_estado || 'ninguno',
        MUESTRA_CODIGO_POSTAL: solicitud.muestra_codigo_postal || '',
        EMAIL_GUIA: solicitud.email_guia || '',
        EMAIL_RESULTADOS: solicitud.email_resultados || '',
        KAM: solicitud.kam || '',
        PAL: solicitud.pal || '',
        NOTAS: solicitud.notas || '',
    });

    const setField = <K extends keyof SolicitudFormData>(campo: K, valor: SolicitudFormData[K]) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const puedeEditar = solicitud.estado === 'pendiente';

    const direccionCompleta = [
        solicitud.muestra_calle,
        solicitud.muestra_numero_ext && `#${solicitud.muestra_numero_ext}`,
        solicitud.muestra_numero_int && `Int. ${solicitud.muestra_numero_int}`,
    ].filter(Boolean).join(' ');

    const ubicacion = [
        solicitud.muestra_colonia,
        solicitud.muestra_municipio,
        solicitud.muestra_estado,
        solicitud.muestra_codigo_postal && `C.P. ${solicitud.muestra_codigo_postal}`,
    ].filter(Boolean).join(', ');

    const handleComentar = (mensaje: string) => {
        setEnviandoComentario(true);
        router.post(`/reportes/solicitudes/${solicitud.id}/comentarios`, { mensaje }, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['eventos'], onSuccess: (page: any) => {
                    setEventos(page.props.eventos);
                }});
            },
            onFinish: () => setEnviandoComentario(false),
        });
    };

    const handleGuardarEdicion = () => {
        setGuardando(true);
        router.put(`/reportes/solicitudes/${solicitud.id}`, form, {
            preserveScroll: true,
            onSuccess: () => {
                setEditando(false);
                router.reload();
            },
            onFinish: () => setGuardando(false),
        });
    };

    return (
        <>
            <Head title={`Solicitud ${solicitud.folio_merck || solicitud.id} — DIAHMOES`} />

            <div className="min-h-screen bg-slate-50">
                <PortalReportesNavbar
                    sesionInfo={sesionInfo}
                    subtitulo={solicitud.folio_merck ? `Folio ${solicitud.folio_merck}` : `Solicitud #${solicitud.id}`}
                    volverA="/reportes/solicitudes"
                    volverLabel="Volver"
                />

                <div className="space-y-4 p-4 sm:p-6">

                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-[#189BAF]" />
                                {solicitud.folio_merck ? `Folio ${solicitud.folio_merck}` : `Solicitud #${solicitud.id}`}
                            </h1>
                            <p className="text-xs text-gray-400">Creada el {solicitud.created_at}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <BadgeEstado estado={solicitud.estado} />
                            {puedeEditar && !editando && (
                                <Button size="sm" variant="outline" onClick={() => setEditando(true)}>
                                    <Pencil className="h-4 w-4 mr-1.5" /> Editar
                                </Button>
                            )}
                        </div>
                    </div>

                    {!puedeEditar && (
                        <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-lg px-3 py-2">
                            Esta solicitud ya fue {solicitud.estado === 'confirmada' ? 'confirmada' : 'procesada'} y no se puede editar. Puedes seguir agregando comentarios.
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Columna de datos / edición */}
                        <div className="lg:col-span-2 space-y-4">
                            {editando ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Editar solicitud</CardTitle>
                                        <CardDescription>Los cambios quedarán registrados en la línea de tiempo</CardDescription>
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
                                                <input className={inputClass} type="text" value={form.HORARIO} onChange={e => setField('HORARIO', e.target.value)} />
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
                                                <input className={inputClass} type="text" value={form.MUESTRA_CODIGO_POSTAL} onChange={e => setField('MUESTRA_CODIGO_POSTAL', e.target.value)} />
                                            </div>
                                        </div>

                                        <p className={sectionTitle}>Correos</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className={labelClass}>Email envío de guía</label>
                                                <RepeaterEmails value={form.EMAIL_GUIA} onChange={v => setField('EMAIL_GUIA', v)} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Email envío de resultados</label>
                                                <RepeaterEmails value={form.EMAIL_RESULTADOS} onChange={v => setField('EMAIL_RESULTADOS', v)} />
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
                                        <textarea className={inputClass} rows={3} value={form.NOTAS} onChange={e => setField('NOTAS', e.target.value)} />

                                        <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                                            <Button variant="outline" onClick={() => setEditando(false)} disabled={guardando}>
                                                <X className="h-4 w-4 mr-1.5" /> Cancelar
                                            </Button>
                                            <Button onClick={handleGuardarEdicion} disabled={guardando} className="bg-[#189BAF] hover:bg-[#157a8c] text-white">
                                                {guardando ? (
                                                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
                                                ) : (
                                                    <>Guardar cambios</>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <ClipboardList className="h-4 w-4" /> Datos de la solicitud
                                            </CardTitle>
                                            <CardDescription>{solicitud.cantidad} muestra(s) — {solicitud.tipo_solicitud}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            <Dato label="Programada para" value={solicitud.programar_para_formato} />
                                            <Dato label="Horario" value={solicitud.horario} />
                                            <Dato label="Dirigirse a" value={solicitud.dirigirse_a} />
                                            <Dato label="Solicita" value={solicitud.solicita} />
                                            <Dato label="Preguntar por" value={solicitud.preguntar_por} />
                                            <Dato label="Médico" value={solicitud.medico} />
                                            <Dato label="Institución" value={solicitud.institucion} />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> Dirección de recolección
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            <Dato label="Dirección" value={direccionCompleta || '—'} />
                                            <Dato label="Ubicación" value={ubicacion || '—'} />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Phone className="h-4 w-4" /> Contacto y correos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            <Dato label="Teléfono" value={solicitud.telefono} />
                                            <Dato label="Celular" value={solicitud.celular} />
                                            <Dato label="Email guía" value={solicitud.email_guia?.split(',').filter(Boolean).join(', ')} />
                                            <Dato label="Email resultados" value={solicitud.email_resultados?.split(',').filter(Boolean).join(', ')} />
                                            <Dato label="KAM" value={solicitud.kam} />
                                            <Dato label="PAL" value={solicitud.pal} />
                                        </CardContent>
                                    </Card>

                                    {solicitud.notas && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Notas</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{solicitud.notas}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Columna de timeline */}
                        <div className="lg:col-span-1">
                            <TimelineSolicitud
                                eventos={eventos}
                                onComentar={handleComentar}
                                enviando={enviandoComentario}
                                placeholder="Escribe un comentario para el equipo DIAHMOES..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}