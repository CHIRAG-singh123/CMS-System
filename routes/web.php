<?php

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CmsPageController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GalleryController;
use App\Http\Controllers\Admin\InquiryController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\NewPasswordController;
use App\Http\Controllers\Admin\PasswordResetLinkController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ProductServiceController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\TwoFactorChallengeController;
use App\Http\Controllers\PublicInquiryController;
use App\Http\Controllers\PublicMediaController;
use App\Http\Controllers\PublicSiteController;
use App\Http\Controllers\PublicThemeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::middleware('public.live')->group(function (): void {
    Route::get('/', [PublicSiteController::class, 'home'])->name('public.home');
    Route::get('/about-us', [PublicSiteController::class, 'about'])->name('public.about');
    Route::get('/services', [PublicSiteController::class, 'services'])->name('public.services');
    Route::get('/gallery', [PublicSiteController::class, 'gallery'])->name('public.gallery');
    Route::get('/contact-us', [PublicSiteController::class, 'contact'])->name('public.contact');
    Route::post('/contact-us/inquiries', [PublicInquiryController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('public.contact.inquiries.store');
    Route::post('/theme', [PublicThemeController::class, 'update'])->name('public.theme.update');
});

Route::get('/media/{path}', PublicMediaController::class)
    ->where('path', '.*')
    ->name('media.show');
Route::get('/storage/{path}', PublicMediaController::class)
    ->where('path', '.*')
    ->name('media.storage');

Route::prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', function () {
        return Auth::guard('admin')->check()
            ? redirect()->route('admin.dashboard')
            : redirect()->route('admin.login');
    })->name('home');

    Route::middleware('admin.guest')->group(function (): void {
        Route::get('/login', [AuthController::class, 'create'])->name('login');
        Route::post('/login', [AuthController::class, 'store'])->name('login.store');
        Route::get('/login/google/redirect', [AuthController::class, 'redirectToGoogle'])->name('login.google.redirect');
        Route::get('/login/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('login.google.callback');
        Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
        Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('password.email');
        Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
        Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.store');
        Route::get('/two-factor/challenge', [TwoFactorChallengeController::class, 'create'])->name('two-factor.challenge');
        Route::post('/two-factor/challenge', [TwoFactorChallengeController::class, 'store'])->name('two-factor.challenge.store');
        Route::post('/two-factor/challenge/resend', [TwoFactorChallengeController::class, 'resend'])->name('two-factor.challenge.resend');
    });

    Route::middleware(['admin.auth', 'admin.session'])->group(function (): void {
        Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->middleware('can:dashboard.view')
            ->name('dashboard');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
        Route::put('/profile/theme', [ProfileController::class, 'updateThemePreference'])->name('profile.theme.update');
        Route::put('/profile/google-login', [ProfileController::class, 'updateGoogleLoginVisibility'])
            ->middleware('can:settings.edit')
            ->name('profile.google-login.update');
        Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
        Route::delete('/profile/avatar', [ProfileController::class, 'destroyAvatar'])->name('profile.avatar.destroy');
        Route::post('/profile/two-factor/enable/request', [ProfileController::class, 'requestEnableTwoFactor'])
            ->name('profile.two-factor.enable.request');
        Route::post('/profile/two-factor/enable/confirm', [ProfileController::class, 'confirmEnableTwoFactor'])
            ->name('profile.two-factor.enable.confirm');
        Route::post('/profile/two-factor/disable/request', [ProfileController::class, 'requestDisableTwoFactor'])
            ->name('profile.two-factor.disable.request');
        Route::post('/profile/two-factor/disable/confirm', [ProfileController::class, 'confirmDisableTwoFactor'])
            ->name('profile.two-factor.disable.confirm');
        Route::post('/profile/two-factor/authenticator/enable/request', [ProfileController::class, 'requestEnableAuthenticatorTwoFactor'])
            ->name('profile.two-factor.authenticator.enable.request');
        Route::post('/profile/two-factor/authenticator/enable/confirm', [ProfileController::class, 'confirmEnableAuthenticatorTwoFactor'])
            ->name('profile.two-factor.authenticator.enable.confirm');
        Route::post('/profile/two-factor/authenticator/disable/request', [ProfileController::class, 'requestDisableAuthenticatorTwoFactor'])
            ->name('profile.two-factor.authenticator.disable.request');
        Route::post('/profile/two-factor/authenticator/disable/confirm', [ProfileController::class, 'confirmDisableAuthenticatorTwoFactor'])
            ->name('profile.two-factor.authenticator.disable.confirm');
        Route::post('/profile/logout-other-sessions', [ProfileController::class, 'logoutOtherSessions'])
            ->name('profile.logout-other-sessions');

        Route::get('/cms-pages', [CmsPageController::class, 'index'])
            ->middleware('can:cms_pages.view')
            ->name('cms-pages.index');
        Route::get('/cms-pages/create', [CmsPageController::class, 'create'])
            ->middleware('can:cms_pages.create')
            ->name('cms-pages.create');
        Route::post('/cms-pages', [CmsPageController::class, 'store'])
            ->middleware('can:cms_pages.create')
            ->name('cms-pages.store');
        Route::put('/cms-pages/reorder', [CmsPageController::class, 'reorder'])
            ->middleware('can:cms_pages.edit')
            ->name('cms-pages.reorder');
        Route::get('/cms-pages/{cmsPage}/edit', [CmsPageController::class, 'edit'])
            ->middleware('can:cms_pages.edit')
            ->name('cms-pages.edit');
        Route::put('/cms-pages/{cmsPage}', [CmsPageController::class, 'update'])
            ->middleware('can:cms_pages.edit')
            ->name('cms-pages.update');
        Route::delete('/cms-pages/{cmsPage}', [CmsPageController::class, 'destroy'])
            ->middleware('can:cms_pages.delete')
            ->name('cms-pages.destroy');

        Route::get('/products-services', [ProductServiceController::class, 'index'])
            ->middleware('can:products_services.view')
            ->name('products-services.index');
        Route::get('/products-services/create', [ProductServiceController::class, 'create'])
            ->middleware('can:products_services.create')
            ->name('products-services.create');
        Route::post('/products-services', [ProductServiceController::class, 'store'])
            ->middleware('can:products_services.create')
            ->name('products-services.store');
        Route::get('/products-services/{productService}/edit', [ProductServiceController::class, 'edit'])
            ->middleware('can:products_services.edit')
            ->name('products-services.edit');
        Route::put('/products-services/{productService}', [ProductServiceController::class, 'update'])
            ->middleware('can:products_services.edit')
            ->name('products-services.update');
        Route::delete('/products-services/{productService}', [ProductServiceController::class, 'destroy'])
            ->middleware('can:products_services.delete')
            ->name('products-services.destroy');

        Route::get('/categories', [CategoryController::class, 'index'])
            ->middleware('can:categories.view')
            ->name('categories.index');
        Route::get('/categories/create', [CategoryController::class, 'create'])
            ->middleware('can:categories.create')
            ->name('categories.create');
        Route::post('/categories', [CategoryController::class, 'store'])
            ->middleware('can:categories.create')
            ->name('categories.store');
        Route::put('/categories/reorder', [CategoryController::class, 'reorder'])
            ->middleware('can:categories.edit')
            ->name('categories.reorder');
        Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])
            ->middleware('can:categories.edit')
            ->name('categories.edit');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])
            ->middleware('can:categories.edit')
            ->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
            ->middleware('can:categories.delete')
            ->name('categories.destroy');

        Route::get('/inquiries', [InquiryController::class, 'index'])
            ->middleware('can:inquiries.view')
            ->name('inquiries.index');
        Route::get('/inquiries/{inquiry}', [InquiryController::class, 'show'])
            ->middleware('can:inquiries.view')
            ->name('inquiries.show');
        Route::put('/inquiries/{inquiry}/status', [InquiryController::class, 'updateStatus'])
            ->middleware('can:inquiries.edit')
            ->name('inquiries.status');
        Route::put('/inquiries/{inquiry}/note', [InquiryController::class, 'updateNote'])
            ->middleware('can:inquiries.edit')
            ->name('inquiries.note');
        Route::delete('/inquiries/{inquiry}', [InquiryController::class, 'destroy'])
            ->middleware('can:inquiries.delete')
            ->name('inquiries.destroy');

        Route::get('/members', [MemberController::class, 'index'])
            ->middleware('can:members.view')
            ->name('members.index');
        Route::get('/members/create', [MemberController::class, 'create'])
            ->middleware('can:members.create')
            ->name('members.create');
        Route::post('/members', [MemberController::class, 'store'])
            ->middleware('can:members.create')
            ->name('members.store');
        Route::get('/members/{member}/edit', [MemberController::class, 'edit'])
            ->middleware('can:members.edit')
            ->name('members.edit');
        Route::put('/members/{member}', [MemberController::class, 'update'])
            ->middleware('can:members.edit')
            ->name('members.update');
        Route::delete('/members/{member}', [MemberController::class, 'destroy'])
            ->middleware('can:members.delete')
            ->name('members.destroy');

        Route::get('/admin-users', [AdminUserController::class, 'index'])
            ->middleware('can:admin_users.view')
            ->name('admin-users.index');
        Route::get('/admin-users/create', [AdminUserController::class, 'create'])
            ->middleware('can:admin_users.create')
            ->name('admin-users.create');
        Route::post('/admin-users', [AdminUserController::class, 'store'])
            ->middleware('can:admin_users.create')
            ->name('admin-users.store');
        Route::get('/admin-users/{adminUser}/edit', [AdminUserController::class, 'edit'])
            ->middleware('can:admin_users.edit')
            ->name('admin-users.edit');
        Route::put('/admin-users/{adminUser}', [AdminUserController::class, 'update'])
            ->middleware('can:admin_users.edit')
            ->name('admin-users.update');
        Route::delete('/admin-users/{adminUser}', [AdminUserController::class, 'destroy'])
            ->middleware('can:admin_users.delete')
            ->name('admin-users.destroy');

        Route::get('/roles-permissions', [RolePermissionController::class, 'index'])
            ->middleware('can:roles_permissions.view')
            ->name('roles-permissions.index');
        Route::get('/roles-permissions/roles/create', [RolePermissionController::class, 'create'])
            ->middleware('can:roles_permissions.create')
            ->name('roles-permissions.roles.create');
        Route::post('/roles-permissions/roles', [RolePermissionController::class, 'store'])
            ->middleware('can:roles_permissions.create')
            ->name('roles-permissions.roles.store');
        Route::get('/roles-permissions/roles/{role}/edit', [RolePermissionController::class, 'edit'])
            ->middleware('can:roles_permissions.edit')
            ->name('roles-permissions.roles.edit');
        Route::put('/roles-permissions/roles/{role}', [RolePermissionController::class, 'update'])
            ->middleware('can:roles_permissions.edit')
            ->name('roles-permissions.roles.update');
        Route::delete('/roles-permissions/roles/{role}', [RolePermissionController::class, 'destroy'])
            ->middleware('can:roles_permissions.delete')
            ->name('roles-permissions.roles.destroy');

        Route::get('/testimonials', [TestimonialController::class, 'index'])
            ->middleware('can:testimonials.view')
            ->name('testimonials.index');
        Route::get('/testimonials/create', [TestimonialController::class, 'create'])
            ->middleware('can:testimonials.create')
            ->name('testimonials.create');
        Route::post('/testimonials', [TestimonialController::class, 'store'])
            ->middleware('can:testimonials.create')
            ->name('testimonials.store');
        Route::get('/testimonials/{testimonial}/edit', [TestimonialController::class, 'edit'])
            ->middleware('can:testimonials.edit')
            ->name('testimonials.edit');
        Route::put('/testimonials/{testimonial}', [TestimonialController::class, 'update'])
            ->middleware('can:testimonials.edit')
            ->name('testimonials.update');
        Route::delete('/testimonials/{testimonial}', [TestimonialController::class, 'destroy'])
            ->middleware('can:testimonials.delete')
            ->name('testimonials.destroy');

        Route::get('/galleries', [GalleryController::class, 'index'])
            ->middleware('can:galleries.view')
            ->name('galleries.index');
        Route::get('/galleries/create', [GalleryController::class, 'create'])
            ->middleware('can:galleries.create')
            ->name('galleries.create');
        Route::post('/galleries', [GalleryController::class, 'store'])
            ->middleware('can:galleries.create')
            ->name('galleries.store');
        Route::get('/galleries/{gallery}/edit', [GalleryController::class, 'edit'])
            ->middleware('can:galleries.edit')
            ->name('galleries.edit');
        Route::put('/galleries/{gallery}', [GalleryController::class, 'update'])
            ->middleware('can:galleries.edit')
            ->name('galleries.update');
        Route::delete('/galleries/{gallery}', [GalleryController::class, 'destroy'])
            ->middleware('can:galleries.delete')
            ->name('galleries.destroy');
        Route::post('/galleries/{gallery}/images', [GalleryController::class, 'storeImage'])
            ->middleware('can:galleries.edit')
            ->name('galleries.images.store');
        Route::put('/galleries/{gallery}/images/{galleryImage}', [GalleryController::class, 'updateImage'])
            ->middleware('can:galleries.edit')
            ->name('galleries.images.update');
        Route::delete('/galleries/{gallery}/images/{galleryImage}', [GalleryController::class, 'destroyImage'])
            ->middleware('can:galleries.delete')
            ->name('galleries.images.destroy');

        Route::get('/settings', [SettingController::class, 'edit'])
            ->middleware('can:settings.view')
            ->name('settings.edit');
        Route::put('/settings/maintenance', [SettingController::class, 'updateMaintenance'])
            ->middleware('can:settings.edit')
            ->name('settings.maintenance.update');
        Route::put('/settings', [SettingController::class, 'update'])
            ->middleware('can:settings.edit')
            ->name('settings.update');
    });
});
