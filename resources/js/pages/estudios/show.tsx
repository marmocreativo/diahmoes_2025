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
    MessageSquare,
    Check,
    AlertCircle,
    Package,
    Send,
    FlaskConical,
    FileCheck,
    Eye,
    Download
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface ShowEstudioProps {
    estudio: any;
    paciente?: any;
    medico?: any;
    institucion?: any;
    cliente?: any;
    correos_copias?: any[];
    [key: string]: any;
}

export default function ShowEstudioTimeline() {
    const { estudio, paciente, medico, institucion, cliente, correos_copias = [] } = usePage<ShowEstudioProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}`, href: `/estudios/${estudio.ID}` },
    ];

    const formatDate = (dateString: string | undefined) => {
        if (!dateString || dateString === '0000-00-00 00:00:00') return null;
        return new Date(dateString).toLocaleString('es-MX');
    };

    const formatSimpleDate = (dateString: string | undefined) => {
        if (!dateString || dateString === '0000-00-00 00:00:00') return null;
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

    // Determinar el estado de cada paso
    const getStepStatus = (step: number) => {
        const fechaSolicitud = estudio.FECHA_SOLICITUD_RECOLECCION && estudio.FECHA_SOLICITUD_RECOLECCION !== '0000-00-00 00:00:00';
        const fechaRecepcion = estudio.FECHA_RECEPCION && estudio.FECHA_RECEPCION !== '0000-00-00 00:00:00';
        const fechaLaboratorio = estudio.FECHA_RECEPCION_LABORATORIO && estudio.FECHA_RECEPCION_LABORATORIO !== '0000-00-00 00:00:00';
        const fechaInforme = estudio.FECHA_INFORME && estudio.FECHA_INFORME !== '0000-00-00 00:00:00';
        const resultadosCompletos = estudio.R_COMPLETOS === 'si';

        switch (step) {
            case 1: return fechaSolicitud ? 'completed' : 'pending';
            case 2: return fechaRecepcion ? 'completed' : fechaSolicitud ? 'current' : 'pending';
            case 3: return (fechaLaboratorio && resultadosCompletos) ? 'completed' : fechaRecepcion ? 'current' : 'pending';
            case 4: return fechaInforme ? 'completed' : (fechaLaboratorio && resultadosCompletos) ? 'current' : 'pending';
            default: return 'pending';
        }
    };

    const getStepIcon = (step: number, status: string) => {
        const iconClass = status === 'completed' ? 'text-white' : status === 'current' ? 'text-[#189BAF]' : 'text-gray-400';
        const icons = [
            <Package className={`h-5 w-5 ${iconClass}`} />,
            <TestTube className={`h-5 w-5 ${iconClass}`} />,
            <FlaskConical className={`h-5 w-5 ${iconClass}`} />,
            <FileCheck className={`h-5 w-5 ${iconClass}`} />
        ];
        return icons[step - 1];
    };

    const getStepColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500 border-green-500';
            case 'current': return 'bg-white border-[#189BAF] border-2';
            default: return 'bg-gray-200 border-gray-200';
        }
    };

    // Función para renderizar datos del paso
    const renderStepData = (step: number) => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Datos de Recolección</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Clave Interna:</span>
                                <p className="font-mono">{estudio.CLAVE_INTERNA || 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Folio Merck:</span>
                                <p className="font-mono">{estudio.FOLIO_MERCK || 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Cliente:</span>
                                <p>{cliente?.CLIENTE_NOMBRE || 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Institución:</span>
                                <p>{institucion?.INSTITUCION_NOMBRE || 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Médico:</span>
                                <p>{medico ? `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}` : 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Tipo de Envío:</span>
                                <p>{estudio.MUESTRA_ENVIO_TIPO || 'No especificado'}</p>
                            </div>
                        </div>
                        {estudio.MUESTRA_DIRECCION && (
                            <div>
                                <span className="text-gray-500">Dirección:</span>
                                <p className="text-sm">{estudio.MUESTRA_DIRECCION}</p>
                                {estudio.MUESTRA_GUIA && (
                                    <p className="text-xs text-gray-600">Guía: {estudio.MUESTRA_GUIA}</p>
                                )}
                            </div>
                        )}
                        <div>
                            <span className="text-gray-500">Fecha Solicitud:</span>
                            <p className="text-sm">{formatDate(estudio.FECHA_SOLICITUD_RECOLECCION) || 'No registrado'}</p>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Datos de Recepción</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Paciente:</span>
                                <p>{paciente ? `${paciente.USUARIO_NOMBRE} ${paciente.USUARIO_APELLIDOS}` : 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Iniciales:</span>
                                <p>{estudio.MUESTRA_INICIALES || 'No registrado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Género:</span>
                                <p>{estudio.MUESTRA_GENERO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Edad:</span>
                                <p>{estudio.MUESTRA_EDAD || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Tipo de Estudio:</span>
                                <p>{estudio.MUESTRA_TIPO_ESTUDIO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Tipo de Muestra:</span>
                                <p>{estudio.MUESTRA_TIPO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Sitio de Lesión:</span>
                                <p>{estudio.MUESTRA_SITIO_LESION || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">ID Muestra:</span>
                                <p className="font-mono">{estudio.MUESTRA_CLAVE || 'No asignado'}</p>
                            </div>
                        </div>
                        {(estudio.MUESTRA_BLOQUES || estudio.MUESTRA_LAMINILLAS) && (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {estudio.MUESTRA_BLOQUES && (
                                    <div>
                                        <span className="text-gray-500">Bloques:</span>
                                        <p>{estudio.MUESTRA_BLOQUES}</p>
                                    </div>
                                )}
                                {estudio.MUESTRA_LAMINILLAS && (
                                    <div>
                                        <span className="text-gray-500">Laminillas:</span>
                                        <p>{estudio.MUESTRA_LAMINILLAS}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {estudio.MUESTRA_DIAGNOSTICO_CLINICO && (
                            <div>
                                <span className="text-gray-500">Diagnóstico Clínico:</span>
                                <p className="text-sm">{estudio.MUESTRA_DIAGNOSTICO_CLINICO}</p>
                            </div>
                        )}
                        <div>
                            <span className="text-gray-500">Fecha Recepción:</span>
                            <p className="text-sm">{formatDate(estudio.FECHA_RECEPCION) || 'No registrado'}</p>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Datos de Laboratorio</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Estudio Solicitado:</span>
                                <p>{estudio.R_ESTUDIO_SOLICITADO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Método:</span>
                                <p>{estudio.R_METODO_PROCESO || estudio.R_OTRO_METODO_PROCESO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Adecuado Procesamiento:</span>
                                <p>{estudio.R_ADECUADO_PROCESAMIENTO || 'No evaluado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Resultados Completos:</span>
                                <Badge className={estudio.R_COMPLETOS === 'si' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                    {estudio.R_COMPLETOS === 'si' ? 'Sí' : 'No'}
                                </Badge>
                            </div>
                        </div>
                        
                        {/* Resultados genéticos */}
                        {(estudio.R_ESTATUS_KRAS || estudio.R_ESTATUS_NRAS || estudio.R_ESTATUS_BRAF) && (
                            <div>
                                <span className="text-gray-500 font-medium">Resultados Genéticos:</span>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                    {estudio.R_ESTATUS_KRAS && (
                                        <div className="flex justify-between text-sm">
                                            <span>K-RAS:</span>
                                            <span className="font-medium">{estudio.R_ESTATUS_KRAS}</span>
                                        </div>
                                    )}
                                    {estudio.R_ESTATUS_NRAS && (
                                        <div className="flex justify-between text-sm">
                                            <span>N-RAS:</span>
                                            <span className="font-medium">{estudio.R_ESTATUS_NRAS}</span>
                                        </div>
                                    )}
                                    {estudio.R_ESTATUS_BRAF && (
                                        <div className="flex justify-between text-sm">
                                            <span>B-RAF:</span>
                                            <span className="font-medium">{estudio.R_ESTATUS_BRAF}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Condiciones de sangre total */}
                        {estudio.MUESTRA_TIPO === 'Sangre total' && estudio.MUESTRA_LIQ_CONDICION && (
                            <div>
                                <span className="text-gray-500">Condición de Muestra:</span>
                                <p className="text-sm">{estudio.MUESTRA_LIQ_CONDICION}</p>
                                {estudio.MUESTRA_LIQ_CANTIDAD_ML && (
                                    <p className="text-xs text-gray-600">Cantidad: {estudio.MUESTRA_LIQ_CANTIDAD_ML} ml</p>
                                )}
                            </div>
                        )}

                        <div>
                            <span className="text-gray-500">Fecha Recepción Lab:</span>
                            <p className="text-sm">{formatDate(estudio.FECHA_RECEPCION_LABORATORIO) || 'No registrado'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Fecha Resultados:</span>
                            <p className="text-sm">{formatDate(estudio.FECHA_OBTENCION_RESULTADOS) || 'No registrado'}</p>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Datos de Informe</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Estado:</span>
                                <Badge className={getStatusColor(estudio.ESTUDIO_ESTADO)}>
                                    {estudio.ESTUDIO_ESTADO || 'Pendiente'}
                                </Badge>
                            </div>
                            <div>
                                <span className="text-gray-500">Facturado:</span>
                                <p>{estudio.ESTUDIO_FACTURADO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Beneficiario:</span>
                                <p>{estudio.BENEFICIARIO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Correos para envío:</span>
                                <p>{correos_copias?.length || 0} configurados</p>
                            </div>
                        </div>

                        {correos_copias && correos_copias.length > 0 && (
                            <div>
                                <span className="text-gray-500 font-medium">Lista de Correos:</span>
                                <div className="mt-2 space-y-1">
                                    {correos_copias.slice(0, 3).map((correo, index) => (
                                        <div key={index} className="flex justify-between text-xs">
                                            <span>{correo.NOMBRE}</span>
                                            <span className="text-gray-600">{correo.CORREO}</span>
                                        </div>
                                    ))}
                                    {correos_copias.length > 3 && (
                                        <p className="text-xs text-gray-500">... y {correos_copias.length - 3} más</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <span className="text-gray-500">Fecha Informe:</span>
                            <p className="text-sm">{formatDate(estudio.FECHA_INFORME) || 'No registrado'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Fecha Envío:</span>
                            <p className="text-sm">{formatDate(estudio.FECHA_RESULTADOS_CORREO) || 'No enviado'}</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const steps = [
        { number: 1, title: 'Recolección', route: 'recoleccion' },
        { number: 2, title: 'Recepción', route: 'recepcion' },
        { number: 3, title: 'Laboratorio', route: 'laboratorio' },
        { number: 4, title: 'Informe', route: 'informe' }
    ];

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
                            {estudio.MUESTRA_TIPO && (
                                <Badge variant="outline">
                                    {estudio.MUESTRA_TIPO}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Botón de PDF */}
                        <a
                            href={`/estudios/${estudio.ID}/pdf?aleatorio=${estudio.ID_ALEATORIO}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                            </Button>
                        </a>
                        
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Timeline Principal */}
                    <div className="lg:col-span-3">
                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle>Progreso del Estudio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    {/* Línea vertical */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    
                                    {/* Pasos */}
                                    <div className="space-y-8">
                                        {steps.map((step, index) => {
                                            const status = getStepStatus(step.number);
                                            const isLast = index === steps.length - 1;
                                            
                                            return (
                                                <div key={step.number} className="relative flex items-start">
                                                    {/* Círculo del paso */}
                                                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStepColor(status)}`}>
                                                        {status === 'completed' ? (
                                                            <Check className="h-5 w-5 text-white" />
                                                        ) : (
                                                            getStepIcon(step.number, status)
                                                        )}
                                                    </div>
                                                    
                                                    {/* Contenido del paso */}
                                                    <div className="flex-1 ml-6">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className={`text-lg font-semibold ${status === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                                                                {step.number}. {step.title}
                                                            </h3>
                                                            <div className="flex gap-2">
                                                                <Link href={`/estudios/${estudio.ID}/edit/${step.route}`}>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        <Edit className="h-3 w-3 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Datos del paso */}
                                                        <div className={`p-4 rounded-lg border ${status === 'pending' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
                                                            {status === 'pending' ? (
                                                                <div className="flex items-center text-gray-500">
                                                                    <AlertCircle className="h-4 w-4 mr-2" />
                                                                    <span className="text-sm">Paso pendiente</span>
                                                                </div>
                                                            ) : (
                                                                renderStepData(step.number)
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Información general */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#189BAF]" />
                                    Información General
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Folio Completo</p>
                                    <p className="font-mono">{estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Año / Seriado</p>
                                    <p>{estudio.ANIO} / {String(estudio.SERIADO).padStart(3, '0')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Creado</p>
                                    <p className="text-sm">{formatDate(estudio.created_at) || 'No disponible'}</p>
                                </div>
                                {estudio.ESTUDIO_COMENTARIOS && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">Comentarios</p>
                                            <div className="p-2 bg-gray-50 rounded text-xs">
                                                {estudio.ESTUDIO_COMENTARIOS}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

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
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Recibe correos: {cliente.CLIENTE_ENVIAR_CORREO === 'si' ? 'Sí' : 'No'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}