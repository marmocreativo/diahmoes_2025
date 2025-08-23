import { useMemo, useCallback, useState } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Eye, FileText, Mail, Plus, Trash2, Send } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditInformeProps {
    estudio: any;
    medico: any;
    [key: string]: any;
}

interface CorreoCopia {
    ID?: number;
    NOMBRE: string;
    CORREO: string;
    ID_ESTUDIO: number;
}

export default function EditInformeOptimized() {
    const { estudio, medico } = usePage<EditInformeProps>().props;

    const { data, setData, patch, processing } = useForm({
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

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Informe', href: `/estudios/${estudio.ID}/edit/informe` },
    ], [estudio]);

    const handleSave = useCallback(() => {
        const formData = { ...data, listaCorreos };
        patch(`/estudios/${estudio.ID}/informe`, {
            data: formData
        });
    }, [estudio.ID, data, listaCorreos, patch]);

    const handleSaveAndSend = useCallback(() => {
        const formData = { ...data, listaCorreos, _action: 'enviar' };
        patch(`/estudios/${estudio.ID}/informe`, {
            data: formData,
            onSuccess: () => {
                alert('Estudio guardado y correo enviado exitosamente');
            }
        });
    }, [estudio.ID, data, listaCorreos, patch]);

    const handlePrev = useCallback(() => {
        router.visit(`/estudios/${estudio.ID}/edit/laboratorio`);
    }, [estudio.ID]);

    const agregarCorreoMedico = useCallback(() => {
        if (medico && medico.USUARIO_CORREO) {
            const correoMedico = {
                NOMBRE: `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}`,
                CORREO: medico.USUARIO_CORREO,
                ID_ESTUDIO: estudio.ID
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
                ID_ESTUDIO: estudio.ID
            }]);
            setNuevoCorreo({ nombre: '', correo: '' });
        }
    }, [nuevoCorreo, estudio.ID]);

    const eliminarCorreo = useCallback((index: number) => {
        setListaCorreos(prev => prev.filter((_, i) => i !== index));
    }, []);

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";
    const textareaClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Informe`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con clave interna y estado */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-[#189BAF]" />
                                <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                            </div>
                            <Badge className="bg-[#189BAF] text-white">4. Informe</Badge>
                        </div>
                        <Link href={`/estudios/${estudio.ID}`}>
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Estudio
                            </Button>
                        </Link>
                    </div>
                    
                    {/* Barra de progreso del estado */}
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{estudio.ESTUDIO_ESTADO}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#189BAF] h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>

                <form className="space-y-6">
                    {/* Información del Informe */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            📄 Informe
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Fecha Informe <small>(dd/mm/aaaa)</small></label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={data.FECHA_INFORME}
                                    onChange={(e) => setData('FECHA_INFORME', e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className={labelClass}>Hora Informe <small>(00:00)</small></label>
                                <input
                                    type="time"
                                    className={inputClass}
                                    value={data.HORA_INFORME}
                                    onChange={(e) => setData('HORA_INFORME', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* COLUMNA IZQUIERDA - Lista de correos */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    ✉️ Lista de Correos para envío de informes
                                </h3>
                                
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
                                    <h5 className="font-medium mb-2">Añadir nueva dirección de correo para copia</h5>
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
                                        <h5 className="font-medium">Correos agregados:</h5>
                                        {listaCorreos.map((correo, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{correo.NOMBRE}</p>
                                                    <p className="text-sm text-gray-600">{correo.CORREO}</p>
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
                                    <h5 className="font-medium text-lg mb-2">Enviar estudio como Adjunto</h5>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            checked={data.ENVIAR_ADJUNTO}
                                            onChange={(e) => setData('ENVIAR_ADJUNTO', e.target.checked)}
                                        />
                                        <span className="text-sm">Enviar reporte como adjunto</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA - Configuración del estudio */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Configuración del Estudio</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Facturado</label>
                                        <select
                                            className={selectClass}
                                            value={data.ESTUDIO_FACTURADO}
                                            onChange={(e) => setData('ESTUDIO_FACTURADO', e.target.value)}
                                        >
                                            <option value="">Selecciona</option>
                                            <option value="Si">Si</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>¿Cancelar?</label>
                                        <select
                                            className={selectClass}
                                            value={data.ESTUDIO_ESTADO === 'Cancelado' ? 'Cancelado' : ''}
                                            onChange={(e) => setData('ESTUDIO_ESTADO', e.target.value || estudio.ESTUDIO_ESTADO)}
                                        >
                                            <option value="">Continuar Normal</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Beneficiario</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            value={data.BENEFICIARIO}
                                            onChange={(e) => setData('BENEFICIARIO', e.target.value)}
                                            placeholder="Nombre del beneficiario"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Comentarios</label>
                                        <textarea
                                            className={textareaClass}
                                            rows={6}
                                            value={data.ESTUDIO_COMENTARIOS}
                                            onChange={(e) => setData('ESTUDIO_COMENTARIOS', e.target.value)}
                                            placeholder="Comentarios adicionales sobre el estudio..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-800 mb-2">Información del Envío</h4>
                                <div className="space-y-2 text-sm text-blue-700">
                                    <p><strong>Fecha envío:</strong> {new Date().toLocaleDateString('es-ES')}</p>
                                    <p><strong>Hora envío:</strong> {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p><strong>Correos a enviar:</strong> {listaCorreos.length} destinatarios</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de navegación */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Anterior: Laboratorio
                            </Button>
                            <div className="flex gap-2">
                                <Link href="/estudios">
                                    <Button
                                        variant="outline"
                                        className="bg-gray-600 text-white hover:bg-gray-700"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Guardar y Salir
                                    </Button>
                                </Link>
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
                                    disabled={processing || listaCorreos.length === 0}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Guardar y Enviar Correo
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}