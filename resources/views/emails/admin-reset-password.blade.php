<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Reset your admin password</title>
</head>
<body style="margin:0;padding:32px;background:#f3f4f6;color:#18181b;font-family:Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;">
        <div style="margin-bottom:18px;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#71717a;font-weight:700;">Default Admin</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#71717a;">Password assistance request</p>
        </div>

        <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:20px;padding:36px 40px;box-shadow:0 20px 45px rgba(24,24,27,.08);">
            <h1 style="margin:0 0 14px;font-size:30px;line-height:1.2;color:#18181b;">Reset your admin password</h1>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#52525b;">
                Hello {{ $admin->name }}, we received a request to reset the password for your admin account.
                Use the secure link below to choose a new password.
            </p>

            <div style="margin:0 0 26px;">
                <a
                    href="{{ $url }}"
                    style="display:inline-block;padding:14px 24px;border-radius:14px;background:#27272a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:.01em;"
                >
                    Reset admin password
                </a>
            </div>

            <div style="margin:0 0 24px;padding:18px 20px;border-radius:16px;background:#fafafa;border:1px solid #e4e4e7;">
                <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#3f3f46;">
                    This password reset link will expire in {{ $expiresInMinutes }} minutes.
                </p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#71717a;word-break:break-word;">
                    If the button above does not open correctly, copy and paste this URL into your browser:<br>
                    <span style="color:#3f3f46;">{{ $url }}</span>
                </p>
            </div>

            <p style="margin:0;font-size:14px;line-height:1.8;color:#71717a;">
                If you did not request a password reset, no further action is required and your current password will remain active.
            </p>
        </div>
    </div>
</body>
</html>
