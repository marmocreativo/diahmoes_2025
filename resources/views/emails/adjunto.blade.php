<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Reporte DIAHMOES - {{ $info['FOLIO'] }}</title>
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
        text-align: center;
      }
      
      h1 {
        color: #333;
        font-size: 20px;
        margin: 0 0 15px 0;
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
      }
      
      .attachment-box {
        background: #e8f5e8;
        border: 2px dashed #27ae60;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      
      .attachment-icon {
        font-size: 30px;
        color: #27ae60;
        margin-bottom: 10px;
      }
      
      .attachment-title {
        color: #27ae60;
        font-weight: bold;
        margin-bottom: 5px;
        font-size: 16px;
      }
      
      .link-section {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
        font-size: 12px;
        border-left: 4px solid #189BAF;
      }
      
      .link-text {
        word-break: break-all;
        background: white;
        padding: 8px;
        border-radius: 3px;
        border: 1px solid #ddd;
        font-family: monospace;
        color: #666;
        font-size: 10px;
      }
      
      .security-note {
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 12px;
        margin: 20px 0;
        border-radius: 4px;
        text-align: left;
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
      }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="{{ asset('assets/logo.png') }}" alt="DIAHMOES" class="logo">
            <h2 style="margin: 0; font-size: 18px;">Resultados en Archivo Adjunto</h2>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h1>Estimado Doctor/a</h1>
            
            <div class="folio">
                Estudio {{ $info['FOLIO'] }}
            </div>
            
            <p>Los resultados del análisis genético molecular se encuentran disponibles en el archivo PDF adjunto a este correo electrónico.</p>
            
            <!-- Attachment Indicator -->
            <div class="attachment-box">
                <div class="attachment-icon">📎</div>
                <div class="attachment-title">Archivo PDF Adjunto</div>
                <p style="margin: 0; font-size: 14px; color: #666;">
                    DIAHMOES_{{ $info['FOLIO'] }}.pdf
                </p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">
                    Reporte completo con interpretación clínica
                </p>
            </div>
            
            <div class="security-note">
                <strong>Información Confidencial:</strong><br>
                Este documento contiene información médica sensible y debe ser tratado con estricta confidencialidad según las normativas de protección de datos médicos.
            </div>
            
            <!-- Alternative Link -->
            <div class="link-section">
                <strong style="color: #189BAF;">Acceso Alternativo:</strong>
                <p style="margin: 5px 0; font-size: 11px;">Si presenta dificultades para acceder al archivo adjunto, puede consultar los resultados a través del siguiente enlace seguro:</p>
                <div class="link-text">{{ route('estudios.pdf.public', ['id' => $info['ID'], 'aleatorio' => $info['ALEATORIO']]) }}</div>
            </div>
            
            <p style="font-size: 13px; color: #777; margin-top: 20px;">
                Para consultas técnicas o interpretación de resultados, nuestro equipo médico está disponible a través de los canales oficiales de comunicación.
            </p>
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

    @if(!empty($tokenTracking))
    <!-- Pixel de tracking - invisible -->
    <img src="{{ route('tracking.pixel', ['token' => $tokenTracking]) }}" 
         width="1" height="1" 
         style="display:none; visibility:hidden; position:absolute;" 
         alt="" />
    @endif
</body>
</html>