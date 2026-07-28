<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Guía de Recolección — DIAHMOES</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #189BAF; color: white; text-align: center; padding: 20px; }
        .logo { max-width: 120px; margin-bottom: 10px; }
        .content { padding: 25px; }
        p { color: #666; line-height: 1.5; margin: 10px 0; }
        .folio { background: #f8f9fa; padding: 10px; border-radius: 5px; font-weight: bold; color: #189BAF; margin: 15px 0; font-size: 16px; text-align: center; }
        .highlight-box { background: #e8f5f7; border-left: 4px solid #189BAF; border-radius: 4px; padding: 12px 15px; margin: 15px 0; font-size: 13px; color: #333; text-align: center; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ asset('assets/logo.png') }}" alt="DIAHMOES" class="logo">
            <h2 style="margin: 0; font-size: 18px;">DIAHMOES</h2>
        </div>
        <div class="content">
            <p style="text-align:center; color: #333; font-size: 15px;">
                Adjunto encontrarás la guía de recolección para tu solicitud.
            </p>
            @if($solicitud->FOLIO_MERCK)
            <div class="folio">FOLIO {{ $solicitud->FOLIO_MERCK }}</div>
            @endif
            <div class="highlight-box">
                📎 <strong>Revisa el archivo PDF adjunto en este correo.</strong>
            </div>
            <p style="text-align:center; font-size: 13px;">
                {{ $solicitud->PROGRAMAR_PARA
                    ? \Carbon\Carbon::parse($solicitud->PROGRAMAR_PARA)->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY')
                    : '' }}
                @if($solicitud->HORARIO) &nbsp;·&nbsp; {{ $solicitud->HORARIO }} @endif
            </p>
        </div>
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