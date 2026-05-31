<?php

namespace App\Models;

use App\Notifications\AdminResetPassword;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Traits\HasRoles;

class Admin extends Authenticatable
{
    use HasFactory;
    use HasRoles;
    use Notifiable;

    public const TWO_FACTOR_CODE_LENGTH = 6;
    public const TWO_FACTOR_CODE_EXPIRY_MINUTES = 10;
    public const TWO_FACTOR_RESEND_COOLDOWN_SECONDS = 60;
    public const TWO_FACTOR_MAX_ATTEMPTS = 5;

    protected string $guard_name = 'admin';

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'phone',
        'phone_country',
        'job_title',
        'timezone',
        'bio',
        'google_id',
        'theme_preference',
        'status',
        'last_login_at',
        'two_factor_enabled_at',
        'two_factor_method',
        'authenticator_secret',
        'two_factor_code_hash',
        'two_factor_code_expires_at',
        'two_factor_code_sent_at',
        'two_factor_code_attempts',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'authenticator_secret',
        'two_factor_code_hash',
    ];

    protected function casts(): array
    {
        return [
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled_at' => 'datetime',
            'authenticator_secret' => 'encrypted',
            'two_factor_code_expires_at' => 'datetime',
            'two_factor_code_sent_at' => 'datetime',
            'two_factor_code_attempts' => 'integer',
        ];
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class, 'uploaded_by');
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getDefaultGuardName(): string
    {
        return $this->guard_name;
    }

    public function primaryRole(): ?Role
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->sortBy('name')->first();
        }

        return $this->roles()->orderBy('name')->first();
    }

    public function isSuperAdmin(): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains(fn (Role $role): bool => $role->slug === Role::SUPER_ADMIN_SLUG);
        }

        return $this->roles()->where('slug', Role::SUPER_ADMIN_SLUG)->exists();
    }

    public function hasTwoFactorEnabled(): bool
    {
        return $this->isEmailTwoFactorEnabled() || $this->isAuthenticatorAppEnabled();
    }

    public function isEmailTwoFactorEnabled(): bool
    {
        return $this->two_factor_enabled_at !== null && $this->two_factor_method === 'email';
    }

    public function isAuthenticatorAppEnabled(): bool
    {
        return $this->two_factor_enabled_at !== null
            && $this->two_factor_method === 'authenticator'
            && filled($this->authenticator_secret);
    }

    public function issueTwoFactorCode(): string
    {
        $code = str_pad((string) random_int(0, (10 ** self::TWO_FACTOR_CODE_LENGTH) - 1), self::TWO_FACTOR_CODE_LENGTH, '0', STR_PAD_LEFT);

        $this->forceFill([
            'two_factor_code_hash' => Hash::make($code),
            'two_factor_code_expires_at' => now()->addMinutes(self::TWO_FACTOR_CODE_EXPIRY_MINUTES),
            'two_factor_code_sent_at' => now(),
            'two_factor_code_attempts' => 0,
        ])->save();

        return $code;
    }

    public function clearTwoFactorChallenge(): void
    {
        $this->forceFill([
            'two_factor_code_hash' => null,
            'two_factor_code_expires_at' => null,
            'two_factor_code_sent_at' => null,
            'two_factor_code_attempts' => 0,
        ])->save();
    }

    public function hasValidTwoFactorCode(string $code): bool
    {
        return $this->two_factor_code_hash !== null
            && $this->two_factor_code_expires_at?->isFuture()
            && Hash::check($code, $this->two_factor_code_hash);
    }

    public function canResendTwoFactorCode(): bool
    {
        return $this->two_factor_code_sent_at === null
            || $this->two_factor_code_sent_at->lte(now()->subSeconds(self::TWO_FACTOR_RESEND_COOLDOWN_SECONDS));
    }

    public function incrementTwoFactorAttempts(): int
    {
        $attempts = ((int) $this->two_factor_code_attempts) + 1;

        $this->forceFill([
            'two_factor_code_attempts' => $attempts,
        ])->save();

        return $attempts;
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new AdminResetPassword($token));
    }
}
