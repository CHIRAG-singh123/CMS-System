<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $records = [
            ['client_name' => 'Sunil Arora', 'company_name' => 'Northline Foods'],
            ['client_name' => 'Priya Bedi', 'company_name' => 'Apex Process Works'],
            ['client_name' => 'Karan Gill', 'company_name' => 'Veda Pharmaceuticals'],
            ['client_name' => 'Nisha Dutta', 'company_name' => 'Helios Manufacturing'],
            ['client_name' => 'Ritesh Saini', 'company_name' => 'Prime Logistics'],
            ['client_name' => 'Mitali Bose', 'company_name' => 'Zenith Packaging'],
            ['client_name' => 'Tushar Rao', 'company_name' => 'Orbit Controls'],
            ['client_name' => 'Shruti Nanda', 'company_name' => 'Flowchem Industries'],
            ['client_name' => 'Samar Puri', 'company_name' => 'BlueRiver Utilities'],
            ['client_name' => 'Rhea Chopra', 'company_name' => 'Lattice Infra'],
            ['client_name' => 'Aniket Das', 'company_name' => 'Sterling Fabricators'],
            ['client_name' => 'Neha Bansal', 'company_name' => 'Delta Climate Systems'],
            ['client_name' => 'Harsh Oberoi', 'company_name' => 'Spark Safety Tech'],
            ['client_name' => 'Riya Sood', 'company_name' => 'Atlas Research Labs'],
            ['client_name' => 'Aman Kohli', 'company_name' => 'Nova Energy Grid'],
            ['client_name' => 'Sahana Joshi', 'company_name' => 'Vertex Automation'],
            ['client_name' => 'Anil Prasad', 'company_name' => 'Pinnacle Fabrication'],
            ['client_name' => 'Kavita Singh', 'company_name' => 'Prime Flow Systems'],
            ['client_name' => 'Siddharth Iyer', 'company_name' => 'Optima Controls'],
            ['client_name' => 'Ritika Bose', 'company_name' => 'Brightline Services'],
            ['client_name' => 'Gaurav Chopra', 'company_name' => 'Summit Packaging'],
            ['client_name' => 'Ayesha Nambiar', 'company_name' => 'Clearwater Systems'],
            ['client_name' => 'Manish Agarwal', 'company_name' => 'Strata Logistics'],
            ['client_name' => 'Neetu Sharma', 'company_name' => 'Arcadia Engineering'],
            ['client_name' => 'Lokesh Patel', 'company_name' => 'Prime Utilities'],
            ['client_name' => 'Shradha Jain', 'company_name' => 'Elemental Process Solutions'],
            ['client_name' => 'Vivek Nair', 'company_name' => 'Silverline Research'],
            ['client_name' => 'Pooja Anand', 'company_name' => 'Nexa Safety Systems'],
            ['client_name' => 'Karan Chawla', 'company_name' => 'Vertex Energy Solutions'],
        ];

        foreach ($records as $index => $record) {
            Testimonial::query()->updateOrCreate(
                [
                    'client_name' => $record['client_name'],
                    'company_name' => $record['company_name'],
                ],
                [
                    'client_designation' => 'Client Representative',
                    'image' => sprintf('seed/testimonials/testimonial-%02d.webp', $index + 1),
                    'rating' => 3 + ($index % 3),
                    'message' => 'Seeded testimonial '.($index + 1).' describing delivery quality, communication, and execution reliability.',
                    'status' => Testimonial::STATUSES[$index % count(Testimonial::STATUSES)],
                ],
            );
        }
    }
}
