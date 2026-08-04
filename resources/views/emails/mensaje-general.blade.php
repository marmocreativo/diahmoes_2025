<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, Helvetica, sans-serif; color: #1a2e35; background:#f0f4f5; margin:0; padding:24px;">
    <table width="100%" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:6px; overflow:hidden;">
        <tr>
            <td style="background:#189BAF; padding:18px 24px;">
                <span style="color:#ffffff; font-size:16px; font-weight:bold;">DIAHMOES</span>
            </td>
        </tr>
        <tr>
            <td style="padding:24px;">
                <h2 style="color:#189BAF; font-size:16px; margin:0 0 12px 0;">{{ $titulo }}</h2>
                <p style="font-size:13px; line-height:1.6; margin:0 0 12px 0;">
                    Clave interna: <strong>{{ $estudio->CLAVE_INTERNA ?? $estudio->folio_completo }}</strong>
                </p>
                <div style="font-size:13px; line-height:1.8; white-space:pre-line; margin:0 0 16px 0;">{{ $mensaje }}</div>
                <p style="font-size:12px; color:#4a6670;">Se adjunta un documento PDF con más detalle.</p>
            </td>
        </tr>
        <tr>
            <td style="padding:14px 24px; background:#f9fcfc; font-size:10px; color:#8aa5ad;">
                Este es un mensaje automático de DIAHMOES · Diagnóstico Molecular Especializado
            </td>
        </tr>
    </table>
</body>
</html>