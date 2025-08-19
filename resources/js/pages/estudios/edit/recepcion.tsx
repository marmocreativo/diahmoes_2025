import { useMemo, useCallback } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, Calendar, Package, Truck, FileText } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditRecepcionProps {
    estudio: any;
    pacientes: any[];
    tiposEnvio: Record<string, string>;
    [key: string]: any;
}

export default function EditRecepcionOptimized() {
    const { estudio, pacientes, tiposEnvio } = usePage<EditRecepcionProps>().props;

    // useForm para manejo optimizado del estado
    const { data, setData, patch, processing } = useForm({
        FECHA_RECEPCION: estudio.FECHA_RECEPCION ? 
            new Date(estudio.FECHA_RECEPCION).toISOString().split('T')[0] : '',
        HORA_RECEPCION: estudio.FECHA_RECEPCION ? 
            new Date(estudio.FECHA_RECEPCION).toTimeString().slice(0, 5) : '',
        FECHA_ENVIO_LABORATORIO: estudio.FECHA_ENVIO_LABORATORIO ? 
            new Date(estudio.FECHA_ENVIO_LABORATORIO).toISOString().split('T')[0] : '',
        HORA_ENVIO_LABORATORIO: estudio.FECHA_ENVIO_LABORATORIO ? 
            new Date(estudio.FECHA_ENVIO_LABORATORIO).toTimeString().slice(0, 5) : '',
        ID_PACIENTE: estudio.ID_PACIENTE || '',
        MUESTRA_FOLIO_SOBRE: estudio.MUESTRA_FOLIO_SOBRE || '',
        MUESTRA_FOLIO_KIT_BL: estudio.MUESTRA_FOLIO_KIT_BL || '',
        MUESTRA_OTROS_ROTULOS: estudio.MUESTRA_OTROS_ROTULOS || '',
        MUESTRA_BLOQUES: estudio.MUESTRA_BLOQUES || '',
        MUESTRA_LAMINILLAS: estudio.MUESTRA_LAMINILLAS || '',
        MUESTRA_ENVIO_TIPO: estudio.MUESTRA_ENVIO_TIPO || '',
        MUESTRA_ENVIO: estudio.MUESTRA_ENVIO || '',
        MUESTRA_GUIA: estudio.MUESTRA_GUIA || '',
        MUESTRA_GUIA_MENSAJERIA: estudio.MUESTRA_GUIA_MENSAJERIA || '',
        MUESTRA_GUIA_ESPECIALIZADA: estudio.MUESTRA_GUIA_ESPECIALIZADA || '',
        MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA: estudio.MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA || '',
        MUESTRA_LIQ_CONDICION: estudio.MUESTRA_LIQ_CONDICION || '',
        MUESTRA_LIQ_CONDICION_PRESENCIA: estudio.MUESTRA_LIQ_CONDICION_PRESENCIA || '',
        MUESTRA_LIQ_CANTIDAD_ADECUADA: estudio.MUESTRA_LIQ_CANTIDAD_ADECUADA || '',
        MUESTRA_LIQ_CANTIDAD_ML: estudio.MUESTRA_LIQ_CANTIDAD_ML || '',
        MUESTRA_LIQ_HEMOLISIS: estudio.MUESTRA_LIQ_HEMOLISIS || '',
        MUESTRA_LIQ_AMP_INDICACION: estudio.MUESTRA_LIQ_AMP_INDICACION || '',
        MUESTRA_LIQ_AMP_RAZON: estudio.MUESTRA_LIQ_AMP_RAZON || '',
        ESTUDIO_COMENTARIOS: estudio.ESTUDIO_COMENTARIOS || '',
    });

    // Memorizar breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Recepción', href: `/estudios/${estudio.ID}/edit/recepcion` },
    ], [estudio]);

    // Handlers optimizados
    const handleSave = useCallback(() => {
        patch(`/estudios/${estudio.ID}/recepcion`);
    }, [estudio.ID, patch]);

    const handleNext = useCallback(() => {
        router.visit(`/estudios/${estudio.ID}/edit/laboratorio`);
    }, [estudio.ID]);

    const handlePrev = useCallback(() => {
        router.visit(`/estudios/${estudio.ID}/edit/recoleccion`);
    }, [estudio.ID]);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Recepción`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Editar Estudio - {estudio.CLAVE_INTERNA}
                        </h1>
                        <p className="text-gray-600">Paso 2: Información de Recepción</p>
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
                            <Badge className="bg-[#189BAF] text-white">2. Recepción</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">3. Laboratorio</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">4. Informe</Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Fechas de recepción y envío */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Fechas y Horas</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium mb-2">Recepción de la Muestra</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="fechaRecepcion">Fecha</Label>
                                        <Input
                                            id="fechaRecepcion"
                                            type="date"
                                            value={data.FECHA_RECEPCION ? 
                                                data.FECHA_RECEPCION.split(' ')[0] : ''}
                                            onChange={(e) => setData('FECHA_RECEPCION', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="horaRecepcion">Hora</Label>
                                        <Input
                                            id="horaRecepcion"
                                            type="time"
                                            value={data.HORA_RECEPCION}
                                            onChange={(e) => setData('HORA_RECEPCION', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Envío a Laboratorio</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="fechaEnvio">Fecha</Label>
                                        <Input
                                            id="fechaEnvio"
                                            type="date"
                                            value={data.FECHA_ENVIO_LABORATORIO ? 
                                                data.FECHA_ENVIO_LABORATORIO.split(' ')[0] : ''}
                                            onChange={(e) => setData('FECHA_ENVIO_LABORATORIO', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="horaEnvio">Hora</Label>
                                        <Input
                                            id="horaEnvio"
                                            type="time"
                                            value={data.HORA_ENVIO_LABORATORIO}
                                            onChange={(e) => setData('HORA_ENVIO_LABORATORIO', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del paciente */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Información del Paciente</h2>
                        </div>
                        <div>
                            <Label htmlFor="paciente">Paciente Asignado</Label>
                            <Select
                                value={data.ID_PACIENTE?.toString() || ""}
                                onValueChange={(value) => setData('ID_PACIENTE', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un paciente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pacientes.map((paciente) => (
                                        <SelectItem key={paciente.ID_USUARIO} value={paciente.ID_USUARIO.toString()}>
                                            {paciente.USUARIO_NOMBRE} {paciente.USUARIO_APELLIDOS}
                                            {paciente.USUARIO_CORREO && ` (${paciente.USUARIO_CORREO})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Información de la muestra */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Identificación y Rótulos</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="folioSobre">Folio del Sobre</Label>
                                <Input
                                    id="folioSobre"
                                    value={data.MUESTRA_FOLIO_SOBRE}
                                    onChange={(e) => setData('MUESTRA_FOLIO_SOBRE', e.target.value)}
                                    placeholder="Número de folio"
                                />
                            </div>

                            <div>
                                <Label htmlFor="folioKit">Folio Kit BL</Label>
                                <Input
                                    id="folioKit"
                                    value={data.MUESTRA_FOLIO_KIT_BL}
                                    onChange={(e) => setData('MUESTRA_FOLIO_KIT_BL', e.target.value)}
                                    placeholder="Folio del kit"
                                />
                            </div>

                            <div>
                                <Label htmlFor="otrosRotulos">Otros Rótulos</Label>
                                <Input
                                    id="otrosRotulos"
                                    value={data.MUESTRA_OTROS_ROTULOS}
                                    onChange={(e) => setData('MUESTRA_OTROS_ROTULOS', e.target.value)}
                                    placeholder="Rótulos adicionales"
                                />
                            </div>

                            <div>
                                <Label htmlFor="bloques">Número de Bloques</Label>
                                <Input
                                    id="bloques"
                                    type="number"
                                    value={data.MUESTRA_BLOQUES}
                                    onChange={(e) => setData('MUESTRA_BLOQUES', e.target.value)}
                                    placeholder="Cantidad"
                                />
                            </div>

                            <div>
                                <Label htmlFor="laminillas">Número de Laminillas</Label>
                                <Input
                                    id="laminillas"
                                    type="number"
                                    value={data.MUESTRA_LAMINILLAS}
                                    onChange={(e) => setData('MUESTRA_LAMINILLAS', e.target.value)}
                                    placeholder="Cantidad"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información de envío */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Truck className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Información de Envío</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="tipoEnvio">Tipo de Envío</Label>
                                <Select
                                    value={data.MUESTRA_ENVIO_TIPO || ""}
                                    onValueChange={(value) => setData('MUESTRA_ENVIO_TIPO', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tipo de envío" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(tiposEnvio).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="envio">Estado del Envío</Label>
                                <Input
                                    id="envio"
                                    value={data.MUESTRA_ENVIO}
                                    onChange={(e) => setData('MUESTRA_ENVIO', e.target.value)}
                                    placeholder="Estado o descripción"
                                />
                            </div>

                            <div>
                                <Label htmlFor="guia">Número de Guía</Label>
                                <Input
                                    id="guia"
                                    value={data.MUESTRA_GUIA}
                                    onChange={(e) => setData('MUESTRA_GUIA', e.target.value)}
                                    placeholder="Número de guía"
                                />
                            </div>

                            <div>
                                <Label htmlFor="mensajeria">Mensajería</Label>
                                <Input
                                    id="mensajeria"
                                    value={data.MUESTRA_GUIA_MENSAJERIA}
                                    onChange={(e) => setData('MUESTRA_GUIA_MENSAJERIA', e.target.value)}
                                    placeholder="Nombre de la mensajería"
                                />
                            </div>

                            <div>
                                <Label htmlFor="guiaEspecializada">Guía Especializada</Label>
                                <Input
                                    id="guiaEspecializada"
                                    value={data.MUESTRA_GUIA_ESPECIALIZADA}
                                    onChange={(e) => setData('MUESTRA_GUIA_ESPECIALIZADA', e.target.value)}
                                    placeholder="Número de guía especializada"
                                />
                            </div>

                            <div>
                                <Label htmlFor="mensajeriaEspecializada">Mensajería Especializada</Label>
                                <Input
                                    id="mensajeriaEspecializada"
                                    value={data.MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA}
                                    onChange={(e) => setData('MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA', e.target.value)}
                                    placeholder="Nombre de mensajería especializada"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Condiciones de la muestra líquida */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Condiciones de la Muestra Líquida</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="condicion">Condición</Label>
                                <Select
                                    value={data.MUESTRA_LIQ_CONDICION || ""}
                                    onValueChange={(value) => setData('MUESTRA_LIQ_CONDICION', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona condición" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Buena">Buena</SelectItem>
                                        <SelectItem value="Regular">Regular</SelectItem>
                                        <SelectItem value="Mala">Mala</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="presencia">Presencia</Label>
                                <Select
                                    value={data.MUESTRA_LIQ_CONDICION_PRESENCIA || ""}
                                    onValueChange={(value) => setData('MUESTRA_LIQ_CONDICION_PRESENCIA', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona presencia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Presente">Presente</SelectItem>
                                        <SelectItem value="Ausente">Ausente</SelectItem>
                                        <SelectItem value="Parcial">Parcial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="cantidadAdecuada">Cantidad Adecuada</Label>
                                <Select
                                    value={data.MUESTRA_LIQ_CANTIDAD_ADECUADA || ""}
                                    onValueChange={(value) => setData('MUESTRA_LIQ_CANTIDAD_ADECUADA', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="¿Es adecuada?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Si">Sí</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="cantidadMl">Cantidad (ml)</Label>
                                <Input
                                    id="cantidadMl"
                                    type="number"
                                    step="0.1"
                                    value={data.MUESTRA_LIQ_CANTIDAD_ML}
                                    onChange={(e) => setData('MUESTRA_LIQ_CANTIDAD_ML', e.target.value)}
                                    placeholder="Cantidad en ml"
                                />
                            </div>

                            <div>
                                <Label htmlFor="hemolisis">Hemólisis</Label>
                                <Select
                                    value={data.MUESTRA_LIQ_HEMOLISIS || ""}
                                    onValueChange={(value) => setData('MUESTRA_LIQ_HEMOLISIS', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="¿Presenta hemólisis?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Si">Sí</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="ampIndicacion">AMP Indicación</Label>
                                <Input
                                    id="ampIndicacion"
                                    value={data.MUESTRA_LIQ_AMP_INDICACION}
                                    onChange={(e) => setData('MUESTRA_LIQ_AMP_INDICACION', e.target.value)}
                                    placeholder="Indicación AMP"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="ampRazon">Razón AMP</Label>
                            <Textarea
                                id="ampRazon"
                                value={data.MUESTRA_LIQ_AMP_RAZON}
                                onChange={(e) => setData('MUESTRA_LIQ_AMP_RAZON', e.target.value)}
                                rows={2}
                                placeholder="Razón o justificación para AMP..."
                            />
                        </div>
                    </div>

                    {/* Comentarios adicionales */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Comentarios sobre Recepción</h2>
                        <Textarea
                            value={data.ESTUDIO_COMENTARIOS}
                            onChange={(e) => setData('ESTUDIO_COMENTARIOS', e.target.value)}
                            rows={4}
                            placeholder="Observaciones sobre la recepción de la muestra..."
                        />
                    </div>
                </div>

                {/* Botones de navegación */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Anterior: Recolección
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleSave}
                                disabled={processing}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </Button>
                            <Button
                                className="bg-[#189BAF] hover:bg-[#157a8c]"
                                onClick={handleNext}
                            >
                                Siguiente: Laboratorio
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}