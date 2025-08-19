import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, TestTube, Activity, FileText, Dna } from 'lucide-react';

interface FormularioLaboratorioProps {
    estudio: any;
    onDataChange: (data: any) => void;
    errors?: Partial<Record<string, string>>;
}

const ESTUDIOS_SOLICITADOS = [
    'K-RAS',
    'N-RAS',
    'B-RAF',
    'K-RAS y N-RAS',
    'K-RAS y B-RAF',
    'N-RAS y B-RAF',
    'K-RAS, N-RAS y B-RAF'
];

const ESTATUS_MUTACIONAL = [
    'NO MUTADO',
    'NO MUTADO (VER NOTAS)',
    'MUTADO',
    'MUTADO (VER NOTAS)',
    'NO PROCESABLE',
    'INVALIDO',
    'NO APLICA'
];

const GENOTIPOS_KRAS = [
    'NO PROCESABLE',
    'NO APLICA',
    'INVALIDO',
    'NINGUNA',
    'G12C (c.34G>T)',
    'G12R (c.34G>C)',
    'G12S (c.34G>A)',
    'G12A (c.35G>C)',
    'G12D (c.35G>A)',
    'G12V (c.35G>T)',
    'G13D (c.38G>A)',
    'A59E (c.176C>A)',
    'A59G (c.176C>G)',
    'A59T (c.175G>A)',
    'A59T/E/G (c.175G>A / c.176C>A / c.176C>G)',
    'Q61K (c.181C>A; c.180_181TC>AA)',
    'Q61L (c.182A>T)',
    'Q61R (c.182A>G)',
    'Q61R/L (c.182A>G / c.182A>T)',
    'Q61H (c.183A>C; c.183A>T)',
    'K117N (c.351A>C; c.351A>T)',
    'A146P (c.436G>C)',
    'A146T (c.436G>A)',
    'A146P/T/V (c.436G>C / c.436G>A / c.437C>T)'
];

const GENOTIPOS_NRAS = [
    'NO PROCESABLE',
    'NO APLICA',
    'INVALIDO',
    'NINGUNA',
    'G12C (c.34G>T)',
    'G12S (c.34G>A)',
    'G12A (c.35G>C)',
    'G12A (c.35G>C) / G12V (c.35G>T)',
    'G12D (c.35G>A)',
    'G12V (c.35G>T)',
    'G13D (c.38G>A)',
    'G13V (c.38G>T)',
    'G13R (c.37G>C)',
    'G13R/V (c.37G>C / c.38G>T)',
    'A59T (c.175G>A)',
    'Q61K (c.181C>A)',
    'Q61L (c.182A>T)',
    'Q61R (c.182A>G)',
    'Q61R/K (c.182A>G / c.181C>A)',
    'Q61H (c.183A>C; c.183A>T)',
    'K117N (c.351G>C; c.351G>T)',
    'A146V (c.437C>T)',
    'A146T (c.436G>A)'
];

const GENOTIPOS_BRAF = [
    'NO PROCESABLE',
    'NO APLICA',
    'INVALIDO',
    'NINGUNA',
    'V600D (c.1799_1800delinsAT; c.1799_1800delinsAC)',
    'V600E (c.1799T>A)',
    'V600E/D (c.1799T>A; c.1799_1800delinsAA; c.1799_1800delinsAC)',
    'V600E2 (c.1799_1800delinsAA)',
    'V600K (c.1798_1799delinsAA)',
    'V600K/R (c.1798_1799delinsAA / c.1798_1799delinsAG)',
    'V600M (c.1798G>A)',
    'V600R (c.1798_1799delinsAG)'
];

export default function FormularioLaboratorio({
    estudio,
    onDataChange,
    errors = {}
}: FormularioLaboratorioProps) {
    const [localData, setLocalData] = useState({
        // Fechas de laboratorio
        FechaRecepcionLaboratorio: estudio.FECHA_RECEPCION_LABORATORIO ? 
            new Date(estudio.FECHA_RECEPCION_LABORATORIO).toISOString().split('T')[0] : '',
        HoraRecepcionLaboratorio: estudio.FECHA_RECEPCION_LABORATORIO ? 
            new Date(estudio.FECHA_RECEPCION_LABORATORIO).toTimeString().slice(0, 5) : '',
        FechaObtencionResultados: estudio.FECHA_OBTENCION_RESULTADOS ? 
            new Date(estudio.FECHA_OBTENCION_RESULTADOS).toISOString().split('T')[0] : '',
        HoraObtencionResultados: estudio.FECHA_OBTENCION_RESULTADOS ? 
            new Date(estudio.FECHA_OBTENCION_RESULTADOS).toTimeString().slice(0, 5) : '',
        
        // Resultados de laboratorio
        EstudioSolicitado: estudio.R_ESTUDIO_SOLICITADO || '',
        MetodoDeProceso: estudio.R_METODO_PROCESO || '',
        OtroMetodoDeProceso: '',
        
        // Condiciones específicas para sangre total
        LiqCondicion: estudio.MUESTRA_LIQ_CONDICION || '',
        LiqCondicionPresencia: estudio.MUESTRA_LIQ_CONDICION_PRESENCIA || '',
        LiqCantidadAdecuada: estudio.MUESTRA_LIQ_CANTIDAD_ADECUADA || '',
        LiqCantidadMl: estudio.MUESTRA_LIQ_CANTIDAD_ML || '',
        LiqHemolisis: estudio.MUESTRA_LIQ_HEMOLISIS || '',
        LiqAmpIndicacion: estudio.MUESTRA_LIQ_AMP_INDICACION || '',
        LiqAmpRazon: estudio.MUESTRA_LIQ_AMP_RAZON || '',
        LiqAmpRazonAbierta: estudio.MUESTRA_LIQ_AMP_RAZON || '',
        
        // Análisis de tejido (FFPE)
        PreservacionHE: estudio.R_PRESERVACION_H_E || '',
        NumeroCelulasTumorales: estudio.R_NUMERO_CELULAS_TUMORALES || '',
        AreaTumoral: estudio.R_AREA_TUMORAL || '',
        PorcentajeTumorTejido: estudio.R_PORCENTAJE_TUMOR_TEJIDO || '',
        Enriquecimiento: estudio.R_ENRIQUECIMIENTO || '',
        AdecuadoProcesamiento: estudio.R_ADECUADO_PROCESAMIENTO || '',
        RazonDelEstadoMuestra: estudio.R_RAZON_ADECUADO_PROCESAMIENTO || '',
        
        // Resultados mutacionales
        EstatusKras: estudio.R_ESTATUS_KRAS || '',
        GenotipoKras: estudio.R_GENOTIPO_KRAS || '',
        EstatusNras: estudio.R_ESTATUS_NRAS || '',
        GenotipoNras: estudio.R_GENOTIPO_NRAS || '',
        EstatusBraf: estudio.R_ESTATUS_BRAF || '',
        GenotipoBraf: estudio.R_GENOTIPO_BRAF || '',
        
        // Resultados e informes
        ResultadoHistopatologico: estudio.R_RESULTADO_HISTOPATOLOGICO || '',
        EstudioNotas: estudio.ESTUDIO_NOTAS || '',
        EstudioComentarios: estudio.ESTUDIO_COMENTARIOS || '',
        ResultadosCompletos: estudio.R_COMPLETOS === 'si'
    });

    const handleChange = (key: string, value: any) => {
        // Convertir "none" a string vacío para mantener compatibilidad
        const processedValue = value === "none" ? "" : value;
        const newData = { ...localData, [key]: processedValue };
        setLocalData(newData);
        onDataChange(newData);
    };

    const isSangreTotal = estudio.MUESTRA_TIPO === 'Sangre total';
    const showKras = localData.EstudioSolicitado.includes('K-RAS');
    const showNras = localData.EstudioSolicitado.includes('N-RAS');
    const showBraf = localData.EstudioSolicitado.includes('B-RAF');
    const showOtroMetodo = localData.MetodoDeProceso !== 'PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis' && 
                           localData.MetodoDeProceso !== 'PCR en tiempo real, FFPE sistema, IDYLLA Biocartis';
    const showLiqCondicionPresencia = localData.LiqCondicion === 'condiciones inadecuadas por la presencia de ';
    const showRazonEstado = localData.AdecuadoProcesamiento !== 'adecuada' && localData.AdecuadoProcesamiento !== 'suficiente';

    const getDefaultNotas = () => {
        let notas = '<p>La mutación de KRAS como biomarcador en cáncer del tubo digestivo para la administración de agentes anti-EGFR sólo esta avalada en adenocarcinomas primarios de colon y recto, y cuando estos estén en estadio metastásico. Su empleo en otros contextos puede no estar indicado.</p>';
        
        if (isSangreTotal) {
            notas += '<p>La determinación de mutaciones en RAS mediante biopsia líquida, dada una menor sensibilidad que la determinación en tejido, no está aún avalada para diagnóstico o como un biomarcador para determinación de recurrencia durante el seguimiento del paciente. La posibilidad de falsos negativos incrementa si no se siguen las recomendaciones sobre el estatus del paciente al momento de la toma de la muestra.</p>';
        }
        
        return notas;
    };

    return (
        <div className="space-y-6">
            {/* Recepción Laboratorio */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#189BAF]" />
                        Recepción Laboratorio
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="FechaRecepcionLaboratorio">
                                Fecha Recepción Laboratorio <small className="text-gray-500">(dd/mm/aaaa)</small>
                            </Label>
                            <Input
                                id="FechaRecepcionLaboratorio"
                                type="date"
                                value={localData.FechaRecepcionLaboratorio}
                                onChange={(e) => handleChange('FechaRecepcionLaboratorio', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="HoraRecepcionLaboratorio">
                                Hora Recepción Laboratorio <small className="text-gray-500">(00:00 am/pm)</small>
                            </Label>
                            <Input
                                id="HoraRecepcionLaboratorio"
                                type="time"
                                value={localData.HoraRecepcionLaboratorio}
                                onChange={(e) => handleChange('HoraRecepcionLaboratorio', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Obtención de resultados */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TestTube className="h-5 w-5 text-[#189BAF]" />
                        Obtención de resultados
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="FechaObtencionResultados">
                                Fecha Obtención Resultados <small className="text-gray-500">(dd/mm/aaaa)</small>
                            </Label>
                            <Input
                                id="FechaObtencionResultados"
                                type="date"
                                value={localData.FechaObtencionResultados}
                                onChange={(e) => handleChange('FechaObtencionResultados', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="HoraObtencionResultados">
                                Hora Obtención Resultados <small className="text-gray-500">(00:00 am/pm)</small>
                            </Label>
                            <Input
                                id="HoraObtencionResultados"
                                type="time"
                                value={localData.HoraObtencionResultados}
                                onChange={(e) => handleChange('HoraObtencionResultados', e.target.value)}
                            />
                        </div>
                    </div>

                    <hr />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Columna izquierda - Configuración y condiciones */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="EstudioSolicitado">Estudio Solicitado</Label>
                                <Select
                                    value={localData.EstudioSolicitado || "none"}
                                    onValueChange={(value) => handleChange('EstudioSolicitado', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Selecciona</SelectItem>
                                        {ESTUDIOS_SOLICITADOS.map((estudio) => (
                                            <SelectItem key={estudio} value={estudio}>
                                                {estudio}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="MetodoDeProceso">Método de proceso</Label>
                                <Select
                                    value={localData.MetodoDeProceso || "none"}
                                    onValueChange={(value) => handleChange('MetodoDeProceso', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Otro" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Otro</SelectItem>
                                        {isSangreTotal ? (
                                            <SelectItem value="PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis">
                                                PCR en tiempo real, Biopsia líquida, Sistema IDYLLA Biocartis
                                            </SelectItem>
                                        ) : (
                                            <SelectItem value="PCR en tiempo real, FFPE sistema, IDYLLA Biocartis">
                                                PCR en tiempo real, FFPE sistema, IDYLLA Biocartis
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {showOtroMetodo && (
                                <div>
                                    <Label htmlFor="OtroMetodoDeProceso">
                                        <small>Otro Método de proceso</small>
                                    </Label>
                                    <Input
                                        id="OtroMetodoDeProceso"
                                        value={localData.OtroMetodoDeProceso}
                                        onChange={(e) => handleChange('OtroMetodoDeProceso', e.target.value)}
                                    />
                                </div>
                            )}

                            <hr />

                            {/* Condiciones específicas para sangre total */}
                            {isSangreTotal && (
                                <div className="space-y-4">
                                    <h5 className="font-semibold">Análisis de Muestra Líquida</h5>
                                    
                                    <div>
                                        <Label htmlFor="LiqCondicion">Condición de la muestra Líquida</Label>
                                        <Select
                                            value={localData.LiqCondicion || "none"}
                                            onValueChange={(value) => handleChange('LiqCondicion', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="buenas condiciones">buenas condiciones</SelectItem>
                                                <SelectItem value="condiciones inadecuadas por la presencia de ">
                                                    condiciones inadecuadas por la presencia de
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {showLiqCondicionPresencia && (
                                        <div>
                                            <Label htmlFor="LiqCondicionPresencia">
                                                condiciones inadecuadas por la presencia de: <small className="text-gray-500">Se refiere a la condición de la muestra líquida</small>
                                            </Label>
                                            <Input
                                                id="LiqCondicionPresencia"
                                                value={localData.LiqCondicionPresencia}
                                                onChange={(e) => handleChange('LiqCondicionPresencia', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label htmlFor="LiqCantidadAdecuada">Cantidad de sangre total recibida</Label>
                                        <Select
                                            value={localData.LiqCantidadAdecuada || "none"}
                                            onValueChange={(value) => handleChange('LiqCantidadAdecuada', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="es la adecuada, ">es la adecuada</SelectItem>
                                                <SelectItem value="no es suficiente pues corresponde solo a ">no es suficiente pues corresponde solo a</SelectItem>
                                                <SelectItem value="no es óptima pues corresponde solo a">no es óptima pues corresponde solo a</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="LiqCantidadMl">
                                            Cantidad de sangre: <small className="text-gray-500">(ml aproximadamente)</small>
                                        </Label>
                                        <div className="flex">
                                            <Input
                                                id="LiqCantidadMl"
                                                type="number"
                                                step="0.1"
                                                value={localData.LiqCantidadMl}
                                                onChange={(e) => handleChange('LiqCantidadMl', e.target.value)}
                                                className="rounded-r-none"
                                            />
                                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                ml
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="LiqHemolisis">Se observa Hemólisis</Label>
                                        <Select
                                            value={localData.LiqHemolisis || "none"}
                                            onValueChange={(value) => handleChange('LiqHemolisis', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="se observa hemólisis">se observa hemólisis</SelectItem>
                                                <SelectItem value="se observa ligero tinte hemático">se observa ligero tinte hemático</SelectItem>
                                                <SelectItem value="no se observa hemólisis">no se observa hemólisis</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="LiqAmpIndicacion">Reacciones de amplificación</Label>
                                        <Select
                                            value={localData.LiqAmpIndicacion || "none"}
                                            onValueChange={(value) => handleChange('LiqAmpIndicacion', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="buena calidad">buena calidad</SelectItem>
                                                <SelectItem value="calidad limitada">calidad limitada</SelectItem>
                                                <SelectItem value="calidad subóptima">calidad subóptima</SelectItem>
                                                <SelectItem value="calidad inadecuada">calidad inadecuada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="LiqAmpRazon">
                                            Detalles Reacciones de amplificación (Selecciona "Otra" para mostrar la casilla de texto libre)
                                        </Label>
                                        <Select
                                            value={localData.LiqAmpRazon || "none"}
                                            onValueChange={(value) => handleChange('LiqAmpRazon', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="pues el Cq es tardío">pues el Cq es tardío</SelectItem>
                                                <SelectItem value="no hay amplificación">no hay amplificación</SelectItem>
                                                <SelectItem value="la cinética de la amplificación no es la adecuada">la cinética de la amplificación no es la adecuada</SelectItem>
                                                <SelectItem value="otra">Otra</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="LiqAmpRazonAbierta">Razón reacciones de amplificación (Texto libre)</Label>
                                        <Input
                                            id="LiqAmpRazonAbierta"
                                            value={localData.LiqAmpRazonAbierta}
                                            onChange={(e) => handleChange('LiqAmpRazonAbierta', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Análisis de tejido (no sangre total) */}
                            {!isSangreTotal && (
                                <div className="space-y-4">
                                    <h5 className="font-semibold">Análisis de Tejido</h5>

                                    <div>
                                        <Label htmlFor="PreservacionHE">Preservación H-E</Label>
                                        <Select
                                            value={localData.PreservacionHE || "none"}
                                            onValueChange={(value) => handleChange('PreservacionHE', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="se haya adecuadamente preservado">se haya adecuadamente preservado</SelectItem>
                                                <SelectItem value="tiene preservación subóptima">tiene preservación subóptima</SelectItem>
                                                <SelectItem value="tiene múltiples artificios por mala preservación ">tiene múltiples artificios por mala preservación</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="NumeroCelulasTumorales">Número de Células Tumorales</Label>
                                        <Input
                                            id="NumeroCelulasTumorales"
                                            type="number"
                                            value={localData.NumeroCelulasTumorales}
                                            onChange={(e) => handleChange('NumeroCelulasTumorales', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="AreaTumoral">Área Tumoral</Label>
                                        <div className="flex">
                                            <Input
                                                id="AreaTumoral"
                                                type="number"
                                                step="0.1"
                                                value={localData.AreaTumoral}
                                                onChange={(e) => handleChange('AreaTumoral', e.target.value)}
                                                className="rounded-r-none"
                                            />
                                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                mm²
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="PorcentajeTumorTejido">Porcentaje de Tumor en el tejido</Label>
                                        <div className="flex">
                                            <Input
                                                id="PorcentajeTumorTejido"
                                                value={localData.PorcentajeTumorTejido}
                                                onChange={(e) => handleChange('PorcentajeTumorTejido', e.target.value)}
                                                className="rounded-r-none"
                                            />
                                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                %
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="Enriquecimiento">¿Enriquecimiento?</Label>
                                        <Select
                                            value={localData.Enriquecimiento || "none"}
                                            onValueChange={(value) => handleChange('Enriquecimiento', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="Si">Si</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="AdecuadoProcesamiento">¿Adecuado para Procesamiento?</Label>
                                        <Select
                                            value={localData.AdecuadoProcesamiento || "none"}
                                            onValueChange={(value) => handleChange('AdecuadoProcesamiento', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="express">Liberación Express</SelectItem>
                                                <SelectItem value="adecuada">adecuada</SelectItem>
                                                <SelectItem value="suficiente">suficiente</SelectItem>
                                                <SelectItem value="subóptima">subóptima</SelectItem>
                                                <SelectItem value="inadecuada">inadecuada</SelectItem>
                                                <SelectItem value="no es procesable">no es procesable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {showRazonEstado && (
                                        <div>
                                            <Label htmlFor="RazonDelEstadoMuestra">
                                                Razón de la preservación del especimen. <small className="text-gray-500">Se muestra después del estado de la muestra</small>
                                            </Label>
                                            <Textarea
                                                id="RazonDelEstadoMuestra"
                                                value={localData.RazonDelEstadoMuestra}
                                                onChange={(e) => handleChange('RazonDelEstadoMuestra', e.target.value)}
                                                rows={4}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Columna derecha - Resultados mutacionales */}
                        <div className="space-y-6">
                            {/* K-RAS */}
                            {showKras && (
                                <Card className="border-2">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Dna className="h-5 w-5 text-[#189BAF]" />
                                            K-RAS
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="EstatusKras">Estatus Mutacional K-RAS</Label>
                                            <Select
                                                value={localData.EstatusKras || "none"}
                                                onValueChange={(value) => handleChange('EstatusKras', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Selecciona</SelectItem>
                                                    {ESTATUS_MUTACIONAL.map((estatus) => (
                                                        <SelectItem key={estatus} value={estatus}>
                                                            {estatus}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="GenotipoKras">Genotipo K-RAS</Label>
                                            <Select
                                                value={localData.GenotipoKras || "none"}
                                                onValueChange={(value) => handleChange('GenotipoKras', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Selecciona</SelectItem>
                                                    {GENOTIPOS_KRAS.map((genotipo) => (
                                                        <SelectItem key={genotipo} value={genotipo}>
                                                            {genotipo}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* N-RAS */}
                            {showNras && (
                                <Card className="border-2">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Dna className="h-5 w-5 text-[#189BAF]" />
                                            N-RAS
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="EstatusNras">Estatus Mutacional N-RAS</Label>
                                            <Select
                                                value={localData.EstatusNras || "none"}
                                                onValueChange={(value) => handleChange('EstatusNras', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Selecciona</SelectItem>
                                                    {ESTATUS_MUTACIONAL.map((estatus) => (
                                                        <SelectItem key={estatus} value={estatus}>
                                                            {estatus}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="GenotipoNras">Genotipo N-RAS</Label>
                                            <Select
                                                value={localData.GenotipoNras || "none"}
                                                onValueChange={(value) => handleChange('GenotipoNras', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Selecciona</SelectItem>
                                                    {GENOTIPOS_NRAS.map((genotipo) => (
                                                        <SelectItem key={genotipo} value={genotipo}>
                                                            {genotipo}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* B-RAF */}
                            {showBraf && (
                                <Card className="border-2">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Dna className="h-5 w-5 text-[#189BAF]" />
                                            B-RAF
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="EstatusBraf">Estatus Mutacional B-RAF</Label>
                                            <Select
                                                value={localData.EstatusBraf || "none"}
                                                onValueChange={(value) => handleChange('EstatusBraf', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Selecciona</SelectItem>
                                                    {ESTATUS_MUTACIONAL.map((estatus) => (
                                                        <SelectItem key={estatus} value={estatus}>
                                                            {estatus}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="GenotipoBraf">Genotipo B-RAF</Label>
                                            <Select
                                                value={localData.GenotipoBraf || "none"}
                                                onValueChange={(value) => handleChange('GenotipoBraf', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Selecciona</SelectItem>
                                                    {GENOTIPOS_BRAF.map((genotipo) => (
                                                        <SelectItem key={genotipo} value={genotipo}>
                                                            {genotipo}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Resultados e informes */}
                            {!isSangreTotal && (
                                <div>
                                    <Label htmlFor="ResultadoHistopatologico">Resultado Histopatológico</Label>
                                    <Textarea
                                        id="ResultadoHistopatologico"
                                        value={localData.ResultadoHistopatologico}
                                        onChange={(e) => handleChange('ResultadoHistopatologico', e.target.value)}
                                        rows={5}
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="EstudioNotas">Notas (Visibles en el reporte)</Label>
                                <Textarea
                                    id="EstudioNotas"
                                    value={localData.EstudioNotas || getDefaultNotas()}
                                    onChange={(e) => handleChange('EstudioNotas', e.target.value)}
                                    rows={6}
                                />
                            </div>

                            <div>
                                <Label htmlFor="EstudioComentarios">Comentarios (Visible solo para cliente)</Label>
                                <Textarea
                                    id="EstudioComentarios"
                                    value={localData.EstudioComentarios}
                                    onChange={(e) => handleChange('EstudioComentarios', e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="ResultadosCompletos"
                                    checked={localData.ResultadosCompletos}
                                    onCheckedChange={(checked) => handleChange('ResultadosCompletos', checked)}
                                />
                                <Label htmlFor="ResultadosCompletos">Resultados Completos</Label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}