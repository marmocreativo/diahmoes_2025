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
      }
      
      .link-section {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
        font-size: 12px;
      }
      
      .link-text {
        word-break: break-all;
        background: white;
        padding: 8px;
        border-radius: 3px;
        border: 1px solid #ddd;
        font-family: monospace;
        color: #666;
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
            <h2 style="margin: 0; font-size: 18px;">Reporte Adjunto</h2>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h1>Su reporte está adjunto</h1>
            
            <div class="folio">
                Reporte {{ $info['FOLIO'] }}
            </div>
            
            <p>Su análisis genético se encuentra adjunto a este correo electrónico.</p>
            
            <!-- Attachment Indicator -->
            <div class="attachment-box">
                <div class="attachment-title">Archivo Adjunto a este correo</div>
                <p style="margin: 0; font-size: 14px; color: #666;">
                    El reporte se encuentra en formato PDF
                </p>
            </div>
            
            <!-- Alternative Link -->
            <div class="link-section">
                <strong style="color: #189BAF;">Enlace Alternativo:</strong>
                <p style="margin: 5px 0; font-size: 11px;">Si no puede ver el adjunto:</p>
                <div class="link-text">{{ route('estudios.pdf.public', ['id' => $info['ID'], 'aleatorio' => $info['ALEATORIO']]) }}</div>
            </div>
            
            <p style="font-size: 12px; color: #999;">
                <strong>Confidencial:</strong> Solo comparta con su médico tratante.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <strong>DIAHMOES</strong><br>
            Laboratorio de Diagnóstico Molecular<br>
            <a href="https://diahmoes.com.mx" style="color: #189BAF;">diahmoes.com.mx</a>
        </div>
    </div>
</body>
</html>