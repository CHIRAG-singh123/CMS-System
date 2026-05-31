<?php

namespace App\Mail;

use App\Models\Admin;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminTwoFactorCodeMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public Admin $admin,
        public string $code,
        public int $expiresInMinutes,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your admin verification code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-two-factor-code',
        );
    }
}
