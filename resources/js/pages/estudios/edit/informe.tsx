import { useMemo, useCallback, useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Eye, FileText, Mail, Plus, Trash2, Send, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface ResultadoEnvio {
    nombre: string;
    correo: string;
    estado: 'pendiente' | 'enviando' | 'exito' | 'error';
    mensaje?: string;
}

interface ModalEnvioState {
    isOpen: boolean;
    enviando: boolean;
    resultados: ResultadoEnvio[];
}

interface EditInformeProps {
    estudio: any;
    medico: any;
    correos_copias: any[];
    [key: string]: any;
}

interface CorreoCopia {
    [key: string]: string | number | undefined;
    ID?: number;
    NOMBRE: string;
    CORREO: string;
    ID_ESTUDIO: number;
    ENVIAR?: string;
}

export default function EditInformeComplete() {
    const { estudio, medico, correos_copias = [] } = usePage<EditInformeProps>().props;

    // Estado para el modal de Envio
    const [modalEnvio, setModalEnvio] = useState<ModalEnvioState>({
        isOpen: false,
        enviando: false,
        resultados: []
    });

    const [countdown, setCountdown] = useState(5);
    const [countdownActive, setCountdownActive] = useState(false);

    // Estado para los campos del formulario
    const [formData, setFormData] = useState({
        FECHA_INFORME: estudio.FECHA_INFORME ? 
            estudio.FECHA_INFORME.split('T')[0] : 
            new Date().toISOString().split('T')[0],
        HORA_INFORME: estudio.FECHA_INFORME ? 
            estudio.FECHA_INFORME.split('T')[1].substring(0, 5) : 
            new Date().toTimeString().slice(0, 5),
        ESTUDIO_FACTURADO: estudio.ESTUDIO_FACTURADO || '',
        ESTUDIO_ESTADO: estudio.ESTUDIO_ESTADO || '',
        ESTUDIO_COMENTARIOS: estudio.ESTUDIO_COMENTARIOS || '',
        BENEFICIARIO: estudio.BENEFICIARIO || '',
        ENVIAR_ADJUNTO: true,
        FECHA_RESULTADOS_CORREO: new Date().toISOString().split('T')[0],
        HORA_RESULTADOS_CORREO: new Date().toTimeString().slice(0, 5)
    });

    const [listaCorreos, setListaCorreos] = useState<CorreoCopia[]>([]);
    const [nuevoCorreo, setNuevoCorreo] = useState({ nombre: '', correo: '' });
    const [processing, setProcessing] = useState(false);
    
    // NUEVO: Estado para marcar/desmarcar todos
    const [todosSeleccionados, setTodosSeleccionados] = useState(false);

    // NUEVO: Función para marcar/desmarcar todos
    const toggleTodosCorreos = useCallback(() => {
        const nuevoEstado = !todosSeleccionados;
        setTodosSeleccionados(nuevoEstado);
        
        setListaCorreos(prev => 
            prev.map(correo => ({
                ...correo,
                ENVIAR: nuevoEstado ? 'si' : 'no'
            }))
        );
    }, [todosSeleccionados]);

    // NUEVO: Actualizar el estado cuando cambien los correos
    useEffect(() => {
        if (listaCorreos.length > 0) {
            const todosHabilitados = listaCorreos.every(correo => correo.ENVIAR === 'si');
            setTodosSeleccionados(todosHabilitados);
        } else {
            setTodosSeleccionados(false);
        }
    }, [listaCorreos]);

    // Agregar este useEffect para manejar la cuenta atrás
    useEffect(() => {
        let interval: any = null;
        
        if (modalEnvio.isOpen && !modalEnvio.enviando && countdownActive) {
            interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        // Tiempo agotado, enviar correos automáticamente
                        enviarCorreos();
                        setCountdownActive(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [modalEnvio.isOpen, modalEnvio.enviando, countdownActive]);

    // Función para iniciar la cuenta atrás cuando se abre el modal
    const iniciarModal = useCallback(() => {
        const resultadosIniciales: ResultadoEnvio[] = listaCorreos
            .filter(c => c.ENVIAR === 'si')
            .map(correo => ({
                nombre: correo.NOMBRE,
                correo: correo.CORREO,
                estado: 'pendiente' as const,
                mensaje: undefined
            }));
        
        setModalEnvio({ 
            isOpen: true, 
            enviando: false, 
            resultados: resultadosIniciales 
        });
        setCountdown(5);
        setCountdownActive(true);
    }, [listaCorreos]);

    // Función para cancelar el envío
    const cancelarEnvio = () => {
        setCountdownActive(false);
        setModalEnvio({ isOpen: false, enviando: false, resultados: [] });
        setCountdown(5);
    };

    // Cargar correos existentes al montar el componente
    useEffect(() => {
        console.log('🔄 Cargando correos existentes:', correos_copias);
        if (correos_copias && correos_copias.length > 0) {
            const correosFormateados: CorreoCopia[] = correos_copias.map(correo => ({
                ID: correo.ID,
                NOMBRE: correo.NOMBRE,
                CORREO: correo.CORREO,
                ID_ESTUDIO: correo.ID_ESTUDIO,
                ENVIAR: correo.ENVIAR
            }));
            setListaCorreos(correosFormateados);
        }
    }, [correos_copias]);

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: `/estudios?prefijo=${estudio.CLAVE || 'PRM'}` }, // ← CAMBIO AQUÍ
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Informe', href: `/estudios/${estudio.ID}/edit/informe` },
    ], [estudio]);

    const updateFormData = useCallback((key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    // Función para serializar correos compatible con FormData
    const serializeCorreos = (correos: CorreoCopia[]) => {
        return correos.map(correo => ({
            ID: correo.ID?.toString() || '',
            NOMBRE: correo.NOMBRE,
            CORREO: correo.CORREO,
            ID_ESTUDIO: correo.ID_ESTUDIO.toString(),
            ENVIAR: correo.ENVIAR || 'no'
        }));
    };

    const handleSave = useCallback(() => {
        setProcessing(true);
        
        const dataToSend: Record<string, any> = {
            ...formData,
            FECHA_INFORME: `${formData.FECHA_INFORME} ${formData.HORA_INFORME}:00`,
            FECHA_RESULTADOS_CORREO: `${formData.FECHA_RESULTADOS_CORREO} ${formData.HORA_RESULTADOS_CORREO}:00`,
            correos_copias: serializeCorreos(listaCorreos),
            _action: 'save'
        };
        
        console.log('💾 Guardando datos:', dataToSend);
        
        router.patch(`/estudios/${estudio.ID}/informe`, dataToSend, {
            onSuccess: () => {
                console.log('✅ Datos guardados exitosamente');
            },
            onError: (errors) => {
                console.error('❌ Error al guardar:', errors);
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    }, [estudio.ID, formData, listaCorreos]);

    const handleSaveAndSend = useCallback(() => {
        setProcessing(true);
        
        const dataToSend: Record<string, any> = {
            ...formData,
            FECHA_INFORME: `${formData.FECHA_INFORME} ${formData.HORA_INFORME}:00`,
            FECHA_RESULTADOS_CORREO: `${formData.FECHA_RESULTADOS_CORREO} ${formData.HORA_RESULTADOS_CORREO}:00`,
            correos_copias: serializeCorreos(listaCorreos)
        };
        
        console.log('Guardando datos antes de envío:', dataToSend);
        
        router.patch(`/estudios/${estudio.ID}/informe`, dataToSend, {
            onSuccess: () => {
                console.log('Datos guardados exitosamente, abriendo modal de envío');
                setProcessing(false);
                
                // Filtrar correos que se van a enviar
                const correosParaEnviar = listaCorreos.filter(correo => correo.ENVIAR === 'si');
                
                if (correosParaEnviar.length > 0) {
                    iniciarModal();
                } else {
                    alert('No hay correos marcados para enviar');
                }
            },
            onError: (errors) => {
                console.error('Error al guardar:', errors);
                setProcessing(false);
            }
        });
    }, [estudio.ID, formData, listaCorreos]);

    const enviarCorreos = useCallback(() => {
        setModalEnvio(prev => ({ ...prev, enviando: true }));
        
        const correosParaEnviar = listaCorreos.filter(correo => correo.ENVIAR === 'si');
        
        // Enviar correos uno por uno
        const enviarCorreoIndividual = async (index: number): Promise<void> => {
            if (index >= correosParaEnviar.length) {
                // Todos los correos procesados
                setModalEnvio(prev => ({ ...prev, enviando: false }));
                return;
            }
            
            const correo = correosParaEnviar[index];
            
            // Actualizar estado a "enviando"
            setModalEnvio(prev => ({
                ...prev,
                resultados: prev.resultados.map((resultado, i) => 
                    i === index 
                        ? { ...resultado, estado: 'enviando' as const }
                        : resultado
                )
            }));
            
            try {
                // Obtener el token CSRF
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                
                if (!csrfToken) {
                    throw new Error('Token CSRF no encontrado');
                }
                
                // Llamada para enviar correo individual
                const response = await fetch(`/estudios/${estudio.ID}/enviar-correo`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({
                        nombre: correo.NOMBRE,
                        correo: correo.CORREO,
                        enviar_adjunto: formData.ENVIAR_ADJUNTO
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Éxito
                    setModalEnvio(prev => ({
                        ...prev,
                        resultados: prev.resultados.map((resultado, i) => 
                            i === index 
                                ? { 
                                    ...resultado, 
                                    estado: 'exito' as const, 
                                    mensaje: result.message || 'Correo enviado exitosamente' 
                                }
                                : resultado
                        )
                    }));
                } else {
                    // Error
                    setModalEnvio(prev => ({
                        ...prev,
                        resultados: prev.resultados.map((resultado, i) => 
                            i === index 
                                ? { 
                                    ...resultado, 
                                    estado: 'error' as const, 
                                    mensaje: result.message || 'Error al enviar correo' 
                                }
                                : resultado
                        )
                    }));
                }
            } catch (error) {
                console.error('Error enviando correo:', error);
                let mensajeError = 'Error de conexión';
                
                if (error instanceof Error) {
                    mensajeError = `Error de conexión: ${error.message}`;
                    
                    if (error.cause) {
                        mensajeError += ` (Causa: ${error.cause})`;
                    }
                    
                    if (error.name === 'NetworkError') {
                        mensajeError = `Error de red: ${error.message}`;
                    } else if (error.name === 'TypeError') {
                        mensajeError = `Error de tipo: ${error.message}`;
                    } else if (error.name === 'AbortError') {
                        mensajeError = `Solicitud cancelada: ${error.message}`;
                    }
                } else if (typeof error === 'string') {
                    mensajeError = `Error de conexión: ${error}`;
                } else {
                    mensajeError = `Error de conexión: ${JSON.stringify(error)}`;
                }
                
                setModalEnvio(prev => ({
                    ...prev,
                    resultados: prev.resultados.map((resultado, i) => 
                        i === index 
                            ? { 
                                ...resultado, 
                                estado: 'error' as const, 
                                mensaje: mensajeError
                            }
                            : resultado
                    )
                }));
            }
            
            // Continuar con el siguiente correo después de 1 segundo
            setTimeout(() => enviarCorreoIndividual(index + 1), 1000);
        };
        
        // Iniciar el envío del primer correo
        enviarCorreoIndividual(0);
    }, [estudio.ID, listaCorreos, formData.ENVIAR_ADJUNTO]);

    const handleSaveAndExit = useCallback(() => {
        setProcessing(true);
        
        const dataToSend: Record<string, any> = {
            ...formData,
            FECHA_INFORME: `${formData.FECHA_INFORME} ${formData.HORA_INFORME}:00`,
            FECHA_RESULTADOS_CORREO: `${formData.FECHA_RESULTADOS_CORREO} ${formData.HORA_RESULTADOS_CORREO}:00`,
            correos_copias: serializeCorreos(listaCorreos),
            _action: 'save_and_exit' // ← AGREGAR ESTO
        };
        
        router.patch(`/estudios/${estudio.ID}/informe`, dataToSend, {
            onSuccess: () => {
                // El backend se encargará de redirigir con el prefijo correcto
                console.log('Datos guardados y regresando a lista');
            },
            onError: (errors) => {
                console.error('❌ Error al guardar:', errors);
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    }, [estudio.ID, formData, listaCorreos]);

    const handlePrev = useCallback(() => {
        router.visit(`/estudios/${estudio.ID}/edit/laboratorio`);
    }, [estudio.ID]);

    const agregarCorreoMedico = useCallback(() => {
        if (medico && medico.USUARIO_CORREO) {
            const correoMedico: CorreoCopia = {
                NOMBRE: `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}`,
                CORREO: medico.USUARIO_CORREO,
                ID_ESTUDIO: estudio.ID,
                ENVIAR: 'si'
            };
            
            // Verificar si ya está agregado
            const yaExiste = listaCorreos.some(correo => correo.CORREO === medico.USUARIO_CORREO);
            if (!yaExiste) {
                setListaCorreos(prev => [...prev, correoMedico]);
            }
        }
    }, [medico, estudio.ID, listaCorreos]);

    const agregarCorreo = useCallback(() => {
        if (nuevoCorreo.correo.trim()) {
            const nuevoCorreoObj: CorreoCopia = {
                NOMBRE: nuevoCorreo.nombre.trim(),
                CORREO: nuevoCorreo.correo.trim(),
                ID_ESTUDIO: estudio.ID,
                ENVIAR: 'si'
            };
            
            setListaCorreos(prev => [...prev, nuevoCorreoObj]);
            setNuevoCorreo({ nombre: '', correo: '' });
        }
    }, [nuevoCorreo, estudio.ID]);

    const eliminarCorreo = useCallback((index: number) => {
        setListaCorreos(prev => prev.filter((_, i) => i !== index));
    }, []);

    const toggleEnviarCorreo = useCallback((index: number) => {
        setListaCorreos(prev => prev.map((correo, i) => 
            i === index 
                ? { ...correo, ENVIAR: correo.ENVIAR === 'si' ? 'no' : 'si' }
                : correo
        ));
    }, []);

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent bg-white";
    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent bg-white";
    const textareaClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent bg-white resize-none";
    const labelClass = "block text-sm font-medium mb-1";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Informe`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con información del estudio y progreso */}
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    {/* Header principal */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <FileText className="h-6 w-6 text-[#189BAF] flex-shrink-0" />
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                                {estudio.CLAVE_INTERNA}
                            </h1>
                        </div>
                        
                        <Link href={`/estudios/${estudio.ID}`}>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Estudio
                            </Button>
                        </Link>
                    </div>
                    
                    {/* Pasos del proceso - Versión desktop */}
                    <div className="hidden lg:block mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 w-full">
                                <Badge variant="outline">1. Recolección</Badge>
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <Badge variant="outline">2. Recepción</Badge>
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <Badge variant="outline">3. Laboratorio</Badge>
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <Badge className="bg-[#189BAF] text-white">4. Informe</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Pasos del proceso - Versión tablet */}
                    <div className="hidden sm:block lg:hidden mb-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">1. Recolección</Badge>
                                <div className="flex-1 h-0.5 bg-gray-300"></div>
                                <Badge variant="outline" className="text-xs">2. Recepción</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">3. Laboratorio</Badge>
                                <div className="flex-1 h-0.5 bg-gray-300"></div>
                                <Badge className="bg-[#189BAF] text-white text-xs">4. Informe</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Pasos del proceso - Versión móvil */}
                    <div className="block sm:hidden mb-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">1. Recolección</Badge>
                                <span className="text-xs text-gray-500">Completado</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">2. Recepción</Badge>
                                <span className="text-xs text-gray-500">Completado</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">3. Laboratorio</Badge>
                                <span className="text-xs text-gray-500">Completado</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Badge className="bg-[#189BAF] text-white text-xs">4. Informe</Badge>
                                <span className="text-xs text-[#189BAF] font-medium">En proceso</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Progreso del estudio</span>
                            <span className="text-sm text-gray-500">100%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-[#189BAF] h-2 rounded-full transition-all duration-300 ease-in-out" 
                                style={{ width: '100%' }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Información del Informe */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Información del Informe</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Fecha Informe</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={formData.FECHA_INFORME}
                                onChange={(e) => updateFormData('FECHA_INFORME', e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className={labelClass}>Hora Informe</label>
                            <input
                                type="time"
                                className={inputClass}
                                value={formData.HORA_INFORME}
                                onChange={(e) => updateFormData('HORA_INFORME', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* COLUMNA IZQUIERDA - Lista de correos */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Lista de Correos para Envío de Informes</h3>
                        
                        {/* Botón para agregar médico */}
                        {medico && (
                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={agregarCorreoMedico}
                                    className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    Enviar copia al médico: {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                </button>
                            </div>
                        )}

                        {/* Agregar nuevo correo */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <h5 className="font-medium mb-2">Añadir nueva dirección de correo</h5>
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-5">
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="Nombre Completo (opcional)"
                                        value={nuevoCorreo.nombre}
                                        onChange={(e) => setNuevoCorreo(prev => ({...prev, nombre: e.target.value}))}
                                    />
                                </div>
                                <div className="col-span-5">
                                    <input
                                        type="email"
                                        className={inputClass}
                                        placeholder="Correo"
                                        value={nuevoCorreo.correo}
                                        onChange={(e) => setNuevoCorreo(prev => ({...prev, correo: e.target.value}))}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <button
                                        type="button"
                                        onClick={agregarCorreo}
                                        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                                        disabled={!nuevoCorreo.correo.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de correos agregados con funcionalidad marcar/desmarcar todos */}
                        {listaCorreos.length > 0 && (
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between">
                                    <h5 className="font-medium">Correos agregados ({listaCorreos.length}):</h5>
                                    <button
                                        type="button"
                                        onClick={toggleTodosCorreos}
                                        className="flex items-center gap-2 px-3 py-1 text-sm border rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={todosSeleccionados}
                                            onChange={() => {}}
                                            className="h-4 w-4 text-[#189BAF] focus:ring-[#189BAF] border-gray-300 rounded pointer-events-none"
                                        />
                                        <span className="text-gray-700">
                                            {todosSeleccionados ? 'Desmarcar todos' : 'Marcar todos'}
                                        </span>
                                    </button>
                                </div>
                                
                                {listaCorreos.map((correo, index) => (
                                    <div
                                        key={correo.ID || index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={correo.ENVIAR === 'si'}
                                                onChange={() => toggleEnviarCorreo(index)}
                                                className="h-4 w-4 text-[#189BAF] focus:ring-[#189BAF] border-gray-300 rounded"
                                            />
                                            <div>
                                                <p className="font-medium">{correo.NOMBRE}</p>
                                                <p className="text-sm text-gray-600">{correo.CORREO}</p>
                                                {correo.ID && <p className="text-xs text-gray-400">ID: {correo.ID}</p>}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => eliminarCorreo(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Enviar como adjunto */}
                        <div className="border-t pt-4">
                            <h5 className="font-medium mb-2">Opciones de Envío</h5>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2 h-4 w-4 text-[#189BAF] focus:ring-[#189BAF] border-gray-300 rounded"
                                    checked={formData.ENVIAR_ADJUNTO}
                                    onChange={(e) => updateFormData('ENVIAR_ADJUNTO', e.target.checked)}
                                />
                                <span className="text-sm">Enviar reporte como adjunto</span>
                            </label>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA - Configuración del estudio */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Configuración del Estudio</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Facturado</label>
                                <select
                                    className={selectClass}
                                    value={formData.ESTUDIO_FACTURADO}
                                    onChange={(e) => updateFormData('ESTUDIO_FACTURADO', e.target.value)}
                                >
                                    <option value="">Selecciona</option>
                                    <option value="Si">Si</option>
                                    <option value="No">No</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Estado del Estudio</label>
                                <select
                                    className={selectClass}
                                    value={formData.ESTUDIO_ESTADO}
                                    onChange={(e) => updateFormData('ESTUDIO_ESTADO', e.target.value)}
                                >
                                    <option value="">Selecciona</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En Proceso">En Proceso</option>
                                    <option value="Completado">Completado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Beneficiario</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.BENEFICIARIO}
                                    onChange={(e) => updateFormData('BENEFICIARIO', e.target.value)}
                                    placeholder="Nombre del beneficiario"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Comentarios</label>
                                <textarea
                                    className={textareaClass}
                                    rows={8}
                                    value={formData.ESTUDIO_COMENTARIOS}
                                    onChange={(e) => updateFormData('ESTUDIO_COMENTARIOS', e.target.value)}
                                    placeholder="Comentarios adicionales sobre el estudio..."
                                />
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2">Información del Envío</h4>
                            <div className="space-y-1 text-sm text-blue-700">
                                <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES')}</p>
                                <p><strong>Hora:</strong> {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                                <p><strong>Correos activos:</strong> {listaCorreos.filter(c => c.ENVIAR === 'si').length} de {listaCorreos.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de navegación */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    {/* Versión Desktop */}
                    <div className="hidden md:flex justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                disabled={processing}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Anterior
                            </Button>
                            
                            <Button
                                variant="outline"
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={handleSaveAndExit}
                                disabled={processing}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Guardar y Salir
                            </Button>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleSave}
                                disabled={processing}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Solo Guardar
                            </Button>
                            
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleSaveAndSend}
                                disabled={processing || listaCorreos.filter(c => c.ENVIAR === 'si').length === 0}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Guardar y Enviar Correo
                            </Button>
                        </div>
                    </div>

                    {/* Versión Tablet */}
                    <div className="hidden sm:flex md:hidden flex-col gap-3">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                disabled={processing}
                                className="flex-1"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Anterior
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                onClick={handleSaveAndSend}
                                disabled={processing || listaCorreos.filter(c => c.ENVIAR === 'si').length === 0}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Guardar y Enviar
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleSave}
                                disabled={processing}
                                className="bg-blue-600 text-white hover:bg-blue-700 flex-1"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Solo Guardar
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-red-600 text-white hover:bg-red-700 flex-1"
                                onClick={handleSaveAndExit}
                                disabled={processing}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Guardar y Salir
                            </Button>
                        </div>
                    </div>

                    {/* Versión Móvil */}
                    <div className="flex sm:hidden flex-col gap-3">
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white w-full py-3"
                            onClick={handleSaveAndSend}
                            disabled={processing || listaCorreos.filter(c => c.ENVIAR === 'si').length === 0}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Guardar y Enviar Correo
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleSave}
                                disabled={processing}
                                className="bg-blue-600 text-white hover:bg-blue-700 text-sm py-2"
                            >
                                <Save className="h-4 w-4 mr-1" />
                                Guardar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                disabled={processing}
                                className="text-sm py-2"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Anterior
                            </Button>
                        </div>
                        
                        <Button
                            variant="outline"
                            className="bg-red-600 text-white hover:bg-red-700 w-full"
                            onClick={handleSaveAndExit}
                            disabled={processing}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar y Salir
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal de Envío de Correos */}
            {modalEnvio.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Envío de Correos Electrónicos</h3>
                            {!modalEnvio.enviando && (
                                <button
                                    onClick={cancelarEnvio}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        
                        <div className="space-y-3">
                            {modalEnvio.resultados.map((resultado, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{resultado.nombre || 'Sin nombre'}</p>
                                        <p className="text-sm text-gray-600">{resultado.correo}</p>
                                        {resultado.mensaje && (
                                            <p className={`text-sm mt-1 ${
                                                resultado.estado === 'error' ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                {resultado.mensaje}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="ml-4">
                                        {(!resultado.estado || resultado.estado === 'pendiente') && (
                                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            </div>
                                        )}
                                        {resultado.estado === 'enviando' && (
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        {resultado.estado === 'exito' && (
                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 border-l-2 border-b-2 border-white transform rotate-[-45deg] translate-y-[-1px]"></div>
                                            </div>
                                        )}
                                        {resultado.estado === 'error' && (
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-0.5 bg-white"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                            {!modalEnvio.enviando ? (
                                <div className="flex flex-col items-center gap-3">
                                    {countdownActive && (
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 mb-2">
                                                Los correos se enviarán automáticamente en:
                                            </p>
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-lg">{countdown}</span>
                                                </div>
                                                <span className="text-gray-500 text-sm">segundos</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => router.visit(`/estudios?prefijo=${estudio.CLAVE || 'PRM'}`)}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Salir
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCountdownActive(false);
                                                enviarCorreos();
                                            }}
                                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors"
                                        >
                                            <Send className="h-4 w-4" />
                                            Enviar Ahora ({modalEnvio.resultados.length})
                                        </button>
                                    </div>
                                </div>
                            ) : modalEnvio.enviando ? (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    Enviando correos...
                                </div>
                            ) : (
                                // NUEVO: Botón para salir cuando el envío ha terminado
                                <button
                                    onClick={() => router.visit(`/estudios?prefijo=${estudio.CLAVE || 'PRM'}`)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Salir
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}