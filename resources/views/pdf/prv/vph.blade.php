<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA }}</title>
    @include('pdf.prv._estilos')
</head>
<body>
<div class="page-wrapper">

    @php
        $esAmplio = $plantilla->CODIGO === 'VPH_AMPLIO';
        $titulo = $esAmplio
            ? 'Detección y Tipificación de VPH — Panel Amplio (Alto y Bajo Riesgo)'
            : 'Detección y Tipificación de VPH — Panel Genotipos Alto Riesgo';
    @endphp

    @include('pdf.prv._encabezado', ['tituloEstudio' => $titulo])

    <table class="section-header-table">
        <tr>
            <td class="sh-label">Calidad del Espécimen</td>
            <td class="sh-line"></td>
        </tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            Calidad del espécimen: <span class="highlight">{{ $datos['calidad_especimen'] ?? 'No especificada' }}</span>
        </div>
    </div>

    <table class="section-header-table">
        <tr>
            <td class="sh-label">Resultado</td>
            <td class="sh-line"></td>
        </tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            @php
                $badgeClase = ($datos['resultado_vph'] ?? '') === 'Positivo' ? 'status-positivo' : 'status-negativo';
            @endphp
            <span class="status-badge {{ $badgeClase }}">{{ $datos['resultado_vph'] ?? 'Sin resultado' }}</span>
            para la presencia de DNA del virus del papiloma humano (VPH)
            @if(!empty($datos['tipo_vph']))
                tipo <span class="highlight">{{ $datos['tipo_vph'] }}</span>
            @endif
            @if(!empty($datos['nivel_riesgo']))
                , el cual corresponde a un genotipo de <span class="highlight">{{ $datos['nivel_riesgo'] }}</span>.
            @else
                .
            @endif
        </div>
    </div>

    <table class="section-header-table">
        <tr>
            <td class="sh-label">Genotipos Detectables</td>
            <td class="sh-line"></td>
        </tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            <div style="margin-bottom: 6px;">
                <span class="highlight">Alto Riesgo:</span>
                @if($esAmplio)
                    VPH tipo 16,18,26,31,33,35,39,45,51,52,53,56,58,59,66,68,69,73 y 82.
                @else
                    VPH tipo 16,18,31,33,35,39,45,51,52,56,58,59,66 y 68.
                @endif
            </div>
            @if($esAmplio)
                <div>
                    <span class="highlight">Bajo Riesgo:</span>
                    VPH tipo 6,11,40,42,43,44,54,61 y 70.
                </div>
            @endif
        </div>
    </div>

    <div class="signature-section">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'firma_completa_2_blanco.jpg' : 'firma_completa_2.jpg' }}" alt="Firma" class="signature-image">
        <div>
            <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'footer_reporte_blanco.jpg' : 'footer_reporte.jpg' }}" alt="" class="footer-image">
        </div>
    </div>

</div>
</body>
</html>