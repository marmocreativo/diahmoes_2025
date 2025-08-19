import { useMemo, useCallback } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, Calendar, User, Building, Package } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditRecoleccionProps {
    estudio: any;
    medicos: any[];
    pacientes: any[];
    instituciones: any[];
    clientes: any[];
    tiposMuestra: Record<string, string>;
    tiposEstudio: Record<string, string>;
    generos: Record<string, string>;
    [key: string]: any;
}

export default function EditRecoleccionOptimized() {
    const { estudio, medicos, pacientes, instituciones, clientes, tiposMuestra, tiposEstudio, generos } = 
        usePage<EditRecoleccionProps>().props;

    // useForm para manejo optimizado del estado
    const { data, setData, patch, processing } = useForm({
        FECHA_SOLICITUD_RECOLECCION: estudio.FECHA_SOLICITUD_RECOLECCION ? 
            new Date(estudio.FECHA_SOLICITUD_RECOLECCION).toISOString().split('T')[0] : '',
        HORA_SOLICITUD_RECOLECCION: estudio.FECHA_SOLICITUD_RECOLECCION ? 
            new Date(estudio.FECHA_SOLICITUD_RECOLECCION).toTimeString().slice(0, 5) : '',
        ID_MEDICO: estudio.ID_MEDICO || '',
        ID_PACIENTE: estudio.ID_PACIENTE || '',
        ID_INSTITUCION: estudio.ID_INSTITUCION || '',
        ID_CLIENTE: estudio.ID_CLIENTE || '',
        MUESTRA_TIPO: estudio.MUESTRA_TIPO || '',
        MUESTRA_TIPO_ESTUDIO: estudio.MUESTRA_TIPO_ESTUDIO || '',
        MUESTRA_INICIALES: estudio.MUESTRA_INICIALES || '',
        MUESTRA_GENERO: estudio.MUESTRA_GENERO || '',
        MUESTRA_EDAD: estudio.MUESTRA_EDAD || '',
        MUESTRA_SITIO_LESION: estudio.MUESTRA_SITIO_LESION || '',
        MUESTRA_DIAGNOSTICO_CLINICO: estudio.MUESTRA_DIAGNOSTICO_CLINICO || '',
        MUESTRA_DIRECCION: estudio.MUESTRA_DIRECCION || '',
        MUESTRA_NUMERO_EXT: estudio.MUESTRA_NUMERO_EXT || '',
        MUESTRA_NUMERO_INT: estudio.MUESTRA_NUMERO_INT || '',
        MUESTRA_COLONIA: estudio.MUESTRA_COLONIA || '',
        MUESTRA_MUNICIPIO: estudio.MUESTRA_MUNICIPIO || '',
        MUESTRA_CIUDAD: estudio.MUESTRA_CIUDAD || '',
        MUESTRA_ESTADO: estudio.MUESTRA_ESTADO || '',
        MUESTRA_CODIGO_POSTAL: estudio.MUESTRA_CODIGO_POSTAL || '',
        MUESTRA_HORARIOS: estudio.MUESTRA_HORARIOS || '',
        ESTUDIO_COMENTARIOS: estudio.ESTUDIO_COMENTARIOS || '',
    });

    // Memorizar breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Recolección', href: `/estudios/${estudio.ID}/edit/recoleccion` },
    ], [estudio]);

    // Handlers optimizados
    const handleSave = useCallback(() => {
        patch(`/estudios/${estudio.ID}/recoleccion`);
    }, [estudio.ID, patch]);

    const handleNext = useCallback(() => {
        const formData = { ...data, _next: 'recepcion' };
        router.patch(`/estudios/${estudio.ID}/recoleccion`, formData, {
            onSuccess: () => router.visit(`/estudios/${estudio.ID}/edit/recepcion`)
        });
    }, [estudio.ID, data, router]);

    // Combinar fecha y hora
    const handleFechaHoraChange = useCallback((campo: string, valor: string) => {
        if (campo === 'fecha') {
            const fecha = valor;
            const hora = data.HORA_SOLICITUD_RECOLECCION || '00:00';
            const fechaCompleta = fecha ? `${fecha} ${hora}:00` : '';
            setData('FECHA_SOLICITUD_RECOLECCION', fechaCompleta);
        } else if (campo === 'hora') {
            const fecha = data.FECHA_SOLICITUD_RECOLECCION ? 
                new Date(data.FECHA_SOLICITUD_RECOLECCION).toISOString().split('T')[0] : '';
            const fechaCompleta = fecha ? `${fecha} ${valor}:00` : '';
            setData('HORA_SOLICITUD_RECOLECCION', valor);
            setData('FECHA_SOLICITUD_RECOLECCION', fechaCompleta);
        }
    }, [data, setData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Recolección`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Editar Estudio - {estudio.CLAVE_INTERNA}
                        </h1>
                        <p className="text-gray-600">Paso 1: Información de Recolección</p>
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
                            <Badge className="bg-[#189BAF] text-white">1. Recolección</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">2. Recepción</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">3. Laboratorio</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline">4. Informe</Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Fecha y hora de solicitud */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Fecha y Hora de Solicitud</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fechaSolicitud">Fecha de Solicitud</Label>
                                <Input
                                    id="fechaSolicitud"
                                    type="date"
                                    value={data.FECHA_SOLICITUD_RECOLECCION ? 
                                        new Date(data.FECHA_SOLICITUD_RECOLECCION).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleFechaHoraChange('fecha', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaSolicitud">Hora de Solicitud</Label>
                                <Input
                                    id="horaSolicitud"
                                    type="time"
                                    value={data.HORA_SOLICITUD_RECOLECCION}
                                    onChange={(e) => handleFechaHoraChange('hora', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información de personas y entidades */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Personas y Entidades</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="medico">Médico</Label>
                                <Select
                                    value={data.ID_MEDICO?.toString() || ""}
                                    onValueChange={(value) => setData('ID_MEDICO', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un médico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {medicos.map((medico) => (
                                            <SelectItem key={medico.ID_USUARIO} value={medico.ID_USUARIO.toString()}>
                                                {medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="paciente">Paciente</Label>
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
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="institucion">Institución</Label>
                                <Select
                                    value={data.ID_INSTITUCION?.toString() || ""}
                                    onValueChange={(value) => setData('ID_INSTITUCION', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una institución" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instituciones.map((institucion) => (
                                            <SelectItem key={institucion.ID_INSTITUCION} value={institucion.ID_INSTITUCION.toString()}>
                                                {institucion.INSTITUCION_NOMBRE}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="cliente">Cliente</Label>
                                <Select
                                    value={data.ID_CLIENTE?.toString() || ""}
                                    onValueChange={(value) => setData('ID_CLIENTE', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map((cliente) => (
                                            <SelectItem key={cliente.ID_CLIENTE} value={cliente.ID_CLIENTE.toString()}>
                                                {cliente.CLIENTE_NOMBRE}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Información de la muestra */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Información de la Muestra</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="tipoMuestra">Tipo de Muestra</Label>
                                <Select
                                    value={data.MUESTRA_TIPO || ""}
                                    onValueChange={(value) => setData('MUESTRA_TIPO', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(tiposMuestra).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="tipoEstudio">Tipo de Estudio</Label>
                                <Select
                                    value={data.MUESTRA_TIPO_ESTUDIO || ""}
                                    onValueChange={(value) => setData('MUESTRA_TIPO_ESTUDIO', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona estudio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(tiposEstudio).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="iniciales">Iniciales del Paciente</Label>
                                <Input
                                    id="iniciales"
                                    value={data.MUESTRA_INICIALES}
                                    onChange={(e) => setData('MUESTRA_INICIALES', e.target.value)}
                                    placeholder="Ej: ABC"
                                />
                            </div>

                            <div>
                                <Label htmlFor="genero">Género</Label>
                                <Select
                                    value={data.MUESTRA_GENERO || ""}
                                    onValueChange={(value) => setData('MUESTRA_GENERO', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona género" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(generos).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edad">Edad</Label>
                                <Input
                                    id="edad"
                                    type="number"
                                    value={data.MUESTRA_EDAD}
                                    onChange={(e) => setData('MUESTRA_EDAD', e.target.value)}
                                    placeholder="Edad en años"
                                />
                            </div>

                            <div>
                                <Label htmlFor="sitioLesion">Sitio de Lesión</Label>
                                <Input
                                    id="sitioLesion"
                                    value={data.MUESTRA_SITIO_LESION}
                                    onChange={(e) => setData('MUESTRA_SITIO_LESION', e.target.value)}
                                    placeholder="Ubicación de la muestra"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="diagnosticoClinico">Diagnóstico Clínico</Label>
                            <Textarea
                                id="diagnosticoClinico"
                                value={data.MUESTRA_DIAGNOSTICO_CLINICO}
                                onChange={(e) => setData('MUESTRA_DIAGNOSTICO_CLINICO', e.target.value)}
                                rows={3}
                                placeholder="Descripción del diagnóstico clínico..."
                            />
                        </div>
                    </div>

                    {/* Dirección de recolección */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Building className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">Dirección de Recolección</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input
                                    id="direccion"
                                    value={data.MUESTRA_DIRECCION}
                                    onChange={(e) => setData('MUESTRA_DIRECCION', e.target.value)}
                                    placeholder="Calle y número"
                                />
                            </div>

                            <div>
                                <Label htmlFor="numeroExt">Número Exterior</Label>
                                <Input
                                    id="numeroExt"
                                    value={data.MUESTRA_NUMERO_EXT}
                                    onChange={(e) => setData('MUESTRA_NUMERO_EXT', e.target.value)}
                                    placeholder="Núm. Ext."
                                />
                            </div>

                            <div>
                                <Label htmlFor="numeroInt">Número Interior</Label>
                                <Input
                                    id="numeroInt"
                                    value={data.MUESTRA_NUMERO_INT}
                                    onChange={(e) => setData('MUESTRA_NUMERO_INT', e.target.value)}
                                    placeholder="Núm. Int."
                                />
                            </div>

                            <div>
                                <Label htmlFor="colonia">Colonia</Label>
                                <Input
                                    id="colonia"
                                    value={data.MUESTRA_COLONIA}
                                    onChange={(e) => setData('MUESTRA_COLONIA', e.target.value)}
                                    placeholder="Colonia"
                                />
                            </div>

                            <div>
                                <Label htmlFor="municipio">Municipio</Label>
                                <Input
                                    id="municipio"
                                    value={data.MUESTRA_MUNICIPIO}
                                    onChange={(e) => setData('MUESTRA_MUNICIPIO', e.target.value)}
                                    placeholder="Municipio"
                                />
                            </div>

                            <div>
                                <Label htmlFor="ciudad">Ciudad</Label>
                                <Input
                                    id="ciudad"
                                    value={data.MUESTRA_CIUDAD}
                                    onChange={(e) => setData('MUESTRA_CIUDAD', e.target.value)}
                                    placeholder="Ciudad"
                                />
                            </div>

                            <div>
                                <Label htmlFor="estado">Estado</Label>
                                <Input
                                    id="estado"
                                    value={data.MUESTRA_ESTADO}
                                    onChange={(e) => setData('MUESTRA_ESTADO', e.target.value)}
                                    placeholder="Estado"
                                />
                            </div>

                            <div>
                                <Label htmlFor="codigoPostal">Código Postal</Label>
                                <Input
                                    id="codigoPostal"
                                    value={data.MUESTRA_CODIGO_POSTAL}
                                    onChange={(e) => setData('MUESTRA_CODIGO_POSTAL', e.target.value)}
                                    placeholder="C.P."
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="horarios">Horarios de Recolección</Label>
                            <Textarea
                                id="horarios"
                                value={data.MUESTRA_HORARIOS}
                                onChange={(e) => setData('MUESTRA_HORARIOS', e.target.value)}
                                rows={2}
                                placeholder="Especifica los horarios disponibles para la recolección..."
                            />
                        </div>
                    </div>

                    {/* Comentarios adicionales */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Comentarios Adicionales</h2>
                        <Textarea
                            value={data.ESTUDIO_COMENTARIOS}
                            onChange={(e) => setData('ESTUDIO_COMENTARIOS', e.target.value)}
                            rows={4}
                            placeholder="Comentarios o notas adicionales sobre la recolección..."
                        />
                    </div>
                </div>

                {/* Botones de navegación */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between">
                        <Link href="/estudios">
                            <Button variant="outline">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Volver a Lista
                            </Button>
                        </Link>
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
                                disabled={processing}
                            >
                                Siguiente: Recepción
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}