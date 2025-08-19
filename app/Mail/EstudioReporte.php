<?php

namespace App\Mail;

use App\Models\Estudio;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class EstudioReporte extends Mailable
{
    use Queueable, SerializesModels;

    public $estudio;
    public $enviarAdjunto;

    /**
     * Create a new message instance.
     */
    public function __construct(Estudio $estudio, bool $enviarAdjunto = false)
    {
        $this->estudio = $estudio;
        $this->enviarAdjunto = $enviarAdjunto;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'DIAHMOES - Reporte ' . ($this->estudio->FOLIO_MERCK ?? $this->estudio->CLAVE_INTERNA),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: $this->enviarAdjunto ? 'emails.adjunto' : 'emails.enlace',
            with: [
                'estudio' => $this->estudio,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        if (!$this->enviarAdjunto) {
            return [];
        }

        // Generar el PDF y adjuntarlo
        try {
            $this->estudio->load(['medico', 'paciente', 'institucion', 'cliente']);
            
            $data = [
                'estudio' => $this->estudio,
                'paciente' => $this->estudio->paciente,
                'medico' => $this->estudio->medico,
                'institucion' => $this->estudio->institucion,
                'cliente' => $this->estudio->cliente
            ];
            
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.estudio', $data);
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isPhpEnabled' => true,
                'defaultFont' => 'Arial'
            ]);
            
            $filename = 'DIAHMOES_' . ($this->estudio->CLAVE_INTERNA ?? $this->estudio->folio_completo) . '.pdf';
            
            return [
                Attachment::fromData(fn () => $pdf->output(), $filename)
                    ->withMime('application/pdf'),
            ];
        } catch (\Exception $e) {
            // Si hay error generando el PDF, no adjuntar nada
            \Log::error('Error generando PDF para adjuntar: ' . $e->getMessage());
            return [];
        }
    }
}