import { useMemo, useCallback, useState, useRef } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, FileText, FlaskConical } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

// Usaremos un textarea simple en lugar de ReactQuill por ahora

interface EditLaboratorioProps {
    estudio: any;
    [key: string]: any;
}

export default function EditLaboratorioOptimized() {
    const { estudio } = usePage<EditLaboratorioProps>().props;

    const { data, setData, patch, processing } = useForm({
        // Fechas laboratorio
        FECHA_RECEPCION_LABORATORIO: estudio.FECHA_RECEPCION_LABORATORIO ? 
            new Date(estudio.FECHA_RECEPCION_LABORATORIO).toISOString().split('T')[0] : '',
        HORA_RECEPCION_LABORATORIO: estudio.FECHA_RECEPCION_LABORATORIO ? 
            new Date(estudio.FECHA_RECEPCION_LABORATORIO).toTimeString().slice(0, 5) : '',
        FECHA_OBTENCION_RESULTADOS: estudio.FECHA_OBTENCION_RESULTADOS ? 
            new Date(estudio.FECHA_OBTENCION_RESULTADOS).toISOString().split('T')[0] : '',
        HORA_OBTENCION_RESULTADOS: estudio.FECHA_OBTENCION_RESULTADOS ? 
            new Date(estudio.FECHA_OBTENCION_RESULTADOS).toTimeString().slice(0, 5) : '',

        // Estudios y métodos
        R_ESTUDIO_SOLICITADO: estudio.R_ESTUDIO_SOLICITADO || '',
        R_METODO_PROCESO: estudio.R_METODO_PROCESO || '',
        R_OTRO_METODO_PROCESO: estudio.R_OTRO_METODO_PROCESO || '',

        // Condiciones muestra líquida (sangre total)
        MUESTRA_LIQ_CONDICION: estudio.MUESTRA_LIQ_CONDICION || '',
        MUESTRA_LIQ_CONDICION_PRESENCIA: estudio.MUESTRA_LIQ_CONDICION_PRESENCIA || '',
        MUESTRA_LIQ_CANTIDAD_ADECUADA: estudio.MUESTRA_LIQ_CANTIDAD_ADECUADA || '',
        MUESTRA_LIQ_CANTIDAD_ML: estudio.MUESTRA_LIQ_CANTIDAD_ML || '',
        MUESTRA_LIQ_HEMOLISIS: estudio.MUESTRA_LIQ_HEMOLISIS || '',
        MUESTRA_LIQ_AMP_INDICACION: estudio.MUESTRA_LIQ_AMP_INDICACION || '',
        MUESTRA_LIQ_AMP_RAZON: estudio.MUESTRA_LIQ_AMP_RAZON || '',

        // Datos tejido (no sangre total)
        R_PRESERVACION_H_E: estudio.R_PRESERVACION_H_E || '',
        R_NUMERO_CELULAS_TUMORALES: estudio.R_NUMERO_CELULAS_TUMORALES || '',
        R_AREA_TUMORAL: estudio.R_AREA_TUMORAL || '',
        R_PORCENTAJE_TUMOR_TEJIDO: estudio.R_PORCENTAJE_TUMOR_TEJIDO || '',
        R_ENRIQUECIMIENTO: estudio.R_ENRIQUECIMIENTO || '',
        R_ADECUADO_PROCESAMIENTO: estudio.R_ADECUADO_PROCESAMIENTO || '',
        R_RAZON_ADECUADO_PROCESAMIENTO: estudio.R_RAZON_ADECUADO_PROCESAMIENTO || '',

        // Resultados genéticos
        R_ESTATUS_KRAS: estudio.R_ESTATUS_KRAS || '',
        R_GENOTIPO_KRAS: estudio.R_GENOTIPO_KRAS || '',
        R_ESTATUS_NRAS: estudio.R_ESTATUS_NRAS || '',
        R_GENOTIPO_NRAS: estudio.R_GENOTIPO_NRAS || '',
        R_ESTATUS_BRAF: estudio.R_ESTATUS_BRAF || '',
        R_GENOTIPO_BRAF: estudio.R_GENOTIPO_BRAF || '',

        // Textos con editor
        R_RESULTADO_HISTOPATOLOGICO: estudio.R_RESULTADO_HISTOPATOLOGICO || '',
        ESTUDIO_NOTAS: estudio.ESTUDIO_NOTAS || `<p>La mutación de KRAS como biomarcador en cáncer del tubo digestivo para la administración de agentes anti-EGFR sólo esta avalada en adenocarcinomas primarios de colon y recto, y cuando estos estén en estadio metastásico. Su empleo en otros contextos puede no estar indicado.</p>`,
        ESTUDIO_COMENTARIOS: estudio.ESTUDIO_COMENTARIOS || '',

        // Estado final
        R_COMPLETOS: estudio.R_COMPLETOS === 'si'
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Laboratorio', href: `/estudios/${estudio.ID}/edit/laboratorio` },
    ], [estudio]);


    const handleSave = useCallback((e?: React.MouseEvent) => {
        console.log('🔴 handleSave ejecutado');
        e?.preventDefault();
        
        console.log('📊 Datos actuales del form:', data);
        console.log('🔢 ID del estudio:', estudio.ID);
        
        // Preparar datos con fechas y horas combinadas si están presentes
        const formData = { ...data };
        if (data.FECHA_RECEPCION_LABORATORIO && data.HORA_RECEPCION_LABORATORIO) {
            formData.FECHA_RECEPCION_LABORATORIO = data.FECHA_RECEPCION_LABORATORIO + ' ' + data.HORA_RECEPCION_LABORATORIO + ':00';
            console.log('📅 Fecha recepción laboratorio combinada:', formData.FECHA_RECEPCION_LABORATORIO);
        }
        if (data.FECHA_OBTENCION_RESULTADOS && data.HORA_OBTENCION_RESULTADOS) {
            formData.FECHA_OBTENCION_RESULTADOS = data.FECHA_OBTENCION_RESULTADOS + ' ' + data.HORA_OBTENCION_RESULTADOS + ':00';
            console.log('📅 Fecha obtención resultados combinada:', formData.FECHA_OBTENCION_RESULTADOS);
        }
        
        console.log('📤 Datos a enviar:', formData);
        console.log('🎯 URL de patch:', `/estudios/${estudio.ID}/laboratorio`);
        
        router.patch(`/estudios/${estudio.ID}/laboratorio`, formData, {
            onSuccess: (response) => {
                console.log('✅ Datos guardados exitosamente');
                console.log('📥 Respuesta del servidor:', response);
                alert('✅ Datos guardados exitosamente');
            },
            onError: (errors) => {
                console.error('❌ Error al guardar:', errors);
                console.error('🔍 Detalles del error:', JSON.stringify(errors, null, 2));
            },
            onStart: () => {
                console.log('🚀 Iniciando petición patch...');
            },
            onFinish: () => {
                console.log('🏁 Petición patch finalizada');
            }
        });
    }, [estudio.ID, data, router]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        console.log('🟡 handleNext ejecutado');
        e?.preventDefault();
        
        console.log('📊 Datos actuales del form (Next):', data);
        console.log('🔢 ID del estudio (Next):', estudio.ID);
        
        // Preparar datos con fechas y horas combinadas si están presentes
        const formData = { ...data, _next: 'informe' };
        if (data.FECHA_RECEPCION_LABORATORIO && data.HORA_RECEPCION_LABORATORIO) {
            formData.FECHA_RECEPCION_LABORATORIO = data.FECHA_RECEPCION_LABORATORIO + ' ' + data.HORA_RECEPCION_LABORATORIO + ':00';
            console.log('📅 Fecha recepción laboratorio combinada (Next):', formData.FECHA_RECEPCION_LABORATORIO);
        }
        if (data.FECHA_OBTENCION_RESULTADOS && data.HORA_OBTENCION_RESULTADOS) {
            formData.FECHA_OBTENCION_RESULTADOS = data.FECHA_OBTENCION_RESULTADOS + ' ' + data.HORA_OBTENCION_RESULTADOS + ':00';
            console.log('📅 Fecha obtención resultados combinada (Next):', formData.FECHA_OBTENCION_RESULTADOS);
        }
        
        console.log('📤 Datos a enviar (Next):', formData);
        console.log('🎯 URL de patch (Next):', `/estudios/${estudio.ID}/laboratorio`);
        
        router.patch(`/estudios/${estudio.ID}/laboratorio`, formData, {
            onSuccess: (response) => {
                console.log('✅ Datos guardados exitosamente (Next)');
                console.log('📥 Respuesta del servidor (Next):', response);
                console.log('🔄 Navegando a informe...');
                router.visit(`/estudios/${estudio.ID}/edit/informe`);
            },
            onError: (errors) => {
                console.error('❌ Error al guardar (Next):', errors);
                console.error('🔍 Detalles del error (Next):', JSON.stringify(errors, null, 2));
            },
            onStart: () => {
                console.log('🚀 Iniciando petición patch (Next)...');
            },
            onFinish: () => {
                console.log('🏁 Petición patch finalizada (Next)');
            }
        });
    }, [estudio.ID, data, router]);

    const handlePrev = useCallback(() => {
        router.visit(`/estudios/${estudio.ID}/edit/recepcion`);
    }, [estudio.ID]);

    const handleSaveAndExit = useCallback((e?: React.MouseEvent) => {
        console.log('🔵 handleSaveAndExit ejecutado');
        e?.preventDefault();
        
        console.log('📊 Datos actuales del form (Salir):', data);
        console.log('🔢 ID del estudio (Salir):', estudio.ID);
        
        // Preparar datos con fechas y horas combinadas si están presentes
        const formData = { ...data };
        if (data.FECHA_RECEPCION_LABORATORIO && data.HORA_RECEPCION_LABORATORIO) {
            formData.FECHA_RECEPCION_LABORATORIO = data.FECHA_RECEPCION_LABORATORIO + ' ' + data.HORA_RECEPCION_LABORATORIO + ':00';
            console.log('📅 Fecha recepción laboratorio combinada (Salir):', formData.FECHA_RECEPCION_LABORATORIO);
        }
        if (data.FECHA_OBTENCION_RESULTADOS && data.HORA_OBTENCION_RESULTADOS) {
            formData.FECHA_OBTENCION_RESULTADOS = data.FECHA_OBTENCION_RESULTADOS + ' ' + data.HORA_OBTENCION_RESULTADOS + ':00';
            console.log('📅 Fecha obtención resultados combinada (Salir):', formData.FECHA_OBTENCION_RESULTADOS);
        }
        
        console.log('📤 Datos a enviar (Salir):', formData);
        console.log('🎯 URL de patch (Salir):', `/estudios/${estudio.ID}/laboratorio`);
        
        router.patch(`/estudios/${estudio.ID}/laboratorio`, formData, {
            onSuccess: (response) => {
                console.log('✅ Datos guardados exitosamente (Salir)');
                console.log('📥 Respuesta del servidor (Salir):', response);
                console.log('🔄 Navegando a lista de estudios...');
                router.visit('/estudios');
            },
            onError: (errors) => {
                console.error('❌ Error al guardar (Salir):', errors);
                console.error('🔍 Detalles del error (Salir):', JSON.stringify(errors, null, 2));
            },
            onStart: () => {
                console.log('🚀 Iniciando petición patch (Salir)...');
            },
            onFinish: () => {
                console.log('🏁 Petición patch finalizada (Salir)');
            }
        });
    }, [estudio.ID, data, router]);

    // Lógica condicional para mostrar campos
    const esSangreTotal = estudio.MUESTRA_TIPO === 'Sangre total';
    const estudiosIncluyen = (estudio: string) => data.R_ESTUDIO_SOLICITADO.includes(estudio);
    const mostrarOtroMetodo = !['PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis', 'PCR en tiempo real, FFPE sistema, IDYLLA Biocartis'].includes(data.R_METODO_PROCESO);
    const mostrarCondicionPresencia = data.MUESTRA_LIQ_CONDICION === 'condiciones inadecuadas por la presencia de ';
    const mostrarRazonProcesamiento = !['adecuada', 'suficiente'].includes(data.R_ADECUADO_PROCESAMIENTO);

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";
    const textareaClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Laboratorio`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con clave interna y estado */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-[#189BAF]" />
                                <h1 className="text-2xl font-bold text-gray-800">{estudio.CLAVE_INTERNA}</h1>
                            </div>
                            <Badge className="bg-[#189BAF] text-white">3. Laboratorio</Badge>
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
                            <div className="bg-[#189BAF] h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <form className="space-y-6">
                    {/* Recepción Laboratorio */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Recepción Laboratorio</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Fecha Recepción Laboratorio <small>(dd/mm/aaaa)</small></label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={data.FECHA_RECEPCION_LABORATORIO}
                                    onChange={(e) => setData('FECHA_RECEPCION_LABORATORIO', e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className={labelClass}>Hora Recepción Laboratorio <small>(00:00)</small></label>
                                <input
                                    type="time"
                                    className={inputClass}
                                    value={data.HORA_RECEPCION_LABORATORIO}
                                    onChange={(e) => setData('HORA_RECEPCION_LABORATORIO', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Obtención de resultados */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            🧪 Obtención de resultados
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Fechas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Fecha Obtención Resultados <small>(dd/mm/aaaa)</small></label>
                                    <input
                                        type="date"
                                        className={inputClass}
                                        value={data.FECHA_OBTENCION_RESULTADOS}
                                        onChange={(e) => setData('FECHA_OBTENCION_RESULTADOS', e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <label className={labelClass}>Hora Obtención Resultados <small>(00:00)</small></label>
                                    <input
                                        type="time"
                                        className={inputClass}
                                        value={data.HORA_OBTENCION_RESULTADOS}
                                        onChange={(e) => setData('HORA_OBTENCION_RESULTADOS', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* COLUMNA IZQUIERDA - Configuración del estudio */}
                                <div className="space-y-6">
                                    {/* Estudio solicitado */}
                                    <div>
                                        <label className={labelClass}>Estudio Solicitado</label>
                                        <select
                                            className={selectClass}
                                            value={data.R_ESTUDIO_SOLICITADO}
                                            onChange={(e) => setData('R_ESTUDIO_SOLICITADO', e.target.value)}
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
                                            className={selectClass}
                                            value={data.R_METODO_PROCESO}
                                            onChange={(e) => setData('R_METODO_PROCESO', e.target.value)}
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

                                    {/* Otro método de proceso */}
                                    {mostrarOtroMetodo && (
                                        <div>
                                            <label className={labelClass}><small>Otro Método de proceso</small></label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={data.R_OTRO_METODO_PROCESO}
                                                onChange={(e) => setData('R_OTRO_METODO_PROCESO', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {/* Campos específicos para SANGRE TOTAL */}
                                    {esSangreTotal && (
                                        <div className="space-y-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
                                            <h4 className="font-medium text-blue-800">Análisis de Sangre Total</h4>
                                            
                                            <div>
                                                <label className={labelClass}>Condición de la muestra Líquida</label>
                                                <select
                                                    className={selectClass}
                                                    value={data.MUESTRA_LIQ_CONDICION}
                                                    onChange={(e) => setData('MUESTRA_LIQ_CONDICION', e.target.value)}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="buenas condiciones">buenas condiciones</option>
                                                    <option value="condiciones inadecuadas por la presencia de ">condiciones inadecuadas por la presencia de</option>
                                                </select>
                                            </div>

                                            {mostrarCondicionPresencia && (
                                                <div>
                                                    <label className={labelClass}>condiciones inadecuadas por la presencia de: <small>Se refiere a la condición de la muestra líquida</small></label>
                                                    <input
                                                        type="text"
                                                        className={inputClass}
                                                        value={data.MUESTRA_LIQ_CONDICION_PRESENCIA}
                                                        onChange={(e) => setData('MUESTRA_LIQ_CONDICION_PRESENCIA', e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className={labelClass}>Cantidad de sangre total recibida</label>
                                                <select
                                                    className={selectClass}
                                                    value={data.MUESTRA_LIQ_CANTIDAD_ADECUADA}
                                                    onChange={(e) => setData('MUESTRA_LIQ_CANTIDAD_ADECUADA', e.target.value)}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="es la adecuada, ">es la adecuada,</option>
                                                    <option value="no es suficiente pues corresponde solo a ">no es suficiente pues corresponde solo a</option>
                                                    <option value="no es óptima pues corresponde solo a">no es óptima pues corresponde solo a</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Cantidad de sangre: <small>(ml aproximadamente)</small></label>
                                                <div className="flex">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className={inputClass + " rounded-r-none"}
                                                        value={data.MUESTRA_LIQ_CANTIDAD_ML}
                                                        onChange={(e) => setData('MUESTRA_LIQ_CANTIDAD_ML', e.target.value)}
                                                    />
                                                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
                                                        ml
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Se observa Hemólisis</label>
                                                <select
                                                    className={selectClass}
                                                    value={data.MUESTRA_LIQ_HEMOLISIS}
                                                    onChange={(e) => setData('MUESTRA_LIQ_HEMOLISIS', e.target.value)}
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
                                                    className={selectClass}
                                                    value={data.MUESTRA_LIQ_AMP_INDICACION}
                                                    onChange={(e) => setData('MUESTRA_LIQ_AMP_INDICACION', e.target.value)}
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
                                                <select
                                                    className={selectClass}
                                                    value={data.MUESTRA_LIQ_AMP_RAZON}
                                                    onChange={(e) => setData('MUESTRA_LIQ_AMP_RAZON', e.target.value)}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="pues el Cq es tardío">pues el Cq es tardío</option>
                                                    <option value="no hay amplificación">no hay amplificación</option>
                                                    <option value="la cinética de la amplificación no es la adecuada">la cinética de la amplificación no es la adecuada</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Razón reacciones de amplificación (Texto libre)</label>
                                                <input
                                                    type="text"
                                                    className={inputClass}
                                                    value={data.MUESTRA_LIQ_AMP_RAZON}
                                                    onChange={(e) => setData('MUESTRA_LIQ_AMP_RAZON', e.target.value)}
                                                    placeholder="Otra razón personalizada"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Campos específicos para TEJIDO (no sangre total) */}
                                    {!esSangreTotal && (
                                        <div className="space-y-4 border border-green-200 rounded-lg p-4 bg-green-50">
                                            <h4 className="font-medium text-green-800">Análisis de Tejido</h4>
                                            
                                            <div>
                                                <label className={labelClass}>Preservación H-E</label>
                                                <select
                                                    className={selectClass}
                                                    value={data.R_PRESERVACION_H_E}
                                                    onChange={(e) => setData('R_PRESERVACION_H_E', e.target.value)}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="se haya adecuadamente preservado">se haya adecuadamente preservado</option>
                                                    <option value="tiene preservación subóptima">tiene preservación subóptima</option>
                                                    <option value="tiene múltiples artificios por mala preservación ">tiene múltiples artificios por mala preservación</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Número de Células Tumorales</label>
                                                <input
                                                    type="number"
                                                    className={inputClass}
                                                    value={data.R_NUMERO_CELULAS_TUMORALES}
                                                    onChange={(e) => setData('R_NUMERO_CELULAS_TUMORALES', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>Área Tumoral</label>
                                                <div className="flex">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className={inputClass + " rounded-r-none"}
                                                        value={data.R_AREA_TUMORAL}
                                                        onChange={(e) => setData('R_AREA_TUMORAL', e.target.value)}
                                                    />
                                                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
                                                        mm²
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Porcentaje de Tumor en el tejido</label>
                                                <div className="flex">
                                                    <input
                                                        type="text"
                                                        className={inputClass + " rounded-r-none"}
                                                        value={data.R_PORCENTAJE_TUMOR_TEJIDO}
                                                        onChange={(e) => setData('R_PORCENTAJE_TUMOR_TEJIDO', e.target.value)}
                                                    />
                                                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
                                                        %
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>¿Enriquecimiento?</label>
                                                <select
                                                    className={selectClass}
                                                    value={data.R_ENRIQUECIMIENTO}
                                                    onChange={(e) => setData('R_ENRIQUECIMIENTO', e.target.value)}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="Si">Si</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>¿Adecuado para Procesamiento?</label>
                                                <select
                                                    className={selectClass}
                                                    value={data.R_ADECUADO_PROCESAMIENTO}
                                                    onChange={(e) => setData('R_ADECUADO_PROCESAMIENTO', e.target.value)}
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

                                            {mostrarRazonProcesamiento && (
                                                <div>
                                                    <label className={labelClass}>Razón de la preservación del especimen <small>Se muestra después del estado de la muestra</small></label>
                                                    <textarea
                                                        className={textareaClass}
                                                        rows={3}
                                                        value={data.R_RAZON_ADECUADO_PROCESAMIENTO}
                                                        onChange={(e) => setData('R_RAZON_ADECUADO_PROCESAMIENTO', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* COLUMNA DERECHA - Resultados genéticos */}
                                <div className="space-y-6">
                                    {/* Resultados K-RAS */}
                                    {estudiosIncluyen('K-RAS') && (
                                        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                                            <h4 className="font-medium text-orange-800 mb-3">Resultados K-RAS</h4>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <label className={labelClass}>Estatus Mutacional K-RAS</label>
                                                    <select
                                                        className={selectClass}
                                                        value={data.R_ESTATUS_KRAS}
                                                        onChange={(e) => setData('R_ESTATUS_KRAS', e.target.value)}
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
                                                        className={selectClass}
                                                        value={data.R_GENOTIPO_KRAS}
                                                        onChange={(e) => setData('R_GENOTIPO_KRAS', e.target.value)}
                                                    >
                                                        <option value="">Selecciona</option>
                                                        <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                        <option value="NO APLICA">NO APLICA</option>
                                                        <option value="INVALIDO">INVALIDO</option>
                                                        <option value="NINGUNA">NINGUNA</option>
                                                        <option value="G12C (c.34G&gt;T)">G12C (c.34G&gt;T)</option>
                                                        <option value="G12R (c.34G&gt;C)">G12R (c.34G&gt;C)</option>
                                                        <option value="G12S (c.34G&gt;A)">G12S (c.34G&gt;A)</option>
                                                        <option value="G12A (c.35G&gt;C)">G12A (c.35G&gt;C)</option>
                                                        <option value="G12D (c.35G&gt;A)">G12D (c.35G&gt;A)</option>
                                                        <option value="G12V (c.35G&gt;T)">G12V (c.35G&gt;T)</option>
                                                        <option value="G13D (c.38G&gt;A)">G13D (c.38G&gt;A)</option>
                                                        <option value="A59E (c.176C&gt;A)">A59E (c.176C&gt;A)</option>
                                                        <option value="A59G (c.176C&gt;G)">A59G (c.176C&gt;G)</option>
                                                        <option value="A59T (c.175G&gt;A)">A59T (c.175G&gt;A)</option>
                                                        <option value="Q61K (c.181C&gt;A; c.180_181TC&gt;AA)">Q61K (c.181C&gt;A; c.180_181TC&gt;AA)</option>
                                                        <option value="Q61L (c.182A&gt;T)">Q61L (c.182A&gt;T)</option>
                                                        <option value="Q61R (c.182A&gt;G)">Q61R (c.182A&gt;G)</option>
                                                        <option value="Q61H (c.183A&gt;C; c.183A&gt;T)">Q61H (c.183A&gt;C; c.183A&gt;T)</option>
                                                        <option value="K117N (c.351A&gt;C; c.351A&gt;T)">K117N (c.351A&gt;C; c.351A&gt;T)</option>
                                                        <option value="A146P (c.436G&gt;C)">A146P (c.436G&gt;C)</option>
                                                        <option value="A146T (c.436G&gt;A)">A146T (c.436G&gt;A)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resultados N-RAS */}
                                    {estudiosIncluyen('N-RAS') && (
                                        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                            <h4 className="font-medium text-purple-800 mb-3">Resultados N-RAS</h4>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <label className={labelClass}>Estatus Mutacional N-RAS</label>
                                                    <select
                                                        className={selectClass}
                                                        value={data.R_ESTATUS_NRAS}
                                                        onChange={(e) => setData('R_ESTATUS_NRAS', e.target.value)}
                                                    >
                                                        <option value="">Selecciona</option>
                                                        <option value="NO APLICA">NO APLICA</option>
                                                        <option value="MUTADO">MUTADO</option>
                                                        <option value="MUTADO (VER NOTAS)">MUTADO (VER NOTAS)</option>
                                                        <option value="NO MUTADO (VER NOTAS)">NO MUTADO (VER NOTAS)</option>
                                                        <option value="NO MUTADO">NO MUTADO</option>
                                                        <option value="INVALIDO">INVALIDO</option>
                                                        <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Genotipo N-RAS</label>
                                                    <select
                                                        className={selectClass}
                                                        value={data.R_GENOTIPO_NRAS}
                                                        onChange={(e) => setData('R_GENOTIPO_NRAS', e.target.value)}
                                                    >
                                                        <option value="">Selecciona</option>
                                                        <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                        <option value="NO APLICA">NO APLICA</option>
                                                        <option value="INVALIDO">INVALIDO</option>
                                                        <option value="NINGUNA">NINGUNA</option>
                                                        <option value="G12C (c.34G&gt;T)">G12C (c.34G&gt;T)</option>
                                                        <option value="G12S (c.34G&gt;A)">G12S (c.34G&gt;A)</option>
                                                        <option value="G12A (c.35G&gt;C)">G12A (c.35G&gt;C)</option>
                                                        <option value="G12D (c.35G&gt;A)">G12D (c.35G&gt;A)</option>
                                                        <option value="G12V (c.35G&gt;T)">G12V (c.35G&gt;T)</option>
                                                        <option value="G13D (c.38G&gt;A)">G13D (c.38G&gt;A)</option>
                                                        <option value="G13V (c.38G&gt;T)">G13V (c.38G&gt;T)</option>
                                                        <option value="G13R (c.37G&gt;C)">G13R (c.37G&gt;C)</option>
                                                        <option value="A59T (c.175G&gt;A)">A59T (c.175G&gt;A)</option>
                                                        <option value="Q61K (c.181C&gt;A)">Q61K (c.181C&gt;A)</option>
                                                        <option value="Q61L (c.182A&gt;T)">Q61L (c.182A&gt;T)</option>
                                                        <option value="Q61R (c.182A&gt;G)">Q61R (c.182A&gt;G)</option>
                                                        <option value="Q61H (c.183A&gt;C; c.183A&gt;T)">Q61H (c.183A&gt;C; c.183A&gt;T)</option>
                                                        <option value="K117N (c.351G&gt;C; c.351G&gt;T)">K117N (c.351G&gt;C; c.351G&gt;T)</option>
                                                        <option value="A146V (c.437C&gt;T)">A146V (c.437C&gt;T)</option>
                                                        <option value="A146T (c.436G&gt;A)">A146T (c.436G&gt;A)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resultados B-RAF */}
                                    {estudiosIncluyen('B-RAF') && (
                                        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                            <h4 className="font-medium text-red-800 mb-3">Resultados B-RAF</h4>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <label className={labelClass}>Estatus Mutacional B-RAF</label>
                                                    <select
                                                        className={selectClass}
                                                        value={data.R_ESTATUS_BRAF}
                                                        onChange={(e) => setData('R_ESTATUS_BRAF', e.target.value)}
                                                    >
                                                        <option value="">Selecciona</option>
                                                        <option value="NO APLICA">NO APLICA</option>
                                                        <option value="MUTADO">MUTADO</option>
                                                        <option value="MUTADO (VER NOTAS)">MUTADO (VER NOTAS)</option>
                                                        <option value="NO MUTADO (VER NOTAS)">NO MUTADO (VER NOTAS)</option>
                                                        <option value="NO MUTADO">NO MUTADO</option>
                                                        <option value="INVALIDO">INVALIDO</option>
                                                        <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Genotipo B-RAF</label>
                                                    <select
                                                        className={selectClass}
                                                        value={data.R_GENOTIPO_BRAF}
                                                        onChange={(e) => setData('R_GENOTIPO_BRAF', e.target.value)}
                                                    >
                                                        <option value="">Selecciona</option>
                                                        <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                        <option value="NO APLICA">NO APLICA</option>
                                                        <option value="INVALIDO">INVALIDO</option>
                                                        <option value="NINGUNA">NINGUNA</option>
                                                        <option value="V600D (c.1799_1800delinsAT; c.1799_1800delinsAC)">V600D (c.1799_1800delinsAT; c.1799_1800delinsAC)</option>
                                                        <option value="V600E (c.1799T&gt;A)">V600E (c.1799T&gt;A)</option>
                                                        <option value="V600E/D (c.1799T&gt;A; c.1799_1800delinsAA; c.1799_1800delinsAC)">V600E/D (c.1799T&gt;A; c.1799_1800delinsAA; c.1799_1800delinsAC)</option>
                                                        <option value="V600E2 (c.1799_1800delinsAA)">V600E2 (c.1799_1800delinsAA)</option>
                                                        <option value="V600K (c.1798_1799delinsAA)">V600K (c.1798_1799delinsAA)</option>
                                                        <option value="V600K/R (c.1798_1799delinsAA / c.1798_1799delinsAG)">V600K/R (c.1798_1799delinsAA / c.1798_1799delinsAG)</option>
                                                        <option value="V600M (c.1798G&gt;A)">V600M (c.1798G&gt;A)</option>
                                                        <option value="V600R (c.1798_1799delinsAG)">V600R (c.1798_1799delinsAG)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resultados y documentación */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Resultados y Documentación</h3>
                        
                        <div className="space-y-6">
                            {/* Resultado Histopatológico - Solo para no sangre total */}
                            {!esSangreTotal && (
                                <div>
                                    <label className={labelClass}>Resultado Histopatológico</label>
                                    <textarea
                                        className={textareaClass}
                                        rows={8}
                                        value={data.R_RESULTADO_HISTOPATOLOGICO || ''}
                                        onChange={(e) => setData('R_RESULTADO_HISTOPATOLOGICO', e.target.value)}
                                        placeholder="Ingrese el resultado histopatológico..."
                                    />
                                </div>
                            )}

                            {/* Notas del estudio */}
                            <div>
                                <label className={labelClass}>Notas (Visibles en el reporte)</label>
                                <textarea
                                    className={textareaClass}
                                    rows={10}
                                    value={data.ESTUDIO_NOTAS || ''}
                                    onChange={(e) => setData('ESTUDIO_NOTAS', e.target.value)}
                                    placeholder="Ingrese las notas del estudio..."
                                />
                            </div>

                            {/* Comentarios del estudio */}
                            <div>
                                <label className={labelClass}>Comentarios (Visible solo para cliente)</label>
                                <textarea
                                    className={textareaClass}
                                    rows={8}
                                    value={data.ESTUDIO_COMENTARIOS || ''}
                                    onChange={(e) => setData('ESTUDIO_COMENTARIOS', e.target.value)}
                                    placeholder="Ingrese comentarios del estudio..."
                                />
                            </div>

                            {/* Checkbox resultados completos */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="resultadosCompletos"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={data.R_COMPLETOS}
                                    onChange={(e) => setData('R_COMPLETOS', e.target.checked)}
                                />
                                <label htmlFor="resultadosCompletos" className="ml-2 block text-sm text-gray-900">
                                    Resultados Completos
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Botones de navegación */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between">
                            <Button 
                                type="button"
                                variant="outline" 
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={handleSaveAndExit}
                                disabled={processing}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Guardar y Salir
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleSave}
                                    disabled={processing}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Solo Guardar
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                    onClick={handleNext}
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