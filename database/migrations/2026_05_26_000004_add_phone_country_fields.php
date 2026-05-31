<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Propaganistas\LaravelPhone\PhoneNumber;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table): void {
            $table->string('phone_country', 2)->nullable()->after('phone');
        });

        Schema::table('members', function (Blueprint $table): void {
            $table->string('phone_country', 2)->nullable()->after('phone');
        });

        Schema::table('inquiries', function (Blueprint $table): void {
            $table->string('phone_country', 2)->nullable()->after('phone');
        });

        Schema::table('site_settings', function (Blueprint $table): void {
            $table->string('phone_country', 2)->nullable()->after('phone');
            $table->string('whatsapp_number_country', 2)->nullable()->after('whatsapp_number');
        });

        $this->backfillCountry('admins', 'phone', 'phone_country');
        $this->backfillCountry('members', 'phone', 'phone_country');
        $this->backfillCountry('inquiries', 'phone', 'phone_country');
        $this->backfillCountry('site_settings', 'phone', 'phone_country');
        $this->backfillCountry('site_settings', 'whatsapp_number', 'whatsapp_number_country');
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropColumn(['phone_country', 'whatsapp_number_country']);
        });

        Schema::table('inquiries', function (Blueprint $table): void {
            $table->dropColumn('phone_country');
        });

        Schema::table('members', function (Blueprint $table): void {
            $table->dropColumn('phone_country');
        });

        Schema::table('admins', function (Blueprint $table): void {
            $table->dropColumn('phone_country');
        });
    }

    private function backfillCountry(string $table, string $numberColumn, string $countryColumn): void
    {
        DB::table($table)
            ->select(['id', $numberColumn])
            ->whereNotNull($numberColumn)
            ->where($numberColumn, '!=', '')
            ->whereNull($countryColumn)
            ->orderBy('id')
            ->chunkById(100, function ($rows) use ($table, $numberColumn, $countryColumn): void {
                foreach ($rows as $row) {
                    DB::table($table)
                        ->where('id', $row->id)
                        ->update([$countryColumn => $this->detectCountry((string) $row->{$numberColumn})]);
                }
            });
    }

    private function detectCountry(string $number): string
    {
        try {
            $country = (new PhoneNumber($number))->getCountry();

            if (is_string($country) && $country !== '') {
                return strtoupper($country);
            }
        } catch (\Throwable) {
        }

        return 'IN';
    }
};
