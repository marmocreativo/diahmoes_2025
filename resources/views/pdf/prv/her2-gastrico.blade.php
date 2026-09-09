<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA }}</title>
    @include('pdf.prv._estilos')
</head>
<body>
<div class="page-wrapper">

    @include('pdf.prv._encabezado', ['tituloEstudio' => 'HER2 Gástrico — Inmunohistoquímica'])

    <table class="section-header-table">
        <tr><td class="sh-label">Calidad y Controles</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            <div style="margin-bottom: 4px;">Calidad del espécimen: <span class="highlight">{{ $datos['calidad_especimen'] ?? 'N/A' }}</span></div>
            <div style="margin-bottom: 4px;">Control positivo: <span class="highlight">{{ $datos['control_positivo'] ?? 'N/A' }}</span></div>
            <div>Control negativo (de reacción): <span class="highlight">{{ $datos['control_negativo'] ?? 'N/A' }}</span></div>
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Evaluación Inmunohistoquímica</td><td class="sh-line"></td></tr>
    </table>
    <table class="result-table">
        <tr>
            <th>Marcador y clona empleada</th>
            <th>Porcentaje de células con tinción</th>
            <th>Intensidad de la tinción</th>
            <th>Estatus</th>
        </tr>
        <tr>
            <td>HER-2 (Clona CB11)</td>
            <td>{{ $datos['porcentaje_tincion'] ?? 'N/A' }}%</td>
            <td>{{ $datos['intensidad_tincion'] ?? 'N/A' }}</td>
            <td>{{ $datos['estatus_her2'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <div class="content-card">
        <div class="content-card-body" style="font-size: 8.5px; color: #4a6670;">
            <strong>Nivel de expresión (referencia):</strong><br>
            Positivo – 3+: Tinción de membrana intensa y continua total o basolateral en ≥10% del tumor (resección) o en un grupo de más de 5 células cohesivas (biopsia).<br>
            Equívoco/indeterminado – 2+: Tinción de membrana moderada o débil continua total o basolateral en ≥10% del tumor.<br>
            Negativo – 1+: Tinción de membrana débil discontinua en ≥10% del tumor.<br>
            Negativo – 0: Tinción de membrana discontinua en &lt;10% del tumor o solo escasas células dispersas.
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Interpretación</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            {{ $datos['interpretacion_texto'] ?? 'No especificada' }}
        </div>
    </div>

    <div class="signature-section">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'firma_completa_2_blanco.jpg' : 'firma_completa_2.jpg' }}" alt="Firma" class="signature-image">
        <div><img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'footer_reporte_blanco.jpg' : 'footer_reporte.jpg' }}" alt="" class="footer-image"></div>
    </div>

</div>
</body>
</html>