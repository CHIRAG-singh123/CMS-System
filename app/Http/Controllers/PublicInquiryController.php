<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublicInquiryRequest;
use App\Mail\PublicInquiryConfirmationMail;
use App\Mail\PublicInquirySubmittedMail;
use App\Models\Inquiry;
use App\Models\SiteSetting;
use App\Support\FixedCmsPageRegistry;
use App\Support\FixedCmsPageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class PublicInquiryController extends Controller
{
    public function store(PublicInquiryRequest $request, FixedCmsPageService $pages): RedirectResponse
    {
        $payload = $request->safe()->except(['website']);

        if (! Schema::hasColumn('inquiries', 'phone_country')) {
            unset($payload['phone_country']);
        }

        $payload['status'] = 'new';
        $payload['ip_address'] = $request->ip();
        $payload['user_agent'] = $request->userAgent();

        $inquiry = Inquiry::query()->create($payload);
        $this->sendNotificationsAfterResponse($inquiry->id);

        return redirect()
            ->route('public.contact')
            ->with('success', data_get(
                $pages->viewData($pages->page(FixedCmsPageRegistry::CONTACT)),
                'sections.form.successMessage',
                'Your inquiry has been received.',
            ));
    }

    private function sendNotificationsAfterResponse(int $inquiryId): void
    {
        defer(function () use ($inquiryId): void {
            $inquiry = Inquiry::query()->find($inquiryId);

            if (! $inquiry) {
                return;
            }

            $settings = SiteSetting::singleton();
            $recipient = $settings->export_email ?: config('mail.from.address');

            if ($recipient) {
                try {
                    Mail::to($recipient)->queue(new PublicInquirySubmittedMail($inquiry));
                } catch (\Throwable $exception) {
                    Log::warning('Failed to send public inquiry admin email.', [
                        'inquiry_id' => $inquiry->id,
                        'error' => $exception->getMessage(),
                    ]);
                }
            }

            try {
                Mail::to($inquiry->email)->queue(new PublicInquiryConfirmationMail($inquiry, $settings));
            } catch (\Throwable $exception) {
                Log::warning('Failed to send public inquiry confirmation email.', [
                    'inquiry_id' => $inquiry->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }, "public-inquiry-mails:{$inquiryId}");
    }
}
