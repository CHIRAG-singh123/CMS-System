<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Role::query()
            ->where('status', 'active')
            ->where('slug', '!=', Role::SUPER_ADMIN_SLUG)
            ->get(['id', 'slug'])
            ->keyBy('slug');

        $members = [
            ['name' => 'Aarav Mehta', 'designation' => 'Managing Director', 'role' => 'admin'],
            ['name' => 'Diya Shah', 'designation' => 'Operations Head', 'role' => 'branch-admin'],
            ['name' => 'Rohan Verma', 'designation' => 'Sales Director', 'role' => 'sales-manager'],
            ['name' => 'Ishita Kapoor', 'designation' => 'Marketing Lead', 'role' => 'marketing-lead'],
            ['name' => 'Kabir Nair', 'designation' => 'Process Engineer', 'role' => 'catalog-editor'],
            ['name' => 'Anaya Joshi', 'designation' => 'Project Manager', 'role' => 'content-manager'],
            ['name' => 'Vivaan Patel', 'designation' => 'Field Service Lead', 'role' => 'support-lead'],
            ['name' => 'Myra Iqbal', 'designation' => 'Quality Manager', 'role' => 'qa-reviewer'],
            ['name' => 'Arjun Khanna', 'designation' => 'Solutions Architect', 'role' => 'seo-editor'],
            ['name' => 'Kiara Menon', 'designation' => 'Client Success Manager', 'role' => 'analytics-viewer'],
            ['name' => 'Reyansh Roy', 'designation' => 'Procurement Head', 'role' => 'viewer'],
            ['name' => 'Aditi Malhotra', 'designation' => 'Design Coordinator', 'role' => 'gallery-manager'],
            ['name' => 'Neil Sethi', 'designation' => 'Safety Specialist', 'role' => 'qa-reviewer'],
            ['name' => 'Sara Fernandes', 'designation' => 'HR Business Partner', 'role' => 'support-lead'],
            ['name' => 'Devika Rao', 'designation' => 'Technical Writer', 'role' => 'testimonial-editor'],
            ['name' => 'Kavya Jain', 'designation' => 'Logistics Coordinator', 'role' => 'branch-admin'],
            ['name' => 'Rohit Bhatia', 'designation' => 'Automation Specialist', 'role' => 'catalog-editor'],
            ['name' => 'Simran Kaur', 'designation' => 'Digital Content Specialist', 'role' => 'content-manager'],
            ['name' => 'Nikhil Aggarwal', 'designation' => 'Service Delivery Manager', 'role' => 'support-lead'],
            ['name' => 'Pooja Kulkarni', 'designation' => 'Brand Strategist', 'role' => 'marketing-lead'],
            ['name' => 'Arnav Singh', 'designation' => 'Process Analyst', 'role' => 'qa-reviewer'],
            ['name' => 'Ananya Patel', 'designation' => 'Customer Experience Lead', 'role' => 'viewer'],
            ['name' => 'Sahil Gupta', 'designation' => 'Engineering Supervisor', 'role' => 'admin'],
            ['name' => 'Megha Sharma', 'designation' => 'Gallery Coordinator', 'role' => 'gallery-manager'],
            ['name' => 'Naveen Joshi', 'designation' => 'Data Insights Analyst', 'role' => 'analytics-viewer'],
            ['name' => 'Priyanka Bansal', 'designation' => 'Operations Planner', 'role' => 'branch-admin'],
            ['name' => 'Tarun Shah', 'designation' => 'Inventory Specialist', 'role' => 'catalog-editor'],
            ['name' => 'Rhea Nanda', 'designation' => 'Communications Officer', 'role' => 'testimonial-editor'],
            ['name' => 'Kunal Desai', 'designation' => 'Compliance Officer', 'role' => 'qa-reviewer'],
        ];

        foreach ($members as $index => $member) {
            $slug = Str::slug($member['name']);
            $role = $roles->get($member['role']) ?? $roles->get('viewer');

            Member::query()->updateOrCreate(
                ['email' => "{$slug}@example.com"],
                [
                    'name' => $member['name'],
                    'designation' => $member['designation'],
                    'image' => sprintf('seed/members/member-%02d.webp', $index + 1),
                    'short_bio' => "{$member['name']} serves as {$member['designation']} in the seeded dataset.",
                    'phone' => sprintf('+91-88000%05d', $index + 1),
                    'linkedin' => "https://www.linkedin.com/in/{$slug}",
                    'twitter' => "https://x.com/{$slug}",
                    'instagram' => "https://instagram.com/{$slug}",
                    'role_id' => $role?->id,
                    'status' => Member::STATUSES[$index % count(Member::STATUSES)],
                ],
            );
        }
    }
}
