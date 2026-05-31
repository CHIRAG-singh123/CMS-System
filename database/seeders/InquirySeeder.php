<?php

namespace Database\Seeders;

use App\Models\Inquiry;
use App\Models\ProductService;
use Illuminate\Database\Seeder;

class InquirySeeder extends Seeder
{
    public function run(): void
    {
        $productServices = ProductService::query()->orderBy('id')->get();

        for ($index = 1; $index <= 30; $index++) {
            $type = Inquiry::TYPES[($index - 1) % count(Inquiry::TYPES)];
            $status = Inquiry::STATUSES[($index - 1) % count(Inquiry::STATUSES)];
            $productService = in_array($type, ['product', 'service', 'quote'], true)
                ? $productServices[($index - 1) % $productServices->count()]
                : null;

            $subject = $productService
                ? "{$productService->title} {$type} request {$index}"
                : "General enquiry {$index}";

            Inquiry::query()->updateOrCreate(
                [
                    'email' => sprintf('contact%02d@example.com', $index),
                    'subject' => $subject,
                ],
                [
                    'inquiry_type' => $type,
                    'product_service_id' => $productService?->id,
                    'name' => "Contact {$index}",
                    'phone' => sprintf('+91-90000%05d', $index),
                    'message' => "Seeded enquiry message {$index} for {$type} workflow handling.",
                    'status' => $status,
                    'admin_note' => $status === 'new' ? null : "Follow-up note for seeded enquiry {$index}.",
                    'ip_address' => "192.168.10.{$index}",
                    'user_agent' => "Seeded Browser {$index} / Windows 11",
                ],
            );
        }
    }
}
