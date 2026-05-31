<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Inquiry received</title>
</head>
<body style="margin:0;padding:32px;background:#f3f4f6;color:#18181b;font-family:Arial,sans-serif;">
    @php
        $companyPhone = $settings->phone;

        if ($companyPhone && $settings->phone_country) {
            try {
                $companyPhone = phone($companyPhone, $settings->phone_country)->formatInternational();
            } catch (\Throwable) {
                // Keep the stored value as fallback.
            }
        }
    @endphp
    <div style="max-width:680px;margin:0 auto;">
        <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:20px;padding:34px 38px;box-shadow:0 20px 45px rgba(24,24,27,.08);">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#71717a;font-weight:700;">
                {{ $settings->company_name ?: config('app.name') }}
            </p>
            <h1 style="margin:0 0 14px;font-size:28px;line-height:1.2;color:#18181b;">Your inquiry has been received</h1>
            <p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#52525b;">
                Thank you, {{ $inquiry->name }}. Our team will review your request and respond using the contact details you provided.
            </p>

            <div style="margin:0 0 24px;padding:18px 20px;border-radius:16px;background:#fafafa;border:1px solid #e4e4e7;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#3f3f46;">Subject</p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#52525b;">{{ $inquiry->subject }}</p>
            </div>

            <p style="margin:0;font-size:13px;line-height:1.8;color:#71717a;">
                If you need to add more details, reply to this email or contact us directly.
                @if ($companyPhone)
                    Phone: {{ $companyPhone }}.
                @endif
            </p>
        </div>
    </div>
</body>
</html>
