import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Pencil, CheckCircle, PlusCircle, Send, RefreshCw, FileText } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface EventoSolicitud {
    id: number;
    tipo: 'creacion' | 'edicion' | 'comentario' | 'confirmacion' | 'envio_guia';
    autor_tipo: 'cliente' | 'admin';
    autor_nombre: string | null;
    mensaje: string | null;
    cambios: Record<string, { anterior: string | null; nuevo: string | null }> | null;
    created_at: string;
}

interface Props {
    eventos: EventoSolicitud[];
    onComentar: (mensaje: string) => Promise<void> | void;
    enviando?: boolean;
    deshabilitado?: boolean;
    placeholder?: string;
}

// ---------------------------------------------------------------------------
// Helpers visuales
// ---------------------------------------------------------------------------

const ICONOS = {
    creacion: PlusCircle,
    edicion: Pencil,
    comentario: MessageSquare,
    confirmacion: CheckCircle,
    envio_guia: FileText,
};

const COLORES = {
    creacion: 'bg-[#189BAF]/10 text-[#189BAF]',
    edicion: 'bg-gray-100 text-gray-600',
    comentario: 'bg-amber-100 text-amber-700',
    confirmacion: 'bg-green-100 text-green-700',
    envio_guia: 'bg-purple-100 text-purple-700',
};

const ETIQUETAS = {
    creacion: 'Solicitud creada',
    edicion: 'Solicitud editada',
    comentario: 'Comentario',
    confirmacion: 'Solicitud confirmada',
    envio_guia: 'Guía enviada',
};

function EventoItem({ evento }: { evento: EventoSolicitud }) {
    const Icono = ICONOS[evento.tipo];

    return (
        <div className="flex gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${COLORES[evento.tipo]}`}>
                <Icono className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 pb-4 border-l border-gray-100 pl-4 -ml-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">
                        {ETIQUETAS[evento.tipo]}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{evento.created_at}</span>
                </div>

                <p className="text-xs text-gray-500 mt-0.5">
                    {evento.autor_tipo === 'admin' ? 'Equipo DIAHMOES' : 'Solicitante'}
                    {evento.autor_nombre ? ` — ${evento.autor_nombre}` : ''}
                </p>

                {(evento.tipo === 'comentario' || evento.tipo === 'envio_guia') && evento.mensaje && (
                    <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">
                        {evento.mensaje}
                    </div>
                )}

                {evento.tipo === 'edicion' && evento.cambios && (
                    <div className="mt-2 space-y-1">
                        {Object.entries(evento.cambios).map(([campo, valores]) => (
                            <div key={campo} className="text-xs">
                                <span className="font-semibold text-gray-500 uppercase">{campo}</span>
                                <div>
                                    <span className="text-red-500 line-through">{valores.anterior || '—'}</span>
                                    {' → '}
                                    <span className="text-green-600 font-medium">{valores.nuevo || '—'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function TimelineSolicitud({
    eventos,
    onComentar,
    enviando = false,
    deshabilitado = false,
    placeholder = 'Escribe un comentario...',
}: Props) {
    const [mensaje, setMensaje] = useState('');

    const handleEnviar = async () => {
        if (!mensaje.trim() || enviando) return;
        await onComentar(mensaje.trim());
        setMensaje('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4" />
                    Línea de tiempo
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-0 mb-4">
                    {eventos.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Sin eventos registrados.</p>
                    ) : (
                        eventos.map((evento) => <EventoItem key={evento.id} evento={evento} />)
                    )}
                </div>

                {!deshabilitado && (
                    <div className="border-t pt-4">
                        <textarea
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#189BAF]/30 focus:border-[#189BAF]"
                            rows={3}
                            placeholder={placeholder}
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                            <Button
                                size="sm"
                                onClick={handleEnviar}
                                disabled={!mensaje.trim() || enviando}
                                className="bg-[#189BAF] hover:bg-[#157a8c] text-white"
                            >
                                {enviando ? (
                                    <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Enviando...</>
                                ) : (
                                    <><Send className="h-3.5 w-3.5 mr-1.5" /> Comentar</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}