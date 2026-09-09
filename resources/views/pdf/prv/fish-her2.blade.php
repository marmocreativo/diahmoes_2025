<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA }}</title>
    @include('pdf.prv._estilos')
</head>
<body>
<div class="page-wrapper">

    @include('pdf.prv._encabezado', ['tituloEstudio' => 'Hibridación in Situ Fluorescente (FISH) — Amplificación de Gen HER-2'])

    <table class="section-header-table">
        <tr><td class="sh-label">Calidad del Espécimen</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            Calidad del espécimen: <span class="highlight">{{ $datos['calidad_especimen'] ?? 'No especificada' }}</span>
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Método de Proceso</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            Para la detección de la amplificación del gen HER-2neu, se realizó hibridación in situ fluorescente (FISH),
            con un sistema dual de sondas: dirigida al gen HER2/centromérica. El análisis se realizó en células en
            interfase de tejido fijado en formol y embebido en parafina.
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Resultado</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            <div style="margin-bottom: 6px;">
                Resultado: <span class="highlight">{{ $datos['resultado_nuc_ish'] ?? 'No especificado' }}</span>
            </div>
            <div style="margin-bottom: 6px;">
                La razón HER2-neu/CEP17 es: <span class="highlight">{{ $datos['razon_her2_cep17'] ?? 'N/A' }}</span>
                @if(!empty($datos['cuentas_promedio_her2']))
                    (Cuentas promedio de HER2: <span class="highlight">{{ $datos['cuentas_promedio_her2'] }}</span>)
                @endif
            </div>
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Interpretación</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            @php
                $resInterp = $datos['interpretacion_resultado'] ?? '';
                $badgeClase = $resInterp === 'Positivo' ? 'status-positivo' : ($resInterp === 'Equívoco' ? 'status-neutro' : 'status-negativo');
            @endphp
            <span class="status-badge {{ $badgeClase }}">{{ $resInterp ?: 'Sin interpretación' }} HER2/neu</span>
            @if(!empty($datos['interpretacion_texto']))
                <div style="margin-top: 8px;">{{ $datos['interpretacion_texto'] }}</div>
            @endif
        </div>
    </div>

    <div class="signature-section">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'firma_completa_2_blanco.jpg' : 'firma_completa_2.jpg' }}" alt="Firma" class="signature-image">
        <div><img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'footer_reporte_blanco.jpg' : 'footer_reporte.jpg' }}" alt="" class="footer-image"></div>
    </div>

</div>
</body>
</html>