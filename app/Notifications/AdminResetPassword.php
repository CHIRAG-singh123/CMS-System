<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;

class AdminResetPassword extends ResetPassword
{
    protected function resetUrl($notifiable): string
    {
        return url(route('admin.password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));
    }

    public function toMail($notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject(Lang::get('Reset your admin password'))
            ->view('emails.admin-reset-password', [
                'admin' => $notifiable,
                'url' => $url,
                'expiresInMinutes' => (int) config('auth.passwords.admins.expire'),
            ]);
    }
}
