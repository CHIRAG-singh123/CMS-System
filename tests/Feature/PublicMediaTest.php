<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicMediaTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_disk_files_are_served_through_media_route(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('admins/avatars/test-avatar.png', 'avatar-image');

        $this->get('/media/admins/avatars/test-avatar.png')
            ->assertOk()
            ->assertHeader('Cache-Control');
    }

    public function test_media_route_rejects_directory_traversal_attempts(): void
    {
        $this->get('/media/../.env')->assertNotFound();
    }
}
