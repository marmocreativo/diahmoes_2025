<?php

namespace App\Services;

use App\Models\EnvioCorreo;
use App\Models\Estudio;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class EnvioCorreoService
{
    /**
     * Registrar un envío de correo después de enviarlo
     */
    public function registrarEnvio($datos)
    {
        $envio = EnvioCorreo::create([
            'ID_ESTUDIO' => $datos['ID_ESTUDIO'],
            'ID_MEDICO' => $datos['ID_MEDICO'] ?? null,
            'ID_USUARIO_ENVIO' => $datos['ID_USUARIO_ENVIO'] ?? Auth::user()->ID_USUARIO ?? Auth::id(),
            'NOMBRE_DESTINATARIO' => $datos['NOMBRE_DESTINATARIO'],
            'CORREO_DESTINATARIO' => $datos['CORREO_DESTINATARIO'],
            'TIPO_ENVIO' => $datos['TIPO_ENVIO'], // 'enlace' o 'adjunto'
            'MENSAJE_HTML' => $datos['MENSAJE_HTML'],
            'ESTADO' => 'enviado',
        ]);

        return $envio;
    }

    /**
     * Agregar pixel de tracking al HTML del mensaje
     */
    public function agregarPixelTracking($htmlContent, $token)
    {
        $pixelUrl = route('tracking.pixel', ['token' => $token]);
        $pixel = '<img src="' . $pixelUrl . '" width="1" height="1" style="display:none;" alt="" />';
        
        // Insertar antes del cierre del body, o al final si no existe
        if (strpos($htmlContent, '</body>') !== false) {
            $htmlContent = str_replace('</body>', $pixel . '</body>', $htmlContent);
        } else {
            $htmlContent .= $pixel;
        }

        return $htmlContent;
    }

    /**
     * Enviar correo y registrar automáticamente
     */
    public function enviarYRegistrar($datosEnvio, $mailableClass = null)
    {
        try {
            // Registrar el envío primero para obtener el token
            $envio = $this->registrarEnvio($datosEnvio);
            
            // Agregar pixel de tracking al HTML
            $htmlConPixel = $this->agregarPixelTracking($datosEnvio['MENSAJE_HTML'], $envio->TOKEN_LECTURA);
            
            // Si se proporciona una clase Mailable personalizada
            if ($mailableClass) {
                Mail::to($datosEnvio['CORREO_DESTINATARIO'])
                    ->send(new $mailableClass($datosEnvio, $htmlConPixel, $envio));
            } else {
                // Envío básico con Mail::html()
                Mail::html($htmlConPixel, function ($message) use ($datosEnvio) {
                    $message->to($datosEnvio['CORREO_DESTINATARIO'], $datosEnvio['NOMBRE_DESTINATARIO'])
                           ->subject($datosEnvio['ASUNTO'] ?? 'Resultados de Estudio');
                });
            }

            return [
                'success' => true,
                'envio' => $envio,
                'message' => 'Correo enviado y registrado correctamente'
            ];

        } catch (\Exception $e) {
            // Si falla el envío, eliminar el registro
            if (isset($envio)) {
                $envio->delete();
            }

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Error al enviar el correo'
            ];
        }
    }

    /**
     * Obtener estadísticas de un estudio específico
     */
    public function estadisticasEstudio($estudioId)
    {
        $estudio = Estudio::findOrFail($estudioId);
        return $estudio->getEstadisticasCorreos();
    }

    /**
     * Verificar si un estudio tiene todos los correos leídos
     */
    public function estudioCorreosCompletos($estudioId)
    {
        $estudio = Estudio::findOrFail($estudioId);
        return $estudio->todosCorreosLeidos();
    }

    /**
     * Obtener último envío de un estudio
     */
    public function ultimoEnvioEstudio($estudioId)
    {
        $estudio = Estudio::findOrFail($estudioId);
        return $estudio->ultimoEnvioCorreo();
    }
}