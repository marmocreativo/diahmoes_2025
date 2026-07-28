<?php

namespace App\Mail;

use App\Models\SolicitudCliente;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EnvioGuiaSolicitud extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public SolicitudCliente $solicitud,
        public string $rutaTemporal,
        public string $nombreArchivo
    ) {}

    public function envelope(): Envelope
    {
        $folio = $this->solicitud->FOLIO_MERCK ? ' #' . $this->solicitud->FOLIO_MERCK : '';

        return new Envelope(
            from: config('mail.from.address'),
            subject: 'Guía de recolección' . $folio,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.solicitud-cliente-guia',
            with: ['solicitud' => $this->solicitud],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath($this->rutaTemporal)
                ->as($this->nombreArchivo)
                ->withMime('application/pdf'),
        ];
    }
}