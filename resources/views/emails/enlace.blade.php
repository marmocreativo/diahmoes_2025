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
      
      .btn {
        display: inline-block;
        background: #189BAF;
        color: white;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 25px;
        margin: 20px 0;
        font-weight: bold;
        transition: background-color 0.3s;
      }
      
      .btn:hover {
        background: #147a8a;
      }
      
      .security-note {
        background: #e8f4f8;
        border-left: 4px solid #189BAF;
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
            <img src="https://diahmoes.com.mx/assets/logo.png" alt="DIAHMOES" class="logo">
            <h2 style="margin: 0; font-size: 18px;">Resultados Disponibles</h2>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h1>Estimado Doctor/a</h1>
            
            <div class="folio">
                Estudio {{ $info['FOLIO'] }}
            </div>
            
            <p>Los resultados del análisis genético molecular han sido procesados exitosamente y están disponibles para su consulta.</p>
            
            <a href="{{ route('estudios.pdf.public', ['id' => $info['ID'], 'aleatorio' => $info['ALEATORIO']]) }}" 
               class="btn" target="_blank">
                Ver Resultados
            </a>
            
            <div class="security-note">
                <strong>Información Confidencial:</strong><br>
                Este enlace es único y seguro. Los resultados son estrictamente confidenciales y solo pueden ser consultados mediante este acceso directo.
            </div>
            
            <p style="font-size: 13px; color: #777; margin-top: 20px;">
                Si requiere asistencia técnica o tiene consultas sobre los resultados, 
                no dude en contactarnos a través de nuestros canales oficiales.
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