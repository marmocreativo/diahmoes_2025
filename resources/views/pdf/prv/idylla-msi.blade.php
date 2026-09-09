<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA }}</title>
    @include('pdf.prv._estilos')
</head>
<body>
<div class="page-wrapper">

    @include('pdf.prv._encabezado', ['tituloEstudio' => 'Determinación de Inestabilidad Microsatelital (MSI) — Sistema Idylla'])

    <table class="section-header-table">
        <tr><td class="sh-label">Calidad del Espécimen</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            El tejido se haya adecuadamente preservado desde el punto de vista morfológico, la muestra presenta
            aproximadamente <span class="highlight">{{ $datos['celulas_tumorales_aprox'] ?? 'N/A' }}</span> células
            tumorales que abarcan un área de <span class="highlight">{{ $datos['area_mm2'] ?? 'N/A' }} mm²</span> y
            representan el <span class="highlight">{{ $datos['porcentaje_celularidad'] ?? 'N/A' }}%</span> de la
            celularidad del tejido, tras ser enriquecido. Por todo lo anterior la muestra es
            <span class="highlight">{{ $datos['calidad_muestra'] ?? 'N/A' }}</span> para su procesamiento.
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Loci Evaluados</td><td class="sh-line"></td></tr>
    </table>
    <table class="result-table">
        <tr>
            @php $columnas = ['Loci evaluados', 'Estatus', 'Observaciones']; @endphp
            @foreach($columnas as $col)
                <th>{{ $col }}</th>
            @endforeach
        </tr>
        @foreach(($datos['loci_tabla'] ?? []) as $fila)
            <tr>
                @foreach($fila as $celda)
                    <td>{{ $celda }}</td>
                @endforeach
            </tr>
        @endforeach
    </table>
    <div class="content-card">
        <div class="content-card-body" style="font-size: 8.5px; color: #4a6670;">
            La determinación de inestabilidad microsatelital mediante el sistema Idylla, Biocartis, ha demostrado
            tener alta concordancia con los métodos convencionales para esta determinación.
            Maertens et al. Annals of Oncology 2017; 28 (suppl_5): v22–v42.
        </div>
    </div>

    <table class="section-header-table">
        <tr><td class="sh-label">Interpretación</td><td class="sh-line"></td></tr>
    </table>
    <div class="content-card">
        <div class="content-card-body">
            <span class="status-badge status-neutro">{{ $datos['interpretacion_msi'] ?? 'No especificado' }}</span>
            <div style="margin-top: 8px; font-size: 8.5px; color: #4a6670;">
                Nota: Para fines de indicación terapéutica se recomienda repetir la determinación con un método con aprobación IVD.
            </div>
        </div>
    </div>

    <div class="signature-section">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'firma_completa_2_blanco.jpg' : 'firma_completa_2.jpg' }}" alt="Firma" class="signature-image">
        <div><img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'footer_reporte_blanco.jpg' : 'footer_reporte.jpg' }}" alt="" class="footer-image"></div>
    </div>

</div>
</body>
</html>