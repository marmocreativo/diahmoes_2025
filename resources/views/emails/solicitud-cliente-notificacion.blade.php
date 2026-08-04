<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Actualización de Solicitud — DIAHMOES</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
      }

      .container {
        max-width: 500px;
        margin: 0 auto;
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }

      .header {
        background: #189BAF;
        color: white;
        text-align: center;
        padding: 20px;
      }

      .logo {
        max-width: 120px;
        margin-bottom: 10px;
      }

      .content {
        padding: 25px;
      }

      p {
        color: #666;
        line-height: 1.5;
        margin: 10px 0;
      }

      .folio {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
        color: #189BAF;
        margin: 15px 0;
        font-size: 16px;
        text-align: center;
      }

      .badge {
        display: inline-block;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: bold;
        margin-bottom: 15px;
      }

      .badge-creacion     { background: #D68B41; }
      .badge-edicion      { background: #6b7280; }
      .badge-comentario   { background: #189BAF; }
      .badge-confirmacion { background: #16a34a; }
      .badge-cancelacion  { background: #dc2626; }

      .section-title {
        font-size: 13px;
        font-weight: bold;
        color: #189BAF;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #e8f5f7;
        padding-bottom: 6px;
        margin: 20px 0 10px;
      }

      .data-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #f5f5f5;
        font-size: 13px;
      }

      .data-label {
        color: #999;
        min-width: 140px;
      }

      .data-value {
        color: #333;
        font-weight: bold;
        text-align: right;
      }

      .highlight-box {
        background: #e8f5f7;
        border-left: 4px solid #189BAF;
        border-radius: 4px;
        padding: 12px 15px;
        margin: 15px 0;
        font-size: 13px;
        color: #333;
      }

      .autor-box {
        font-size: 12px;
        color: #999;
        text-align: center;
        margin-bottom: 15px;
      }

      .cambio-row {
        font-size: 12px;
        padding: 6px 0;
        border-bottom: 1px solid #f5f5f5;
      }

      .cambio-campo {
        color: #999;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 11px;
      }

      .cambio-valores {
        margin-top: 2px;
      }

      .cambio-anterior {
        color: #b91c1c;
        text-decoration: line-through;
      }

      .cambio-nuevo {
        color: #15803d;
        font-weight: bold;
      }

      .action-box {
        background: #fff8f0;
        border: 2px dashed #D68B41;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
      }

      .action-title {
        color: #D68B41;
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 6px;
      }

      .url-text {
        background: #f8f9fa;
        padding: 12px;
        margin: 10px 0 0;
        border-radius: 4px;
        font-size: 12px;
        color: #666;
        word-break: break-all;
        text-align: left;
        border-left: 4px solid #189BAF;
      }

      .footer {
        background: #f8f9fa;
        padding: 15px;
        text-align: center;
        font-size: 12px;
        color: #999;
      }

      @media only screen and (max-width: 600px) {
        .container {
          margin: 0;
          border-radius: 0;
        }
        .content {
          padding: 20px;
        }
        .data-row {
          flex-direction: column;
        }
        .data-value {
          text-align: left;
          margin-top: 2px;
        }
      }
    </style>
</head>
<body>
    <div class="container">

        <!-- Header -->
        <div class="header">
            <img src="{{ asset('assets/logo.png') }}" alt="DIAHMOES" class="logo">
            <h2 style="margin: 0; font-size: 18px;">DIAHMOES</h2>
        </div>

        <!-- Content -->
        <div class="content">

            @php
                $titulos = [
                    'creacion'     => 'Se ha recibido una nueva solicitud de recolección.',
                    'edicion'      => 'La solicitud ha sido actualizada.',
                    'comentario'   => 'Hay un nuevo comentario en la solicitud.',
                    'confirmacion' => 'La solicitud ha sido confirmada.',
                    'cancelacion'  => 'La solicitud ha sido cancelada.',
                ];

                $badges = [
                    'creacion'     => 'Nueva solicitud',
                    'edicion'      => 'Solicitud editada',
                    'comentario'   => 'Nuevo comentario',
                    'confirmacion' => 'Confirmada',
                    'cancelacion'  => 'Cancelada',
                ];
            @endphp

            <p style="text-align:center; color: #333; font-size: 15px;">
                {{ $titulos[$evento->TIPO] ?? 'Actualización en la solicitud.' }}
            </p>

            @if($solicitud->FOLIO_MERCK)
            <div class="folio">
                FOLIO {{ $solicitud->FOLIO_MERCK }}
            </div>
            @endif

            <div style="text-align:center;">
                <span class="badge badge-{{ $evento->TIPO }}">{{ $badges[$evento->TIPO] ?? $evento->TIPO }}</span>
            </div>

            <div class="autor-box">
                {{ $evento->AUTOR_TIPO === 'admin' ? 'Registrado por el equipo DIAHMOES' : 'Registrado por el solicitante' }}
                @if($evento->AUTOR_NOMBRE)
                    — {{ $evento->AUTOR_NOMBRE }}
                @endif
                <br>
                {{ $evento->created_at->locale('es')->isoFormat('D [de] MMMM [de] YYYY, HH:mm') }}
            </div>

            {{-- Contenido específico según el tipo de evento --}}
            @if($evento->TIPO === 'comentario' && $evento->MENSAJE)
                <div class="section-title">Comentario</div>
                <div class="highlight-box">{{ $evento->MENSAJE }}</div>
            @endif

            @if($evento->TIPO === 'edicion' && $evento->CAMBIOS)
                <div class="section-title">Cambios realizados</div>
                @foreach($evento->CAMBIOS as $campo => $valores)
                    <div class="cambio-row">
                        <div class="cambio-campo">{{ $campo }}</div>
                        <div class="cambio-valores">
                            <span class="cambio-anterior">{{ $valores['anterior'] ?? '—' }}</span>
                            &rarr;
                            <span class="cambio-nuevo">{{ $valores['nuevo'] ?? '—' }}</span>
                        </div>
                    </div>
                @endforeach
            @endif

            @if($evento->TIPO === 'confirmacion')
                <div class="highlight-box" style="text-align:center;">
                    ✅ La solicitud ha sido confirmada por el equipo DIAHMOES.
                </div>
            @endif

            <!-- Datos principales (siempre visibles como referencia) -->
            <div class="section-title">Datos de la solicitud</div>

            <div class="data-row">
                <span class="data-label">Tipo</span>
                <span class="data-value">{{ $solicitud->TIPO_SOLICITUD }}</span>
            </div>

            <div class="data-row">
                <span class="data-label">Cantidad de muestras</span>
                <span class="data-value">{{ $solicitud->CANTIDAD }}</span>
            </div>

            <div class="data-row">
                <span class="data-label">Médico</span>
                <span class="data-value">{{ $solicitud->nombre_medico }}</span>
            </div>

            <div class="data-row">
                <span class="data-label">Institución</span>
                <span class="data-value">{{ $solicitud->nombre_institucion }}</span>
            </div>

            <div class="highlight-box">
                📅 <strong>
                    {{ $solicitud->PROGRAMAR_PARA
                        ? \Carbon\Carbon::parse($solicitud->PROGRAMAR_PARA)->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY')
                        : '—' }}
                </strong>
                @if($solicitud->HORARIO)
                    &nbsp;·&nbsp; 🕐 {{ $solicitud->HORARIO }}
                @endif
            </div>

            <!-- Acción -->
            <div class="action-box">
                <div class="action-title">⚡ Ver solicitud completa</div>
                <p style="margin: 0; font-size: 13px; color: #666;">
                    Ingresa al sistema para ver el detalle y la línea de tiempo de esta solicitud.
                </p>
                <div class="url-text">
                    {{ $urlDestino }}
                </div>
            </div>

        </div>

        <!-- Footer -->
        <div class="footer">
            <strong>DIAHMOES</strong><br>
            Laboratorio de Diagnóstico Molecular<br>
            <a href="https://diahmoes.com.mx" style="color: #189BAF; text-decoration: none;">diahmoes.com.mx</a><br>
            <br>
            <span style="color: #bbb; font-size: 11px;">
                Este correo fue generado automáticamente. Por favor no responda a esta dirección.
            </span>
        </div>

    </div>
</body>
</html>