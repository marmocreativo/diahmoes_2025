import { useMemo, useCallback, useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Eye, FileText, Mail, Plus, Trash2, Send } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditInformeProps {
    estudio: any;
    medico: any;
    correos_copias: any[]; // Agregar correos existentes
    [key: string]: any;
}

interface CorreoCopia {
    ID?: number;
    NOMBRE: string;
    CORREO: string;
    ID_ESTUDIO: number;
    ENVIAR?: string;
}

export default function EditInformeFixed() {
    const { estudio, medico, correos_copias = [] } = usePage<EditInformeProps>().props;

    // Estado para los campos del formulario
    const [formData, setFormData] = useState({
        FECHA_INFORME: estudio.FECHA_INFORME ? 
            new Date(estudio.FECHA_INFORME).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0],
        HORA_INFORME: estudio.FECHA_INFORME ? 
            new Date(estudio.FECHA_INFORME).toTimeString().slice(0, 5) : 
            new Date().toTimeString().slice(0, 5),
        ESTUDIO_FACTURADO: estudio.ESTUDIO_FACTURADO || '',
        ESTUDIO_ESTADO: estudio.ESTUDIO_ESTADO || '',
        ESTUDIO_COMENTARIOS: estudio.ESTUDIO_COMENTARIOS || '',
        BENEFICIARIO: estudio.BENEFICIARIO || '',
        ENVIAR_ADJUNTO: false,
        FECHA_RESULTADOS_CORREO: new Date().toISOString().split('T')[0],
        HORA_RESULTADOS_CORREO: new Date().toTimeString().slice(0, 5)
    });

    const [listaCorreos, setListaCorreos] = useState<CorreoCopia[]>([]);
    const [nuevoCorreo, setNuevoCorreo] = useState({ nombre: '', correo: '' });
    const [processing, setProcessing] = useState(false);

    // Cargar correos existentes al montar el componente
    useEffect(() => {
        console.log('🔄 Cargando correos existentes:', correos_copias);
        if (correos_copias && correos_copias.length > 0) {
            const correosFormateados = correos_copias.map(correo => ({
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
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Informe', href: `/estudios/${estudio.ID}/edit/informe` },
    ], [estudio]);

    const updateFormData = useCallback((key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSave = useCallback(() => {
        setProcessing(true);
        const dataToSend = {
            ...formData,
            // Combinar fecha y hora para informe
            FECHA_INFORME: `${formData.FECHA_INFORME} ${formData.HORA_INFORME}:00`,
            FECHA_RESULTADOS_CORREO: `${formData.FECHA_RESULTADOS_CORREO} ${formData.HORA_RESULTADOS_CORREO}:00`,
            correos_copias: listaCorreos
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
        const dataToSend = {
            ...formData,
            FECHA_INFORME: `${formData.FECHA_INFORME} ${formData.HORA_INFORME}:00`,
            FECHA_RESULTADOS_CORREO: `${formData.FECHA_RESULTADOS_CORREO} ${formData.HORA_RESULTADOS_CORREO}:00`,
            correos_copias: listaCorreos,
            _action: 'enviar'
        };
        
        console.log('📧 Guardando y enviando:', dataToSend);
        
        router.patch(`/estudios/${estudio.ID}/informe`, dataToSend, {
            onSuccess: () => {
                alert('Estudio guardado y correo enviado exitosamente');
            },
            onError: (errors) => {
                console.error('❌ Error al guardar y enviar:', errors);
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    }, [estudio.ID, formData, listaCorreos]);

    const handleSaveAndExit = useCallback(() => {
        setProcessing(true);
        const dataToSend = {
            ...formData,
            FECHA_INFORME: `${formData.FECHA_INFORME} ${formData.HORA_INFORME}:00`,
            FECHA_RESULTADOS_CORREO: `${formData.FECHA_RESULTADOS_CORREO} ${formData.HORA_RESULTADOS_CORREO}:00`,
            correos_copias: listaCorreos
        };
        
        router.patch(`/estudios/${estudio.ID}/informe`, dataToSend, {
            onSuccess: () => {
                router.visit('/estudios');
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
            const correoMedico = {
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
        if (nuevoCorreo.nombre.trim() && nuevoCorreo.correo.trim()) {
            setListaCorreos(prev => [...prev, {
                NOMBRE: nuevoCorreo.nombre.trim(),
                CORREO: nuevoCorreo.correo.trim(),
                ID_ESTUDIO: estudio.ID,
                ENVIAR: 'si'
            }]);
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

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent";
    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent bg-white";
    const textareaClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent resize-none";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Informe`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con información del estudio y progreso */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-[#189BAF]" />
                                <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                            </div>
                        </div>
                        <Link href={`/estudios/${estudio.ID}`}>
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Estudio
                            </Button>
                        </Link>
                    </div>
                    
                    {/* Progreso de pasos */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline">1. Recolección</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge variant="outline">2. Recepción</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge variant="outline">3. Laboratorio</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge className="bg-[#189BAF] text-white">4. Informe</Badge>
                        </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#189BAF] h-2 rounded-full" style={{ width: '100%' }}></div>
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
                                        placeholder="Nombre Completo"
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
                                        disabled={!nuevoCorreo.nombre.trim() || !nuevoCorreo.correo.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de correos agregados */}
                        {listaCorreos.length > 0 && (
                            <div className="space-y-2 mb-4">
                                <h5 className="font-medium">Correos agregados ({listaCorreos.length}):</h5>
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
                    <div className="flex justify-between">
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
                </div>

                {/* Debug Info */}
                <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium mb-2">Debug Info</h4>
                    <div className="text-sm space-y-1">
                        <p>Correos en BD: {correos_copias?.length || 0}</p>
                        <p>Correos en lista: {listaCorreos.length}</p>
                        <p>Correos para enviar: {listaCorreos.filter(c => c.ENVIAR === 'si').length}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}