<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class EstudioReporte extends Mailable
{
    use Queueable, SerializesModels;

    public $estudio;
    public $enviarAdjunto;
    public $info;

    /**
     * Create a new message instance.
     */
    public function __construct($estudio, $enviarAdjunto = false)
    {
        $this->estudio = $estudio;
        $this->enviarAdjunto = $enviarAdjunto;
        
        // Preparar datos como en el legacy
        $this->info = [
            'FOLIO' => $estudio->CLAVE_INTERNA,
            'ID' => $estudio->ID,
            'ALEATORIO' => $estudio->ID_ALEATORIO
        ];
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = 'Enlace de Reporte ' . $this->estudio->CLAVE_INTERNA . 
                  ' | PX: ' . ($this->estudio->MUESTRA_INICIALES ?: 'N/A') . 
                  ' | Diahmoes';

        $email = $this->from('resultados@diahmoes.com.mx', 'Reporte Diahmoes')
                      ->subject($subject);

        // Elegir vista según si se envía adjunto o no
        if ($this->enviarAdjunto) {
            $email->view('emails.adjunto', ['info' => $this->info]);
            
            // Generar y adjuntar PDF
            $this->attachPdf();
        } else {
            $email->view('emails.enlace', ['info' => $this->info]);
        }

        return $email;
    }

    /**
     * Generar y adjuntar el PDF del estudio
     */
    private function attachPdf()
    {
        try {
            // URL para generar el PDF (usando la ruta pública existente)
            $pdfUrl = route('estudios.pdf.public', [
                'id' => $this->info['ID'],
                'aleatorio' => $this->info['ALEATORIO']
            ]);

            // Descargar el PDF usando HTTP client
            $response = Http::timeout(30)->get($pdfUrl);
            
            if ($response->successful()) {
                $filename = 'DIAHMOES_' . $this->info['FOLIO'] . '.pdf';
                
                // Adjuntar el contenido del PDF
                $this->attachData(
                    $response->body(), 
                    $filename, 
                    [
                        'mime' => 'application/pdf',
                    ]
                );
                
                \Log::info("PDF adjuntado exitosamente: {$filename}");
            } else {
                \Log::error('Error al generar PDF para adjunto: ' . $response->status());
            }
        } catch (\Exception $e) {
            \Log::error('Error adjuntando PDF: ' . $e->getMessage());
            // Continuar sin adjunto si hay error
        }
    }
}