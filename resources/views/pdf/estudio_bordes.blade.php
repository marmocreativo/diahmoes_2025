<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA ?? $estudio->folio_completo }}</title>
    <style>
        @page {
            margin: 0;
            padding: 0;
        }

        html, body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1a2e35;
            background: #ffffff;
        }

        /* ── VARIABLES DE COLOR (paleta DIAHMOES) ── */
        /* Teal principal : #189BAF  */
        /* Teal oscuro    : #189BAF  */
        /* Naranja acento : #e07b39  */
        /* Gris fondo     : #f0f4f5  */
        /* Gris borde     : #d4e0e2  */
        /* Texto oscuro   : #1a2e35  */
        /* Texto medio    : #4a6670  */
        /* Texto claro    : #8aa5ad  */

        /* ══ PÁGINA 1 ══════════════════════════════ */

        .page-wrapper {
            padding: 0 28px 20px 28px;
        }

        /* ── HEADER LOGOS ── */
        .header-logos {
            margin: 16px 0 14px 0;
            text-align: center;
        }

        .header-logos img {
            max-height: 80px;
            max-width: 100%;
            height: auto;
            width: auto;
        }

        /* ── TÍTULO DEL ESTUDIO ── */
        .study-title-row {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .study-title-row td {
            vertical-align: bottom;
            padding: 0;
        }

        .study-main-title {
            font-size: 18px;
            font-weight: bold;
            color: #189BAF;
            line-height: 1.1;
            letter-spacing: -0.5px;
        }

        .study-sub-title {
            font-size: 10px;
            color: #4a6670;
            margin-top: 3px;
            letter-spacing: 0.3px;
        }

        .study-folio-block {
            text-align: right;
        }

        .folio-label {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #8aa5ad;
            display: block;
        }

        .folio-value {
            font-size: 14px;
            font-weight: bold;
            color: #189BAF;
            display: block;
        }

        .folio-date {
            font-size: 9px;
            color: #4a6670;
            display: block;
            margin-top: 2px;
        }

        /* ── GRID DE 3 COLUMNAS ── */
        .info-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin: 0 -8px;
            margin-bottom: 16px;
            table-layout: fixed;
        }

        .info-card {
            border: 1.5px solid #d4e0e2;
            border-radius: 10px;
            padding: 12px 13px;
            vertical-align: top;
            background: #f9fcfc;
        }

        .info-card-field {
            margin-bottom: 8px;
        }

        .info-card-field:last-child {
            margin-bottom: 0;
        }

        .field-label {
            font-size: 7.5px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #8aa5ad;
            font-weight: bold;
            display: block;
            margin-bottom: 2px;
        }

        .field-value {
            font-size: 11px;
            color: #1a2e35;
            line-height: 1.4;
        }

        .field-value.large {
            font-size: 13px;
            font-weight: bold;
            color: #1a2e35;
        }

        

        /* ── SEPARADOR RESULTADOS ── */
        .section-header {
            margin: 4px 0 10px 0;
            display: flex;
            align-items: center;
        }

        .section-header-label {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            color: #189BAF;
            padding-right: 10px;
            white-space: nowrap;
        }

        .section-header-line {
            flex: 1;
            border: none;
            border-top: 1.5px solid #d4e0e2;
        }
        

        /* Fallback para DomPDF (no soporta flex bien) */
        .section-header-table {
            width: 100%;
            border-collapse: collapse;
            margin: 4px 0 10px 0;
        }

        .section-header-table td {
            padding: 0;
            vertical-align: middle;
        }

        .section-header-table .sh-label {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            color: #189BAF;
            white-space: nowrap;
            padding-right: 10px;
            width: 1%;
        }

        .section-header-table .sh-line {
            border-top: 1.5px solid #d4e0e2;
        }

        /* ── NOTAS ── */
        .calidad-card {
            border: 1.5px solid #d4e0e2;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 2px;
            margin-bottom: 14px;
        }

        .calidad-card-header {
            background: #f0f4f5;
            border-bottom: 1.5px solid #d4e0e2;
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #4a6670;
        }

        .calidad-card-body {
            padding: 10px 14px;
            font-size: 10px;
            line-height: 1.8;
            color: #1a2e35;
        }

        .calidad-card-body .highlight {
            font-weight: bold;
            color: #189BAF;
        }

        /* ── CARDS DE GENES ── */
        .genes-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin: 0 -8px;
            table-layout: fixed;
            margin-bottom: 14px;
        }

        .gene-card {
            border: 1.5px solid #d4e0e2;
            border-radius: 10px;
            overflow: hidden;
            vertical-align: top;
        }

        .gene-card-header {
            padding: 8px 13px;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #189BAF;
        }

        .gene-card-body {
            padding: 10px 13px;
            background: #f9fcfc;
            min-height: 55px;
        }

        .status-badge {
            display: inline-block;
            padding: 3px 11px;
            border-radius: 20px;
            font-size: 9.5px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }

        .status-mutado {
            background-color: #fde8e8;
            color: #9b1c1c;
            border: 1px solid #f8b4b4;
        }

        .status-no-mutado {
            background-color: #def7ec;
            color: #03543f;
            border: 1px solid #84e1bc;
        }

        .status-ver-notas {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fcd34d;
        }

        .gene-locus {
            font-size: 8px;
            color: #8aa5ad;
            margin-top: 2px;
        }

        .gene-mutation-detail {
            font-size: 9.5px;
            color: #4a6670;
            margin-top: 5px;
            line-height: 1.5;
        }

        .gene-mutation-detail strong {
            color: #189BAF;
        }

        /* ── NOTAS ── */
        .notes-card {
            border: 1.5px solid #d4e0e2;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 2px;
        }

        .notes-card-header {
            background: #f0f4f5;
            border-bottom: 1.5px solid #d4e0e2;
            padding: 6px 14px;
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #4a6670;
        }

        .notes-card-body {
            padding: 10px 14px;
            font-size: 10px;
            line-height: 1.8;
            color: #1a2e35;
            min-height: 80px;
        }

        /* ── FIRMA ── */
        .signature-section {
            margin-top: 24px;
            padding-top: 14px;
            border-top: 1.5px solid #d4e0e2;
            text-align: center;
        }

        .signature-image {
            max-width: 180px;
            max-height: 75px;
            height: auto;
            width: auto;
        }

        .footer-image {
            width: 100%;
            max-height: 50px;
            height: auto;
            object-fit: contain;
            margin-top: 12px;
        }

        /* ══ PÁGINA 2 ══════════════════════════════ */

        .page-break {
            page-break-before: always;
            padding: 20px 28px;
        }

        .page2-title-bar {
            background: #189BAF;
            border-radius: 8px;
            padding: 10px 16px;
            margin-bottom: 16px;
        }

        .page2-title-bar .p2-title {
            font-size: 12px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .page2-title-bar .p2-sub {
            font-size: 8.5px;
            color: #b2e8e5;
            margin-top: 2px;
            letter-spacing: 0.5px;
        }

        .mutation-section {
            margin-bottom: 14px;
        }

        .mutation-section-label {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #189BAF;
            margin-bottom: 5px;
            padding-left: 8px;
            border-left: 3px solid #189BAF;
        }

        .mutation-table {
            width: 100%;
            border: 1px solid #d4e0e2;
            border-collapse: collapse;
            font-size: 8.5px;
        }

        .mutation-table td {
            border: 1px solid #d4e0e2;
            padding: 4px 8px;
            text-align: center;
            color: #1a2e35;
            vertical-align: middle;
        }

        .mutation-table tr:nth-child(even) td {
            background-color: #f0f4f5;
        }

        .mutation-table .mut-header {
            background-color: #189BAF;
            color: #ffffff;
            font-weight: bold;
            font-size: 8.5px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            padding: 6px 8px;
        }

        .mutation-table .codon-cell {
            background-color: #e6f7f6;
            color: #189BAF;
            font-weight: bold;
            font-size: 8px;
            text-align: left;
        }

        .patrocinio-section {
            margin-top: 18px;
            text-align: center;
            padding-top: 14px;
            border-top: 1.5px solid #d4e0e2;
        }

        .patrocinio-label {
            font-size: 7px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #8aa5ad;
            margin-bottom: 6px;
        }

        .patrocinio-image {
            max-height: 70px;
            height: auto;
            width: auto;
        }
    </style>
</head>
<body>

@php
    $estudios_solicitados = [];
    if (strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'K-RAS') !== false) $estudios_solicitados[] = 'K-RAS';
    if (strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'N-RAS') !== false) $estudios_solicitados[] = 'N-RAS';
    if (strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'B-RAF') !== false) $estudios_solicitados[] = 'B-RAF';

    $cantidad_estudios = count($estudios_solicitados);
    $el_los = $cantidad_estudios > 1 ? 'Mutaciones en los genes' : 'Mutación en el gen';

    $titulo_genes = '';
    for ($i = 0; $i < count($estudios_solicitados); $i++) {
        if ($i > 0) $titulo_genes .= ($i == count($estudios_solicitados) - 1) ? ' y ' : ', ';
        $titulo_genes .= $estudios_solicitados[$i];
    }

    $tieneKras = strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'K-RAS') !== false;
    $tieneNras = strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'N-RAS') !== false;
    $tieneBraf = strpos($estudio->R_ESTUDIO_SOLICITADO ?? '', 'B-RAF') !== false;
@endphp

<!-- ══════════════ PÁGINA 1 ══════════════ -->
<div class="page-wrapper">

    <!-- HEADER LOGOS -->
    <div class="header-logos">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'logo_reporte_blanco.jpg' : 'logo_reporte.jpg' }}" alt="DIAHMOES">
    </div>

    <!-- TÍTULO + FOLIO -->
    <table class="study-title-row">
        <tr>
            <td>
                <div class="study-main-title">{{ $el_los }} {{ $titulo_genes }}</div>
                <div class="study-sub-title">Diagnóstico Molecular Especializado · DIAHMOES</div>
            </td>
            <td style="width: 170px;" class="study-folio-block">
                <span class="folio-label">Clave Interna</span>
                <span class="folio-value">{{ $estudio->CLAVE_INTERNA ?? $estudio->folio_completo }}</span>
                <span class="folio-date">Fecha de emisión:<br>{{ $estudio->FECHA_INFORME ? $estudio->FECHA_INFORME->format('d/m/Y') : 'No registrada' }}</span>
            </td>
        </tr>
    </table>

    <!-- GRID 3 COLUMNAS -->
    <table class="info-grid">
        <tr>
            <!-- COL 1: Paciente -->
            <td class="info-card" style="width: 28%">
                <div class="info-card-field">
                    <span class="field-label">Paciente</span>
                    <span class="field-value large">{{ $paciente->USUARIO_NOMBRE ?? 'N/A' }} {{ $paciente->USUARIO_APELLIDOS ?? '' }}</span>
                </div>
                <div class="info-card-field">
                    <span class="field-label">Edad</span>
                    <span class="field-value">{{ $estudio->MUESTRA_EDAD ?? 'No especificada' }}</span>
                </div>
                <div class="info-card-field">
                    <span class="field-label">Género</span>
                    <span class="field-value">{{ $estudio->MUESTRA_GENERO ?? 'No especificado' }}</span>
                </div>
            </td>

            <!-- COL 2: Médico e Institución -->
            <td class="info-card" style="width: 28%">
                <div class="info-card-field">
                    <span class="field-label">Médico Solicitante</span>
                    <span class="field-value">{{ $medico->PREFIJO ?? '' }} {{ $medico->USUARIO_NOMBRE ?? 'N/A' }} {{ $medico->USUARIO_APELLIDOS ?? '' }}</span>
                </div>
                <div class="info-card-field">
                    <span class="field-label">Institución</span>
                    <span class="field-value">{{ $institucion->INSTITUCION_NOMBRE ?? 'No especificada' }}</span>
                </div>
                <div class="info-card-field">
                    <span class="field-label">Recepción en Laboratorio</span>
                    <span class="field-value">{{ $estudio->FECHA_RECEPCION_LABORATORIO ? $estudio->FECHA_RECEPCION_LABORATORIO->format('d/m/Y') : 'No registrada' }}</span>
                </div>
            </td>

            <!-- COL 3: Resto de datos + calidad -->
            <td class="info-card" style="width: 44%">
                <div class="info-card-field">
                    <span class="field-label">Diagnóstico Clínico</span>
                    <span class="field-value">{{ $estudio->MUESTRA_DIAGNOSTICO_CLINICO ?? 'No especificado' }}</span>
                </div>
                <div class="info-card-field">
                    <span class="field-label">Tipo de Muestra</span>
                    <span class="field-value">{{ $estudio->MUESTRA_TIPO ?? 'No especificado' }}</span>
                </div>
                <div class="info-card-field">
                    <span class="field-label">ID de Muestra</span>
                    <span class="field-value">{{ $estudio->MUESTRA_CLAVE ?? 'No asignado' }}</span>
                </div>
                <div class="info-card-field">
                    <span class="field-label">Método de Proceso</span>
                    <span class="field-value">{{ $estudio->R_METODO_PROCESO ?? 'No especificado' }}</span>
                </div>
                @if($estudio->MUESTRA_TIPO !== 'Sangre total')
                <div class="info-card-field">
                    <span class="field-label">Evaluación Histopatológica</span>
                    <span class="field-value">{{ $estudio->R_RESULTADO_HISTOPATOLOGICO ?? 'No especificada' }}</span>
                </div>
                @endif
            </td>
        </tr>
    </table>

    <!-- SEPARADOR CALIDAD DEL ESPÉCIMEN -->
    <table class="section-header-table">
        <tr>
            <td class="sh-label">Calidad del Espécimen</td>
            <td class="sh-line"></td>
        </tr>
    </table>

    <div class="calidad-card">
        <div class="calidad-card-body">
            @if($estudio->MUESTRA_TIPO == 'Sangre total')
                La muestra se recibe en <span class="highlight">{{ $estudio->MUESTRA_LIQ_CONDICION ?? '' }}{{ $estudio->MUESTRA_LIQ_CONDICION_PRESENCIA ?? '' }}.</span>
                La cantidad de sangre total recibida <span class="highlight">{{ $estudio->MUESTRA_LIQ_CANTIDAD_ADECUADA ?? '' }} {{ $estudio->MUESTRA_LIQ_CANTIDAD_ML ?? '' }} ml aproximadamente.</span>
                Tras centrifugar <span class="highlight">{{ $estudio->MUESTRA_LIQ_HEMOLISIS ?? '' }}.</span>
                Las reacciones de amplificación indican <span class="highlight">{{ $estudio->MUESTRA_LIQ_AMP_INDICACION ?? '' }}</span> del DNA
                <span class="highlight">@if($estudio->MUESTRA_LIQ_AMP_RAZON), {{ $estudio->MUESTRA_LIQ_AMP_RAZON }}@endif.</span>
                @if($estudio->MUESTRA_LIQ_LIPEMICA === 'Si')
                    <span class="highlight">Muestra presenta lipemia.</span>
                @endif
            @else
                @if($estudio->R_ADECUADO_PROCESAMIENTO == 'express')
                    El tejido se haya adecuadamente preservado y la muestra reúne la cantidad adecuada de células tumorales para su procesamiento.
                @elseif($estudio->R_ADECUADO_PROCESAMIENTO == 'inadecuada')
                    El tejido <span class="highlight">{{ $estudio->R_PRESERVACION_H_E ?? '' }}</span> desde el punto de vista morfológico. La muestra no reúne la cantidad y/o proporción de células tumorales para una determinación confiable.
                @elseif(in_array($estudio->R_ADECUADO_PROCESAMIENTO, ['adecuada', 'suficiente', 'subóptima']))
                    El tejido <span class="highlight">{{ $estudio->R_PRESERVACION_H_E ?? '' }}</span> morfológicamente, presenta <span class="highlight">{{ $estudio->R_NUMERO_CELULAS_TUMORALES ? number_format($estudio->R_NUMERO_CELULAS_TUMORALES) : '' }}</span> células tumorales en <span class="highlight">{{ $estudio->R_AREA_TUMORAL ?? '' }} mm²</span>, representando el <span class="highlight">{{ $estudio->R_PORCENTAJE_TUMOR_TEJIDO ?? '' }}%</span> de la celularidad<span class="highlight">{{ $estudio->R_ENRIQUECIMIENTO == 'Si' ? ', tras ser enriquecido.' : '.' }}</span>
                    Muestra <span class="highlight">{{ $estudio->R_ADECUADO_PROCESAMIENTO ?? '' }}</span> para su procesamiento{{ $estudio->R_RAZON_ADECUADO_PROCESAMIENTO ? ', ' . $estudio->R_RAZON_ADECUADO_PROCESAMIENTO : '' }}.
                @endif
            @endif
        </div>
    </div>


    <!-- SEPARADOR RESULTADOS -->
    <table class="section-header-table">
        <tr>
            <td class="sh-label">Resultados</td>
            <td class="sh-line"></td>
        </tr>
    </table>

    <!-- CARDS GENES -->
    <table class="genes-grid">
        <tr>
            @if($tieneKras)
            <td class="gene-card">
                <div class="gene-card-header kras">KRAS</div>
                <div class="gene-card-body">
                    @if($estudio->R_ESTATUS_KRAS)
                        @php
                            $sk = $estudio->R_ESTATUS_KRAS;
                            $bk = str_contains($sk, 'VER NOTAS') ? 'status-ver-notas' : (str_contains($sk, 'MUTADO') ? 'status-mutado' : 'status-no-mutado');
                        @endphp
                        <span class="status-badge {{ $bk }}">{{ $sk }}</span>
                        @if($sk == 'MUTADO')
                            <div class="gene-locus">Codones 12,13,59,61,117 o 146 · Exones 2,3 o 4</div>
                        @endif
                        @if(in_array($sk, ['MUTADO', 'MUTADO (VER NOTAS)']))
                            <div class="gene-mutation-detail"><strong>Mutación:</strong> {{ $estudio->R_GENOTIPO_KRAS }}</div>
                        @endif
                    @endif
                </div>
            </td>
            @endif

            @if($tieneNras)
            <td class="gene-card">
                <div class="gene-card-header nras">NRAS</div>
                <div class="gene-card-body">
                    @if($estudio->R_ESTATUS_NRAS)
                        @php
                            $sn = $estudio->R_ESTATUS_NRAS;
                            $bn = str_contains($sn, 'VER NOTAS') ? 'status-ver-notas' : (str_contains($sn, 'MUTADO') ? 'status-mutado' : 'status-no-mutado');
                        @endphp
                        <span class="status-badge {{ $bn }}">{{ $sn }}</span>
                        @if($sn == 'MUTADO')
                            <div class="gene-locus">Codones 12,13,59,61,117 o 146 · Exones 2,3 o 4</div>
                        @endif
                        @if(in_array($sn, ['MUTADO', 'MUTADO (VER NOTAS)']))
                            <div class="gene-mutation-detail"><strong>Mutación:</strong> {{ $estudio->R_GENOTIPO_NRAS }}</div>
                        @endif
                    @endif
                </div>
            </td>
            @endif

            @if($tieneBraf)
            <td class="gene-card">
                <div class="gene-card-header braf">BRAF</div>
                <div class="gene-card-body">
                    @if($estudio->R_ESTATUS_BRAF)
                        @php
                            $sb = $estudio->R_ESTATUS_BRAF;
                            $bb = str_contains($sb, 'MUTADO') ? 'status-mutado' : 'status-no-mutado';
                        @endphp
                        <span class="status-badge {{ $bb }}">{{ $sb }}</span>
                        @if($sb == 'MUTADO')
                            <div class="gene-locus">Codón 600 · Exón 15</div>
                            <div class="gene-mutation-detail"><strong>Mutación:</strong> {{ $estudio->R_GENOTIPO_BRAF }}</div>
                        @endif
                    @endif
                </div>
            </td>
            @endif
        </tr>
    </table>

    <!-- NOTAS -->
    <table class="section-header-table">
        <tr>
            <td class="sh-label">Notas</td>
            <td class="sh-line"></td>
        </tr>
    </table>

    <div class="notes-card">
        <div class="notes-card-body">{!! $estudio->ESTUDIO_NOTAS ?? '' !!}</div>
    </div>

    <!-- FIRMA -->
    <div class="signature-section">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'firma_completa_2_blanco.jpg' : 'firma_completa_2.jpg' }}" alt="Firma" class="signature-image">
        <div>
            <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'footer_reporte_blanco.jpg' : 'footer_reporte.jpg' }}" alt="" class="footer-image">
        </div>
    </div>

</div><!-- /page-wrapper -->


<!-- ══════════════ PÁGINA 2 ══════════════ -->
<div class="page-break">

    <div class="page2-title-bar">
        <div class="p2-title">Mutaciones Incluidas en la Determinación</div>
        <div class="p2-sub">Panel de referencia · Variantes analizadas por metodología empleada</div>
    </div>

    <!-- KRAS -->
    <div class="mutation-section">
        <div class="mutation-section-label">KRAS</div>
        <table class="mutation-table">
            <tr><td colspan="4" class="mut-header">Mutaciones en KRAS incluidas en la determinación</td></tr>
            <tr>
                <td rowspan="6" class="codon-cell">Codón 12 (exón 2)</td>
                <td>G12C (c.34G&gt;T)</td>
                <td rowspan="5" class="codon-cell">Codón {{ $estudio->MUESTRA_TIPO == 'Sangre total' ? '59' : '61' }} (exón 3)</td>
                <td>Q61K (c.181C&gt;A; c.180_181TC&gt;AA)</td>
            </tr>
            <tr><td>G12R (c.34G&gt;C)</td><td>Q61L (c.182A&gt;T)</td></tr>
            <tr><td>G12S (c.34G&gt;A)</td><td>Q61R (c.182A&gt;G)</td></tr>
            <tr><td>G12A (c.35G&gt;C)</td><td>Q61H (c.183A&gt;C; c.183A&gt;T)</td></tr>
            <tr><td>G12D (c.35G&gt;A)</td><td>K117N (c.351A&gt;C; c.351A&gt;T)</td></tr>
            <tr>
                <td>G12V (c.35G&gt;T)</td>
                <td rowspan="2" class="codon-cell">Codón 146 (exón 4)</td>
                <td>A146P (c.436G&gt;C)</td>
            </tr>
            <tr>
                <td class="codon-cell">Codón 13 (exón 2)</td>
                <td>G13D (c.38G&gt;A)</td>
                <td>A146T (c.436G&gt;A)</td>
            </tr>
            <tr>
                <td rowspan="3" class="codon-cell">Codón 59 (exón 3)</td>
                <td>A59E (c.176C&gt;A)</td><td></td><td></td>
            </tr>
            <tr><td>A59G (c.176C&gt;G)</td><td></td><td></td></tr>
            <tr><td>A59T (c.175G&gt;A)</td><td></td><td></td></tr>
        </table>
    </div>

    <!-- NRAS -->
    <div class="mutation-section">
        <div class="mutation-section-label">NRAS</div>
        <table class="mutation-table">
            <tr><td colspan="4" class="mut-header">Mutaciones en NRAS incluidas en la determinación</td></tr>
            <tr>
                <td rowspan="6" class="codon-cell">Codón 12 (exón 2)</td>
                <td>G12C (c.34G&gt;T)</td>
                <td rowspan="5" class="codon-cell">Codón 61 (exón 3)</td>
                <td>Q61K (c.181C&gt;A; c.180_181TC&gt;AA)</td>
            </tr>
            <tr><td>G12R (c.34G&gt;C)</td><td>Q61L (c.182A&gt;T)</td></tr>
            <tr><td>G12S (c.34G&gt;A)</td><td>Q61R (c.182A&gt;G)</td></tr>
            <tr><td>G12A (c.35G&gt;C)</td><td>Q61H (c.183A&gt;C; c.183A&gt;T)</td></tr>
            <tr><td>G12D (c.35G&gt;A)</td><td>K117N (c.351A&gt;C; c.351A&gt;T)</td></tr>
            <tr>
                <td>G12V (c.35G&gt;T)</td>
                <td rowspan="2" class="codon-cell">Codón 146 (exón 4)</td>
                <td>A146P (c.436G&gt;C)</td>
            </tr>
            <tr>
                <td class="codon-cell">Codón 13 (exón 2)</td>
                <td>G13D (c.38G&gt;A)</td>
                <td>A146T (c.436G&gt;A)</td>
            </tr>
            <tr>
                <td rowspan="3" class="codon-cell">Codón 59 (exón 3)</td>
                <td>A59E (c.176C&gt;A)</td><td></td><td></td>
            </tr>
            <tr><td>A59G (c.176C&gt;G)</td><td></td><td></td></tr>
            <tr><td>A59T (c.175G&gt;A)</td><td></td><td></td></tr>
        </table>
    </div>

    <!-- BRAF -->
    <div class="mutation-section">
        <div class="mutation-section-label">BRAF</div>
        <table class="mutation-table">
            <tr><td colspan="2" class="mut-header">Mutaciones en BRAF incluidas en la determinación</td></tr>
            <tr>
                <td rowspan="6" class="codon-cell">Codón 600 (exón 15)</td>
                <td>V600D (c.1799_1800delinsAT; c.1799_1800delinsAC)</td>
            </tr>
            <tr><td>V600E (c.1799T&gt;A)</td></tr>
            <tr><td>V600E2 (c.1799_1800delinsAA)</td></tr>
            <tr><td>V600K (c.1798_1799delinsAA)</td></tr>
            <tr><td>V600M (c.1798G&gt;A)</td></tr>
            <tr><td>V600R (c.1798_1799delinsAG)</td></tr>
        </table>
    </div>

    <!-- PATROCINIO -->
    <div class="patrocinio-section">
        <div class="patrocinio-label">Con el patrocinio de</div>
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'patrocinio_reporte_blanco.jpg' : 'patrocinio_reporte.jpg' }}" alt="Patrocinio" class="patrocinio-image">
    </div>

</div>

</body>
</html>