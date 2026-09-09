<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA }}</title>
    @include('pdf.prv._estilos')
</head>
<body>
<div class="page-wrapper">

    @include('pdf.prv._encabezado', ['tituloEstudio' => 'Detección de Translocaciones (ALK, ROS1, RET, NTRK1‑3) y Mutación METex14'])

    <table class="section-header-table">
        <tr><td class="sh-label">Calidad del Espécimen</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            Adecuada, la muestra presenta aproximadamente <span class="highlight">{{ $datos['celulas_aprox'] ?? 'N/A' }}</span> células,
            que constituyen el <span class="highlight">{{ $datos['porcentaje_nucleos'] ?? 'N/A' }}%</span> de los núcleos en la muestra,
            y abarcan un área de <span class="highlight">{{ $datos['area_mm2'] ?? 'N/A' }} mm²</span>. Por lo que demuestra ser suficiente
            para un análisis molecular que arroje resultados confiables de acuerdo al método empleado. El tejido se haya adecuadamente
            preservado desde el punto de vista morfológico.
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Panel de Fusiones / Translocaciones</td><td class="sh-line"></td></tr>
    </table>
    <table class="result-table">
        <tr><th>Gen / Alteración</th><th>Resultado</th></tr>
        @php
            $genes = [
                'ALK' => $datos['resultado_alk'] ?? null,
                'ROS1' => $datos['resultado_ros1'] ?? null,
                'RET' => $datos['resultado_ret'] ?? null,
                'NTRK1' => $datos['resultado_ntrk1'] ?? null,
                'NTRK2' => $datos['resultado_ntrk2'] ?? null,
                'NTRK3' => $datos['resultado_ntrk3'] ?? null,
                'MET (omisión exón 14)' => $datos['resultado_met_ex14'] ?? null,
            ];
        @endphp
        @foreach($genes as $gen => $res)
            @if(!empty($res))
                <tr><td>{{ $gen }}</td><td>{{ $res }}</td></tr>
            @endif
        @endforeach
    </table>

    <table class="section-header-table">
        <tr><td class="sh-label">Análisis BRCA1/2 — Secuenciación Masiva</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            @php
                $brcaRes = $datos['brca_resultado'] ?? '';
                $badgeBrca = str_starts_with($brcaRes, 'Positivo') ? 'status-positivo' : 'status-negativo';
            @endphp
            <span class="status-badge {{ $badgeBrca }}">{{ $brcaRes ?: 'Sin resultado' }}</span>
            @if(!empty($datos['brca_gen_afectado']) && $datos['brca_gen_afectado'] !== 'N/A')
                <div style="margin-top: 8px;">Gen afectado: <span class="highlight">{{ $datos['brca_gen_afectado'] }}</span></div>
            @endif
            @if(!empty($datos['brca_variante']))
                <div style="margin-top: 4px;">Variante: <span class="highlight">{{ $datos['brca_variante'] }}</span></div>
            @endif
            @if(!empty($datos['brca_interpretacion']))
                <div style="margin-top: 8px;">{{ $datos['brca_interpretacion'] }}</div>
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