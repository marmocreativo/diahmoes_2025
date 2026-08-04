<?php

namespace App\Mail;

use App\Models\Estudio;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EstudioMensajeGeneral extends Mailable
{
    use Queueable, SerializesModels;

    public Estudio $estudio;
    public string $titulo;
    public string $asuntoPdf;
    public string $asuntoCorreo;
    public string $mensaje;

    /**
     * @param Estudio $estudio
     * @param string $titulo        Título grande del PDF (ej. "Aviso de Enriquecimiento de Muestra")
     * @param string $asuntoPdf     Etiqueta de la sección de mensaje dentro del PDF (ej. "Enriquecimiento")
     * @param string $asuntoCorreo  Texto para el asunto del correo (ej. "Enriquecimiento de Muestra")
     * @param string $mensaje       Contenido del mensaje (texto libre)
     */
    public function __construct(Estudio $estudio, string $titulo, string $asuntoPdf, string $asuntoCorreo, string $mensaje)
    {
        $this->estudio = $estudio;
        $this->titulo = $titulo;
        $this->asuntoPdf = $asuntoPdf;
        $this->asuntoCorreo = $asuntoCorreo;
        $this->mensaje = $mensaje;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->asuntoCorreo . ' - ' . ($this->estudio->CLAVE_INTERNA ?? 'Sin clave') . ' | Diahmoes';

        $email = $this->from('resultados@geneticlab.mx', 'Diahmoes')
            ->subject($subject)
            ->view('emails.mensaje-general', [
                'estudio' => $this->estudio,
                'titulo' => $this->titulo,
                'mensaje' => $this->mensaje,
            ]);

        $this->attachPdf();

        return $email;
    }

    /**
     * Generar el PDF en memoria (sin escribir a disco, por las
     * limitaciones de Bluehost) y adjuntarlo.
     */
    private function attachPdf(): void
    {
        try {
            $estudio = $this->estudio;
            $estudio->loadMissing(['medico', 'paciente', 'institucion', 'cliente']);

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.estudio-general', [
                'estudio' => $estudio,
                'paciente' => $estudio->paciente,
                'medico' => $estudio->medico,
                'institucion' => $estudio->institucion,
                'cliente' => $estudio->cliente,
                'paraImprimir' => false,
                'titulo' => $this->titulo,
                'asunto' => $this->asuntoPdf,
                'mensaje' => $this->mensaje,
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isPhpEnabled' => true,
                'defaultFont' => 'Arial',
                'isRemoteEnabled' => true,
            ]);

            $filename = 'DIAHMOES_' . ($estudio->CLAVE_INTERNA ?? $estudio->ID) . '_' . str($this->asuntoPdf)->slug() . '.pdf';

            $this->attachData($pdf->output(), $filename, [
                'mime' => 'application/pdf',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error generando/adjuntando PDF de mensaje general: ' . $e->getMessage());
        }
    }
}