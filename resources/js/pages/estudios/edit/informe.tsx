import { useState, useCallback, useMemo } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, CheckCircle, Send, FileText, Mail, Plus, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditInformeProps {
    estudio: any;
    medicos: any[];
    correosCopia: any[];
    [key: string]: any;
}

interface CorreoCopia {
    ID?: number;
    NOMBRE: string;
    CORREO: string;
    ID_ESTUDIO: number;
}

export default function EditInformeOptimized() {
    const { estudio, medicos, correosCopia } = usePage<EditInformeProps>().props;

    // Usar useForm de Inertia para mejor manejo del estado
    const { data, setData, patch, processing } = useForm({
        FechaInforme: estudio.FECHA_INFORME ? 
            new Date(estudio.FECHA_INFORME).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0],
        HoraInforme: estudio.FECHA_INFORME ? 
            new Date(estudio.FECHA_INFORME).toTimeString().slice(0, 5) : 
            new Date().toTimeString().slice(0, 5),
        FechaResultadosCorreo: new Date().toISOString().split('T')[0],
        HoraResultadosCorreo: new Date().toTimeString().slice(0, 5),
        EstudioFacturado: estudio.ESTUDIO_FACTURADO || '',
        EstudioEstado: estudio.ESTUDIO_ESTADO || '',
        EstudioComentarios: estudio.ESTUDIO_COMENTARIOS || '',
        EnviarAdjunto: false as boolean,
        Beneficiario: estudio.BENEFICIARIO || ''
    });

    const [listaCorreos, setListaCorreos] = useState<CorreoCopia[]>(correosCopia);
    const [nuevoCorreo, setNuevoCorreo] = useState({ nombre: '', correo: '' });
    const [procesandoCorreo, setProcesandoCorreo] = useState(false);

    // Memorizar breadcrumbs para evitar re-renders
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Informe', href: `/estudios/${estudio.ID}/edit/informe` },
    ], [estudio]);

    // Memorizar médico actual para evitar búsquedas repetidas
    const medicoActual = useMemo(() => 
        medicos.find(m => m.ID_USUARIO == estudio.ID_MEDICO), 
        [medicos, estudio.ID_MEDICO]
    );

    // Handlers optimizados con useCallback
    const handleSave = useCallback(() => {
        patch(`/estudios/${estudio.ID}/informe`);
    }, [estudio.ID, patch]);

    const handleSaveAndSendEmail = useCallback(() => {
        const formData = { ...data, _sendEmail: true };
        router.patch(`/estudios/${estudio.ID}/informe`, formData);
    }, [estudio.ID, data, router]);

    const handleComplete = useCallback(() => {
        const formData = { ...data, _complete: true };
        router.patch(`/estudios/${estudio.ID}/informe`, formData, {
            onSuccess: () => router.visit(`/estudios/${estudio.ID}`)
        });
    }, [estudio.ID, data, router]);

    const agregarCorreoMedico = useCallback(async () => {
        if (!medicoActual || procesandoCorreo) return;
        
        const yaExiste = listaCorreos.some(c => c.CORREO === medicoActual.USUARIO_CORREO);
        if (yaExiste) return;
        
        setProcesandoCorreo(true);
        
        try {
            const response = await fetch(`/api/estudios/${estudio.ID}/correos-copia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    nombre: `${medicoActual.USUARIO_NOMBRE} ${medicoActual.USUARIO_APELLIDOS}`,
                    correo: medicoActual.USUARIO_CORREO
                })
            });
            
            if (response.ok) {
                const nuevoCorreo = await response.json();
                setListaCorreos(prev => [...prev, nuevoCorreo]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProcesandoCorreo(false);
        }
    }, [medicoActual, procesandoCorreo, listaCorreos, estudio.ID]);

    const agregarNuevoCorreo = useCallback(async () => {
        if (!nuevoCorreo.nombre.trim() || !nuevoCorreo.correo.trim() || procesandoCorreo) return;
        
        const yaExiste = listaCorreos.some(c => c.CORREO === nuevoCorreo.correo.trim());
        if (yaExiste) return;
        
        setProcesandoCorreo(true);
        
        try {
            const response = await fetch(`/api/estudios/${estudio.ID}/correos-copia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    nombre: nuevoCorreo.nombre.trim(),
                    correo: nuevoCorreo.correo.trim()
                })
            });
            
            if (response.ok) {
                const correoCreado = await response.json();
                setListaCorreos(prev => [...prev, correoCreado]);
                setNuevoCorreo({ nombre: '', correo: '' });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProcesandoCorreo(false);
        }
    }, [nuevoCorreo, procesandoCorreo, listaCorreos, estudio.ID]);

    const eliminarCorreo = useCallback(async (id: number) => {
        if (procesandoCorreo) return;
        
        setProcesandoCorreo(true);
        
        try {
            const response = await fetch(`/api/estudios/${estudio.ID}/correos-copia/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
            
            if (response.ok) {
                setListaCorreos(prev => prev.filter(c => c.ID !== id));
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProcesandoCorreo(false);
        }
    }, [procesandoCorreo, estudio.ID]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Informe`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Editar Estudio - {estudio.CLAVE_INTERNA}
                        </h1>
                        <p className="text-gray-600">Paso 4: Informe Final</p>
                    </div>
                    <Link href={`/estudios/${estudio.ID}`}>
                        <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Estudio
                        </Button>
                    </Link>
                </div>

                {/* Indicador de pasos */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Badge variant="outline">1. Recolección</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">2. Recepción</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">3. Laboratorio</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <Badge className="bg-[#189BAF] text-white">4. Informe</Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Fecha y hora del informe */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Informe</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="FechaInforme">Fecha Informe</Label>
                                <Input
                                    id="FechaInforme"
                                    type="date"
                                    value={data.FechaInforme}
                                    onChange={(e) => setData('FechaInforme', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="HoraInforme">Hora Informe</Label>
                                <Input
                                    id="HoraInforme"
                                    type="time"
                                    value={data.HoraInforme}
                                    onChange={(e) => setData('HoraInforme', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Lista de correos */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Mail className="h-5 w-5 text-[#189BAF]" />
                                <h2 className="text-lg font-semibold">Lista de Correos</h2>
                            </div>

                            {/* Botón médico */}
                            {medicoActual && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <Button
                                        onClick={agregarCorreoMedico}
                                        disabled={procesandoCorreo}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        {procesandoCorreo ? 'Agregando...' : 'Enviar copia al médico'}
                                    </Button>
                                </div>
                            )}

                            {/* Agregar nuevo correo */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <h3 className="font-semibold mb-2">Añadir nueva dirección</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    <div className="col-span-2">
                                        <Input
                                            placeholder="Nombre Completo"
                                            value={nuevoCorreo.nombre}
                                            onChange={(e) => setNuevoCorreo(prev => ({...prev, nombre: e.target.value}))}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            placeholder="Correo"
                                            type="email"
                                            value={nuevoCorreo.correo}
                                            onChange={(e) => setNuevoCorreo(prev => ({...prev, correo: e.target.value}))}
                                        />
                                    </div>
                                    <Button
                                        onClick={agregarNuevoCorreo}
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={!nuevoCorreo.nombre.trim() || !nuevoCorreo.correo.trim() || procesandoCorreo}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Lista de correos */}
                            {listaCorreos.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Correos agregados:</h3>
                                    {listaCorreos.map((correo) => (
                                        <div
                                            key={correo.ID}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">{correo.NOMBRE}</p>
                                                <p className="text-sm text-gray-600">{correo.CORREO}</p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={procesandoCorreo}
                                                onClick={() => correo.ID && eliminarCorreo(correo.ID)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <hr className="my-4" />

                            {/* Enviar como adjunto */}
                            <div className="space-y-2">
                                <h3 className="font-semibold">Enviar estudio como Adjunto</h3>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="EnviarAdjunto"
                                        checked={data.EnviarAdjunto}
                                        onCheckedChange={(checked) => setData('EnviarAdjunto', checked === true)}
                                    />
                                    <Label htmlFor="EnviarAdjunto">Enviar reporte como adjunto</Label>
                                </div>
                            </div>
                        </div>

                        {/* Estado del estudio */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Estado del Estudio</h2>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="EstudioFacturado">Facturado</Label>
                                        <Select
                                            value={data.EstudioFacturado || "none"}
                                            onValueChange={(value) => setData('EstudioFacturado', value === "none" ? "" : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="Si">Si</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="EstudioEstado">¿Cancelar?</Label>
                                        <Select
                                            value={data.EstudioEstado === 'Cancelado' ? 'Cancelado' : 'none'}
                                            onValueChange={(value) => setData('EstudioEstado', value === "none" ? estudio.ESTUDIO_ESTADO : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Continuar Normal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Continuar Normal</SelectItem>
                                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="EstudioComentarios">Comentarios</Label>
                                        <Textarea
                                            id="EstudioComentarios"
                                            value={data.EstudioComentarios}
                                            onChange={(e) => setData('EstudioComentarios', e.target.value)}
                                            rows={4}
                                            placeholder="Comentarios adicionales..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Información del médico */}
                            {medicoActual && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h3 className="text-blue-800 font-semibold mb-2">Médico Asignado</h3>
                                    <div className="space-y-2">
                                        <p><strong>Nombre:</strong> {medicoActual.USUARIO_NOMBRE} {medicoActual.USUARIO_APELLIDOS}</p>
                                        <p><strong>Correo:</strong> {medicoActual.USUARIO_CORREO}</p>
                                        {medicoActual.USUARIO_TELEFONO && (
                                            <p><strong>Teléfono:</strong> {medicoActual.USUARIO_TELEFONO}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botones de navegación */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(`/estudios/${estudio.ID}/edit/laboratorio`)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Anterior: Laboratorio
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleSave}
                                disabled={processing}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Solo Guardar
                            </Button>
                            <Button
                                className="bg-orange-600 hover:bg-orange-700"
                                onClick={handleSaveAndSendEmail}
                                disabled={processing}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Guardar y Enviar Correo
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={handleComplete}
                                disabled={processing}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Completar Estudio
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}