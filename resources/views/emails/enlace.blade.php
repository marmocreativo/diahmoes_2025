<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Reporte DIAHMOES - {{ $info['FOLIO'] }}</title>
    <style>
      /* -------------------------------------
          GLOBAL RESETS
      ------------------------------------- */
      img {
        border: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100%;
      }
      
      body {
        background: linear-gradient(135deg, #eeeeee 0%, #dddddd 100%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 16px;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%;
      }
      
      table td {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 16px;
        vertical-align: top;
      }

      /* -------------------------------------
          BODY & CONTAINER
      ------------------------------------- */
      .body {
        background: linear-gradient(135deg, #eeeeee 0%, #dddddd 100%);
        width: 100%;
        min-height: 100vh;
      }
      
      .container {
        display: block;
        margin: 0 auto !important;
        max-width: 600px;
        padding: 20px;
        width: 600px;
      }
      
      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 600px;
        padding: 0;
      }

      /* -------------------------------------
          MAIN CARD
      ------------------------------------- */
      .main {
        background: #ffffff;
        border-radius: 20px;
        width: 100%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      
      .header-section {
        background: linear-gradient(90deg, #eeeeee 0%, #ffffff 100%);
        padding: 40px 30px;
        text-align: center;
        color: white;
      }
      
      .logo-container {
        margin-bottom: 20px;
      }
      
      .logo {
        max-width: 200px;
        height: auto;
        border-radius: 10px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }
      
      .header-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .header-subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin: 10px 0 0 0;
        font-weight: 300;
      }

      .wrapper {
        box-sizing: border-box;
        padding: 40px 30px;
      }
      
      .content-block {
        margin-bottom: 30px;
      }
      
      .icon-container {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #3498db, #2980b9);
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: white;
        box-shadow: 0 10px 25px rgba(52, 152, 219, 0.3);
      }

      /* -------------------------------------
          TYPOGRAPHY
      ------------------------------------- */
      h1, h2, h3, h4 {
        color: #2c3e50;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 600;
        line-height: 1.4;
        margin: 0;
        margin-bottom: 20px;
      }
      
      h2 {
        font-size: 24px;
        text-align: center;
        color: #34495e;
      }
      
      p {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 16px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 20px;
        color: #555;
        line-height: 1.6;
      }
      
      .highlight-text {
        background: linear-gradient(120deg, #3498db 0%, #2980b9 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
        font-size: 18px;
      }

      /* -------------------------------------
          MODERN BUTTON
      ------------------------------------- */
      .btn-container {
        text-align: center;
        margin: 40px 0;
      }
      
      .btn-modern {
        display: inline-block;
        padding: 18px 40px;
        background: linear-gradient(135deg, #189BAF 0%, #189BAF 100%);
        color: white !important;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.3s ease;
        box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .btn-modern:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(52, 152, 219, 0.4);
      }
      
      .btn-icon {
        margin-right: 10px;
        font-size: 18px;
      }

      /* -------------------------------------
          INFO SECTION
      ------------------------------------- */
      .info-section {
        background: #f8f9fa;
        border-radius: 15px;
        padding: 25px;
        margin: 30px 0;
        border-left: 5px solid #3498db;
      }
      
      .info-title {
        font-size: 14px;
        font-weight: 600;
        color: #3498db;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
      }
      
      .info-content {
        font-size: 14px;
        color: #666;
        word-break: break-all;
        background: white;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }

      /* -------------------------------------
          FOOTER
      ------------------------------------- */
      .footer {
        background: #2c3e50;
        padding: 30px;
        text-align: center;
        color: white;
      }
      
      .footer p {
        color: #bdc3c7;
        font-size: 14px;
        margin-bottom: 10px;
      }
      
      .footer-links {
        margin-top: 20px;
      }
      
      .footer-links a {
        color: #3498db;
        text-decoration: none;
        margin: 0 15px;
        font-size: 14px;
      }

      /* -------------------------------------
          RESPONSIVE
      ------------------------------------- */
      @media only screen and (max-width: 620px) {
        .container {
          width: 100% !important;
          padding: 10px !important;
        }
        
        .wrapper {
          padding: 30px 20px !important;
        }
        
        .header-section {
          padding: 30px 20px !important;
        }
        
        .header-title {
          font-size: 24px !important;
        }
        
        .btn-modern {
          padding: 16px 30px !important;
          font-size: 14px !important;
        }
        
        .info-section {
          padding: 20px !important;
        }
      }

      /* -------------------------------------
          ANIMATIONS
      ------------------------------------- */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate {
        animation: fadeInUp 0.6s ease-out;
      }
    </style>
</head>
<body class="body">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
            <td class="container">
                <div class="content">
                    <!-- MAIN CARD -->
                    <table role="presentation" class="main">
                        <!-- HEADER SECTION -->
                        <tr>
                            <td class="header-section">
                                <div class="logo-container">
                                    <img src="https://diahmoes.com.mx/assets/logo.png" alt="DIAHMOES Logo" class="logo">
                                </div>
                                <h1 class="header-title">Reporte Disponible</h1>
                                <p class="header-subtitle">Su análisis genético ha sido completado exitosamente</p>
                            </td>
                        </tr>
                        
                        <!-- CONTENT SECTION -->
                        <tr>
                            <td class="wrapper">
                                <!-- Main Content -->
                                <div class="content-block animate">
                                    <h2>¡Su reporte está listo!</h2>
                                    <p>Estimado paciente, nos complace informarle que su</p>
                                    <p><span class="highlight-text">Reporte {{ $info['FOLIO'] }}</span></p>
                                    <p>ha sido procesado y está disponible para su descarga.</p>
                                    
                                    <p>Este documento contiene los resultados de su análisis genético realizado en nuestros laboratorios especializados.</p>
                                </div>
                                
                                <!-- Download Button -->
                                <div class="btn-container">
                                    <a href="{{ route('estudios.pdf.public', ['id' => $info['ID'], 'aleatorio' => $info['ALEATORIO']]) }}" 
                                       class="btn-modern" target="_blank">
                                        <span class="btn-icon">⬇</span>
                                        Descargar Reporte
                                    </a>
                                </div>
                                
                                <!-- Info Section -->
                                <div class="info-section">
                                    <div class="info-title">Enlace Alternativo</div>
                                    <p style="margin-bottom: 10px; color: #666;">Si tiene problemas para descargar, puede copiar y pegar este enlace en su navegador:</p>
                                    <div class="info-content">{{ route('estudios.pdf.public', ['id' => $info['ID'], 'aleatorio' => $info['ALEATORIO']]) }}</div>
                                </div>
                                
                                <!-- Additional Info -->
                                <div class="content-block">
                                    <p style="text-align: center; color: #7f8c8d; font-size: 14px;">
                                        <strong>Importante:</strong> Este enlace es seguro y confidencial. Solo usted puede acceder a este reporte.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- FOOTER -->
                        <tr>
                            <td class="footer">
                                <p><strong>DIAHMOES</strong></p>
                                <p>Laboratorio de Diagnóstico Molecular Especializado</p>
                                <div class="footer-links">
                                    <a href="https://diahmoes.com.mx">Sitio Web</a>
                                    <a href="mailto:contacto@diahmoes.com.mx">Contacto</a>
                                </div>
                                <p style="margin-top: 20px; font-size: 12px;">
                                    Este correo fue enviado automáticamente. Por favor no responda a este mensaje.
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>