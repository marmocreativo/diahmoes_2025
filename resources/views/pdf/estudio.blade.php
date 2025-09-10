<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA ?? $estudio->folio_completo }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 10px;
        }
        .header-table {
            width: 100%;
            margin: 0;
            border-collapse: collapse;
        }
        .header-table td {
            padding: 5px;
        }
        .logo-cell {
            height: 160px;
            text-align: center;
        }
        .logo-image {
            max-height: 150px;
            max-width: 100%;
            height: auto;
            width: auto;
        }
        .title-cell {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            padding: 10px 0;
        }
        .info-cell {
            text-align: right;
            font-size: 11px;
        }
        .info-cell b {
            font-size: 9px;
        }
        .data-table {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin: 5px 0;
        }
        .data-table td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 11px;
            vertical-align: top;
        }
        .data-table td.small {
            font-size: 8px;
        }
        .data-table td.patient-name {
            font-size: 11px;
            font-weight: bold;
        }
        .results-section {
            margin: 10px 0;
        }
        .results-title {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .gene-section {
            margin: 5px 0;
            padding: 5px;
        }
        .gene-section.kras {
            background-color: #eee;
        }
        .gene-section.nras {
            background-color: #ccc;
        }
        .gene-section.braf {
            background-color: #aaa;
        }
        .gene-title {
            font-size: 9px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        .gene-result {
            font-size: 10px;
            padding-left: 50px;
        }
        .gene-result .highlight {
            color: #d32f2f;
            font-weight: bold;
        }
        .notes-section {
            margin-top: 10px;
        }
        .notes-title {
            font-size: 7px;
            font-weight: bold;
        }
        .notes-content {
            font-size: 7px;
            margin-top: 3px;
        }
        .signature-table {
            width: 100%;
            position: fixed;
            bottom: 50px;
            text-align: center;
        }
        .signature-image {
            max-width: 200px;
            max-height: 80px;
            height: auto;
            width: auto;
        }
        .footer-image {
            width: 100%;
            max-height: 60px;
            height: auto;
            object-fit: contain;
        }
        .mutation-table {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 6px;
        }
        .mutation-table td {
            border: 1px solid #000;
            padding: 3px;
            text-align: center;
        }
        .mutation-table .header {
            background-color: #000;
            color: #fff;
            font-weight: bold;
        }
        .page-break {
            page-break-before: always;
        }
        .hr-separator {
            border: none;
            border-top: 1px solid #000;
            margin: 20px 0;
        }
        .patrocinio-image {
            max-width: 300px;
            max-height: 80px;
            height: auto;
            width: auto;
        }
    </style>
</head>
<body>
    <!-- Página 1: Reporte Principal -->
    <table class="header-table">
        <tr>
            <td class="logo-cell">
                <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'logo_reporte_blanco.jpg' : 'logo_reporte.jpg' }}" alt="DIAHMOES logo 2025" class="logo-image">
            </td>
        </tr>
        <tr>
            <td class="title-cell">
                @php
                    $estudios_solicitados = [];
                    $titulo_genes = '';
                    $el_los = '';
                    
                    if (strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'K-RAS') !== false) {
                        $estudios_solicitados[] = 'K-RAS';
                    }
                    if (strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'N-RAS') !== false) {
                        $estudios_solicitados[] = 'N-RAS';
                    }
                    if (strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'B-RAF') !== false) {
                        $estudios_solicitados[] = 'B-RAF';
                    }
                    
                    $cantidad_estudios = count($estudios_solicitados);
                    $el_los = $cantidad_estudios > 1 ? 'MUTACIONES EN LOS GENES' : 'MUTACIÓN EN EL GEN';
                    
                    for ($i = 0; $i < count($estudios_solicitados); $i++) {
                        if ($i > 0) {
                            if ($i == count($estudios_solicitados) - 1) {
                                $titulo_genes .= ' y ';
                            } else {
                                $titulo_genes .= ', ';
                            }
                        }
                        $titulo_genes .= $estudios_solicitados[$i];
                    }
                @endphp
                DETERMINACIÓN DE {{ $el_los }} {{ $titulo_genes }}
            </td>
        </tr>
        <tr>
            <td class="info-cell">
                <b>{{ $estudio->CLAVE_INTERNA ?? $estudio->folio_completo }}</b><br>
                <b>Fecha de emisión: {{ $estudio->FECHA_INFORME ? $estudio->FECHA_INFORME->format('d-m-y') : 'No registrada' }}</b>
            </td>
        </tr>
    </table>

    <!-- Tabla de datos del paciente -->
    <table class="data-table">
        <tr>
            <td colspan="2" class="patient-name">
                <b>Nombre del paciente:</b> {{ $paciente->USUARIO_NOMBRE ?? 'N/A' }} {{ $paciente->USUARIO_APELLIDOS ?? '' }}
            </td>
        </tr>
        <tr>
            <td style="width: 50%;">
                <b>Edad:</b> {{ $estudio->MUESTRA_EDAD ?? 'No especificada' }}
            </td>
            <td rowspan="2">
                <b>Diagnóstico Clínico:</b><br>
                {{ $estudio->MUESTRA_DIAGNOSTICO_CLINICO ?? 'No especificado' }}
            </td>
        </tr>
        <tr>
            <td>
                <b>Género:</b> {{ $estudio->MUESTRA_GENERO ?? 'No especificado' }}
            </td>
        </tr>
        <tr>
            <td class="small">
                <b>Fecha de Recepción en Laboratorio:</b> 
                {{ $estudio->FECHA_RECEPCION_LABORATORIO ? $estudio->FECHA_RECEPCION_LABORATORIO->format('d-m-y') : 'No registrada' }}
            </td>
            <td class="small">
                <b>ID de la muestra recibida:</b> {{ $estudio->MUESTRA_CLAVE ?? 'No asignado' }}
            </td>
        </tr>
        <tr>
            <td class="small">
                <p><b>Médico Solicitante:</b><br> 
                {{ $medico->USUARIO_NOMBRE ?? 'N/A' }} {{ $medico->USUARIO_APELLIDOS ?? '' }}</p>
            </td>
            <td class="small">
                <p><b>Institución:</b><br> 
                {{ $institucion->INSTITUCION_NOMBRE ?? 'No especificada' }}</p>
            </td>
        </tr>
        <tr>
            <td class="small">
                <p><b>Tipo de Muestra Recibida:</b><br>
                {{ $estudio->MUESTRA_TIPO ?? 'No especificado' }}</p>
            </td>
            <td class="small">
                <p><b>Método de Proceso:</b><br>
                {{ $estudio->R_METODO_PROCESO ?? 'No especificado' }}</p>
            </td>
        </tr>
        
        @if($estudio->MUESTRA_TIPO !== 'Sangre total')
        <tr>
            <td colspan="2" class="small">
                <b>Evaluación histopatológica:</b><br>
                {{ $estudio->R_RESULTADO_HISTOPATOLOGICO ?? 'No especificada' }}
            </td>
        </tr>
        @endif
        
        <tr>
            <td colspan="2" style="font-size: 9px;">
                <b>Calidad del especimen:</b><br>
                @if($estudio->MUESTRA_TIPO == 'Sangre total')
                    La muestra se recibe en <b class="highlight">{{ $estudio->MUESTRA_LIQ_CONDICION ?? '' }}{{ $estudio->MUESTRA_LIQ_CONDICION_PRESENCIA ?? '' }}.</b>
                    La cantidad de sangre total recibida <b class="highlight">{{ $estudio->MUESTRA_LIQ_CANTIDAD_ADECUADA ?? '' }} {{ $estudio->MUESTRA_LIQ_CANTIDAD_ML ?? '' }} ml aproximadamente.</b>
                    Tras centrifugar la muestra para obtener plasma <b class="highlight">{{ $estudio->MUESTRA_LIQ_HEMOLISIS ?? '' }}.</b>
                    Las reacciones de amplificación para {{ $estudio->R_ESTUDIO_SOLICITADO ?? '' }} indican <b class="highlight">{{ $estudio->MUESTRA_LIQ_AMP_INDICACION ?? '' }}</b> del DNA en la muestra
                    <b class="highlight">@if($estudio->MUESTRA_LIQ_AMP_RAZON), {{ $estudio->MUESTRA_LIQ_AMP_RAZON }}@endif.</b>
                @else
                    @if($estudio->R_ADECUADO_PROCESAMIENTO == 'express')
                        El tejido se haya adecuadamente preservado desde el punto de vista morfológico, y la muestra reúne la cantidad absoluta y proporción adecuadas de células tumorales para su procesamiento bajo la metodología empleada
                    @elseif($estudio->R_ADECUADO_PROCESAMIENTO == 'inadecuada')
                        El tejido <b class="highlight">{{ $estudio->R_PRESERVACION_H_E ?? '' }}</b>
                        desde el punto de vista morfológico. No obstante la muestra no reune la cantidad y o proporción de células tumorales para una determinación confiable.
                    @elseif(in_array($estudio->R_ADECUADO_PROCESAMIENTO, ['adecuada', 'suficiente', 'subóptima']))
                        El tejido <b class="highlight">{{ $estudio->R_PRESERVACION_H_E ?? '' }}</b>
                        desde el punto de vista morfológico, la muestra presenta <b class="highlight">{{ $estudio->R_NUMERO_CELULAS_TUMORALES ? number_format($estudio->R_NUMERO_CELULAS_TUMORALES) : '' }}</b>
                        células tumorales que abarcan un área de <b class="highlight">{{ $estudio->R_AREA_TUMORAL ?? '' }} mm<sup>2</sup></b>
                        y representan el <b class="highlight">{{ $estudio->R_PORCENTAJE_TUMOR_TEJIDO ?? '' }}%</b> de la celularidad del tejido<b>{{ $estudio->R_ENRIQUECIMIENTO == 'Si' ? ', tras ser enriquecido.' : '.' }}</b>
                        Por todo lo anterior la muestra es <b class="highlight">{{ $estudio->R_ADECUADO_PROCESAMIENTO ?? '' }}</b> para su procesamiento{{ $estudio->R_RAZON_ADECUADO_PROCESAMIENTO ? ', ' . $estudio->R_RAZON_ADECUADO_PROCESAMIENTO : '' }}.
                    @endif
                @endif
            </td>
        </tr>
    </table>

    <hr class="hr-separator">

    <!-- Sección de Resultados -->
    <div class="results-section">
        <div class="results-title">RESULTADOS:</div>
        
        @if(strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'K-RAS') !== false)
        <div class="gene-section kras">
            <div class="gene-title">KRAS:</div>
            @if($estudio->R_ESTATUS_KRAS)
                @php
                    $texto_resultado = $estudio->R_ESTATUS_KRAS;
                    $texto_genotipo = $estudio->R_GENOTIPO_KRAS;
                @endphp
                <div class="gene-result">
                    <span class="highlight">{{ $texto_resultado }}</span> 
                    @if($texto_resultado == 'MUTADO') EN CODONES 12,13,59,61,117 o 146, EXONES 2,3 o 4 del gen KRAS.@endif<br>
                    @if(in_array($texto_resultado, ['MUTADO', 'MUTADO (VER NOTAS)']))
                        Mutación: <span class="highlight">{{ $texto_genotipo }}</span>
                    @endif
                </div>
            @endif
        </div>
        @endif

        @if(strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'N-RAS') !== false)
        <div class="gene-section nras">
            <div class="gene-title">NRAS:</div>
            @if($estudio->R_ESTATUS_NRAS)
                @php
                    $texto_resultado = $estudio->R_ESTATUS_NRAS;
                    $texto_genotipo = $estudio->R_GENOTIPO_NRAS;
                @endphp
                <div class="gene-result">
                    <span class="highlight">{{ $texto_resultado }}</span> 
                    @if($texto_resultado == 'MUTADO') EN CODONES 12,13,59,61,117 o 146, EXONES 2,3 o 4 del gen N-RAS.@endif<br>
                    @if(in_array($texto_resultado, ['MUTADO', 'MUTADO (VER NOTAS)']))
                        Mutación: <span class="highlight">{{ $texto_genotipo }}</span>
                    @endif
                </div>
            @endif
        </div>
        @endif

        @if(strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'B-RAF') !== false)
        <div class="gene-section braf">
            <div class="gene-title">BRAF:</div>
            @if($estudio->R_ESTATUS_BRAF)
                @php
                    $texto_resultado = $estudio->R_ESTATUS_BRAF;
                    $texto_genotipo = $estudio->R_GENOTIPO_BRAF;
                @endphp
                <div class="gene-result">
                    <span class="highlight">{{ $texto_resultado }}</span> 
                    @if($texto_resultado == 'MUTADO') EN EL CODÓN 600, EXÓN 15 del gen B-RAF.@endif<br>
                    @if($texto_resultado == 'MUTADO')
                        Mutación: <span class="highlight">{{ $texto_genotipo }}</span>
                    @endif
                </div>
            @endif
        </div>
        @endif

        <div class="notes-section">
            <div class="notes-title">NOTAS:</div>
            <div class="notes-content">{{ $estudio->ESTUDIO_NOTAS ?? '' }}</div>
        </div>
    </div>

    <!-- Firma y Footer -->
    <div class="signature-table">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'firma_completa_2_blanco.jpg' : 'firma_completa_2.jpg' }}" alt="" class="signature-image">
        </div>
        <div>
            <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'footer_reporte_blanco.jpg' : 'footer_reporte.jpg' }}" alt="" class="footer-image">
        </div>
    </div>

    <!-- Página 2: Tablas de Mutaciones -->
    <div class="page-break">
        
        <!-- Tabla KRAS -->
        <table class="mutation-table">
            <tr>
                <td colspan="4" class="header">MUTACIONES EN KRAS INCLUIDAS EN LA DETERMINACIÓN</td>
            </tr>
            <tr>
                <td rowspan="6">Codón 12 (exón 2)</td>
                <td>G12C (c.34G>T)</td>
                <td rowspan="5">Codón {{ $estudio->MUESTRA_TIPO == 'Sangre total' ? '59' : '61' }} (exón 3)</td>
                <td>Q61K (c.181C>A;</td>
            </tr>
            <tr>
                <td>G12R (c.34G>C)</td>
                <td>c.180_181TC>AA)</td>
            </tr>
            <tr>
                <td>G12S (c.34G>A)</td>
                <td>Q61L (c.182A>T)</td>
            </tr>
            <tr>
                <td>G12A (c.35G>C)</td>
                <td>Q61R (c.182A>G)</td>
            </tr>
            <tr>
                <td>G12D (c.35G>A)</td>
                <td>Q61H (c.183A>C; c.183A>T)</td>
            </tr>
            <tr>
                <td>G12V (c.35G>T)</td>
                <td>Codón 117 (exón 4)</td>
                <td>K117N (c.351A>C; c.351A>T)</td>
            </tr>
            <tr>
                <td>Codón 13 (exón 2)</td>
                <td>G13D (c.38G>A)</td>
                <td rowspan="2">Codón 146 (exón 4)</td>
                <td>A146P (c.436G>C)</td>
            </tr>
            <tr>
                <td rowspan="3">Codón 59 (exón 3)</td>
                <td>A59E (c.176C>A)</td>
                <td>A146T (c.436G>A)</td>
            </tr>
            <tr>
                <td>A59G (c.176C>G)</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td>A59T (c.175G>A)</td>
                <td></td>
                <td></td>
            </tr>
        </table>

        <!-- Tabla NRAS -->
        <table class="mutation-table">
            <tr>
                <td colspan="4" class="header">MUTACIONES EN NRAS INCLUIDAS EN LA DETERMINACIÓN</td>
            </tr>
            <tr>
                <td rowspan="6">Codón 12 (exón 2)</td>
                <td>G12C (c.34G>T)</td>
                <td rowspan="5">Codón 61 (exón 3)</td>
                <td>Q61K (c.181C>A;</td>
            </tr>
            <tr>
                <td>G12R (c.34G>C)</td>
                <td>c.180_181TC>AA)</td>
            </tr>
            <tr>
                <td>G12S (c.34G>A)</td>
                <td>Q61L (c.182A>T)</td>
            </tr>
            <tr>
                <td>G12A (c.35G>C)</td>
                <td>Q61R (c.182A>G)</td>
            </tr>
            <tr>
                <td>G12D (c.35G>A)</td>
                <td>Q61H (c.183A>C; c.183A>T)</td>
            </tr>
            <tr>
                <td>G12V (c.35G>T)</td>
                <td>Codón 117 (exón 4)</td>
                <td>K117N (c.351A>C; c.351A>T)</td>
            </tr>
            <tr>
                <td>Codón 13 (exón 2)</td>
                <td>G13D (c.38G>A)</td>
                <td rowspan="2">Codón 146 (exón 4)</td>
                <td>A146P (c.436G>C)</td>
            </tr>
            <tr>
                <td rowspan="3">Codón 59 (exón 3)</td>
                <td>A59E (c.176C>A)</td>
                <td>A146T (c.436G>A)</td>
            </tr>
            <tr>
                <td>A59G (c.176C>G)</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td>A59T (c.175G>A)</td>
                <td></td>
                <td></td>
            </tr>
        </table>

        <!-- Tabla BRAF -->
        <table class="mutation-table">
            <tr>
                <td colspan="2" class="header">MUTACIONES EN BRAF INCLUIDAS EN LA DETERMINACIÓN</td>
            </tr>
            <tr>
                <td rowspan="6">Codón 600 (exón 15)</td>
                <td>V600D(c.1799_1800delinsAT; c.1799_1800delinsAC)</td>
            </tr>
            <tr>
                <td>V600E(c.1799T>A)</td>
            </tr>
            <tr>
                <td>V600E2(c.1799_1800delinsAA)</td>
            </tr>
            <tr>
                <td>V600K(c.1798_1799delinsAA)</td>
            </tr>
            <tr>
                <td>V600M(c.1798G>A)</td>
            </tr>
            <tr>
                <td>V600R(c.1798_1799delinsAG)</td>
            </tr>
        </table>

        <!-- Patrocinio -->
        <div style="margin-top: 30px; text-align: center;">
            <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'patrocinio_reporte_blanco.jpg' : 'patrocinio_reporte.jpg' }}" alt="Patrocinio" class="patrocinio-image">
        </div>
    </div>
</body>
</html>