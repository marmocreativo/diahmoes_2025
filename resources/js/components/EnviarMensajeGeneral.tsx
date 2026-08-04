import { useState, useCallback } from 'react';
import { Send, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface CorreoDestino {
    NOMBRE: string;
    CORREO: string;
}

interface ResultadoEnvioMensaje {
    nombre: string;
    correo: string;
    estado: 'pendiente' | 'enviando' | 'exito' | 'error';
    mensaje?: string;
}

interface EnviarMensajeGeneralProps {
    estudioId: number;
    tipoMensaje: string; // 'enriquecimiento' | 'patrocinio' | 'cancelacion' | 'personalizado'
    label: string;
    correos: CorreoDestino[]; // ya filtrados con ENVIAR = 'si'
    colorClass?: string; // clases tailwind para el botón, ej. 'bg-orange-600 hover:bg-orange-700'
    disabled?: boolean;
    // Solo se usan si tipoMensaje === 'personalizado'
    tituloPersonalizado?: string;
    asuntoPersonalizado?: string;
    mensajePersonalizado?: string;
}

export default function EnviarMensajeGeneral({
    estudioId,
    tipoMensaje,
    label,
    correos,
    colorClass = 'bg-[#189BAF] hover:bg-[#157a8c]',
    disabled = false,
    tituloPersonalizado,
    asuntoPersonalizado,
    mensajePersonalizado,
}: EnviarMensajeGeneralProps) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [resultados, setResultados] = useState<ResultadoEnvioMensaje[]>([]);

    const abrirModal = useCallback(() => {
        if (correos.length === 0) {
            alert('No hay correos marcados para enviar (revisa la sección de Correos, checkbox "Enviar").');
            return;
        }
        setResultados(correos.map(c => ({ nombre: c.NOMBRE, correo: c.CORREO, estado: 'pendiente' })));
        setModalAbierto(true);
    }, [correos]);

    const cerrarModal = useCallback(() => {
        if (enviando) return;
        setModalAbierto(false);
        setResultados([]);
    }, [enviando]);

    const enviarTodos = useCallback(() => {
        setEnviando(true);

        const enviarUno = async (index: number): Promise<void> => {
            if (index >= correos.length) {
                setEnviando(false);
                return;
            }

            const correo = correos[index];

            setResultados(prev => prev.map((r, i) => (i === index ? { ...r, estado: 'enviando' } : r)));

            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (!csrfToken) throw new Error('Token CSRF no encontrado');

                const response = await fetch(`/estudios/${estudioId}/enviar-mensaje`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        tipo_mensaje: tipoMensaje,
                        nombre: correo.NOMBRE,
                        correo: correo.CORREO,
                        titulo_personalizado: tituloPersonalizado,
                        asunto_personalizado: asuntoPersonalizado,
                        mensaje_personalizado: mensajePersonalizado,
                    }),
                });

                const result = await response.json();

                setResultados(prev => prev.map((r, i) =>
                    i === index
                        ? { ...r, estado: response.ok && result.success ? 'exito' : 'error', mensaje: result.message }
                        : r
                ));
            } catch (error) {
                setResultados(prev => prev.map((r, i) =>
                    i === index
                        ? { ...r, estado: 'error', mensaje: error instanceof Error ? error.message : 'Error de conexión' }
                        : r
                ));
            }

            setTimeout(() => enviarUno(index + 1), 800);
        };

        enviarUno(0);
    }, [correos, estudioId, tipoMensaje, tituloPersonalizado, asuntoPersonalizado, mensajePersonalizado]);

    return (
        <>
            <button
                type="button"
                disabled={disabled}
                onClick={abrirModal}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
            >
                <Send className="h-4 w-4" />
                {label}
            </button>

            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">{label}</h2>
                            {!enviando && (
                                <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Se enviará a {correos.length} destinatario(s) marcado(s) con "Enviar" en la lista de correos.
                        </p>

                        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                            {resultados.map((r, i) => (
                                <div key={i} className="flex items-center justify-between text-sm border border-gray-200 rounded-md px-3 py-2">
                                    <div>
                                        <p className="font-medium text-gray-800">{r.nombre}</p>
                                        <p className="text-gray-500 text-xs">{r.correo}</p>
                                        {r.estado === 'error' && r.mensaje && (
                                            <p className="text-red-600 text-xs mt-1">{r.mensaje}</p>
                                        )}
                                    </div>
                                    <div>
                                        {r.estado === 'pendiente' && <span className="text-gray-400 text-xs">Pendiente</span>}
                                        {r.estado === 'enviando' && <Loader2 className="h-4 w-4 animate-spin text-[#189BAF]" />}
                                        {r.estado === 'exito' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                        {r.estado === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cerrarModal}
                                disabled={enviando}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                {enviando ? 'Enviando...' : 'Cerrar'}
                            </button>
                            {!enviando && resultados.every(r => r.estado === 'pendiente') && (
                                <button
                                    onClick={enviarTodos}
                                    className={`px-4 py-2 text-sm text-white rounded-md ${colorClass}`}
                                >
                                    Confirmar y Enviar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}