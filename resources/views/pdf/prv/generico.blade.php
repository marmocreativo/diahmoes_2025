<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DIAHMOES - {{ $estudio->CLAVE_INTERNA }}</title>
    @include('pdf.prv._estilos')
</head>
<body>
<div class="page-wrapper">

    @include('pdf.prv._encabezado', ['tituloEstudio' => $plantilla->NOMBRE])

    @foreach ($plantilla->CAMPOS as $seccion)
        <table class="section-header-table">
            <tr>
                <td class="sh-label">{{ $seccion['seccion'] }}</td>
                <td class="sh-line"></td>
            </tr>
        </table>

        <div class="content-card">
            <div class="content-card-body">
                @foreach ($seccion['campos'] as $campo)
                    @php $valor = $datos[$campo['key']] ?? null; @endphp

                    @if ($campo['tipo'] === 'tabla' && is_array($valor))
                        <table class="result-table">
                            <tr>
                                @foreach ($campo['columnas'] as $col)
                                    <th>{{ $col }}</th>
                                @endforeach
                            </tr>
                            @foreach ($valor as $fila)
                                <tr>
                                    @foreach ($fila as $celda)
                                        <td>{{ $celda }}</td>
                                    @endforeach
                                </tr>
                            @endforeach
                        </table>
                    @else
                        <div style="margin-bottom: 8px;">
                            <span class="field-label" style="display:inline;">{{ $campo['label'] }}:</span>
                            <span> {{ $valor ?? 'N/A' }}</span>
                        </div>
                    @endif
                @endforeach
            </div>
        </div>
    @endforeach

    @if ($estudio->ESTUDIO_NOTAS)
        <table class="section-header-table">
            <tr>
                <td class="sh-label">Notas</td>
                <td class="sh-line"></td>
            </tr>
        </table>
        <div class="notes-card">
            <div class="notes-card-body">{!! $estudio->ESTUDIO_NOTAS !!}</div>
        </div>
    @endif

    <div class="signature-section">
        <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'firma_completa_2_blanco.jpg' : 'firma_completa_2.jpg' }}" alt="Firma" class="signature-image">
        <div>
            <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'footer_reporte_blanco.jpg' : 'footer_reporte.jpg' }}" alt="" class="footer-image">
        </div>
    </div>

</div>
</body>
</html>