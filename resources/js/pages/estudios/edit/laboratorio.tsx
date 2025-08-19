import { useMemo, useCallback } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, Calendar, FlaskConical, FileText, CheckCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditLaboratorioProps {
    estudio: any;
    [key: string]: any;
}

export default function EditLaboratorioOptimized() {
    const { estudio } = usePage<EditLaboratorioProps>().props;

    // useForm para manejo optimizado del estado
    const { data, setData, patch, processing } = useForm({
        FECHA_RECEPCION_LABORATORIO: estudio.FECHA_RECEPCION_LABORATORIO ? 
            new Date(estudio.FECHA_RECEPCION_LABORATORIO).toISOString().split('T')[0] : '',
        HORA_RECEPCION_LABORATORIO: estudio.FECHA_RECEPCION_LABORATORIO ? 
            new Date(estudio.FECHA_RECEPCION_LABORATORIO).toTimeString().slice(0, 5) : '',
        FECHA_ENTREGA_PROCESAMIENTO: estudio.FECHA_ENTREGA_PROCESAMIENTO ? 
            new Date(estudio.FECHA_ENTREGA_PROCESAMIENTO).toISOString().split('T')[0] : '',
        HORA_ENTREGA_PROCESAMIENTO: estudio.FECHA_ENTREGA_PROCESAMIENTO ? 
            new Date(estudio.FECHA_ENTREGA_PROCESAMIENTO).toTimeString().slice(0, 5) : '',
        FECHA_OBTENCION_RESULTADOS: estudio.FECHA_OBTENCION_RESULTADOS ? 
            new Date(estudio.FECHA_OBTENCION_RESULTADOS).toISOString().split('T')[0] : '',
        HORA_OBTENCION_RESULTADOS: estudio.FECHA_OBTENCION_RESULTADOS ? 
            new Date(estudio.FECHA_OBTENCION_RESULTADOS).toTimeString().slice(0, 5) : '',
        FECHA_RETORNO_MATERIAL: estudio.FECHA_RETORNO_MATERIAL ? 
            new Date(estudio.FECHA_RETORNO_MATERIAL).toISOString().split('T')[0] : '',
        HORA_RETORNO_MATERIAL: estudio.FECHA_RETORNO_MATERIAL ? 
            new Date(estudio.FECHA_RETORNO_MATERIAL).toTimeString().slice(0, 5) : '',
        FECHA_RECEPCION_RESULTADOS_FISICOS: estudio.FECHA_RECEPCION_RESULTADOS_FISICOS ? 
            new Date(estudio.FECHA_RECEPCION_RESULTADOS_FISICOS).toISOString().split('T')[0] : '',
        HORA_RECEPCION_RESULTADOS_FISICOS: estudio.FECHA_RECEPCION_RESULTADOS_FISICOS ? 
            new Date(estudio.FECHA_RECEPCION_RESULTADOS_FISICOS).toTimeString().slice(0, 5) : '',
        R_METODO_PROCESO: estudio.R_METODO_PROCESO || '',
        R_RAZON_ADECUADO_PROCESAMIENTO: estudio.R_RAZON_ADECUADO_PROCESAMIENTO || '',
        R_INTERPRETACION: estudio.R_INTERPRETACION || '',
        R_COMPLETOS: estudio.R_COMPLETOS || 'no',
        MUESTRA_GUIA_RETORNO: estudio.MUESTRA_GUIA_RETORNO || '',
        MUESTRA_GUIA_RETORNO_MENSAJERIA: estudio.MUESTRA_GUIA_RETORNO_MENSAJERIA || '',
        ESTUDIO_COMENTARIOS: estudio.ESTUDIO_COMENTARIOS || '',
    });

    // Memorizar breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Laboratorio', href: `/estudios/${estudio.ID}/edit/laboratorio` },
    ], [estudio]);

    // Handlers optimizados
    const handleSave = useCallback(() => {
        patch(`/estudios/${estudio.ID}/laboratorio`);
    }, [estudio.ID, patch]);

    const handleNext = useCallback(() => {
        router.visit(`/estudios/${estudio.ID}/edit/informe`);
    }, [estudio.ID]);

    const handlePrev = useCallback(() => {
        router.visit(`/estudios/${estudio.ID}/edit/recepcion`);
    }, [estudio.ID]);

    // Manejar cambios de fecha y hora
    const handleFechaHoraChange = useCallback((baseName: string, campo: string, valor: string) => {
        if (baseName === 'RECEPCION_LABORATORIO') {
            if (campo === 'fecha') {
                const horaActual = data.HORA_RECEPCION_LABORATORIO || '00:00';
                const fechaCompleta = valor ? `${valor} ${horaActual}:00` : '';
                setData('FECHA_RECEPCION_LABORATORIO', fechaCompleta);
            } else if (campo === 'hora') {
                const fechaActual = data.FECHA_RECEPCION_LABORATORIO ? 
                    new Date(data.FECHA_RECEPCION_LABORATORIO).toISOString().split('T')[0] : '';
                const fechaCompleta = fechaActual ? `${fechaActual} ${valor}:00` : '';
                setData('HORA_RECEPCION_LABORATORIO', valor);
                if (fechaCompleta) {
                    setData('FECHA_RECEPCION_LABORATORIO', fechaCompleta);
                }
            }
        } else if (baseName === 'ENTREGA_PROCESAMIENTO') {
            if (campo === 'fecha') {
                const horaActual = data.HORA_ENTREGA_PROCESAMIENTO || '00:00';
                const fechaCompleta = valor ? `${valor} ${horaActual}:00` : '';
                setData('FECHA_ENTREGA_PROCESAMIENTO', fechaCompleta);
            } else if (campo === 'hora') {
                const fechaActual = data.FECHA_ENTREGA_PROCESAMIENTO ? 
                    new Date(data.FECHA_ENTREGA_PROCESAMIENTO).toISOString().split('T')[0] : '';
                const fechaCompleta = fechaActual ? `${fechaActual} ${valor}:00` : '';
                setData('HORA_ENTREGA_PROCESAMIENTO', valor);
                if (fechaCompleta) {
                    setData('FECHA_ENTREGA_PROCESAMIENTO', fechaCompleta);
                }
            }
        } else if (baseName === 'OBTENCION_RESULTADOS') {
            if (campo === 'fecha') {
                const horaActual = data.HORA_OBTENCION_RESULTADOS || '00:00';
                const fechaCompleta = valor ? `${valor} ${horaActual}:00` : '';
                setData('FECHA_OBTENCION_RESULTADOS', fechaCompleta);
            } else if (campo === 'hora') {
                const fechaActual = data.FECHA_OBTENCION_RESULTADOS ? 
                    new Date(data.FECHA_OBTENCION_RESULTADOS).toISOString().split('T')[0] : '';
                const fechaCompleta = fechaActual ? `${fechaActual} ${valor}:00` : '';
                setData('HORA_OBTENCION_RESULTADOS', valor);
                if (fechaCompleta) {
                    setData('FECHA_OBTENCION_RESULTADOS', fechaCompleta);
                }
            }
        } else if (baseName === 'RETORNO_MATERIAL') {
            if (campo === 'fecha') {
                const horaActual = data.HORA_RETORNO_MATERIAL || '00:00';
                const fechaCompleta = valor ? `${valor} ${horaActual}:00` : '';
                setData('FECHA_RETORNO_MATERIAL', fechaCompleta);
            } else if (campo === 'hora') {
                const fechaActual = data.FECHA_RETORNO_MATERIAL ? 
                    new Date(data.FECHA_RETORNO_MATERIAL).toISOString().split('T')[0] : '';
                const fechaCompleta = fechaActual ? `${fechaActual} ${valor}:00` : '';
                setData('HORA_RETORNO_MATERIAL', valor);
                if (fechaCompleta) {
                    setData('FECHA_RETORNO_MATERIAL', fechaCompleta);
                }
            }
        } else if (baseName === 'RECEPCION_RESULTADOS_FISICOS') {
            if (campo === 'fecha') {
                const horaActual = data.HORA_RECEPCION_RESULTADOS_FISICOS || '00:00';
                const fechaCompleta = valor ? `${valor} ${horaActual}:00` : '';
                setData('FECHA_RECEPCION_RESULTADOS_FISICOS', fechaCompleta);
            } else if (campo === 'hora') {
                const fechaActual = data.FECHA_RECEPCION_RESULTADOS_FISICOS ? 
                    new Date(data.FECHA_RECEPCION_RESULTADOS_FISICOS).toISOString().split('T')[0] : '';
                const fechaCompleta = fechaActual ? `${fechaActual} ${valor}:00` : '';
                setData('HORA_RECEPCION_RESULTADOS_FISICOS', valor);
                if (fechaCompleta) {
                    setData('FECHA_RECEPCION_RESULTADOS_FISICOS', fechaCompleta);
                }
            }
        }
    }, [data, setData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Laboratorio`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Editar Estudio - {estudio.CLAVE_INTERNA}
                        </h1>
                        <p className="text-gray-600">Paso 3: Información de Laboratorio</p>
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
                            <Badge className="bg-[#189BAF] text-white">3. Laboratorio</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">4. Informe</Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Fechas del proceso de laboratorio */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Cronología del Proceso</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Recepción en laboratorio */}
                            <div>
                                <h3 className="font-medium mb-2">Recepción en Laboratorio</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="fechaRecepcionLab">Fecha</Label>
                                        <Input
                                            id="fechaRecepcionLab"
                                            type="date"
                                            value={data.FECHA_RECEPCION_LABORATORIO ? 
                                                new Date(data.FECHA_RECEPCION_LABORATORIO).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleFechaHoraChange('RECEPCION_LABORATORIO', 'fecha', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="horaRecepcionLab">Hora</Label>
                                        <Input
                                            id="horaRecepcionLab"
                                            type="time"
                                            value={data.HORA_RECEPCION_LABORATORIO}
                                            onChange={(e) => handleFechaHoraChange('RECEPCION_LABORATORIO', 'hora', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Entrega para procesamiento */}
                            <div>
                                <h3 className="font-medium mb-2">Entrega para Procesamiento</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="fechaEntrega">Fecha</Label>
                                        <Input
                                            id="fechaEntrega"
                                            type="date"
                                            value={data.FECHA_ENTREGA_PROCESAMIENTO ? 
                                                new Date(data.FECHA_ENTREGA_PROCESAMIENTO).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleFechaHoraChange('ENTREGA_PROCESAMIENTO', 'fecha', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="horaEntrega">Hora</Label>
                                        <Input
                                            id="horaEntrega"
                                            type="time"
                                            value={data.HORA_ENTREGA_PROCESAMIENTO}
                                            onChange={(e) => handleFechaHoraChange('ENTREGA_PROCESAMIENTO', 'hora', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Obtención de resultados */}
                            <div>
                                <h3 className="font-medium mb-2">Obtención de Resultados</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="fechaResultados">Fecha</Label>
                                        <Input
                                            id="fechaResultados"
                                            type="date"
                                            value={data.FECHA_OBTENCION_RESULTADOS ? 
                                                new Date(data.FECHA_OBTENCION_RESULTADOS).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleFechaHoraChange('OBTENCION_RESULTADOS', 'fecha', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="horaResultados">Hora</Label>
                                        <Input
                                            id="horaResultados"
                                            type="time"
                                            value={data.HORA_OBTENCION_RESULTADOS}
                                            onChange={(e) => handleFechaHoraChange('OBTENCION_RESULTADOS', 'hora', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Retorno de material */}
                            <div>
                                <h3 className="font-medium mb-2">Retorno de Material</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="fechaRetorno">Fecha</Label>
                                        <Input
                                            id="fechaRetorno"
                                            type="date"
                                            value={data.FECHA_RETORNO_MATERIAL ? 
                                                new Date(data.FECHA_RETORNO_MATERIAL).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleFechaHoraChange('RETORNO_MATERIAL', 'fecha', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="horaRetorno">Hora</Label>
                                        <Input
                                            id="horaRetorno"
                                            type="time"
                                            value={data.HORA_RETORNO_MATERIAL}
                                            onChange={(e) => handleFechaHoraChange('RETORNO_MATERIAL', 'hora', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Recepción de resultados físicos */}
                            <div className="md:col-span-2">
                                <h3 className="font-medium mb-2">Recepción de Resultados Físicos</h3>
                                <div className="grid grid-cols-2 gap-2 max-w-md">
                                    <div>
                                        <Label htmlFor="fechaRecepcionFisicos">Fecha</Label>
                                        <Input
                                            id="fechaRecepcionFisicos"
                                            type="date"
                                            value={data.FECHA_RECEPCION_RESULTADOS_FISICOS ? 
                                                new Date(data.FECHA_RECEPCION_RESULTADOS_FISICOS).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleFechaHoraChange('RECEPCION_RESULTADOS_FISICOS', 'fecha', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="horaRecepcionFisicos">Hora</Label>
                                        <Input
                                            id="horaRecepcionFisicos"
                                            type="time"
                                            value={data.HORA_RECEPCION_RESULTADOS_FISICOS}
                                            onChange={(e) => handleFechaHoraChange('RECEPCION_RESULTADOS_FISICOS', 'hora', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del proceso */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FlaskConical className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Detalles del Procesamiento</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="metodoProceso">Método de Proceso</Label>
                                <Select
                                    value={data.R_METODO_PROCESO || ""}
                                    onValueChange={(value) => setData('R_METODO_PROCESO', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el método utilizado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PCR">PCR</SelectItem>
                                        <SelectItem value="Histopatología">Histopatología</SelectItem>
                                        <SelectItem value="Inmunohistoquímica">Inmunohistoquímica</SelectItem>
                                        <SelectItem value="Citología">Citología</SelectItem>
                                        <SelectItem value="Biología Molecular">Biología Molecular</SelectItem>
                                        <SelectItem value="Otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="razonProcesamiento">Razón del Procesamiento Adecuado</Label>
                                <Textarea
                                    id="razonProcesamiento"
                                    value={data.R_RAZON_ADECUADO_PROCESAMIENTO}
                                    onChange={(e) => setData('R_RAZON_ADECUADO_PROCESAMIENTO', e.target.value)}
                                    rows={3}
                                    placeholder="Explica por qué el procesamiento es adecuado para esta muestra..."
                                />
                            </div>

                            <div>
                                <Label htmlFor="interpretacion">Interpretación de Resultados</Label>
                                <Textarea
                                    id="interpretacion"
                                    value={data.R_INTERPRETACION}
                                    onChange={(e) => setData('R_INTERPRETACION', e.target.value)}
                                    rows={4}
                                    placeholder="Interpretación detallada de los resultados obtenidos..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Estado de los resultados */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Estado de los Resultados</h2>
                        </div>
                        <div>
                            <Label htmlFor="resultadosCompletos">¿Están los resultados completos?</Label>
                            <Select
                                value={data.R_COMPLETOS || "no"}
                                onValueChange={(value) => setData('R_COMPLETOS', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no">No - Pendientes</SelectItem>
                                    <SelectItem value="parcial">Parcialmente Completos</SelectItem>
                                    <SelectItem value="si">Sí - Completos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Información de retorno */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Información de Retorno</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="guiaRetorno">Número de Guía de Retorno</Label>
                                <Input
                                    id="guiaRetorno"
                                    value={data.MUESTRA_GUIA_RETORNO}
                                    onChange={(e) => setData('MUESTRA_GUIA_RETORNO', e.target.value)}
                                    placeholder="Número de guía"
                                />
                            </div>

                            <div>
                                <Label htmlFor="mensajeriaRetorno">Mensajería de Retorno</Label>
                                <Input
                                    id="mensajeriaRetorno"
                                    value={data.MUESTRA_GUIA_RETORNO_MENSAJERIA}
                                    onChange={(e) => setData('MUESTRA_GUIA_RETORNO_MENSAJERIA', e.target.value)}
                                    placeholder="Nombre de la mensajería"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Comentarios adicionales */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Observaciones del Laboratorio</h2>
                        <Textarea
                            value={data.ESTUDIO_COMENTARIOS}
                            onChange={(e) => setData('ESTUDIO_COMENTARIOS', e.target.value)}
                            rows={4}
                            placeholder="Comentarios y observaciones sobre el proceso de laboratorio..."
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
                            Anterior: Recepción
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
                                Siguiente: Informe
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}