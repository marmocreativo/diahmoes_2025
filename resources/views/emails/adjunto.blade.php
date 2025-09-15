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
      
      .url-text {
        background: #f8f9fa;
        padding: 12px;
        margin: 15px 0;
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
            <div class="folio">
                REPORTE {{ $info['FOLIO'] }}
            </div>
            
            <p>Adjunto a este correo podrás encontrar el reporte {{ $info['FOLIO'] }}</p>
            
            <p>Si tienes problemas para ver el adjunto puedes copiar y pegar la siguiente dirección en tu navegador</p>
            
            <div class="url-text">
                {{ route('estudios.pdf.public', ['id' => $info['ID'], 'aleatorio' => $info['ALEATORIO']]) }}
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

    @if(!empty($tokenTracking))
    <!-- Pixel de tracking - invisible -->
    <img src="{{ route('tracking.pixel', ['token' => $tokenTracking]) }}" 
         width="1" height="1" 
         style="display:none; visibility:hidden; position:absolute;" 
         alt="" />
    @endif
</body>
</html>