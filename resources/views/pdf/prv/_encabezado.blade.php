<div class="header-logos">
    <img src="https://diahmoes.com.mx/assets/{{ $paraImprimir ? 'logo_reporte_blanco.jpg' : 'logo_reporte.jpg' }}" alt="DIAHMOES">
</div>

<table class="study-title-row">
    <tr>
        <td>
            <div class="study-main-title">{{ $tituloEstudio }}</div>
            <div class="study-sub-title">Diagnóstico Molecular Especializado · DIAHMOES</div>
        </td>
        <td style="width: 170px;" class="study-folio-block">
            <span class="folio-label">Folio</span>
            <span class="folio-value">{{ $estudio->CLAVE_INTERNA }}</span>
            <span class="folio-date">Fecha de emisión:<br>{{ now()->format('d/m/Y') }}</span>
        </td>
    </tr>
</table>

<table class="info-grid">
    <tr>
        <td class="info-card" style="width: 28%">
            <div class="info-card-field">
                <span class="field-label">Paciente</span>
                <span class="field-value large">{{ $estudio->paciente->USUARIO_NOMBRE ?? 'N/A' }} {{ $estudio->paciente->USUARIO_APELLIDOS ?? '' }}</span>
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

        <td class="info-card" style="width: 28%">
            <div class="info-card-field">
                <span class="field-label">Médico Solicitante</span>
                <span class="field-value">{{ $estudio->medico->USUARIO_NOMBRE ?? 'N/A' }} {{ $estudio->medico->USUARIO_APELLIDOS ?? '' }}</span>
            </div>
            <div class="info-card-field">
                <span class="field-label">Institución</span>
                <span class="field-value">{{ $estudio->institucion->INSTITUCION_NOMBRE ?? 'No especificada' }}</span>
            </div>
            <div class="info-card-field">
                <span class="field-label">Recepción en Laboratorio</span>
                <span class="field-value">{{ $estudio->FECHA_RECEPCION_LABORATORIO ? $estudio->FECHA_RECEPCION_LABORATORIO->format('d/m/Y') : 'No registrada' }}</span>
            </div>
        </td>

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
        </td>
    </tr>
</table>