import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Edit, 
    ArrowLeft, 
    Calendar, 
    User, 
    Building, 
    MapPin, 
    FileText, 
    Mail,
    Phone,
    Hash,
    Clock,
    TestTube,
    Microscope,
    MessageSquare
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface ShowEstudioProps {
    estudio: any;
    paciente?: any;
    medico?: any;
    institucion?: any;
    cliente?: any;
    [key: string]: any;
}

export default function ShowEstudio() {
    const { estudio, paciente, medico, institucion, cliente } = usePage<ShowEstudioProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}`, href: `/estudios/${estudio.ID}` },
    ];

    const formatDate = (dateString: string | undefined) => {
        if (!dateString || dateString === '0000-00-00 00:00:00') return 'No registrado';
        return new Date(dateString).toLocaleString('es-MX');
    };

    const formatSimpleDate = (dateString: string | undefined) => {
        if (!dateString || dateString === '0000-00-00 00:00:00') return 'No registrado';
        return new Date(dateString).toLocaleDateString('es-MX');
    };

    const getStatusColor = (estado: string | undefined) => {
        if (!estado) return 'bg-gray-100 text-gray-800 border-gray-200';
        
        switch (estado.toLowerCase()) {
            case 'completado':
            case 'terminado':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'en_proceso':
            case 'en proceso':
            case 'resultados completos':
                return 'bg-[#189BAF]/10 text-[#189BAF] border-[#189BAF]/20';
            case 'pendiente':
            case 'solicitud recolección':
                return 'bg-[#D68B41]/10 text-[#D68B41] border-[#D68B41]/20';
            case 'cancelado':
            case 'no adecuado':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'recepción laboratorio':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'resultados enviados':
            case 'retorno material':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Determinar el siguiente paso basado en el estado
    const getNextStep = (estado: string | undefined) => {
        if (!estado) return 'recoleccion';
        
        switch (estado) {
            case 'Solicitud Recolección':
                return 'recepcion';
            case 'Recepción Laboratorio':
                return 'laboratorio';
            case 'Resultados Completos':
                return 'informe';
            case 'Resultados Enviados':
            case 'Retorno Material':
            case 'Terminado':
            case 'No Adecuado':
            case 'Cancelado':
                return null;
            default:
                return 'recoleccion';
        }
    };

    const nextStep = getNextStep(estudio.ESTUDIO_ESTADO);
    const canContinue = !estudio.FECHA_RESULTADOS_CORREO || estudio.FECHA_RESULTADOS_CORREO === '0000-00-00 00:00:00';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Estudio - ${estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Estudio {estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(estudio.ESTUDIO_ESTADO)}>
                                {estudio.ESTUDIO_ESTADO || 'Pendiente'}
                            </Badge>
                            {estudio.MUESTRA_TIPO_ESTUDIO && (
                                <Badge variant="outline">
                                    {estudio.MUESTRA_TIPO_ESTUDIO}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Botón de siguiente paso si aplica */}
                        {nextStep && canContinue && (
                            <Link href={`/estudios/${estudio.ID}/edit/${nextStep}`}>
                                <Button className="bg-orange-600 hover:bg-orange-700">
                                    Continuar ({nextStep})
                                </Button>
                            </Link>
                        )}
                        
                        {/* Botón de editar */}
                        <Link href={`/estudios/${estudio.ID}/edit/recoleccion`}>
                            <Button className="bg-[#189BAF] hover:bg-[#157a8c]">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        </Link>
                        
                        {/* Botón volver */}
                        <Link href="/estudios">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Información básica del estudio */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#189BAF]" />
                                    Información del Estudio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Folio Interno</p>
                                        <p className="font-mono">{estudio.CLAVE_INTERNA || 'No asignado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Folio Merck</p>
                                        <p className="font-mono">{estudio.FOLIO_MERCK || 'No asignado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Año</p>
                                        <p>{estudio.ANIO}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Seriado</p>
                                        <p>{String(estudio.SERIADO).padStart(3, '0')}</p>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Fecha Solicitud</p>
                                        <p className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(estudio.FECHA_SOLICITUD_RECOLECCION)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Creado</p>
                                        <p className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {formatDate(estudio.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {estudio.ESTUDIO_COMENTARIOS && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-2">Comentarios</p>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <p className="text-sm">{estudio.ESTUDIO_COMENTARIOS}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Información de la muestra */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TestTube className="h-5 w-5 text-[#189BAF]" />
                                    Información de la Muestra
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Iniciales del Paciente</p>
                                        <p>{estudio.MUESTRA_INICIALES || 'No registrado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tipo de Estudio</p>
                                        <p>{estudio.MUESTRA_TIPO_ESTUDIO || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tipo de Muestra</p>
                                        <p>{estudio.MUESTRA_TIPO || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Género</p>
                                        <p>{estudio.MUESTRA_GENERO || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Edad</p>
                                        <p>{estudio.MUESTRA_EDAD || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Sitio de Lesión</p>
                                        <p>{estudio.MUESTRA_SITIO_LESION || 'No especificado'}</p>
                                    </div>
                                </div>

                                {(estudio.MUESTRA_BLOQUES || estudio.MUESTRA_LAMINILLAS) && (
                                    <>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-4">
                                            {estudio.MUESTRA_BLOQUES && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Bloques</p>
                                                    <p>{estudio.MUESTRA_BLOQUES}</p>
                                                </div>
                                            )}
                                            {estudio.MUESTRA_LAMINILLAS && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Laminillas</p>
                                                    <p>{estudio.MUESTRA_LAMINILLAS}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {estudio.MUESTRA_DIAGNOSTICO_CLINICO && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-2">Diagnóstico Clínico</p>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <p className="text-sm">{estudio.MUESTRA_DIAGNOSTICO_CLINICO}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Fechas importantes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-[#189BAF]" />
                                    Cronología del Estudio
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium">Solicitud de Recolección</span>
                                        <span className="text-sm text-gray-600">{formatDate(estudio.FECHA_SOLICITUD_RECOLECCION)}</span>
                                    </div>
                                    
                                    {estudio.FECHA_RECEPCION && estudio.FECHA_RECEPCION !== '0000-00-00 00:00:00' && (
                                        <div className="flex items-center justify-between py-2 border-t">
                                            <span className="text-sm font-medium">Recepción en Laboratorio</span>
                                            <span className="text-sm text-gray-600">{formatDate(estudio.FECHA_RECEPCION)}</span>
                                        </div>
                                    )}
                                    
                                    {estudio.FECHA_INFORME && estudio.FECHA_INFORME !== '0000-00-00 00:00:00' && (
                                        <div className="flex items-center justify-between py-2 border-t">
                                            <span className="text-sm font-medium">Informe Generado</span>
                                            <span className="text-sm text-gray-600">{formatDate(estudio.FECHA_INFORME)}</span>
                                        </div>
                                    )}
                                    
                                    {estudio.FECHA_RESULTADOS_CORREO && estudio.FECHA_RESULTADOS_CORREO !== '0000-00-00 00:00:00' && (
                                        <div className="flex items-center justify-between py-2 border-t">
                                            <span className="text-sm font-medium">Resultados Enviados</span>
                                            <span className="text-sm text-gray-600">{formatDate(estudio.FECHA_RESULTADOS_CORREO)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Paciente */}
                        {paciente && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-[#189BAF]" />
                                        Paciente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="font-medium">{paciente.USUARIO_NOMBRE} {paciente.USUARIO_APELLIDOS}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <p className="text-sm">{paciente.USUARIO_CORREO}</p>
                                    </div>
                                    {paciente.USUARIO_TELEFONO && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">{paciente.USUARIO_TELEFONO}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Médico */}
                        {medico && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-[#189BAF]" />
                                        Médico
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="font-medium">{medico.USUARIO_NOMBRE} {medico.USUARIO_APELLIDOS}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <p className="text-sm">{medico.USUARIO_CORREO}</p>
                                    </div>
                                    {medico.USUARIO_TELEFONO && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">{medico.USUARIO_TELEFONO}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Institución */}
                        {institucion && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-[#189BAF]" />
                                        Institución
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="font-medium">{institucion.INSTITUCION_NOMBRE}</p>
                                        {institucion.INSTITUCION_RAZON_SOCIAL && (
                                            <p className="text-sm text-gray-600">{institucion.INSTITUCION_RAZON_SOCIAL}</p>
                                        )}
                                    </div>
                                    {institucion.INSTITUCION_RFC && (
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">{institucion.INSTITUCION_RFC}</p>
                                        </div>
                                    )}
                                    {institucion.INSTITUCION_CORREO && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">{institucion.INSTITUCION_CORREO}</p>
                                        </div>
                                    )}
                                    {institucion.INSTITUCION_TELEFONO && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">{institucion.INSTITUCION_TELEFONO}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Cliente */}
                        {cliente && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-[#189BAF]" />
                                        Cliente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="font-medium">{cliente.CLIENTE_NOMBRE}</p>
                                    </div>
                                    {cliente.CLIENTE_CORREO && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">{cliente.CLIENTE_CORREO}</p>
                                        </div>
                                    )}
                                    {cliente.CLIENTE_TELEFONO && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">{cliente.CLIENTE_TELEFONO}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Recibe correos: {cliente.CLIENTE_ENVIAR_CORREO || 'No especificado'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Información de envío */}
                        {(estudio.MUESTRA_DIRECCION || estudio.MUESTRA_GUIA_MENSAJERIA) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-[#189BAF]" />
                                        Información de Envío
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {estudio.MUESTRA_GUIA_MENSAJERIA && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Mensajería</p>
                                            <p className="text-sm">{estudio.MUESTRA_GUIA_MENSAJERIA}</p>
                                        </div>
                                    )}
                                    {estudio.MUESTRA_GUIA && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">No. de Guía</p>
                                            <p className="text-sm font-mono">{estudio.MUESTRA_GUIA}</p>
                                        </div>
                                    )}
                                    {estudio.MUESTRA_DIRECCION && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Dirección</p>
                                            <div className="text-sm text-gray-600">
                                                <p>{estudio.MUESTRA_DIRECCION}</p>
                                                {estudio.MUESTRA_COLONIA && <p>{estudio.MUESTRA_COLONIA}</p>}
                                                {estudio.MUESTRA_MUNICIPIO && estudio.MUESTRA_ESTADO && (
                                                    <p>{estudio.MUESTRA_MUNICIPIO}, {estudio.MUESTRA_ESTADO}</p>
                                                )}
                                                {estudio.MUESTRA_CODIGO_POSTAL && (
                                                    <p>CP: {estudio.MUESTRA_CODIGO_POSTAL}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {estudio.MUESTRA_ENVIO_TIPO && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Tipo de Envío</p>
                                            <p className="text-sm">{estudio.MUESTRA_ENVIO_TIPO}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}