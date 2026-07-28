<?php

namespace App\Mail;

use App\Models\SolicitudCliente;
use App\Models\SolicitudClienteEvento;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolicitudClienteNotificacion extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public SolicitudCliente $solicitud,
        public SolicitudClienteEvento $evento,
        public string $urlDestino
    ) {}

    public function envelope(): Envelope
    {
        $folio = $this->solicitud->FOLIO_MERCK ? ' #' . $this->solicitud->FOLIO_MERCK : '';

        $asuntos = [
            'creacion'     => 'Nueva solicitud recibida' . $folio,
            'edicion'      => 'Solicitud actualizada' . $folio,
            'comentario'   => 'Nuevo comentario en tu solicitud' . $folio,
            'confirmacion' => 'Solicitud confirmada' . $folio,
        ];

        return new Envelope(
            from: config('mail.from.address'),
            subject: $asuntos[$this->evento->TIPO] ?? ('Actualización de solicitud' . $folio),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.solicitud-cliente-notificacion',
            with: [
                'solicitud'   => $this->solicitud,
                'evento'      => $this->evento,
                'urlDestino'  => $this->urlDestino,
            ],
        );
    }
}