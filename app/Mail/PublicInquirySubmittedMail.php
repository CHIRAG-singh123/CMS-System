<?php

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class PublicInquirySubmittedMail extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public function __construct(public Inquiry $inquiry)
    {
        $this->inquiry->loadMissing('productService:id,title,type');
    }

    public function envelope(): Envelope
    {
        $envelope = new Envelope(
            subject: 'New website inquiry: '.$this->inquiry->subject,
        );

        if (filter_var($this->inquiry->email, FILTER_VALIDATE_EMAIL)) {
            $envelope->replyTo($this->inquiry->email, Str::limit($this->inquiry->name, 120, ''));
        }

        return $envelope;
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.public-inquiry-submitted',
        );
    }
}
