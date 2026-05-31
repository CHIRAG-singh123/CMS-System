<?php

namespace App\Mail;

use App\Models\Inquiry;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PublicInquiryConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public Inquiry $inquiry,
        public SiteSetting $settings,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We received your inquiry: '.$this->inquiry->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.public-inquiry-confirmation',
        );
    }
}
