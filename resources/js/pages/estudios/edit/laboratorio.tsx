import { useState, useRef, useCallback, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Save, Eye, FileText, FlaskConical } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { type BreadcrumbItem } from '@/types';

interface EditLaboratorioProps {
    estudio: {
        ID: number;
        CLAVE_INTERNA: string;
        MUESTRA_TIPO: string;
        R_ESTUDIO_SOLICITADO: string;
        R_ADECUADO_PROCESAMIENTO: string;
        R_COMPLETOS: string;
        R_METODO_PROCESO: string;
        R_OTRO_METODO_PROCESO?: string;
        R_ESTATUS_KRAS: string;
        R_ESTATUS_NRAS: string;
        R_ESTATUS_BRAF: string;
        R_GENOTIPO_KRAS: string;
        R_GENOTIPO_NRAS: string;
        R_GENOTIPO_BRAF: string;
        R_PRESERVACION_H_E?: string;
        R_NUMERO_CELULAS_TUMORALES?: string;
        R_AREA_TUMORAL?: string;
        R_PORCENTAJE_TUMOR_TEJIDO?: string;
        R_RAZON_ADECUADO_PROCESAMIENTO?: string;
        R_RESULTADO_HISTOPATOLOGICO?: string;
        ESTUDIO_NOTAS?: string;
        ESTUDIO_COMENTARIOS?: string;
        FECHA_RECEPCION_LABORATORIO?: string;
        FECHA_OBTENCION_RESULTADOS?: string;
        MUESTRA_LIQ_CONDICION?: string;
        MUESTRA_LIQ_CONDICION_PRESENCIA?: string;
        MUESTRA_LIQ_CANTIDAD_ADECUADA?: string;
        MUESTRA_LIQ_CANTIDAD_ML?: string;
        MUESTRA_LIQ_HEMOLISIS?: string;
        MUESTRA_LIQ_AMP_INDICACION?: string;
        MUESTRA_LIQ_AMP_RAZON?: string;
    };
    [key: string]: any;
}
interface GenotipoOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface CamposSangreTotal {
    condicion: string;
    condicionPresencia: string;
    cantidadAdecuada: string;
    cantidadMl: string;
    hemolisis: string;
    ampIndicacion: string;
    ampRazon: string;
}

export default function EditLaboratorioConCondicionales() {
    const { estudio } = usePage<EditLaboratorioProps>().props;
    // Este log no funciona por que ??

    // Referencias para inputs simples - no causan re-renders
    const formRef = useRef<HTMLFormElement>(null);

    // Estado para react Quill
    const [notasContent, setNotasContent] = useState('');
    
    // Estado para processing y campos que requieren reactividad
    const [processing, setProcessing] = useState(false);
    const [estudiosSeleccionados, setEstudiosSeleccionados] = useState(estudio.R_ESTUDIO_SOLICITADO || '');
    const [adecuadoProcesamiento, setAdecuadoProcesamiento] = useState(estudio.R_ADECUADO_PROCESAMIENTO || '');
    const [resultadosCompletos, setResultadosCompletos] = useState(estudio.R_COMPLETOS === 'si');
    const [metodoSeleccionado, setMetodoSeleccionado] = useState(estudio.R_METODO_PROCESO || '');

    const [camposSangreTotal, setCamposSangreTotal] = useState({
        condicion: estudio.MUESTRA_LIQ_CONDICION || '',
        condicionPresencia: estudio.MUESTRA_LIQ_CONDICION_PRESENCIA || '',
        cantidadAdecuada: estudio.MUESTRA_LIQ_CANTIDAD_ADECUADA || '',
        cantidadMl: estudio.MUESTRA_LIQ_CANTIDAD_ML || '',
        hemolisis: estudio.MUESTRA_LIQ_HEMOLISIS || '',
        ampIndicacion: estudio.MUESTRA_LIQ_AMP_INDICACION || '',
        ampRazon: estudio.MUESTRA_LIQ_AMP_RAZON || ''
    });

    // Estados para los estatus mutacionales - NUEVO
    const [estatusKRAS, setEstatusKRAS] = useState(estudio.R_ESTATUS_KRAS || '');
    const [estatusNRAS, setEstatusNRAS] = useState(estudio.R_ESTATUS_NRAS || '');
    const [estatusBRAF, setEstatusBRAF] = useState(estudio.R_ESTATUS_BRAF || '');
    // Estados para los genotipos
    const [genotipoKRAS, setGenotipoKRAS] = useState(estudio.R_GENOTIPO_KRAS || '');
    const [genotipoNRAS, setGenotipoNRAS] = useState(estudio.R_GENOTIPO_NRAS || '');
    const [genotipoBRAF, setGenotipoBRAF] = useState(estudio.R_GENOTIPO_BRAF || '');

    // Configuración React Quill
    const quillModules = {
        toolbar: [
            ['bold', 'italic']
        ]
    };

    const quillFormats = ['bold', 'italic'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Estudios', href: '/estudios' },
        { title: `${estudio.CLAVE_INTERNA}`, href: `/estudios/${estudio.ID}` },
        { title: 'Laboratorio', href: `/estudios/${estudio.ID}/edit/laboratorio` },
    ];

    // Función para obtener fecha y hora actuales
    const getCurrentDateTime = (): { fecha: string; hora: string } => {
        const now = new Date();
        const fecha = now.toISOString().split('T')[0];
        const hora = now.toTimeString().slice(0, 5);
        return { fecha, hora };
    };

    // Preparar fechas y horas iniciales
    const fechaRecepcionInicial = estudio.FECHA_RECEPCION_LABORATORIO ? 
        estudio.FECHA_RECEPCION_LABORATORIO.split('T')[0] : '';
    const horaRecepcionInicial = estudio.FECHA_RECEPCION_LABORATORIO ? 
        estudio.FECHA_RECEPCION_LABORATORIO.split('T')[1].substring(0, 5) : '';
    
    // Para fecha de resultados: usar valores existentes si los hay, o vacío si no están completos
    const fechaResultadosInicial = (estudio.FECHA_OBTENCION_RESULTADOS && resultadosCompletos) ? 
        estudio.FECHA_OBTENCION_RESULTADOS.split('T')[0] : '';
    const horaResultadosInicial = (estudio.FECHA_OBTENCION_RESULTADOS && resultadosCompletos) ? 
        estudio.FECHA_OBTENCION_RESULTADOS.split('T')[1].substring(0, 5) : '';

    // LÓGICA CONDICIONAL - Ahora usa estado reactivo para estudiosSeleccionados
    const esSangreTotal = estudio.MUESTRA_TIPO === 'Sangre total';

    const getNotasDefault = (): string => {
        let notasDefault = 'La mutación de KRAS como biomarcador en cáncer del tubo digestivo para la administración de agentes anti-EGFR sólo esta avalada en adenocarcinomas primarios de colon y recto, y cuando estos estén en estadio metastásico. Su empleo en otros contextos puede no estar indicado.';
        
        if (esSangreTotal) {
            notasDefault += '\n\nLa determinación de mutaciones en RAS mediante biopsia líquida, dada una menor sensibilidad que la determinación en tejido, no está aún avalada para diagnóstico o como un biomarcador para determinación de recurrencia durante el seguimiento del paciente. La posibilidad de falsos negativos incrementa si no se siguen las recomendaciones sobre el estatus del paciente al momento de la toma de la muestra.';
        }
        
        return notasDefault;
    };
    const estudiosIncluyen = (tipoEstudio: string): boolean => {
        return estudiosSeleccionados.includes(tipoEstudio);
    };
    
    const mostrarKRAS = estudiosIncluyen('K-RAS');
    const mostrarNRAS = estudiosIncluyen('N-RAS');
    const mostrarBRAF = estudiosIncluyen('B-RAF');
    
    // Determinar método por defecto según tipo de muestra
    const metodoDefecto = esSangreTotal 
        ? 'PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis'
        : 'PCR en tiempo real, FFPE sistema, IDYLLA Biocartis';
    
    // Inicializar método si está vacío
    useEffect(() => {
        if (!metodoSeleccionado) {
            setMetodoSeleccionado(metodoDefecto);
        }
    }, [metodoDefecto, metodoSeleccionado]);
    
    const mostrarOtroMetodo = metodoSeleccionado === 'Otro';
    
    const mostrarCondicionPresencia = camposSangreTotal.condicion === 'condiciones inadecuadas por la presencia de ';

    
    // Mostrar razón de procesamiento si el valor es subóptima, inadecuada o no es procesable
    const mostrarRazonProcesamiento = ['subóptima', 'inadecuada'].includes(adecuadoProcesamiento);

    const autoSelectIfSingleOption = (options: GenotipoOption[]): string => {
        const availableOptions = options.filter(opt => !opt.disabled && opt.value !== '');
        return availableOptions.length === 1 ? availableOptions[0].value : '';
    };

    // Funciones para determinar qué opciones están habilitadas en los genotipos
    const getGenotipoOptions = (estatus: string): GenotipoOption[] => {
        const baseOptions: GenotipoOption[] = [
            { value: 'NO PROCESABLE', label: 'NO PROCESABLE' },
            { value: 'NO APLICA', label: 'NO APLICA' },
            { value: 'INVALIDO', label: 'INVALIDO' },
            { value: 'NINGUNA', label: 'NINGUNA' }
        ];

        switch (estatus) {
            case 'NO APLICA':
                return baseOptions.map(opt => ({...opt, disabled: opt.value !== 'NO APLICA'}));
            case 'NO PROCESABLE':
                return baseOptions.map(opt => ({...opt, disabled: opt.value !== 'NO PROCESABLE'}));
            case 'INVALIDO':
                return baseOptions.map(opt => ({...opt, disabled: opt.value !== 'INVALIDO'}));
            case 'NO MUTADO':
            case 'NO MUTADO (VER NOTAS)':
                return baseOptions.map(opt => ({...opt, disabled: opt.value !== 'NINGUNA'}));
            case 'MUTADO':
            case 'MUTADO (VER NOTAS)':
                return baseOptions.map(opt => ({
                    ...opt, 
                    disabled: ['NO APLICA', 'NO PROCESABLE', 'INVALIDO', 'NINGUNA'].includes(opt.value)
                }));
            default:
                return baseOptions.map(opt => ({...opt, disabled: true}));
        }
    };

    // Opciones específicas de genes para cada tipo
    const getKRASGeneOptions = (): GenotipoOption[] => [
        { value: "G12C (c.34G>T)", label: "G12C (c.34G>T)" },
        { value: "G12R (c.34G>C)", label: "G12R (c.34G>C)" },
        { value: "G12S (c.34G>A)", label: "G12S (c.34G>A)" },
        { value: "G12A (c.35G>C)", label: "G12A (c.35G>C)" },
        { value: "G12D (c.35G>A)", label: "G12D (c.35G>A)" },
        { value: "G12V (c.35G>T)", label: "G12V (c.35G>T)" },
        { value: "G13D (c.38G>A)", label: "G13D (c.38G>A)" },
        { value: "A59E (c.176C>A)", label: "A59E (c.176C>A)" },
        { value: "A59G (c.176C>G)", label: "A59G (c.176C>G)" },
        { value: "A59T (c.175G>A)", label: "A59T (c.175G>A)" },
        { value: "A59T/E/G (c.175G>A / c.176C>A / c.176C>G)", label: "A59T/E/G (c.175G>A / c.176C>A / c.176C>G)" },
        { value: "Q61K (c.181C>A; c.180_181TC>AA)", label: "Q61K (c.181C>A; c.180_181TC>AA)" },
        { value: "Q61L (c.182A>T)", label: "Q61L (c.182A>T)" },
        { value: "Q61R (c.182A>G)", label: "Q61R (c.182A>G)" },
        { value: "Q61R/L (c.182A>G / c.182A>T)", label: "Q61R/L (c.182A>G / c.182A>T)" },
        { value: "Q61H (c.183A>C; c.183A>T)", label: "Q61H (c.183A>C; c.183A>T)" },
        { value: "K117N (c.351A>C; c.351A>T)", label: "K117N (c.351A>C; c.351A>T)" },
        { value: "A146P (c.436G>C)", label: "A146P (c.436G>C)" },
        { value: "A146T (c.436G>A)", label: "A146T (c.436G>A)" },
        { value: "A146P/T/V (c.436G>C / c.436G>A / c.437C>T)", label: "A146P/T/V (c.436G>C / c.436G>A / c.437C>T)" }
    ];

    const getNRASGeneOptions = (): GenotipoOption[] => [
        { value: "G12C (c.34G>T)", label: "G12C (c.34G>T)" },
        { value: "G12S (c.34G>A)", label: "G12S (c.34G>A)" },
        { value: "G12A (c.35G>C)", label: "G12A (c.35G>C)" },
        { value: "G12A (c.35G>C) / G12V (c.35G>T)", label: "G12A (c.35G>C) / G12V (c.35G>T)" },
        { value: "G12D (c.35G>A)", label: "G12D (c.35G>A)" },
        { value: "G12V (c.35G>T)", label: "G12V (c.35G>T)" },
        { value: "G13D (c.38G>A)", label: "G13D (c.38G>A)" },
        { value: "G13V (c.38G>T)", label: "G13V (c.38G>T)" },
        { value: "G13R (c.37G>C)", label: "G13R (c.37G>C)" },
        { value: "G13R/V (c.37G>C / c.38G>T)", label: "G13R/V (c.37G>C / c.38G>T)" },
        { value: "A59T (c.175G>A)", label: "A59T (c.175G>A)" },
        { value: "Q61K (c.181C>A)", label: "Q61K (c.181C>A)" },
        { value: "Q61L (c.182A>T)", label: "Q61L (c.182A>T)" },
        { value: "Q61R (c.182A>G)", label: "Q61R (c.182A>G)" },
        { value: "Q61R/K (c.182A>G / c.181C>A)", label: "Q61R/K (c.182A>G / c.181C>A)" },
        { value: "Q61H (c.183A>C; c.183A>T)", label: "Q61H (c.183A>C; c.183A>T)" },
        { value: "K117N (c.351G>C; c.351G>T)", label: "K117N (c.351G>C; c.351G>T)" },
        { value: "A146V (c.437C>T)", label: "A146V (c.437C>T)" },
        { value: "A146T (c.436G>A)", label: "A146T (c.436G>A)" }
    ];

    const getBRAFGeneOptions = (): GenotipoOption[] => [
        { value: "V600D (c.1799_1800delinsAT; c.1799_1800delinsAC)", label: "V600D (c.1799_1800delinsAT; c.1799_1800delinsAC)" },
        { value: "V600E (c.1799T>A)", label: "V600E (c.1799T>A)" },
        { value: "V600E/D (c.1799T>A; c.1799_1800delinsAA; c.1799_1800delinsAC)", label: "V600E/D (c.1799T>A; c.1799_1800delinsAA; c.1799_1800delinsAC)" },
        { value: "V600E2 (c.1799_1800delinsAA)", label: "V600E2 (c.1799_1800delinsAA)" },
        { value: "V600K (c.1798_1799delinsAA)", label: "V600K (c.1798_1799delinsAA)" },
        { value: "V600K/R (c.1798_1799delinsAA / c.1798_1799delinsAG)", label: "V600K/R (c.1798_1799delinsAA / c.1798_1799delinsAG)" },
        { value: "V600M (c.1798G>A)", label: "V600M(c.1798G>A)" },
        { value: "V600R (c.1798_1799delinsAG)", label: "V600R (c.1798_1799delinsAG)" }
    ];

    // Función para obtener todas las opciones de genotipo según el estatus
    const getAllGenotipoOptions = (estatus: string, geneOptions: GenotipoOption[]) => {
        const baseOptions = getGenotipoOptions(estatus);
        
        if (estatus === 'MUTADO' || estatus === 'MUTADO (VER NOTAS)') {
            return [
                ...baseOptions,
                ...geneOptions.map(opt => ({...opt, disabled: false}))
            ];
        }
        
        return baseOptions;
    };

    const handleCampoSangreTotalChange = (campo: keyof CamposSangreTotal, valor: string) => {
        setCamposSangreTotal(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Inicializar contenido de notas
    useEffect(() => {
        if (!notasContent) {
            setNotasContent(estudio.ESTUDIO_NOTAS || getNotasDefault());
        }
    }, [estudio.ESTUDIO_NOTAS, notasContent]);

    // Manejadores de eventos
    const handleEstudioSolicitadoChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const nuevoEstudio = e.target.value;
        console.log('🔄 Cambiando estudio solicitado de:', estudiosSeleccionados, 'a:', nuevoEstudio);
        setEstudiosSeleccionados(nuevoEstudio);
    };

    const handleAdecuadoProcesamientoChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const nuevoValor = e.target.value;
        console.log('🔄 Cambiando adecuado procesamiento de:', adecuadoProcesamiento, 'a:', nuevoValor);
        setAdecuadoProcesamiento(nuevoValor);
    };

    const handleMetodoProcesoChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const nuevoMetodo = e.target.value;
        console.log('🔄 Cambiando método de proceso de:', metodoSeleccionado, 'a:', nuevoMetodo);
        setMetodoSeleccionado(nuevoMetodo);
    };

    // NUEVOS MANEJADORES - Para estatus mutacionales
    const handleEstatusKRASChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const nuevoEstatus = e.target.value;
        setEstatusKRAS(nuevoEstatus);
        
        const options = getAllGenotipoOptions(nuevoEstatus, getKRASGeneOptions());
        const autoSelected = autoSelectIfSingleOption(options);
        setGenotipoKRAS(autoSelected);
    };

    const handleEstatusNRASChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const nuevoEstatus = e.target.value;
        setEstatusNRAS(nuevoEstatus);
        
        const options = getAllGenotipoOptions(nuevoEstatus, getNRASGeneOptions());
        const autoSelected = autoSelectIfSingleOption(options);
        setGenotipoNRAS(autoSelected);
    };

    const handleEstatusBRAFChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const nuevoEstatus = e.target.value;
        setEstatusBRAF(nuevoEstatus);
        
        const options = getAllGenotipoOptions(nuevoEstatus, getBRAFGeneOptions());
        const autoSelected = autoSelectIfSingleOption(options);
        setGenotipoBRAF(autoSelected);
    };

    
    const handleResultadosCompletosChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const isChecked = e.target.checked;
    setResultadosCompletos(isChecked);
    
    if (isChecked) {
        const { fecha, hora } = getCurrentDateTime();
        const form = formRef.current;
        if (form) {
            const fechaInput = form.querySelector('[name="FECHA_OBTENCION_RESULTADOS"]') as HTMLInputElement;
            const horaInput = form.querySelector('[name="HORA_OBTENCION_RESULTADOS"]') as HTMLInputElement;
            if (fechaInput) fechaInput.value = fecha;
            if (horaInput) horaInput.value = hora;
        }
    } else {
        const form = formRef.current;
        if (form) {
            const fechaInput = form.querySelector('[name="FECHA_OBTENCION_RESULTADOS"]') as HTMLInputElement;
            const horaInput = form.querySelector('[name="HORA_OBTENCION_RESULTADOS"]') as HTMLInputElement;
            if (fechaInput) fechaInput.value = '';
            if (horaInput) horaInput.value = '';
        }
    }
};

    // Función para obtener datos del formulario
const getFormData = useCallback((): Record<string, any> => {
    if (!formRef.current) return {};
    
    const formData = new FormData(formRef.current);
    const data: Record<string, any> = {};
    
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Agregar valores de estado para genotipos
    data.R_GENOTIPO_KRAS = genotipoKRAS;
    data.R_GENOTIPO_NRAS = genotipoNRAS;
    data.R_GENOTIPO_BRAF = genotipoBRAF;

    // Agregar valores de sangre total
    if (esSangreTotal) {
        data.MUESTRA_LIQ_CONDICION = camposSangreTotal.condicion;
        data.MUESTRA_LIQ_CONDICION_PRESENCIA = camposSangreTotal.condicionPresencia;
        data.MUESTRA_LIQ_CANTIDAD_ADECUADA = camposSangreTotal.cantidadAdecuada;
        data.MUESTRA_LIQ_CANTIDAD_ML = camposSangreTotal.cantidadMl;
        data.MUESTRA_LIQ_HEMOLISIS = camposSangreTotal.hemolisis;
        data.MUESTRA_LIQ_AMP_INDICACION = camposSangreTotal.ampIndicacion;
        data.MUESTRA_LIQ_AMP_RAZON = camposSangreTotal.ampRazon;
    }

    // Resto del código existente...
    data.R_COMPLETOS = resultadosCompletos ? 'si' : 'no';
    data.ESTUDIO_NOTAS = notasContent;

    if (!resultadosCompletos) {
        data.FECHA_OBTENCION_RESULTADOS = null;
        data.HORA_OBTENCION_RESULTADOS = null;
    }

    const fechaRecepcion = data.FECHA_RECEPCION_LABORATORIO as string;
    const horaRecepcion = data.HORA_RECEPCION_LABORATORIO as string;
    if (fechaRecepcion && horaRecepcion) {
        data.FECHA_RECEPCION_LABORATORIO = fechaRecepcion + ' ' + horaRecepcion + ':00';
    }

    return data;
}, [resultadosCompletos, genotipoKRAS, genotipoNRAS, genotipoBRAF, notasContent, camposSangreTotal, esSangreTotal]);


    // Clases CSS compartidas
    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent bg-white text-black text-base";
    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent bg-white text-black text-base";
    const textareaClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent bg-white resize-none text-black text-base";
    const labelClass = "block text-base font-medium mb-1 text-black";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Estudio - ${estudio.CLAVE_INTERNA} - Laboratorio`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header con información del estudio y progreso */}
                    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                        {/* Header principal */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <FlaskConical className="h-6 w-6 text-[#189BAF] flex-shrink-0" />
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                                    {estudio.CLAVE_INTERNA}
                                </h1>
                            </div>
                            
                            <Link href={`/estudios/${estudio.ID}`}>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Estudio
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Pasos del proceso - Versión desktop */}
                        <div className="hidden lg:block mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 w-full">
                                    <Badge variant="outline">1. Recolección</Badge>
                                    <div className="w-8 h-0.5 bg-gray-300"></div>
                                    <Badge variant="outline">2. Recepción</Badge>
                                    <div className="w-8 h-0.5 bg-gray-300"></div>
                                    <Badge className="bg-[#189BAF] text-white">3. Laboratorio</Badge>
                                    <div className="w-8 h-0.5 bg-gray-300"></div>
                                    <Badge variant="outline">4. Informe</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Pasos del proceso - Versión tablet */}
                        <div className="hidden sm:block lg:hidden mb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">1. Recolección</Badge>
                                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                                    <Badge variant="outline" className="text-xs">2. Recepción</Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge className="bg-[#189BAF] text-white text-xs">3. Laboratorio</Badge>
                                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                                    <Badge variant="outline" className="text-xs">4. Informe</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Pasos del proceso - Versión móvil */}
                        <div className="block sm:hidden mb-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">1. Recolección</Badge>
                                    <span className="text-xs text-gray-500">Completado</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">2. Recepción</Badge>
                                    <span className="text-xs text-gray-500">Completado</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-[#189BAF] text-white text-xs">3. Laboratorio</Badge>
                                    <span className="text-xs text-[#189BAF] font-medium">En proceso</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">4. Informe</Badge>
                                    <span className="text-xs text-gray-400">Pendiente</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Barra de progreso */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Progreso del estudio</span>
                                <span className="text-sm text-gray-500">75%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-[#189BAF] h-2 rounded-full transition-all duration-300 ease-in-out" 
                                    style={{ width: '75%' }}
                                ></div>
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
                                <div className={`grid grid-cols-2 gap-4 transition-opacity duration-200 ${!resultadosCompletos ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha {!resultadosCompletos && '(Oculto)'}
                                        </label>
                                        <input
                                            type="date"
                                            name="FECHA_OBTENCION_RESULTADOS"
                                            defaultValue={fechaResultadosInicial}
                                            disabled={!resultadosCompletos}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${!resultadosCompletos ? 'bg-gray-100' : ''}`}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hora {!resultadosCompletos && '(Oculto)'}
                                        </label>
                                        <input
                                            type="time"
                                            name="HORA_OBTENCION_RESULTADOS"
                                            defaultValue={horaResultadosInicial}
                                            disabled={!resultadosCompletos}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#189BAF] focus:border-transparent ${!resultadosCompletos ? 'bg-gray-100' : ''}`}
                                        />
                                    </div>
                                </div>
                                {!resultadosCompletos && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Los campos de fecha y hora se habilitarán al marcar "Resultados Completos"
                                    </p>
                                )}
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
                                        value={metodoSeleccionado}
                                        onChange={handleMetodoProcesoChange}
                                    >
                                        {esSangreTotal ? (
                                            <option value="PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis">
                                                PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis
                                            </option>
                                        ) : (
                                            <option value="PCR en tiempo real, FFPE sistema, IDYLLA Biocartis">
                                                PCR en tiempo real, FFPE sistema, IDYLLA Biocartis
                                            </option>
                                        )}
                                        <option value="Otro">Otro</option>
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
                                                value={camposSangreTotal.condicion}
                                                onChange={(e) => handleCampoSangreTotalChange('condicion', e.target.value)}
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="buenas condiciones">buenas condiciones</option>
                                                <option value="condiciones inadecuadas por la presencia de ">condiciones inadecuadas por la presencia de</option>
                                            </select>
                                        </div>

                                        {/* Campo condicional actualizado */}
                                        {camposSangreTotal.condicion === 'condiciones inadecuadas por la presencia de ' && (
                                            <div>
                                                <label className={labelClass}>condiciones inadecuadas por la presencia de:</label>
                                                <input
                                                    type="text"
                                                    name="MUESTRA_LIQ_CONDICION_PRESENCIA"
                                                    className={inputClass}
                                                    value={camposSangreTotal.condicionPresencia}
                                                    onChange={(e) => handleCampoSangreTotalChange('condicionPresencia', e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className={labelClass}>Cantidad de sangre total recibida</label>
                                            <select
                                                name="MUESTRA_LIQ_CANTIDAD_ADECUADA"
                                                className={selectClass}
                                                value={camposSangreTotal.cantidadAdecuada}
                                                onChange={(e) => handleCampoSangreTotalChange('cantidadAdecuada', e.target.value)}
                                            >
                                                <option value="">Selecciona</option>
                                                <option value="es la adecuada,">es la adecuada,</option>
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
                                                    value={camposSangreTotal.cantidadMl}
                                                    onChange={(e) => handleCampoSangreTotalChange('cantidadMl', e.target.value)}
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
                                                value={camposSangreTotal.hemolisis}
                                                onChange={(e) => handleCampoSangreTotalChange('hemolisis', e.target.value)}
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
                                                value={camposSangreTotal.ampIndicacion}
                                                onChange={(e) => handleCampoSangreTotalChange('ampIndicacion', e.target.value)}
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
                                                value={camposSangreTotal.ampRazon}
                                                onChange={(e) => handleCampoSangreTotalChange('ampRazon', e.target.value)}
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
                                            <label className={labelClass}>Número de Células Tumorales</label>
                                            <input
                                                type="number"
                                                name="R_NUMERO_CELULAS_TUMORALES"
                                                className={inputClass}
                                                defaultValue={estudio.R_NUMERO_CELULAS_TUMORALES || ''}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Área tumoral</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    name="R_AREA_TUMORAL"
                                                    className={`${inputClass} pr-12`}
                                                    defaultValue={estudio.R_AREA_TUMORAL || ''}
                                                />
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                                                    mm²
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Porcentaje de Tumor en el tejido</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="R_PORCENTAJE_TUMOR_TEJIDO"
                                                    className={`${inputClass} pr-12`}
                                                    defaultValue={estudio.R_PORCENTAJE_TUMOR_TEJIDO || ''}
                                                />
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                                                    %
                                                </span>
                                            </div>
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
                                                    rows={12}
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
                                                    value={estatusKRAS}
                                                    onChange={handleEstatusKRASChange}
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
                                                    value={genotipoKRAS}
                                                    onChange={(e) => setGenotipoKRAS(e.target.value)}
                                                >
                                                    <option value=""></option>
                                                    {getAllGenotipoOptions(estatusKRAS, getKRASGeneOptions()).map((option, index) => (
                                                        <option 
                                                            key={index} 
                                                            value={option.value} 
                                                            disabled={option.disabled}
                                                            className={option.disabled ? 'text-gray-400 bg-gray-100' : ''}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ))}
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
                                                    value={estatusNRAS}
                                                    onChange={handleEstatusNRASChange}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="NO APLICA">NO APLICA</option>
                                                    <option value="NO MUTADO">NO MUTADO</option>
                                                    <option value="NO MUTADO (VER NOTAS)">NO MUTADO (VER NOTAS)</option>
                                                    <option value="MUTADO">MUTADO</option>
                                                    <option value="MUTADO (VER NOTAS)">MUTADO (VER NOTAS)</option>
                                                    <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                    <option value="INVALIDO">INVALIDO</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Genotipo N-RAS</label>
                                                <select
                                                    name="R_GENOTIPO_NRAS"
                                                    className={selectClass}
                                                    value={genotipoNRAS}
                                                    onChange={(e) => setGenotipoNRAS(e.target.value)}
                                                >
                                                    <option value=""></option>
                                                    {getAllGenotipoOptions(estatusNRAS, getNRASGeneOptions()).map((option, index) => (
                                                        <option 
                                                            key={index} 
                                                            value={option.value} 
                                                            disabled={option.disabled}
                                                            className={option.disabled ? 'text-gray-400 bg-gray-100' : ''}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ))}
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
                                                    value={estatusBRAF}
                                                    onChange={handleEstatusBRAFChange}
                                                >
                                                    <option value="">Selecciona</option>
                                                    <option value="NO APLICA">NO APLICA</option>
                                                    <option value="NO MUTADO">NO MUTADO</option>
                                                    <option value="NO MUTADO (VER NOTAS)">NO MUTADO (VER NOTAS)</option>
                                                    <option value="MUTADO">MUTADO</option>
                                                    <option value="MUTADO (VER NOTAS)">MUTADO (VER NOTAS)</option>
                                                    <option value="NO PROCESABLE">NO PROCESABLE</option>
                                                    <option value="INVALIDO">INVALIDO</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Genotipo B-RAF</label>
                                                <select
                                                    name="R_GENOTIPO_BRAF"
                                                    className={selectClass}
                                                    value={genotipoBRAF}
                                                    onChange={(e) => setGenotipoBRAF(e.target.value)}
                                                >
                                                    <option value=""></option>
                                                    {getAllGenotipoOptions(estatusBRAF, getBRAFGeneOptions()).map((option, index) => (
                                                        <option 
                                                            key={index} 
                                                            value={option.value} 
                                                            disabled={option.disabled}
                                                            className={option.disabled ? 'text-gray-400 bg-gray-100' : ''}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ))}
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
                                        rows={12}
                                        defaultValue={estudio.R_RESULTADO_HISTOPATOLOGICO || ''}
                                        placeholder="Ingrese el resultado histopatológico..."
                                    />
                                </div>
                            )}

                            {/* Notas del estudio */}
                            <div>
                                <label className={labelClass}>Notas (Visibles en el reporte)</label>
                                <div className="border border-gray-300 rounded-md">
                                    <ReactQuill
                                        theme="snow"
                                        value={notasContent}
                                        onChange={setNotasContent}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        style={{
                                            height: '500px',
                                            marginBottom: '42px'
                                        }}
                                        placeholder="Ingrese las notas del estudio..."
                                    />
                                </div>
                            </div>

                            {/* Comentarios del estudio */}
                            <div>
                                <label className={labelClass}>Comentarios (Visible solo para cliente)</label>
                                <textarea
                                    name="ESTUDIO_COMENTARIOS"
                                    className={textareaClass}
                                    rows={12}
                                    defaultValue={estudio.ESTUDIO_COMENTARIOS || ''}
                                    placeholder="Ingrese comentarios del estudio..."
                                />
                            </div>

                            {/* Checkbox resultados completos */}
                            <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <input
                                    type="checkbox"
                                    name="R_COMPLETOS"
                                    id="resultadosCompletos"
                                    className="h-4 w-4 text-[#189BAF] focus:ring-[#189BAF] border-gray-300 rounded"
                                    checked={resultadosCompletos}
                                    onChange={handleResultadosCompletosChange}
                                />
                                <label htmlFor="resultadosCompletos" className="ml-2 block text-sm text-gray-900 font-medium">
                                    Resultados Completos
                                </label>
                                <span className="ml-2 text-sm text-gray-600">
                                    (Al marcar se establecerá la fecha y hora de obtención de resultados)
                                </span>
                            </div>
                        </div>
                    </div>

                   {/* Botones de navegación */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        {/* Versión Desktop */}
                        <div className="hidden md:flex justify-between">
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

                        {/* Versión Tablet */}
                        <div className="hidden sm:flex md:hidden flex-col gap-3">
                            {/* Primera fila */}
                            <div className="flex gap-2">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={() => router.visit(`/estudios/${estudio.ID}/edit/recepcion`)}
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Anterior
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white flex-1"
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
                            {/* Segunda fila */}
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
                                    className="bg-blue-600 text-white hover:bg-blue-700 flex-1"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Solo Guardar
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="bg-red-600 text-white hover:bg-red-700 flex-1"
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
                        </div>

                        {/* Versión Móvil */}
                        <div className="flex sm:hidden flex-col gap-3">
                            {/* Botón principal más prominente */}
                            <Button
                                type="button"
                                className="bg-yellow-600 hover:bg-yellow-700 text-white w-full py-3"
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
                            
                            {/* Grid de botones secundarios */}
                            <div className="grid grid-cols-2 gap-2">
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
                                    className="bg-blue-600 text-white hover:bg-blue-700 text-sm py-2"
                                >
                                    <Save className="h-4 w-4 mr-1" />
                                    Guardar
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={() => router.visit(`/estudios/${estudio.ID}/edit/recepcion`)}
                                    disabled={processing}
                                    className="text-sm py-2"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Anterior
                                </Button>
                            </div>
                            
                            {/* Botón de salir en línea separada para mayor visibilidad */}
                            <Button 
                                type="button"
                                variant="outline" 
                                className="bg-red-600 text-white hover:bg-red-700 w-full"
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
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}