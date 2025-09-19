import { Head, usePage, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
    Download,
    ChevronDown,
    ChevronUp,
    Monitor,
    Smartphone
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
    
    // Estados para responsive y expansión
    const [isMobile, setIsMobile] = useState(false);
    const [forceDesktopView, setForceDesktopView] = useState(false);
    const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1, 2, 3, 4])); // Todos expandidos por defecto

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const showMobileView = isMobile && !forceDesktopView;

    // Función para alternar expansión de pasos
    const toggleStepExpansion = (stepNumber: number) => {
        const newExpanded = new Set(expandedSteps);
        if (newExpanded.has(stepNumber)) {
            newExpanded.delete(stepNumber);
        } else {
            newExpanded.add(stepNumber);
        }
        setExpandedSteps(newExpanded);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}`, href: `/estudios/${estudio.ID}` },
    ];

    const formatDate = (dateString: string | undefined) => {
        if (!dateString || dateString === '0000-00-00 00:00:00') return null;
        return new Date(dateString).toLocaleString('es-MX');
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

    // Función mejorada para renderizar datos del laboratorio (COMPLETOS)
    const renderLaboratorioCompleto = () => {
        return (
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Datos de Laboratorio Completos</h4>
                
                {/* Información básica */}
                <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-3 text-sm`}>
                    <div>
                        <span className="text-gray-500 font-medium">Estudio Solicitado:</span>
                        <p className="mt-1 font-bold">{estudio.R_ESTUDIO_SOLICITADO || 'No especificado'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 font-medium">Método de Proceso:</span>
                        <p className="mt-1 font-bold">{estudio.R_METODO_PROCESO || 'No especificado'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 font-medium">Resultados Completos:</span>
                        <div className="mt-1">
                            <Badge className={estudio.R_COMPLETOS === 'si' ? 'bg-green-100 text-green-800 font-bold' : 'bg-yellow-100 text-yellow-800 font-bold'}>
                                {estudio.R_COMPLETOS === 'si' ? 'Sí' : 'No'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Evaluación Histopatológica */}
                {(estudio.R_EVALUACION_HISTOPATOLOGICA || estudio.R_PRESERVACION_H_E || estudio.R_NUMERO_CELULAS_TUMORALES) && (
                    <div>
                        <h5 className="font-medium text-gray-700 mb-2">Evaluación Histopatológica</h5>
                        <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-3 text-sm`}>
                            {estudio.R_EVALUACION_HISTOPATOLOGICA && (
                                <div>
                                    <span className="text-gray-500">Evaluación:</span>
                                    <p className="mt-1 font-bold">{estudio.R_EVALUACION_HISTOPATOLOGICA}</p>
                                </div>
                            )}
                            {estudio.R_PRESERVACION_H_E && (
                                <div>
                                    <span className="text-gray-500">Preservación H&E:</span>
                                    <p className="mt-1 font-bold">{estudio.R_PRESERVACION_H_E}</p>
                                </div>
                            )}
                            {estudio.R_NUMERO_CELULAS_TUMORALES && (
                                <div>
                                    <span className="text-gray-500">N° Células Tumorales:</span>
                                    <p className="mt-1 font-bold">{estudio.R_NUMERO_CELULAS_TUMORALES}</p>
                                </div>
                            )}
                            {estudio.R_AREA_TUMORAL && (
                                <div>
                                    <span className="text-gray-500">Área Tumoral:</span>
                                    <p className="mt-1 font-bold">{estudio.R_AREA_TUMORAL}</p>
                                </div>
                            )}
                            {estudio.R_PORCENTAJE_TUMOR_TEJIDO && (
                                <div>
                                    <span className="text-gray-500">% Tumor/Tejido:</span>
                                    <p className="mt-1 font-bold">{estudio.R_PORCENTAJE_TUMOR_TEJIDO}</p>
                                </div>
                            )}
                            {estudio.R_ENRIQUECIMIENTO && (
                                <div>
                                    <span className="text-gray-500">Enriquecimiento:</span>
                                    <p className="mt-1 font-bold">{estudio.R_ENRIQUECIMIENTO}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Adecuado Procesamiento */}
                {(estudio.R_ADECUADO_PROCESAMIENTO || estudio.R_RAZON_ADECUADO_PROCESAMIENTO) && (
                    <div>
                        <h5 className="font-medium text-gray-700 mb-2">Evaluación de Procesamiento</h5>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                            {estudio.R_ADECUADO_PROCESAMIENTO && (
                                <div>
                                    <span className="text-gray-500">Adecuado Procesamiento:</span>
                                    <div className="mt-1">
                                        <Badge className={estudio.R_ADECUADO_PROCESAMIENTO === 'si' || estudio.R_ADECUADO_PROCESAMIENTO === 'Sí' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {estudio.R_ADECUADO_PROCESAMIENTO}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                            {estudio.R_RAZON_ADECUADO_PROCESAMIENTO && (
                                <div>
                                    <span className="text-gray-500">Razón:</span>
                                    <p className="mt-1 font-bold text-sm bg-gray-50 p-2 rounded">{estudio.R_RAZON_ADECUADO_PROCESAMIENTO}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Resultados Genéticos Completos */}
                <div>
                    <h5 className="font-medium text-gray-700 mb-3">Análisis Genético Molecular</h5>
                    
                    {/* K-RAS */}
                    {(estudio.R_ESTATUS_KRAS || estudio.R_GENOTIPO_KRAS) && (
                        <div className="mb-3 p-3 border rounded-lg">
                            <h6 className="font-medium text-gray-600 mb-2">K-RAS</h6>
                            <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-2 text-sm`}>
                                {estudio.R_ESTATUS_KRAS && (
                                    <div>
                                        <span className="text-gray-500">Estatus:</span>
                                        <p className="font-bold">{estudio.R_ESTATUS_KRAS}</p>
                                    </div>
                                )}
                                {estudio.R_GENOTIPO_KRAS && (
                                    <div className="col-span-full">
                                        <span className="text-gray-500">Genotipo:</span>
                                        <p className="font-bold text-sm bg-gray-50 p-2 rounded mt-1">{estudio.R_GENOTIPO_KRAS}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* N-RAS */}
                    {(estudio.R_ESTATUS_NRAS || estudio.R_GENOTIPO_NRAS) && (
                        <div className="mb-3 p-3 border rounded-lg">
                            <h6 className="font-medium text-gray-600 mb-2">N-RAS</h6>
                            <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-2 text-sm`}>
                                {estudio.R_ESTATUS_NRAS && (
                                    <div>
                                        <span className="text-gray-500">Estatus:</span>
                                        <p className="font-bold">{estudio.R_ESTATUS_NRAS}</p>
                                    </div>
                                )}
                                {estudio.R_GENOTIPO_NRAS && (
                                    <div className="col-span-full">
                                        <span className="text-gray-500">Genotipo:</span>
                                        <p className="font-bold text-sm bg-gray-50 p-2 rounded mt-1">{estudio.R_GENOTIPO_NRAS}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* B-RAF */}
                    {(estudio.R_ESTATUS_BRAF || estudio.R_GENOTIPO_BRAF) && (
                        <div className="mb-3 p-3 border rounded-lg">
                            <h6 className="font-medium text-gray-600 mb-2">B-RAF</h6>
                            <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-2 text-sm`}>
                                {estudio.R_ESTATUS_BRAF && (
                                    <div>
                                        <span className="text-gray-500">Estatus:</span>
                                        <p className="font-bold">{estudio.R_ESTATUS_BRAF}</p>
                                    </div>
                                )}
                                {estudio.R_GENOTIPO_BRAF && (
                                    <div className="col-span-full">
                                        <span className="text-gray-500">Genotipo:</span>
                                        <p className="font-bold text-sm bg-gray-50 p-2 rounded mt-1">{estudio.R_GENOTIPO_BRAF}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Condiciones de Muestra Líquida */}
                {(estudio.MUESTRA_LIQ_CONDICION || estudio.MUESTRA_LIQ_CANTIDAD_ML) && (
                    <div>
                        <h5 className="font-medium text-gray-700 mb-2">Condiciones de Muestra</h5>
                        <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-3 text-sm`}>
                            {estudio.MUESTRA_LIQ_CONDICION && (
                                <div>
                                    <span className="text-gray-500">Condición:</span>
                                    <p className="mt-1 font-bold">{estudio.MUESTRA_LIQ_CONDICION}</p>
                                </div>
                            )}
                            {estudio.MUESTRA_LIQ_CONDICION_PRESENCIA && (
                                <div>
                                    <span className="text-gray-500">Presencia:</span>
                                    <p className="mt-1 font-bold">{estudio.MUESTRA_LIQ_CONDICION_PRESENCIA}</p>
                                </div>
                            )}
                            {estudio.MUESTRA_LIQ_CANTIDAD_ADECUADA && (
                                <div>
                                    <span className="text-gray-500">Cantidad Adecuada:</span>
                                    <p className="mt-1 font-bold">{estudio.MUESTRA_LIQ_CANTIDAD_ADECUADA}</p>
                                </div>
                            )}
                            {estudio.MUESTRA_LIQ_CANTIDAD_ML && (
                                <div>
                                    <span className="text-gray-500">Cantidad (ml):</span>
                                    <p className="mt-1 font-bold">{estudio.MUESTRA_LIQ_CANTIDAD_ML}</p>
                                </div>
                            )}
                            {estudio.MUESTRA_LIQ_HEMOLISIS && (
                                <div>
                                    <span className="text-gray-500">Hemólisis:</span>
                                    <p className="mt-1 font-bold">{estudio.MUESTRA_LIQ_HEMOLISIS}</p>
                                </div>
                            )}
                            {estudio.MUESTRA_LIQ_AMP_INDICACION && (
                                <div>
                                    <span className="text-gray-500">Amplificación:</span>
                                    <p className="mt-1 font-bold">{estudio.MUESTRA_LIQ_AMP_INDICACION}</p>
                                </div>
                            )}
                            {estudio.MUESTRA_LIQ_AMP_RAZON && (
                                <div className="col-span-full">
                                    <span className="text-gray-500">Razón Amplificación:</span>
                                    <p className="mt-1 text-sm font-bold bg-gray-50 p-2 rounded">{estudio.MUESTRA_LIQ_AMP_RAZON}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Resultado Histopatológico */}
                {estudio.R_RESULTADO_HISTOPATOLOGICO && (
                    <div>
                        <span className="text-gray-500 font-medium">Resultado Histopatológico:</span>
                        <div className="mt-1 p-3 font-bold bg-gray-50 rounded text-sm">
                            {estudio.R_RESULTADO_HISTOPATOLOGICO}
                        </div>
                    </div>
                )}

                {/* Interpretación */}
                {estudio.R_INTERPRETACION && (
                    <div>
                        <span className="text-gray-500 font-medium">Interpretación:</span>
                        <div className="mt-1 p-3 font-bold bg-blue-50 border border-blue-200 rounded text-sm">
                            {estudio.R_INTERPRETACION}
                        </div>
                    </div>
                )}

                {/* Fechas de Laboratorio */}
                <div>
                    <h5 className="font-medium text-gray-700 mb-2">Fechas Importantes</h5>
                    <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-3 text-sm`}>
                        <div>
                            <span className="text-gray-500">Recepción Lab:</span>
                            <p className="mt-1 font-bold">{formatDate(estudio.FECHA_RECEPCION_LABORATORIO) || 'No registrado'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Entrega Procesamiento:</span>
                            <p className="mt-1 font-bold">{formatDate(estudio.FECHA_ENTREGA_PROCESAMIENTO) || 'No registrado'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Obtención Resultados:</span>
                            <p className="mt-1 font-bold">{formatDate(estudio.FECHA_OBTENCION_RESULTADOS) || 'No registrado'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Retorno Material:</span>
                            <p className="mt-1 font-bold">{formatDate(estudio.FECHA_RETORNO_MATERIAL) || 'No registrado'}</p>
                        </div>
                    </div>
                </div>

                {/* Notas y Comentarios */}
                {(estudio.ESTUDIO_NOTAS || estudio.ESTUDIO_COMENTARIOS) && (
                    <div>
                        <h5 className="font-medium text-gray-700 mb-2">Observaciones</h5>
                        {estudio.ESTUDIO_NOTAS && (
                            <div className="mb-2">
                                <span className="text-gray-500">Notas:</span>
                                <div className="mt-1 font-bold p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                    <div dangerouslySetInnerHTML={{ __html: estudio.ESTUDIO_NOTAS }} />
                                </div>
                            </div>
                        )}
                        {estudio.ESTUDIO_COMENTARIOS && (
                            <div>
                                <span className="text-gray-500">Comentarios:</span>
                                <div className="mt-1 font-bold p-2 bg-gray-50 rounded text-sm">
                                    <div dangerouslySetInnerHTML={{ __html: estudio.ESTUDIO_COMENTARIOS }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Función para renderizar datos del paso (actualizada)
    const renderStepData = (step: number) => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Datos de Recolección</h4>
                        <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-3 text-sm`}>
                            <div>
                                <span className="text-gray-500">Clave Interna:</span>
                                <p className="font-bold">{estudio.CLAVE_INTERNA || 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Folio Merck:</span>
                                <p className="font-bold">{estudio.FOLIO_MERCK || 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Cliente:</span>
                                <p className='font-bold'>{cliente?.CLIENTE_NOMBRE || 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Institución:</span>
                                <p className='font-bold'>{institucion?.INSTITUCION_NOMBRE || 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Médico:</span>
                                <p className='font-bold'>{medico ? `${medico.USUARIO_NOMBRE} ${medico.USUARIO_APELLIDOS}` : 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Tipo de Envío:</span>
                                <p className='font-bold'>{estudio.MUESTRA_ENVIO_TIPO || 'No especificado'}</p>
                            </div>
                        </div>
                        {estudio.MUESTRA_DIRECCION && (
                            <div>
                                <span className="text-gray-500">Dirección:</span>
                                <p className="font-bold">{estudio.MUESTRA_DIRECCION}</p>
                                {estudio.MUESTRA_GUIA && (
                                    <p className="text-xs text-gray-600">Guía: <span className='font-bold'>{estudio.MUESTRA_GUIA}</span></p>
                                )}
                            </div>
                        )}
                        <div>
                            <span className="text-gray-500">Fecha Solicitud:</span>
                            <p className="text-sm font-bold">{formatDate(estudio.FECHA_SOLICITUD_RECOLECCION) || 'No registrado'}</p>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Datos de Recepción</h4>
                        <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-3 text-sm`}>
                            <div>
                                <span className="text-gray-500">Paciente:</span>
                                <p className='font-bold'>{paciente ? `${paciente.USUARIO_NOMBRE} ${paciente.USUARIO_APELLIDOS}` : 'No asignado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Iniciales:</span>
                                <p className='font-bold'>{estudio.MUESTRA_INICIALES || 'No registrado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Género:</span>
                                <p className='font-bold'>{estudio.MUESTRA_GENERO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Edad:</span>
                                <p className='font-bold'>{estudio.MUESTRA_EDAD || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Tipo de Estudio:</span>
                                <p className='font-bold'>{estudio.MUESTRA_TIPO_ESTUDIO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Tipo de Muestra:</span>
                                <p className='font-bold'>{estudio.MUESTRA_TIPO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Sitio de Lesión:</span>
                                <p className='font-bold'>{estudio.MUESTRA_SITIO_LESION || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">ID Muestra:</span>
                                <p className="font-bold">{estudio.MUESTRA_CLAVE || 'No asignado'}</p>
                            </div>
                        </div>
                        {(estudio.MUESTRA_BLOQUES || estudio.MUESTRA_LAMINILLAS) && (
                            <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-3 text-sm`}>
                                {estudio.MUESTRA_BLOQUES && (
                                    <div>
                                        <span className="text-gray-500">Bloques:</span>
                                        <p className='font-bold'>{estudio.MUESTRA_BLOQUES}</p>
                                    </div>
                                )}
                                {estudio.MUESTRA_LAMINILLAS && (
                                    <div>
                                        <span className="text-gray-500">Laminillas:</span>
                                        <p className='font-bold'>{estudio.MUESTRA_LAMINILLAS}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {estudio.MUESTRA_DIAGNOSTICO_CLINICO && (
                            <div>
                                <span className="text-gray-500">Diagnóstico Clínico:</span>
                                <p className="text-sm font-bold">{estudio.MUESTRA_DIAGNOSTICO_CLINICO}</p>
                            </div>
                        )}
                        <div>
                            <span className="text-gray-500">Fecha Recepción:</span>
                            <p className="text-sm font-bold">{formatDate(estudio.FECHA_RECEPCION) || 'No registrado'}</p>
                        </div>
                    </div>
                );

            case 3:
                return renderLaboratorioCompleto(); // Usar la función completa

            case 4:
                return (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Datos de Informe</h4>
                        <div className={`grid ${showMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-3 text-sm`}>
                            <div>
                                <span className="text-gray-500">Estado:</span>
                                <div className="mt-1 font-bold">
                                    <Badge className={getStatusColor(estudio.ESTUDIO_ESTADO)}>
                                        {estudio.ESTUDIO_ESTADO || 'Pendiente'}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500">Facturado:</span>
                                <p className='font-bold'>{estudio.ESTUDIO_FACTURADO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Beneficiario:</span>
                                <p className='font-bold'>{estudio.BENEFICIARIO || 'No especificado'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Correos para envío:</span>
                                <p className='font-bold'>{correos_copias?.length || 0} configurados</p>
                            </div>
                        </div>

                        {correos_copias && correos_copias.length > 0 && (
                            <div>
                                <span className="text-gray-500 font-medium">Lista de Correos:</span>
                                <div className="mt-2 space-y-1">
                                    {correos_copias.slice(0, showMobileView ? 5 : 3).map((correo, index) => (
                                        <div key={index} className="flex justify-between text-xs">
                                            <span>{correo.NOMBRE}</span>
                                            <span className="text-gray-600">{correo.CORREO}</span>
                                        </div>
                                    ))}
                                    {correos_copias.length > (showMobileView ? 5 : 3) && (
                                        <p className="text-xs text-gray-500">... y {correos_copias.length - (showMobileView ? 5 : 3)} más</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <span className="text-gray-500">Fecha Informe:</span>
                            <p className="text-sm font-bold">{formatDate(estudio.FECHA_INFORME) || 'No registrado'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Fecha Envío:</span>
                            <p className="text-sm font-bold">{formatDate(estudio.FECHA_RESULTADOS_CORREO) || 'No enviado'}</p>
                        </div>
                    </div>
                );

            default:
                return null;
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
                <div className={`flex items-center justify-between ${showMobileView ? 'flex-col space-y-4' : ''}`}>
                    <div className={showMobileView ? 'text-center' : ''}>
                        <h1 className={`${showMobileView ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800`}>
                            Estudio {estudio.CLAVE_INTERNA || `${estudio.CLAVE}-${estudio.ANIO}-${String(estudio.SERIADO).padStart(3, '0')}`}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 justify-center">
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
                    <div className={`flex items-center gap-2 ${showMobileView ? 'flex-wrap justify-center' : ''}`}>
                        {/* Toggle de vista para móviles */}
                        {isMobile && (
                            <button
                                onClick={() => setForceDesktopView(!forceDesktopView)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                title={forceDesktopView ? "Cambiar a vista móvil" : "Cambiar a vista escritorio"}
                            >
                                {forceDesktopView ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                            </button>
                        )}
                        
                        {/* Botón de PDF */}
                        <a
                            href={`/publicos/estudio?id=${estudio.ID}&aleatorio=${estudio.ID_ALEATORIO}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size={showMobileView ? "sm" : "default"}>
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                            </Button>
                        </a>
                        
                        {/* Botón de editar */}
                        <Link href={`/estudios/${estudio.ID}/edit/recoleccion`}>
                            <Button className="bg-[#189BAF] hover:bg-[#157a8c]" size={showMobileView ? "sm" : "default"}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        </Link>
                        
                        {/* Botón volver */}
                        <Link href="/estudios">
                            <Button variant="outline" size={showMobileView ? "sm" : "default"}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className={showMobileView ? 'space-y-6' : ''}>
                    {/* Timeline Principal */}
                    <div className={showMobileView ? '' : 'lg:col-span-3'}>
                        <Card className="p-1 py-6">
                            <CardHeader>
                                <CardTitle>Progreso del Estudio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {steps.map((step, index) => {
                                        const status = getStepStatus(step.number);
                                        const isExpanded = expandedSteps.has(step.number);
                                        
                                        return (
                                            <div key={step.number} className="border rounded-lg">
                                                {/* Header del paso */}
                                                <div className="p-4 bg-gray-50 rounded-t-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStepColor(status)}`}>
                                                                {status === 'completed' ? (
                                                                    <Check className="h-5 w-5 text-white" />
                                                                ) : (
                                                                    getStepIcon(step.number, status)
                                                                )}
                                                            </div>
                                                            <h3 className={`text-lg font-semibold ${status === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                                                                {step.number}. {step.title}
                                                            </h3>
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2">
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
                                                            
                                                            <button
                                                                onClick={() => toggleStepExpansion(step.number)}
                                                                className="p-1 hover:bg-gray-200 rounded"
                                                            >
                                                                {isExpanded ? 
                                                                    <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                                                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Contenido del paso */}
                                                {isExpanded && (
                                                    <div className="p-4 border-t">
                                                        {status === 'pending' ? (
                                                            <div className="flex items-center text-gray-500">
                                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                                <span className="text-sm">Paso pendiente</span>
                                                            </div>
                                                        ) : (
                                                            renderStepData(step.number)
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}