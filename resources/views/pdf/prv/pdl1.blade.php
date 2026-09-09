<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA }}</title>
    @include('pdf.prv._estilos')
</head>
<body>
<div class="page-wrapper">

    @include('pdf.prv._encabezado', ['tituloEstudio' => 'PD-L1 — Inmunohistoquímica (clona 22C3, Dako/Agilent)'])

    <table class="section-header-table">
        <tr><td class="sh-label">Calidad y Controles</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            <div style="margin-bottom: 4px;">Calidad del espécimen: <span class="highlight">{{ $datos['calidad_especimen'] ?? 'N/A' }}</span></div>
            <div style="margin-bottom: 4px;">Número de células tumorales en la muestra: <span class="highlight">{{ $datos['numero_celulas_tumorales'] ?? 'N/A' }}</span> aproximadamente</div>
            <div style="margin-bottom: 4px;">Control positivo: <span class="highlight">{{ $datos['control_positivo'] ?? 'N/A' }}</span></div>
            <div>Control negativo (de reacción): <span class="highlight">{{ $datos['control_negativo'] ?? 'N/A' }}</span></div>
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Evaluación Inmunohistoquímica</td><td class="sh-line"></td></tr>
    </table>
    <table class="result-table">
        <tr>
            <th>% de células tumorales positivas</th>
            <th>TPS (Tumor Proportion Score)</th>
            <th>CPS (Combined Proportion Score)</th>
        </tr>
        <tr>
            <td>{{ $datos['porcentaje_celulas_positivas'] ?? 'N/A' }}%</td>
            <td>{{ $datos['tps'] ?? '-' }}</td>
            <td>{{ $datos['cps'] ?? '-' }}</td>
        </tr>
    </table>

    <div class="content-card">
        <div class="content-card-body" style="font-size: 8.5px; color: #4a6670;">
            <strong>Nivel de expresión (referencia):</strong><br>
            Alto (TPS ≥50) / Bajo (TPS 1‑49) / Ausente (TPS&lt;1) — Presente (CPS≥1) / Ausente (CPS&lt;1)
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Interpretación</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            <div style="margin-bottom: 4px;">Expresión en células tumorales: <span class="highlight">{{ $datos['expresion_tumorales'] ?? 'No especificada' }}</span></div>
            @if(!empty($datos['expresion_inmunitarias']))
                <div>Expresión en células inmunitarias: <span class="highlight">{{ $datos['expresion_inmunitarias'] }}</span></div>
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