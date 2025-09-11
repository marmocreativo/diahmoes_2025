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
      
      .btn {
        display: inline-block;
        background: #189BAF;
        color: white;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 25px;
        margin: 20px 0;
        font-weight: bold;
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
            <img src="https://diahmoes.com.mx/assets/logo.png" alt="DIAHMOES" class="logo">
            <h2 style="margin: 0; font-size: 18px;">Reporte Disponible</h2>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h1>¡Su reporte está listo!</h1>
            
            <div class="folio">
                Reporte {{ $info['FOLIO'] }}
            </div>
            
            <p>Su análisis genético ha sido completado y está disponible para descarga.</p>
            
            <a href="{{ route('estudios.pdf.public', ['id' => $info['ID'], 'aleatorio' => $info['ALEATORIO']]) }}" 
               class="btn" target="_blank">
                ⬇ Descargar Reporte
            </a>
            
            <p style="font-size: 12px; color: #999;">
                Enlace seguro y confidencial. Solo usted puede acceder a este reporte.
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