<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Role;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Role::query()->get()->keyBy('slug');

        $admins = [
            ['name' => 'Super Admin', 'email' => 'admin@example.com', 'role' => Role::SUPER_ADMIN_SLUG, 'status' => 'active'],
            ['name' => 'Aisha Khan', 'email' => 'aisha.khan@example.com', 'role' => 'admin', 'status' => 'active'],
            ['name' => 'Rahul Verma', 'email' => 'rahul.verma@example.com', 'role' => 'content-manager', 'status' => 'active'],
            ['name' => 'Neha Kapoor', 'email' => 'neha.kapoor@example.com', 'role' => 'viewer', 'status' => 'active'],
            ['name' => 'Vikram Joshi', 'email' => 'vikram.joshi@example.com', 'role' => 'sales-manager', 'status' => 'active'],
            ['name' => 'Sana Iqbal', 'email' => 'sana.iqbal@example.com', 'role' => 'marketing-lead', 'status' => 'active'],
            ['name' => 'Arjun Malhotra', 'email' => 'arjun.malhotra@example.com', 'role' => 'support-lead', 'status' => 'active'],
            ['name' => 'Priya Nair', 'email' => 'priya.nair@example.com', 'role' => 'catalog-editor', 'status' => 'active'],
            ['name' => 'Karan Patel', 'email' => 'karan.patel@example.com', 'role' => 'seo-editor', 'status' => 'active'],
            ['name' => 'Meera Chopra', 'email' => 'meera.chopra@example.com', 'role' => 'gallery-manager', 'status' => 'active'],
            ['name' => 'Rohan Das', 'email' => 'rohan.das@example.com', 'role' => 'inquiry-operator', 'status' => 'active'],
            ['name' => 'Ishita Roy', 'email' => 'ishita.roy@example.com', 'role' => 'testimonial-editor', 'status' => 'active'],
            ['name' => 'Dev Khanna', 'email' => 'dev.khanna@example.com', 'role' => 'qa-reviewer', 'status' => 'inactive'],
            ['name' => 'Nidhi Menon', 'email' => 'nidhi.menon@example.com', 'role' => 'branch-admin', 'status' => 'active'],
            ['name' => 'Aman Sethi', 'email' => 'aman.sethi@example.com', 'role' => 'analytics-viewer', 'status' => 'inactive'],
            ['name' => 'Riya Singh', 'email' => 'riya.singh@example.com', 'role' => 'admin', 'status' => 'active'],
            ['name' => 'Tarun Mehta', 'email' => 'tarun.mehta@example.com', 'role' => 'content-manager', 'status' => 'active'],
            ['name' => 'Anjali Sharma', 'email' => 'anjali.sharma@example.com', 'role' => 'viewer', 'status' => 'inactive'],
            ['name' => 'Kunal Bhatt', 'email' => 'kunal.bhatt@example.com', 'role' => 'sales-manager', 'status' => 'active'],
            ['name' => 'Sneha Gupta', 'email' => 'sneha.gupta@example.com', 'role' => 'marketing-lead', 'status' => 'active'],
            ['name' => 'Aditya Rao', 'email' => 'aditya.rao@example.com', 'role' => 'support-lead', 'status' => 'inactive'],
            ['name' => 'Pooja Desai', 'email' => 'pooja.desai@example.com', 'role' => 'catalog-editor', 'status' => 'active'],
            ['name' => 'Vivek Choudhury', 'email' => 'vivek.choudhury@example.com', 'role' => 'seo-editor', 'status' => 'active'],
            ['name' => 'Ritika Sharma', 'email' => 'ritika.sharma@example.com', 'role' => 'gallery-manager', 'status' => 'active'],
            ['name' => 'Yash Singh', 'email' => 'yash.singh@example.com', 'role' => 'inquiry-operator', 'status' => 'active'],
            ['name' => 'Neelam Bose', 'email' => 'neelam.bose@example.com', 'role' => 'testimonial-editor', 'status' => 'active'],
            ['name' => 'Aarushi Jain', 'email' => 'aarushi.jain@example.com', 'role' => 'qa-reviewer', 'status' => 'inactive'],
            ['name' => 'Sameer Kapoor', 'email' => 'sameer.kapoor@example.com', 'role' => 'branch-admin', 'status' => 'active'],
            ['name' => 'Tanvi Iyer', 'email' => 'tanvi.iyer@example.com', 'role' => 'analytics-viewer', 'status' => 'inactive'],
            ['name' => 'Kavya Roy', 'email' => 'kavya.roy@example.com', 'role' => 'admin', 'status' => 'active'],
        ];

        $timezones = ['UTC', 'Asia/Kolkata', 'Europe/London', 'America/New_York', 'Asia/Dubai'];

        foreach ($admins as $index => $admin) {
            $model = Admin::query()->updateOrCreate(
                ['email' => $admin['email']],
                [
                    'name' => $admin['name'],
                    'password' => 'password',
                    'avatar' => sprintf('seed/admins/avatar-%02d.webp', $index + 1),
                    'phone' => sprintf('+91-91000%05d', $index + 1),
                    'job_title' => $this->jobTitleForRole($admin['role']),
                    'timezone' => $timezones[$index % count($timezones)],
                    'bio' => "{$admin['name']} is a seeded {$admin['role']} account.",
                    'theme_preference' => $index % 2 === 0 ? 'dark' : 'light',
                    'status' => $admin['status'],
                    'last_login_at' => now()->subDays($index),
                ],
            );

            $model->syncRoles([$roles[$admin['role']]->id]);
            $model->syncPermissions([]);
        }
    }

    private function jobTitleForRole(string $roleSlug): string
    {
        return match ($roleSlug) {
            Role::SUPER_ADMIN_SLUG => 'Platform Owner',
            'admin' => 'Operations Administrator',
            'content-manager' => 'Content Manager',
            'viewer' => 'Reporting Viewer',
            'sales-manager' => 'Sales Manager',
            'marketing-lead' => 'Marketing Lead',
            'support-lead' => 'Support Lead',
            'catalog-editor' => 'Catalog Editor',
            'seo-editor' => 'SEO Editor',
            'gallery-manager' => 'Gallery Manager',
            'inquiry-operator' => 'Inquiry Operator',
            'testimonial-editor' => 'Testimonial Editor',
            'qa-reviewer' => 'QA Reviewer',
            'branch-admin' => 'Branch Administrator',
            'analytics-viewer' => 'Analytics Viewer',
            default => 'Administrator',
        };
    }
}
