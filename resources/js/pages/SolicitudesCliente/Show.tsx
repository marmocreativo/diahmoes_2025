import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ClipboardList, CheckCircle, Clock, ArrowLeft, MapPin, Phone, Mail, User, Building2, Upload, FileText
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
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
    creado_por: string;
    created_at: string;
}

interface PageProps {
    solicitud: SolicitudCliente;
    eventos: EventoSolicitud[];
}

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

export default function SolicitudesClienteShow() {
    const { solicitud, eventos: eventosIniciales } = usePage<PageProps & Record<string, any>>().props;

    const [eventos, setEventos] = useState<EventoSolicitud[]>(eventosIniciales);
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [confirmando, setConfirmando] = useState(false);

    const [archivoGuia, setArchivoGuia] = useState<File | null>(null);
    const [enviandoGuia, setEnviandoGuia] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Solicitudes de Cliente', href: '/solicitudes-cliente' },
        { title: solicitud.folio_merck || `#${solicitud.id}`, href: `/solicitudes-cliente/${solicitud.id}` },
    ];

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
        router.post(`/solicitudes-cliente/${solicitud.id}/comentarios`, { mensaje }, {
            preserveScroll: true,
            onSuccess: () => {
                // El backend regresa por `back()`; recargamos solo los eventos.
                router.reload({ only: ['eventos'], onSuccess: (page: any) => {
                    setEventos(page.props.eventos);
                }});
            },
            onFinish: () => setEnviandoComentario(false),
        });
    };

    const handleConfirmar = () => {
        setConfirmando(true);
        router.post(`/solicitudes-cliente/${solicitud.id}/confirmar`, {}, {
            preserveScroll: true,
            onFinish: () => setConfirmando(false),
        });
    };

    const handleEnviarGuia = () => {
        if (!archivoGuia) return;

        const formData = new FormData();
        formData.append('guia', archivoGuia);

        setEnviandoGuia(true);
        router.post(`/solicitudes-cliente/${solicitud.id}/enviar-guia`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => setArchivoGuia(null),
            onFinish: () => setEnviandoGuia(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Solicitud ${solicitud.folio_merck || solicitud.id} — DIAHMOES`} />

            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => router.visit('/solicitudes-cliente')}>
                            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-[#189BAF]" />
                                {solicitud.folio_merck ? `Folio ${solicitud.folio_merck}` : `Solicitud #${solicitud.id}`}
                            </h1>
                            <p className="text-xs text-gray-400">Creada el {solicitud.created_at} por {solicitud.creado_por}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <BadgeEstado estado={solicitud.estado} />
                        {solicitud.estado === 'pendiente' && (
                            <Button
                                size="sm"
                                onClick={handleConfirmar}
                                disabled={confirmando}
                                className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                            >
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                {confirmando ? 'Confirmando...' : 'Confirmar solicitud'}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Columna de datos */}
                    <div className="lg:col-span-2 space-y-4">
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" /> Médico e institución
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <Dato label="Médico" value={solicitud.medico} />
                                <Dato label="Institución" value={<span className="flex items-center gap-1 justify-end"><Building2 className="h-3.5 w-3.5" />{solicitud.institucion}</span>} />
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
                                <Dato label="Email guía" value={solicitud.email_guia} />
                                <Dato label="Email resultados" value={solicitud.email_resultados} />
                                <Dato label="KAM" value={solicitud.kam} />
                                <Dato label="PAL" value={solicitud.pal} />
                            </CardContent>
                        </Card>

                        {solicitud.estado === 'confirmada' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> Enviar guía de recolección
                                    </CardTitle>
                                    <CardDescription>
                                        Se enviará como PDF adjunto a: {solicitud.email_guia?.split(',').filter(Boolean).join(', ') || 'sin correos registrados'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setArchivoGuia(e.target.files?.[0] || null)}
                                            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#189BAF]/10 file:text-[#189BAF] file:text-sm"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleEnviarGuia}
                                            disabled={!archivoGuia || enviandoGuia}
                                            className="bg-[#189BAF] hover:bg-[#157a8c] text-white whitespace-nowrap"
                                        >
                                            <Upload className="h-4 w-4 mr-1.5" />
                                            {enviandoGuia ? 'Enviando...' : 'Enviar guía'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                    </div>

                    {/* Columna de timeline */}
                    <div className="lg:col-span-1">
                        <TimelineSolicitud
                            eventos={eventos}
                            onComentar={handleComentar}
                            enviando={enviandoComentario}
                            placeholder="Escribe un comentario para el solicitante..."
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}