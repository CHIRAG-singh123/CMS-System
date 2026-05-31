<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New website inquiry</title>
</head>
<body style="margin:0;padding:32px;background:#f3f4f6;color:#18181b;font-family:Arial,sans-serif;">
    @php
        $inquiryPhone = $inquiry->phone;

        if ($inquiryPhone && $inquiry->phone_country) {
            try {
                $inquiryPhone = phone($inquiryPhone, $inquiry->phone_country)->formatInternational();
            } catch (\Throwable) {
                // Keep the stored value as fallback.
            }
        }
    @endphp
    <div style="max-width:720px;margin:0 auto;">
        <div style="margin-bottom:18px;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#71717a;font-weight:700;">Default Admin</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#71717a;">Website contact inquiry</p>
        </div>

        <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:20px;padding:36px 40px;box-shadow:0 20px 45px rgba(24,24,27,.08);">
            <h1 style="margin:0 0 14px;font-size:28px;line-height:1.2;color:#18181b;">New inquiry received</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#52525b;">
                A visitor submitted the public contact form. The inquiry is now available in the admin inquiries module.
            </p>

            <div style="margin:0 0 26px;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;">
                @foreach ([
                    'Name' => $inquiry->name,
                    'Email' => $inquiry->email,
                    'Phone' => $inquiryPhone ?: 'N/A',
                    'Type' => ucfirst(str_replace('_', ' ', $inquiry->inquiry_type)),
                    'Subject' => $inquiry->subject,
                    'Product / Service' => $inquiry->productService ? $inquiry->productService->title.' ('.$inquiry->productService->type.')' : 'N/A',
                    'IP address' => $inquiry->ip_address ?: 'N/A',
                ] as $label => $value)
                    <div style="display:flex;border-bottom:1px solid #e4e4e7;">
                        <div style="width:180px;padding:12px 16px;background:#fafafa;font-size:13px;font-weight:700;color:#3f3f46;">{{ $label }}</div>
                        <div style="flex:1;padding:12px 16px;font-size:13px;color:#52525b;">{{ $value }}</div>
                    </div>
                @endforeach
            </div>

            <div style="padding:18px 20px;border-radius:16px;background:#fafafa;border:1px solid #e4e4e7;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#3f3f46;">Message</p>
                <p style="margin:0;font-size:14px;line-height:1.8;color:#52525b;white-space:pre-wrap;">{{ $inquiry->message }}</p>
            </div>
        </div>
    </div>
</body>
</html>
