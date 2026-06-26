<?php

namespace App\Mail;

use App\Models\SolicitudCliente;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolicitudClienteRecibida extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public SolicitudCliente $solicitud) {}

    public function envelope(): Envelope
    {
        $folio = $this->solicitud->FOLIO_MERCK
            ? ' #' . $this->solicitud->FOLIO_MERCK
            : '';

        return new Envelope(
            from: config('mail.from.address'),
            subject: 'Nueva solicitud recibida' . $folio,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.solicitud-cliente-recibida',
            with: ['solicitud' => $this->solicitud],
        );
    }
}