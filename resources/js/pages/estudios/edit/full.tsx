import { Head, usePage, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, Calendar, User, Package, Building, FlaskConical, FileText, Truck } from 'lucide-react';

interface EditFullProps {
    estudio: any;
}

export default function EditFull() {
    const { estudio } = usePage<EditFullProps>().props;

    const { data, setData, patch, processing } = useForm({
        // Recolección
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

        // Recepción
        FECHA_RECEPCION: estudio.FECHA_RECEPCION ? 
            new Date(estudio.FECHA_RECEPCION).toISOString().split('T')[0] : '',
        HORA_RECEPCION: estudio.FECHA_RECEPCION ? 
            new Date(estudio.FECHA_RECEPCION).toTimeString().slice(0, 5) : '',
        FECHA_ENVIO_LABORATORIO: estudio.FECHA_ENVIO_LABORATORIO ? 
            new Date(estudio.FECHA_ENVIO_LABORATORIO).toISOString().split('T')[0] : '',
        HORA_ENVIO_LABORATORIO: estudio.FECHA_ENVIO_LABORATORIO ? 
            new Date(estudio.FECHA_ENVIO_LABORATORIO).toTimeString().slice(0, 5) : '',
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

        // Laboratorio
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
        R_COMPLETOS: estudio.R_COMPLETOS || '',
        MUESTRA_GUIA_RETORNO: estudio.MUESTRA_GUIA_RETORNO || '',
        MUESTRA_GUIA_RETORNO_MENSAJERIA: estudio.MUESTRA_GUIA_RETORNO_MENSAJERIA || '',

        // Informe
        FECHA_INFORME: estudio.FECHA_INFORME ? 
            new Date(estudio.FECHA_INFORME).toISOString().split('T')[0] : '',
        HORA_INFORME: estudio.FECHA_INFORME ? 
            new Date(estudio.FECHA_INFORME).toTimeString().slice(0, 5) : '',
        ESTUDIO_FACTURADO: estudio.ESTUDIO_FACTURADO || '',
        ESTUDIO_ESTADO: estudio.ESTUDIO_ESTADO || '',
        BENEFICIARIO: estudio.BENEFICIARIO || '',

        // Comentarios
        ESTUDIO_COMENTARIOS: estudio.ESTUDIO_COMENTARIOS || '',
    });

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Edición Completa', href: `/estudios/${estudio.ID}/edit/full` },
    ];

    const handleSave = () => {
        patch(`/estudios/${estudio.ID}/full`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio Completo - ${estudio.CLAVE_INTERNA}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Editar Estudio Completo - {estudio.CLAVE_INTERNA}
                        </h1>
                        <p className="text-gray-600">Todos los campos en una sola vista</p>
                    </div>
                    <Link href={`/estudios/${estudio.ID}`}>
                        <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Estudio
                        </Button>
                    </Link>
                </div>

                {/* Indicador de sección completa */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Badge className="bg-[#189BAF] text-white">Edición Completa - Todos los Campos</Badge>
                </div>

                <div className="space-y-6">
                    {/* 1. RECOLECCIÓN */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">1. Información de Recolección</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Fecha y hora solicitud */}
                            <div>
                                <Label htmlFor="fechaSolicitud">Fecha Solicitud</Label>
                                <Input
                                    id="fechaSolicitud"
                                    type="date"
                                    value={data.FECHA_SOLICITUD_RECOLECCION}
                                    onChange={(e) => setData('FECHA_SOLICITUD_RECOLECCION', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaSolicitud">Hora Solicitud</Label>
                                <Input
                                    id="horaSolicitud"
                                    type="time"
                                    value={data.HORA_SOLICITUD_RECOLECCION}
                                    onChange={(e) => setData('HORA_SOLICITUD_RECOLECCION', e.target.value)}
                                />
                            </div>
                            
                            {/* IDs */}
                            <div>
                                <Label htmlFor="idMedico">ID Médico</Label>
                                <Input
                                    id="idMedico"
                                    type="number"
                                    value={data.ID_MEDICO}
                                    onChange={(e) => setData('ID_MEDICO', e.target.value)}
                                    placeholder="ID del médico"
                                />
                            </div>
                            <div>
                                <Label htmlFor="idPaciente">ID Paciente</Label>
                                <Input
                                    id="idPaciente"
                                    type="number"
                                    value={data.ID_PACIENTE}
                                    onChange={(e) => setData('ID_PACIENTE', e.target.value)}
                                    placeholder="ID del paciente"
                                />
                            </div>
                            <div>
                                <Label htmlFor="idInstitucion">ID Institución</Label>
                                <Input
                                    id="idInstitucion"
                                    type="number"
                                    value={data.ID_INSTITUCION}
                                    onChange={(e) => setData('ID_INSTITUCION', e.target.value)}
                                    placeholder="ID de la institución"
                                />
                            </div>
                            <div>
                                <Label htmlFor="idCliente">ID Cliente</Label>
                                <Input
                                    id="idCliente"
                                    type="number"
                                    value={data.ID_CLIENTE}
                                    onChange={(e) => setData('ID_CLIENTE', e.target.value)}
                                    placeholder="ID del cliente"
                                />
                            </div>

                            {/* Información de la muestra */}
                            <div>
                                <Label htmlFor="tipoMuestra">Tipo de Muestra</Label>
                                <Input
                                    id="tipoMuestra"
                                    value={data.MUESTRA_TIPO}
                                    onChange={(e) => setData('MUESTRA_TIPO', e.target.value)}
                                    placeholder="Tipo de muestra"
                                />
                            </div>
                            <div>
                                <Label htmlFor="tipoEstudio">Tipo de Estudio</Label>
                                <Input
                                    id="tipoEstudio"
                                    value={data.MUESTRA_TIPO_ESTUDIO}
                                    onChange={(e) => setData('MUESTRA_TIPO_ESTUDIO', e.target.value)}
                                    placeholder="Tipo de estudio"
                                />
                            </div>
                            <div>
                                <Label htmlFor="iniciales">Iniciales</Label>
                                <Input
                                    id="iniciales"
                                    value={data.MUESTRA_INICIALES}
                                    onChange={(e) => setData('MUESTRA_INICIALES', e.target.value)}
                                    placeholder="Iniciales del paciente"
                                />
                            </div>
                            <div>
                                <Label htmlFor="genero">Género</Label>
                                <Input
                                    id="genero"
                                    value={data.MUESTRA_GENERO}
                                    onChange={(e) => setData('MUESTRA_GENERO', e.target.value)}
                                    placeholder="Género"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edad">Edad</Label>
                                <Input
                                    id="edad"
                                    type="number"
                                    value={data.MUESTRA_EDAD}
                                    onChange={(e) => setData('MUESTRA_EDAD', e.target.value)}
                                    placeholder="Edad"
                                />
                            </div>
                            <div>
                                <Label htmlFor="sitioLesion">Sitio de Lesión</Label>
                                <Input
                                    id="sitioLesion"
                                    value={data.MUESTRA_SITIO_LESION}
                                    onChange={(e) => setData('MUESTRA_SITIO_LESION', e.target.value)}
                                    placeholder="Sitio de lesión"
                                />
                            </div>

                            {/* Dirección */}
                            <div className="lg:col-span-2">
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input
                                    id="direccion"
                                    value={data.MUESTRA_DIRECCION}
                                    onChange={(e) => setData('MUESTRA_DIRECCION', e.target.value)}
                                    placeholder="Dirección"
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

                        <div className="mt-4 space-y-4">
                            <div>
                                <Label htmlFor="diagnosticoClinico">Diagnóstico Clínico</Label>
                                <Textarea
                                    id="diagnosticoClinico"
                                    value={data.MUESTRA_DIAGNOSTICO_CLINICO}
                                    onChange={(e) => setData('MUESTRA_DIAGNOSTICO_CLINICO', e.target.value)}
                                    rows={3}
                                    placeholder="Diagnóstico clínico"
                                />
                            </div>
                            <div>
                                <Label htmlFor="horarios">Horarios de Recolección</Label>
                                <Textarea
                                    id="horarios"
                                    value={data.MUESTRA_HORARIOS}
                                    onChange={(e) => setData('MUESTRA_HORARIOS', e.target.value)}
                                    rows={2}
                                    placeholder="Horarios disponibles"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. RECEPCIÓN */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">2. Información de Recepción</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Fechas */}
                            <div>
                                <Label htmlFor="fechaRecepcion">Fecha Recepción</Label>
                                <Input
                                    id="fechaRecepcion"
                                    type="date"
                                    value={data.FECHA_RECEPCION}
                                    onChange={(e) => setData('FECHA_RECEPCION', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaRecepcion">Hora Recepción</Label>
                                <Input
                                    id="horaRecepcion"
                                    type="time"
                                    value={data.HORA_RECEPCION}
                                    onChange={(e) => setData('HORA_RECEPCION', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="fechaEnvioLab">Fecha Envío Lab</Label>
                                <Input
                                    id="fechaEnvioLab"
                                    type="date"
                                    value={data.FECHA_ENVIO_LABORATORIO}
                                    onChange={(e) => setData('FECHA_ENVIO_LABORATORIO', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaEnvioLab">Hora Envío Lab</Label>
                                <Input
                                    id="horaEnvioLab"
                                    type="time"
                                    value={data.HORA_ENVIO_LABORATORIO}
                                    onChange={(e) => setData('HORA_ENVIO_LABORATORIO', e.target.value)}
                                />
                            </div>

                            {/* Folios y rótulos */}
                            <div>
                                <Label htmlFor="folioSobre">Folio Sobre</Label>
                                <Input
                                    id="folioSobre"
                                    value={data.MUESTRA_FOLIO_SOBRE}
                                    onChange={(e) => setData('MUESTRA_FOLIO_SOBRE', e.target.value)}
                                    placeholder="Folio del sobre"
                                />
                            </div>
                            <div>
                                <Label htmlFor="folioKit">Folio Kit BL</Label>
                                <Input
                                    id="folioKit"
                                    value={data.MUESTRA_FOLIO_KIT_BL}
                                    onChange={(e) => setData('MUESTRA_FOLIO_KIT_BL', e.target.value)}
                                    placeholder="Folio kit BL"
                                />
                            </div>
                            <div>
                                <Label htmlFor="otrosRotulos">Otros Rótulos</Label>
                                <Input
                                    id="otrosRotulos"
                                    value={data.MUESTRA_OTROS_ROTULOS}
                                    onChange={(e) => setData('MUESTRA_OTROS_ROTULOS', e.target.value)}
                                    placeholder="Otros rótulos"
                                />
                            </div>
                            <div>
                                <Label htmlFor="bloques">Bloques</Label>
                                <Input
                                    id="bloques"
                                    type="number"
                                    value={data.MUESTRA_BLOQUES}
                                    onChange={(e) => setData('MUESTRA_BLOQUES', e.target.value)}
                                    placeholder="Número de bloques"
                                />
                            </div>
                            <div>
                                <Label htmlFor="laminillas">Laminillas</Label>
                                <Input
                                    id="laminillas"
                                    type="number"
                                    value={data.MUESTRA_LAMINILLAS}
                                    onChange={(e) => setData('MUESTRA_LAMINILLAS', e.target.value)}
                                    placeholder="Número de laminillas"
                                />
                            </div>

                            {/* Envío */}
                            <div>
                                <Label htmlFor="tipoEnvio">Tipo Envío</Label>
                                <Input
                                    id="tipoEnvio"
                                    value={data.MUESTRA_ENVIO_TIPO}
                                    onChange={(e) => setData('MUESTRA_ENVIO_TIPO', e.target.value)}
                                    placeholder="Tipo de envío"
                                />
                            </div>
                            <div>
                                <Label htmlFor="envio">Estado Envío</Label>
                                <Input
                                    id="envio"
                                    value={data.MUESTRA_ENVIO}
                                    onChange={(e) => setData('MUESTRA_ENVIO', e.target.value)}
                                    placeholder="Estado del envío"
                                />
                            </div>
                            <div>
                                <Label htmlFor="guia">Guía</Label>
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
                                    placeholder="Mensajería"
                                />
                            </div>
                            <div>
                                <Label htmlFor="guiaEsp">Guía Especializada</Label>
                                <Input
                                    id="guiaEsp"
                                    value={data.MUESTRA_GUIA_ESPECIALIZADA}
                                    onChange={(e) => setData('MUESTRA_GUIA_ESPECIALIZADA', e.target.value)}
                                    placeholder="Guía especializada"
                                />
                            </div>
                            <div>
                                <Label htmlFor="mensajeriaEsp">Mensajería Especializada</Label>
                                <Input
                                    id="mensajeriaEsp"
                                    value={data.MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA}
                                    onChange={(e) => setData('MUESTRA_GUIA_ESPECIALIZADA_MENSAJERIA', e.target.value)}
                                    placeholder="Mensajería especializada"
                                />
                            </div>

                            {/* Condiciones líquida */}
                            <div>
                                <Label htmlFor="liqCondicion">Condición Líquida</Label>
                                <Input
                                    id="liqCondicion"
                                    value={data.MUESTRA_LIQ_CONDICION}
                                    onChange={(e) => setData('MUESTRA_LIQ_CONDICION', e.target.value)}
                                    placeholder="Condición"
                                />
                            </div>
                            <div>
                                <Label htmlFor="liqPresencia">Presencia</Label>
                                <Input
                                    id="liqPresencia"
                                    value={data.MUESTRA_LIQ_CONDICION_PRESENCIA}
                                    onChange={(e) => setData('MUESTRA_LIQ_CONDICION_PRESENCIA', e.target.value)}
                                    placeholder="Presencia"
                                />
                            </div>
                            <div>
                                <Label htmlFor="liqAdecuada">Cantidad Adecuada</Label>
                                <Input
                                    id="liqAdecuada"
                                    value={data.MUESTRA_LIQ_CANTIDAD_ADECUADA}
                                    onChange={(e) => setData('MUESTRA_LIQ_CANTIDAD_ADECUADA', e.target.value)}
                                    placeholder="¿Es adecuada?"
                                />
                            </div>
                            <div>
                                <Label htmlFor="liqMl">Cantidad (ml)</Label>
                                <Input
                                    id="liqMl"
                                    type="number"
                                    step="0.1"
                                    value={data.MUESTRA_LIQ_CANTIDAD_ML}
                                    onChange={(e) => setData('MUESTRA_LIQ_CANTIDAD_ML', e.target.value)}
                                    placeholder="Cantidad en ml"
                                />
                            </div>
                            <div>
                                <Label htmlFor="liqHemolisis">Hemólisis</Label>
                                <Input
                                    id="liqHemolisis"
                                    value={data.MUESTRA_LIQ_HEMOLISIS}
                                    onChange={(e) => setData('MUESTRA_LIQ_HEMOLISIS', e.target.value)}
                                    placeholder="¿Hemólisis?"
                                />
                            </div>
                            <div>
                                <Label htmlFor="liqAmpInd">AMP Indicación</Label>
                                <Input
                                    id="liqAmpInd"
                                    value={data.MUESTRA_LIQ_AMP_INDICACION}
                                    onChange={(e) => setData('MUESTRA_LIQ_AMP_INDICACION', e.target.value)}
                                    placeholder="AMP indicación"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="liqAmpRazon">Razón AMP</Label>
                            <Textarea
                                id="liqAmpRazon"
                                value={data.MUESTRA_LIQ_AMP_RAZON}
                                onChange={(e) => setData('MUESTRA_LIQ_AMP_RAZON', e.target.value)}
                                rows={2}
                                placeholder="Razón AMP"
                            />
                        </div>
                    </div>

                    {/* 3. LABORATORIO */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FlaskConical className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">3. Información de Laboratorio</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Fechas laboratorio */}
                            <div>
                                <Label htmlFor="fechaRecepLab">Fecha Recepción Lab</Label>
                                <Input
                                    id="fechaRecepLab"
                                    type="date"
                                    value={data.FECHA_RECEPCION_LABORATORIO}
                                    onChange={(e) => setData('FECHA_RECEPCION_LABORATORIO', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaRecepLab">Hora Recepción Lab</Label>
                                <Input
                                    id="horaRecepLab"
                                    type="time"
                                    value={data.HORA_RECEPCION_LABORATORIO}
                                    onChange={(e) => setData('HORA_RECEPCION_LABORATORIO', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="fechaEntregaProc">Fecha Entrega Procesamiento</Label>
                                <Input
                                    id="fechaEntregaProc"
                                    type="date"
                                    value={data.FECHA_ENTREGA_PROCESAMIENTO}
                                    onChange={(e) => setData('FECHA_ENTREGA_PROCESAMIENTO', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaEntregaProc">Hora Entrega Procesamiento</Label>
                                <Input
                                    id="horaEntregaProc"
                                    type="time"
                                    value={data.HORA_ENTREGA_PROCESAMIENTO}
                                    onChange={(e) => setData('HORA_ENTREGA_PROCESAMIENTO', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="fechaObtenRes">Fecha Obtención Resultados</Label>
                                <Input
                                    id="fechaObtenRes"
                                    type="date"
                                    value={data.FECHA_OBTENCION_RESULTADOS}
                                    onChange={(e) => setData('FECHA_OBTENCION_RESULTADOS', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaObtenRes">Hora Obtención Resultados</Label>
                                <Input
                                    id="horaObtenRes"
                                    type="time"
                                    value={data.HORA_OBTENCION_RESULTADOS}
                                    onChange={(e) => setData('HORA_OBTENCION_RESULTADOS', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="fechaRetornoMat">Fecha Retorno Material</Label>
                                <Input
                                    id="fechaRetornoMat"
                                    type="date"
                                    value={data.FECHA_RETORNO_MATERIAL}
                                    onChange={(e) => setData('FECHA_RETORNO_MATERIAL', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaRetornoMat">Hora Retorno Material</Label>
                                <Input
                                    id="horaRetornoMat"
                                    type="time"
                                    value={data.HORA_RETORNO_MATERIAL}
                                    onChange={(e) => setData('HORA_RETORNO_MATERIAL', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="fechaRecepResFis">Fecha Recepción Resultados Físicos</Label>
                                <Input
                                    id="fechaRecepResFis"
                                    type="date"
                                    value={data.FECHA_RECEPCION_RESULTADOS_FISICOS}
                                    onChange={(e) => setData('FECHA_RECEPCION_RESULTADOS_FISICOS', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaRecepResFis">Hora Recepción Resultados Físicos</Label>
                                <Input
                                    id="horaRecepResFis"
                                    type="time"
                                    value={data.HORA_RECEPCION_RESULTADOS_FISICOS}
                                    onChange={(e) => setData('HORA_RECEPCION_RESULTADOS_FISICOS', e.target.value)}
                                />
                            </div>

                            {/* Información del proceso */}
                            <div>
                                <Label htmlFor="metodoProceso">Método Proceso</Label>
                                <Input
                                    id="metodoProceso"
                                    value={data.R_METODO_PROCESO}
                                    onChange={(e) => setData('R_METODO_PROCESO', e.target.value)}
                                    placeholder="Método de proceso"
                                />
                            </div>
                            <div>
                                <Label htmlFor="resultadosCompletos">Resultados Completos</Label>
                                <Input
                                    id="resultadosCompletos"
                                    value={data.R_COMPLETOS}
                                    onChange={(e) => setData('R_COMPLETOS', e.target.value)}
                                    placeholder="¿Completos?"
                                />
                            </div>
                            <div>
                                <Label htmlFor="guiaRetorno">Guía Retorno</Label>
                                <Input
                                    id="guiaRetorno"
                                    value={data.MUESTRA_GUIA_RETORNO}
                                    onChange={(e) => setData('MUESTRA_GUIA_RETORNO', e.target.value)}
                                    placeholder="Guía de retorno"
                                />
                            </div>
                            <div>
                                <Label htmlFor="mensajeriaRetorno">Mensajería Retorno</Label>
                                <Input
                                    id="mensajeriaRetorno"
                                    value={data.MUESTRA_GUIA_RETORNO_MENSAJERIA}
                                    onChange={(e) => setData('MUESTRA_GUIA_RETORNO_MENSAJERIA', e.target.value)}
                                    placeholder="Mensajería retorno"
                                />
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <Label htmlFor="razonProceso">Razón Adecuado Procesamiento</Label>
                                <Textarea
                                    id="razonProceso"
                                    value={data.R_RAZON_ADECUADO_PROCESAMIENTO}
                                    onChange={(e) => setData('R_RAZON_ADECUADO_PROCESAMIENTO', e.target.value)}
                                    rows={3}
                                    placeholder="Razón del procesamiento adecuado"
                                />
                            </div>
                            <div>
                                <Label htmlFor="interpretacion">Interpretación</Label>
                                <Textarea
                                    id="interpretacion"
                                    value={data.R_INTERPRETACION}
                                    onChange={(e) => setData('R_INTERPRETACION', e.target.value)}
                                    rows={4}
                                    placeholder="Interpretación de resultados"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. INFORME */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-[#189BAF]" />
                            <h2 className="text-lg font-semibold">4. Información de Informe</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="fechaInforme">Fecha Informe</Label>
                                <Input
                                    id="fechaInforme"
                                    type="date"
                                    value={data.FECHA_INFORME}
                                    onChange={(e) => setData('FECHA_INFORME', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="horaInforme">Hora Informe</Label>
                                <Input
                                    id="horaInforme"
                                    type="time"
                                    value={data.HORA_INFORME}
                                    onChange={(e) => setData('HORA_INFORME', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="facturado">Facturado</Label>
                                <Input
                                    id="facturado"
                                    value={data.ESTUDIO_FACTURADO}
                                    onChange={(e) => setData('ESTUDIO_FACTURADO', e.target.value)}
                                    placeholder="¿Facturado?"
                                />
                            </div>
                            <div>
                                <Label htmlFor="estadoEstudio">Estado Estudio</Label>
                                <Input
                                    id="estadoEstudio"
                                    value={data.ESTUDIO_ESTADO}
                                    onChange={(e) => setData('ESTUDIO_ESTADO', e.target.value)}
                                    placeholder="Estado del estudio"
                                />
                            </div>
                            <div>
                                <Label htmlFor="beneficiario">Beneficiario</Label>
                                <Input
                                    id="beneficiario"
                                    value={data.BENEFICIARIO}
                                    onChange={(e) => setData('BENEFICIARIO', e.target.value)}
                                    placeholder="Beneficiario"
                                />
                            </div>
                        </div>
                    </div>

                    {/* COMENTARIOS GENERALES */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Comentarios Generales</h2>
                        <Textarea
                            value={data.ESTUDIO_COMENTARIOS}
                            onChange={(e) => setData('ESTUDIO_COMENTARIOS', e.target.value)}
                            rows={6}
                            placeholder="Comentarios y observaciones generales del estudio..."
                        />
                    </div>
                </div>

                {/* Botón de guardar */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between">
                        <Link href={`/estudios/${estudio.ID}`}>
                            <Button variant="outline">
                                Volver al Estudio
                            </Button>
                        </Link>
                        <Button
                            className="bg-[#189BAF] hover:bg-[#157a8c]"
                            onClick={handleSave}
                            disabled={processing}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Guardando...' : 'Guardar Todo'}
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}