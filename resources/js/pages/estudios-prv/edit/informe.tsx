import { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Send, Plus, Trash2, Mail, CheckCircle, Clock, AlertTriangle, FileDown } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { type EstudioPrv } from '@/types/estudios-prv';

// SIMPLIFICACIÓN IMPORTANTE: el botón "Enviar Informe" aquí NO manda un
// correo real todavía (ver nota en EstudioPrvController::enviarInformePrv).
// Solo registra en envios_correos_prv qué se habría mandado. Cuando
// definamos el PDF/Mailable de PRV, este mismo flujo pasa a ser real sin
// tener que rehacer la pantalla.

interface CorreoCopia {
    ID: number;
    NOMBRE: string;
    CORREO: string;
    ENVIAR: 'si' | 'no';
}

interface EnvioCorreo {
    id: number;
    NOMBRE_DESTINATARIO: string;
    CORREO_DESTINATARIO: string;
    ESTADO: 'enviado' | 'leido';
    FECHA_ENVIO: string;
}

interface EditInformeProps {
    estudio: EstudioPrv;
    medico: any;
    correos_copias: CorreoCopia[];
    envios: EnvioCorreo[];
    tieneResultado: boolean;
    nombrePlantilla?: string;
    [key: string]: any;
}

export default function EditInformePrv() {
    const { estudio, medico, correos_copias = [], envios = [], tieneResultado, nombrePlantilla } = usePage<EditInformeProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios PRV', href: '/estudios-prv' },
        { title: estudio.CLAVE_INTERNA, href: `/estudios-prv/${estudio.ID}` },
        { title: 'Informe', href: `/estudios-prv/${estudio.ID}/edit/informe` },
    ];

    const [nuevoCorreo, setNuevoCorreo] = useState({ NOMBRE: '', CORREO: '' });
    const [agregando, setAgregando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [errores, setErrores] = useState<Record<string, string>>({});

    const agregarCorreo = () => {
        if (!nuevoCorreo.NOMBRE.trim() || !nuevoCorreo.CORREO.trim()) return;
        setAgregando(true);
        setErrores({});

        router.post(`/estudios-prv/${estudio.ID}/correos-copia`, {
            NOMBRE: nuevoCorreo.NOMBRE,
            CORREO: nuevoCorreo.CORREO,
            ENVIAR: 'si',
        }, {
            preserveScroll: true,
            onSuccess: () => setNuevoCorreo({ NOMBRE: '', CORREO: '' }),
            onError: (errs) => setErrores(errs as Record<string, string>),
            onFinish: () => setAgregando(false),
        });
    };

    const eliminarCorreo = (correoId: number) => {
        if (!window.confirm('¿Quitar este correo de copia?')) return;
        router.delete(`/estudios-prv/${estudio.ID}/correos-copia/${correoId}`, {
            preserveScroll: true,
        });
    };

    const enviarInforme = () => {
        const activos = correos_copias.filter(c => c.ENVIAR === 'si');
        if (activos.length === 0) {
            alert('No hay correos de copia activos para enviar.');
            return;
        }
        if (!window.confirm(`Se registrará el envío a ${activos.length} destinatario(s) y el estudio se marcará como Terminado. ¿Continuar?`)) {
            return;
        }

        setEnviando(true);
        router.post(`/estudios-prv/${estudio.ID}/enviar-informe`, {}, {
            onFinish: () => setEnviando(false),
        });
    };

    const yaTerminado = estudio.ESTUDIO_ESTADO === 'Terminado';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Informe ${estudio.CLAVE_INTERNA} - DIAHMOES`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                        <p className="text-gray-600">Paso 4 de 4 · Informe</p>
                    </div>
                    <Link href={`/estudios-prv/${estudio.ID}`}>
                        <Button variant="outline">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Volver al estudio
                        </Button>
                    </Link>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                        El envío de correo real (con PDF adjunto) todavía no está implementado para PRV.
                        Por ahora, "Enviar Informe" solo registra el envío en el historial y cierra el estudio.
                    </div>
                </div>

                {/* PDF del informe */}
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">PDF del Informe</h3>
                        {tieneResultado ? (
                            <p className="text-sm text-gray-500 mt-1">
                                Plantilla capturada: <span className="font-medium text-gray-700">{nombrePlantilla}</span>
                            </p>
                        ) : (
                            <p className="text-sm text-red-500 mt-1">
                                Todavía no hay resultados de laboratorio capturados para este estudio.
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {tieneResultado ? (
                            <>
                                <a
                                    href={`/estudios-prv/${estudio.ID}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline">
                                        <FileDown className="h-4 w-4 mr-2" />
                                        Ver / Descargar PDF
                                    </Button>
                                </a>
                            </>
                        ) : (
                            <Link href={`/estudios-prv/${estudio.ID}/edit/laboratorio`}>
                                <Button variant="outline">Capturar Resultados</Button>
                            </Link>
                        )}
                    </div>
                </div>

                {yaTerminado && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">Este estudio ya fue marcado como Terminado.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Correos de copia */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Mail className="h-5 w-5 text-[#189BAF]" /> Destinatarios
                        </h3>

                        {medico && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Médico solicitante</div>
                                <div className="text-sm font-medium text-gray-800">
                                    {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                </div>
                                <div className="text-xs text-gray-500">{medico.USUARIO_CORREO}</div>
                            </div>
                        )}

                        <div className="space-y-2 mb-4">
                            {correos_copias.map(correo => (
                                <div key={correo.ID} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">{correo.NOMBRE}</div>
                                        <div className="text-xs text-gray-500">{correo.CORREO}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={correo.ENVIAR === 'si' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                                            {correo.ENVIAR === 'si' ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                        <button
                                            onClick={() => eliminarCorreo(correo.ID)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {correos_copias.length === 0 && (
                                <p className="text-sm text-gray-400 italic">Sin destinatarios registrados</p>
                            )}
                        </div>

                        {Object.keys(errores).length > 0 && (
                            <div className="text-sm text-red-600 mb-2">
                                {Object.values(errores).map((e, i) => <div key={i}>{e}</div>)}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nombre"
                                value={nuevoCorreo.NOMBRE}
                                onChange={(e) => setNuevoCorreo(prev => ({ ...prev, NOMBRE: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                            />
                            <input
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={nuevoCorreo.CORREO}
                                onChange={(e) => setNuevoCorreo(prev => ({ ...prev, CORREO: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF]"
                            />
                            <button
                                onClick={agregarCorreo}
                                disabled={agregando}
                                className="px-3 py-2 bg-[#189BAF] text-white rounded-md hover:bg-[#157a8c] disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Historial de envíos */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Historial de Envíos</h3>
                        <div className="space-y-2">
                            {envios.map(envio => (
                                <div key={envio.id} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">{envio.NOMBRE_DESTINATARIO}</div>
                                        <div className="text-xs text-gray-500">{envio.CORREO_DESTINATARIO}</div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        {envio.ESTADO === 'leido' ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Clock className="h-4 w-4 text-blue-500" />
                                        )}
                                        <span className="text-gray-500">{envio.ESTADO}</span>
                                    </div>
                                </div>
                            ))}
                            {envios.length === 0 && (
                                <p className="text-sm text-gray-400 italic">Sin envíos registrados todavía</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={enviarInforme}
                        disabled={enviando || yaTerminado || !tieneResultado}
                        className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                        title={!tieneResultado ? 'Captura los resultados de laboratorio primero' : undefined}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {enviando ? 'Registrando...' : yaTerminado ? 'Ya enviado' : 'Enviar Informe y Terminar Estudio'}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}