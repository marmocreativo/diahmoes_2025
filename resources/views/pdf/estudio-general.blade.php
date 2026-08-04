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
        /* Naranja acento : #e07b39  */
        /* Gris fondo     : #f0f4f5  */
        /* Gris borde     : #d4e0e2  */
        /* Texto oscuro   : #1a2e35  */
        /* Texto medio    : #4a6670  */
        /* Texto claro    : #8aa5ad  */

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

        /* ── TÍTULO DEL COMUNICADO ── */
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

        /* ── SEPARADOR ── */
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

        /* ── MENSAJE ── */
        .mensaje-card {
            overflow: hidden;
            margin-top: 2px;
            margin-bottom: 14px;
            border: 1px solid #d4e0e2;
        }

        .mensaje-card-header {
            background: #f0f4f5;
            border-bottom: 1.5px solid #d4e0e2;
            padding: 6px 14px;
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #4a6670;
        }

        .mensaje-card-body {
            padding: 14px;
            font-size: 11px;
            line-height: 1.8;
            color: #1a2e35;
            min-height: 100px;
        }

        /* ── FIRMA ── */
        .signature-section {
            margin-top: 24px;
            padding-top: 14px;
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
    </style>
</head>
<body>

<div class="page-wrapper">

    <!-- HEADER LOGOS -->
    <div class="header-logos">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'logo_reporte_blanco.jpg' : 'logo_reporte.jpg' }}" alt="DIAHMOES">
    </div>

    <!-- TÍTULO + FOLIO -->
    <table class="study-title-row">
        <tr>
            <td>
                <div class="study-main-title">{{ $titulo ?? 'Comunicado sobre su Estudio' }}</div>
                <div class="study-sub-title">Diagnóstico Molecular Especializado · DIAHMOES</div>
            </td>
            <td style="width: 170px;" class="study-folio-block">
                <span class="folio-label">Clave Interna</span>
                <span class="folio-value">{{ $estudio->CLAVE_INTERNA ?? $estudio->folio_completo }}</span>
                <span class="folio-date">Fecha de emisión:<br>{{ now()->format('d/m/Y') }}</span>
            </td>
        </tr>
    </table>

    <!-- GRID 3 COLUMNAS: INFO DE PACIENTE Y MUESTRA -->
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

            <!-- COL 3: Datos de la muestra -->
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
                    <span class="field-label">Estudio Solicitado</span>
                    <span class="field-value">{{ $estudio->R_ESTUDIO_SOLICITADO ?? 'No especificado' }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- SEPARADOR MENSAJE -->
    <table class="section-header-table">
        <tr>
            <td class="sh-label">{{ $asunto ?? 'Mensaje' }}</td>
            <td class="sh-line"></td>
        </tr>
    </table>

    <div class="mensaje-card">
        <div class="mensaje-card-body">{!! nl2br(e($mensaje ?? '')) !!}</div>
    </div>

    <!-- FIRMA -->
    <div class="signature-section">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'firma_completa_2_blanco.jpg' : 'firma_completa_2.jpg' }}" alt="Firma" class="signature-image">
        <div>
            <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'footer_reporte_blanco.jpg' : 'footer_reporte.jpg' }}" alt="" class="footer-image">
        </div>
    </div>

</div><!-- /page-wrapper -->

</body>
</html>