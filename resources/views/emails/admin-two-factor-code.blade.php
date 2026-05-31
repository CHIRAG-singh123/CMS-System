<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin verification code</title>
</head>
<body style="margin:0;padding:32px;background:#f3f4f6;color:#18181b;font-family:Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;">
        <div style="margin-bottom:18px;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#71717a;font-weight:700;">Default Admin</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#71717a;">Secure access notification</p>
        </div>

        <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:20px;padding:36px 40px;box-shadow:0 20px 45px rgba(24,24,27,.08);">
            <h1 style="margin:0 0 14px;font-size:30px;line-height:1.2;color:#18181b;">Your admin verification code</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#52525b;">
                Hello {{ $admin->name }}, we received a request to continue a secure admin sign-in or confirm a two-factor authentication change.
                Use the one-time code below to proceed.
            </p>

            <div style="margin:0 0 28px;padding:24px 28px;border-radius:18px;background:#f8fafc;border:1px solid #d4d4d8;text-align:center;">
                <div style="margin:0 0 10px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#71717a;font-weight:700;">Verification code</div>
                <div style="font-size:38px;font-weight:700;letter-spacing:.38em;color:#18181b;">{{ $code }}</div>
            </div>

            <div style="margin:0 0 24px;padding:18px 20px;border-radius:16px;background:#fafafa;border:1px solid #e4e4e7;">
                <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#3f3f46;">
                    This verification code will expire in {{ $expiresInMinutes }} minutes.
                </p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#71717a;">
                    For your security, never share this code with anyone. Our team will never ask you for this value by phone, chat, or email.
                </p>
            </div>

            <p style="margin:0;font-size:14px;line-height:1.8;color:#71717a;">
                If you did not request this action, you can safely ignore this email. Your account will remain unchanged unless the correct verification code is entered.
            </p>
        </div>
    </div>
</body>
</html>
