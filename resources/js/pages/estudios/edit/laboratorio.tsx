import { useState, useRef, useCallback, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, FileText, FlaskConical } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface EditLaboratorioProps {
    estudio: any;
    [key: string]: any;
}

export default function EditLaboratorioConCondicionales() {
    const { estudio } = usePage<EditLaboratorioProps>().props;

    // Referencias para inputs simples - no causan re-renders
    const formRef = useRef<HTMLFormElement>(null);
    
    // Estado para processing y campos que requieren reactividad
    const [processing, setProcessing] = useState(false);
    const [estudiosSeleccionados, setEstudiosSeleccionados] = useState(estudio.R_ESTUDIO_SOLICITADO || '');
    const [adecuadoProcesamiento, setAdecuadoProcesamiento] = useState(estudio.R_ADECUADO_PROCESAMIENTO || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Laboratorio', href: `/estudios/${estudio.ID}/edit/laboratorio` },
    ];

    // Preparar fechas y horas iniciales
    const fechaRecepcionInicial = estudio.FECHA_RECEPCION_LABORATORIO ? 
        new Date(estudio.FECHA_RECEPCION_LABORATORIO).toISOString().split('T')[0] : '';
    const horaRecepcionInicial = estudio.FECHA_RECEPCION_LABORATORIO ? 
        new Date(estudio.FECHA_RECEPCION_LABORATORIO).toTimeString().slice(0, 5) : '';
    const fechaResultadosInicial = estudio.FECHA_OBTENCION_RESULTADOS ? 
        new Date(estudio.FECHA_OBTENCION_RESULTADOS).toISOString().split('T')[0] : '';
    const horaResultadosInicial = estudio.FECHA_OBTENCION_RESULTADOS ? 
        new Date(estudio.FECHA_OBTENCION_RESULTADOS).toTimeString().slice(0, 5) : '';

    // LÓGICA CONDICIONAL - Ahora usa estado reactivo para estudiosSeleccionados
    const esSangreTotal = estudio.MUESTRA_TIPO === 'Sangre total';
    
    const estudiosIncluyen = (tipoEstudio: string) => {
        return estudiosSeleccionados.includes(tipoEstudio);
    };
    
    const mostrarKRAS = estudiosIncluyen('K-RAS');
    const mostrarNRAS = estudiosIncluyen('N-RAS');
    const mostrarBRAF = estudiosIncluyen('B-RAF');
    
    const mostrarOtroMetodo = !['PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis', 'PCR en tiempo real, FFPE sistema, IDYLLA Biocartis'].includes(estudio.R_METODO_PROCESO || '');
    
    const mostrarCondicionPresencia = estudio.MUESTRA_LIQ_CONDICION === 'condiciones inadecuadas por la presencia de ';
    
    // Mostrar razón de procesamiento si el valor es subóptima, inadecuada o no es procesable
    const mostrarRazonProcesamiento = ['subóptima', 'inadecuada', 'no es procesable'].includes(adecuadoProcesamiento);

    // Debug: Verificar valores de la base de datos
    useEffect(() => {
        console.log('=== DEBUG VALORES DE BD ===');
        console.log('MUESTRA_TIPO:', estudio.MUESTRA_TIPO);
        console.log('R_ESTUDIO_SOLICITADO:', estudio.R_ESTUDIO_SOLICITADO);
        console.log('estudiosSeleccionados (estado):', estudiosSeleccionados);
        console.log('adecuadoProcesamiento (estado):', adecuadoProcesamiento);
        console.log('R_METODO_PROCESO:', estudio.R_METODO_PROCESO);
        console.log('MUESTRA_LIQ_CONDICION:', estudio.MUESTRA_LIQ_CONDICION);
        console.log('R_ADECUADO_PROCESAMIENTO:', estudio.R_ADECUADO_PROCESAMIENTO);
        console.log('=== DEBUG CONDICIONES ===');
        console.log('esSangreTotal:', esSangreTotal);
        console.log('mostrarKRAS:', mostrarKRAS);
        console.log('mostrarNRAS:', mostrarNRAS);
        console.log('mostrarBRAF:', mostrarBRAF);
        console.log('mostrarOtroMetodo:', mostrarOtroMetodo);
        console.log('mostrarCondicionPresencia:', mostrarCondicionPresencia);
        console.log('mostrarRazonProcesamiento:', mostrarRazonProcesamiento);
    }, [estudiosSeleccionados, adecuadoProcesamiento]); // Ahora depende de ambos estados

    // Manejadores de eventos
    const handleEstudioSolicitadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoEstudio = e.target.value;
        console.log('🔄 Cambiando estudio solicitado de:', estudiosSeleccionados, 'a:', nuevoEstudio);
        setEstudiosSeleccionados(nuevoEstudio);
    };

    const handleAdecuadoProcesamientoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoValor = e.target.value;
        console.log('🔄 Cambiando adecuado procesamiento de:', adecuadoProcesamiento, 'a:', nuevoValor);
        setAdecuadoProcesamiento(nuevoValor);
    };

    // Función para obtener datos del formulario (sin usar por ahora)
    const getFormData = useCallback(() => {
        if (!formRef.current) return {};
        
        const formData = new FormData(formRef.current);
        const data: Record<string, any> = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Manejar checkbox R_COMPLETOS específicamente
        const checkbox = formRef.current.querySelector('input[name="R_COMPLETOS"]') as HTMLInputElement;
        data.R_COMPLETOS = checkbox?.checked ? 'si' : 'no';

        return data;
    }, []);

    // Clases CSS compartidas
    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent";
    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent bg-white";
    const textareaClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent resize-none";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Laboratorio`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con información del estudio y progreso */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FlaskConical className="h-6 w-6 text-[#189BAF]" />
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
                            <Badge className="bg-[#189BAF] text-white">3. Laboratorio</Badge>
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <Badge variant="outline">4. Informe</Badge>
                        </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#189BAF] h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Formulario Principal */}
                <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
                    
                    {/* Fechas del Laboratorio */}
                    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                        <h3 className="text-lg font-semibold mb-4">Fechas del Laboratorio</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-4">Recepción en Laboratorio</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha
                                        </label>
                                        <input
                                            type="date"
                                            name="FECHA_RECEPCION_LABORATORIO"
                                            defaultValue={fechaRecepcionInicial}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hora
                                        </label>
                                        <input
                                            type="time"
                                            name="HORA_RECEPCION_LABORATORIO"
                                            defaultValue={horaRecepcionInicial}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-4">Obtención de Resultados</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha
                                        </label>
                                        <input
                                            type="date"
                                            name="FECHA_OBTENCION_RESULTADOS"
                                            defaultValue={fechaResultadosInicial}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hora
                                        </label>
                                        <input
                                            type="time"
                                            name="HORA_OBTENCION_RESULTADOS"
                                            defaultValue={horaResultadosInicial}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuración del Estudio y Resultados */}
                    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                        <h3 className="text-lg font-semibold mb-4">Configuración del Estudio</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* COLUMNA IZQUIERDA - Configuración */}
                            <div className="space-y-6">
                                {/* Estudio solicitado */}
                                <div>
                                    <label className={labelClass}>Estudio Solicitado</label>
                                    <select
                                        name="R_ESTUDIO_SOLICITADO"
                                        className={selectClass}
                                        value={estudiosSeleccionados}
                                        onChange={handleEstudioSolicitadoChange}
                                    >
                                        <option value="">Selecciona</option>
                                        <option value="K-RAS">K-RAS</option>
                                        <option value="N-RAS">N-RAS</option>
                                        <option value="B-RAF">B-RAF</option>
                                        <option value="K-RAS y N-RAS">K-RAS y N-RAS</option>
                                        <option value="K-RAS y B-RAF">K-RAS y B-RAF</option>
                                        <option value="N-RAS y B-RAF">N-RAS y B-RAF</option>
                                        <option value="K-RAS, N-RAS y B-RAF">K-RAS, N-RAS y B-RAF</option>
                                    </select>
                                </div>

                                {/* Método de proceso */}
                                <div>
                                    <label className={labelClass}>Método de proceso</label>
                                    <select
                                        name="R_METODO_PROCESO"
                                        className={selectClass}
                                        defaultValue={estudio.R_METODO_PROCESO || ''}
                                    >
                                        <option value="">Otro</option>
                                        {esSangreTotal ? (
                                            <option value="PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis">
                                                PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis
                                            </option>
                                        ) : (
                                            <option value="PCR en tiempo real, FFPE sistema, IDYLLA Biocartis">
                                                PCR en tiempo real, FFPE sistema, IDYLLA Biocartis
                                            </option>
                                        )}
                                    </select>
                                </div>

                                {/* Otro método de proceso - CONDICIONAL */}
                                {mostrarOtroMetodo && (
                                    <div>
                                        <label className={labelClass}>Otro Método de proceso</label>
                                        <input
                                            type="text"
                                            name="R_OTRO_METODO_PROCESO"
                                            className={inputClass}
                                            defaultValue={estudio.R_OTRO_METODO_PROCESO || ''}
                                        />
                                    </div>
                                )}

                                {/* Campos específicos para SANGRE TOTAL - CONDICIONAL */}
                                {esSangreTotal && (
                                    <div className="space-y-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
                                        <h4 className="font-medium text-blue-800">Análisis de Sangre Total</h4>
                                        
                                        <div>
                                            <label className={labelClass}>Condición de la muestra Líquida</label>
                                            <select
                                                name="MUESTRA_LIQ_CONDICION"
                                                className={selectClass}
                                                defaultValue={estudio.MUESTRA_LIQ_CONDICION || ''}
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="buenas condiciones">buenas condiciones</option>
                                                <option value="condiciones inadecuadas por la presencia de ">condiciones inadecuadas por la presencia de</option>
                                            </select>
                                        </div>

                                        {/* Campo condicional dentro de sangre total */}
                                        {mostrarCondicionPresencia && (
                                            <div>
                                                <label className={labelClass}>condiciones inadecuadas por la presencia de:</label>
                                                <input
                                                    type="text"
                                                    name="MUESTRA_LIQ_CONDICION_PRESENCIA"
                                                    className={inputClass}
                                                    defaultValue={estudio.MUESTRA_LIQ_CONDICION_PRESENCIA || ''}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className={labelClass}>Cantidad de sangre total recibida</label>
                                            <select
                                                name="MUESTRA_LIQ_CANTIDAD_ADECUADA"
                                                className={selectClass}
                                                defaultValue={estudio.MUESTRA_LIQ_CANTIDAD_ADECUADA || ''}
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="es la adecuada, ">es la adecuada,</option>
                                                <option value="no es suficiente pues corresponde solo a ">no es suficiente pues corresponde solo a</option>
                                                <option value="no es óptima pues corresponde solo a">no es óptima pues corresponde solo a</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Cantidad de sangre (ml)</label>
                                            <div className="flex">
                                                <input
                                                    type="number"
                                                    name="MUESTRA_LIQ_CANTIDAD_ML"
                                                    step="0.1"
                                                    className={inputClass + " rounded-r-none"}
                                                    defaultValue={estudio.MUESTRA_LIQ_CANTIDAD_ML || ''}
                                                />
                                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
                                                    ml
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Se observa Hemólisis</label>
                                            <select
                                                name="MUESTRA_LIQ_HEMOLISIS"
                                                className={selectClass}
                                                defaultValue={estudio.MUESTRA_LIQ_HEMOLISIS || ''}
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="se observa hemólisis">se observa hemólisis</option>
                                                <option value="se observa ligero tinte hemático">se observa ligero tinte hemático</option>
                                                <option value="no se observa hemólisis">no se observa hemólisis</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Reacciones de amplificación</label>
                                            <select
                                                name="MUESTRA_LIQ_AMP_INDICACION"
                                                className={selectClass}
                                                defaultValue={estudio.MUESTRA_LIQ_AMP_INDICACION || ''}
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="buena calidad">buena calidad</option>
                                                <option value="calidad limitada">calidad limitada</option>
                                                <option value="calidad subóptima">calidad subóptima</option>
                                                <option value="calidad inadecuada">calidad inadecuada</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Detalles Reacciones de amplificación</label>
                                            <input
                                                type="text"
                                                name="MUESTRA_LIQ_AMP_RAZON"
                                                className={inputClass}
                                                defaultValue={estudio.MUESTRA_LIQ_AMP_RAZON || ''}
                                                placeholder="Razón personalizada"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Campos específicos para TEJIDO - CONDICIONAL */}
                                {!esSangreTotal && (
                                    <div className="space-y-4 border border-green-200 rounded-lg p-4 bg-green-50">
                                        <h4 className="font-medium text-green-800">Análisis de Tejido</h4>
                                        
                                        <div>
                                            <label className={labelClass}>Preservación H-E</label>
                                            <select
                                                name="R_PRESERVACION_H_E"
                                                className={selectClass}
                                                defaultValue={estudio.R_PRESERVACION_H_E || ''}
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="se haya adecuadamente preservado">se haya adecuadamente preservado</option>
                                                <option value="tiene preservación subóptima">tiene preservación subóptima</option>
                                                <option value="tiene múltiples artificios por mala preservación ">tiene múltiples artificios por mala preservación</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>¿Adecuado para Procesamiento?</label>
                                            <select
                                                name="R_ADECUADO_PROCESAMIENTO"
                                                className={selectClass}
                                                value={adecuadoProcesamiento}
                                                onChange={handleAdecuadoProcesamientoChange}
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="express">Liberación Express</option>
                                                <option value="adecuada">adecuada</option>
                                                <option value="suficiente">suficiente</option>
                                                <option value="subóptima">subóptima</option>
                                                <option value="inadecuada">inadecuada</option>
                                                <option value="no es procesable">no es procesable</option>
                                            </select>
                                        </div>

                                        {/* Campo condicional para razón de procesamiento */}
                                        {mostrarRazonProcesamiento && (
                                            <div>
                                                <label className={labelClass}>Razón de la preservación del especimen</label>
                                                <textarea
                                                    name="R_RAZON_ADECUADO_PROCESAMIENTO"
                                                    className={textareaClass}
                                                    rows={3}
                                                    defaultValue={estudio.R_RAZON_ADECUADO_PROCESAMIENTO || ''}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* COLUMNA DERECHA - Resultados genéticos */}
                            <div className="space-y-6">
                                {/* Resultados K-RAS - CONDICIONAL */}
                                {mostrarKRAS && (
                                    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                                        <h4 className="font-medium text-orange-800 mb-3">Resultados K-RAS</h4>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <label className={labelClass}>Estatus Mutacional K-RAS</label>
                                                <select
                                                    name="R_ESTATUS_KRAS"
                                                    className={selectClass}
                                                    defaultValue={estudio.R_ESTATUS_KRAS || ''}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="NO MUTADO">NO MUTADO</option>
                                                    <option value="NO MUTADO (VER NOTAS)">NO MUTADO (VER NOTAS)</option>
                                                    <option value="MUTADO">MUTADO</option>
                                                    <option value="MUTADO (VER NOTAS)">MUTADO (VER NOTAS)</option>
                                                    <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                    <option value="INVALIDO">INVALIDO</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Genotipo K-RAS</label>
                                                <select
                                                    name="R_GENOTIPO_KRAS"
                                                    className={selectClass}
                                                    defaultValue={estudio.R_GENOTIPO_KRAS || ''}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="NINGUNA">NINGUNA</option>
                                                    <option value="G12C (c.34G&gt;T)">G12C (c.34G&gt;T)</option>
                                                    <option value="G12D (c.35G&gt;A)">G12D (c.35G&gt;A)</option>
                                                    <option value="G12V (c.35G&gt;T)">G12V (c.35G&gt;T)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Resultados N-RAS - CONDICIONAL */}
                                {mostrarNRAS && (
                                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                        <h4 className="font-medium text-purple-800 mb-3">Resultados N-RAS</h4>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <label className={labelClass}>Estatus Mutacional N-RAS</label>
                                                <select
                                                    name="R_ESTATUS_NRAS"
                                                    className={selectClass}
                                                    defaultValue={estudio.R_ESTATUS_NRAS || ''}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="NO MUTADO">NO MUTADO</option>
                                                    <option value="MUTADO">MUTADO</option>
                                                    <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Genotipo N-RAS</label>
                                                <select
                                                    name="R_GENOTIPO_NRAS"
                                                    className={selectClass}
                                                    defaultValue={estudio.R_GENOTIPO_NRAS || ''}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="NINGUNA">NINGUNA</option>
                                                    <option value="G12C (c.34G&gt;T)">G12C (c.34G&gt;T)</option>
                                                    <option value="G12D (c.35G&gt;A)">G12D (c.35G&gt;A)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Resultados B-RAF - CONDICIONAL */}
                                {mostrarBRAF && (
                                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                        <h4 className="font-medium text-red-800 mb-3">Resultados B-RAF</h4>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <label className={labelClass}>Estatus Mutacional B-RAF</label>
                                                <select
                                                    name="R_ESTATUS_BRAF"
                                                    className={selectClass}
                                                    defaultValue={estudio.R_ESTATUS_BRAF || ''}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="NO MUTADO">NO MUTADO</option>
                                                    <option value="MUTADO">MUTADO</option>
                                                    <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Genotipo B-RAF</label>
                                                <select
                                                    name="R_GENOTIPO_BRAF"
                                                    className={selectClass}
                                                    defaultValue={estudio.R_GENOTIPO_BRAF || ''}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="NINGUNA">NINGUNA</option>
                                                    <option value="V600E (c.1799T&gt;A)">V600E (c.1799T&gt;A)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resultados y Documentación */}
                    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                        <h3 className="text-lg font-semibold mb-4">Resultados y Documentación</h3>
                        
                        <div className="space-y-6">
                            {/* Resultado Histopatológico - Solo para no sangre total */}
                            {!esSangreTotal && (
                                <div>
                                    <label className={labelClass}>Resultado Histopatológico</label>
                                    <textarea
                                        name="R_RESULTADO_HISTOPATOLOGICO"
                                        className={textareaClass}
                                        rows={8}
                                        defaultValue={estudio.R_RESULTADO_HISTOPATOLOGICO || ''}
                                        placeholder="Ingrese el resultado histopatológico..."
                                    />
                                </div>
                            )}

                            {/* Notas del estudio */}
                            <div>
                                <label className={labelClass}>Notas (Visibles en el reporte)</label>
                                <textarea
                                    name="ESTUDIO_NOTAS"
                                    className={textareaClass}
                                    rows={10}
                                    defaultValue={estudio.ESTUDIO_NOTAS || 'La mutación de KRAS como biomarcador en cáncer del tubo digestivo para la administración de agentes anti-EGFR sólo esta avalada en adenocarcinomas primarios de colon y recto, y cuando estos estén en estadio metastásico. Su empleo en otros contextos puede no estar indicado.'}
                                    placeholder="Ingrese las notas del estudio..."
                                />
                            </div>

                            {/* Comentarios del estudio */}
                            <div>
                                <label className={labelClass}>Comentarios (Visible solo para cliente)</label>
                                <textarea
                                    name="ESTUDIO_COMENTARIOS"
                                    className={textareaClass}
                                    rows={8}
                                    defaultValue={estudio.ESTUDIO_COMENTARIOS || ''}
                                    placeholder="Ingrese comentarios del estudio..."
                                />
                            </div>

                            {/* Checkbox resultados completos */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="R_COMPLETOS"
                                    id="resultadosCompletos"
                                    className="h-4 w-4 text-[#189BAF] focus:ring-[#189BAF] border-gray-300 rounded"
                                    defaultChecked={estudio.R_COMPLETOS === 'si'}
                                />
                                <label htmlFor="resultadosCompletos" className="ml-2 block text-sm text-gray-900">
                                    Resultados Completos
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Debug Info */}
                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm mb-6">
                        <h4 className="font-medium mb-2">Debug Info</h4>
                        <div className="text-sm space-y-1">
                            <p>MUESTRA_TIPO: {estudio.MUESTRA_TIPO || 'null'}</p>
                            <p>R_ESTUDIO_SOLICITADO (BD): {estudio.R_ESTUDIO_SOLICITADO || 'null'}</p>
                            <p>estudiosSeleccionados (estado): {estudiosSeleccionados || 'null'}</p>
                            <p>Es Sangre Total: {esSangreTotal ? 'SI' : 'NO'}</p>
                            <p>Mostrar K-RAS: {mostrarKRAS ? 'SI' : 'NO'}</p>
                            <p>Mostrar N-RAS: {mostrarNRAS ? 'SI' : 'NO'}</p>
                            <p>Mostrar B-RAF: {mostrarBRAF ? 'SI' : 'NO'}</p>
                        </div>
                    </div>

                    {/* Botones de navegación */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between">
                            <div className="flex gap-2">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={() => router.visit(`/estudios/${estudio.ID}/edit/recepcion`)}
                                    disabled={processing}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Anterior
                                </Button>
                                
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => {
                                        const formData = getFormData();
                                        setProcessing(true);
                                        router.patch(`/estudios/${estudio.ID}/laboratorio`, formData, {
                                            onSuccess: () => router.visit('/estudios'),
                                            onFinish: () => setProcessing(false)
                                        });
                                    }}
                                    disabled={processing}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar y Salir
                                </Button>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => {
                                        const formData = getFormData();
                                        setProcessing(true);
                                        router.patch(`/estudios/${estudio.ID}/laboratorio`, formData, {
                                            onSuccess: () => console.log('Datos guardados exitosamente'),
                                            onFinish: () => setProcessing(false)
                                        });
                                    }}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Solo Guardar
                                </Button>
                                
                                <Button
                                    type="button"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                    onClick={() => {
                                        const formData = getFormData();
                                        setProcessing(true);
                                        router.patch(`/estudios/${estudio.ID}/laboratorio`, formData, {
                                            onSuccess: () => router.visit(`/estudios/${estudio.ID}/edit/informe`),
                                            onFinish: () => setProcessing(false)
                                        });
                                    }}
                                    disabled={processing}
                                >
                                    Guardar y Siguiente
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}