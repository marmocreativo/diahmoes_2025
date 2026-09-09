<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA }}</title>
    @include('pdf.prv._estilos')
</head>
<body>
<div class="page-wrapper">

    @include('pdf.prv._encabezado', ['tituloEstudio' => 'Evaluación de Celularidad Tumoral'])

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
            Escaneo y evaluación de celularidad.
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Evaluación de Celularidad Tumoral</td><td class="sh-line"></td></tr>
    </table>
    <table class="result-table">
        <tr>
            <th>Bloques con tumor</th>
            <th>Porcentaje de núcleos de células tumorales en las áreas encerradas en rojo (celularidad)</th>
        </tr>
        <tr>
            <td>{{ $datos['bloques_con_tumor'] ?? 'N/A' }}</td>
            <td>{{ $datos['porcentaje_celularidad'] ?? 'N/A' }}%</td>
        </tr>
    </table>

    <div class="signature-section">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'firma_completa_2_blanco.jpg' : 'firma_completa_2.jpg' }}" alt="Firma" class="signature-image">
        <div><img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'footer_reporte_blanco.jpg' : 'footer_reporte.jpg' }}" alt="" class="footer-image"></div>
    </div>

</div>
</body>
</html>