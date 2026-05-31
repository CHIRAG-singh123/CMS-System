# GPT-5 Codex Build Plan — Admin Panel Only  
## Laravel + SQLite + Inertia.js + React TypeScript + Uploaded UI Kit

## 0. Scope Correction

This plan is specifically for building **only the admin panel**.

Do **not** build the public website frontend in this phase.

The admin panel must only perform these responsibilities:

- Admin login
- Admin dashboard
- Create, read, update, delete data
- Store data in SQLite
- Upload and manage image/file paths
- Manage all listed admin modules
- Protect all admin routes using middleware
- Use the uploaded UI kit for the admin frontend
- Use Laravel + Inertia.js to render React admin pages

The admin panel will store content that can later be used by a public website, but Codex must not build the public website in this task.

---

## 1. Final Admin Modules

Build only these admin modules by default:

1. Dashboard
2. CMS Page
3. Product / Service
4. Category
5. Inquiries
6. Member / Team
7. Roles & Permissions
8. Testimonial
9. Gallery Management

Do not add extra sidebar modules unless explicitly requested.

Optional internal helpers are allowed:

- Media upload helper
- Admin authentication helper
- Permission middleware
- Reusable form/table components

These helpers should not become extra sidebar pages unless required.

---

## 2. Mandatory Routing Behaviour

The following route must work by default:

```text
http://localhost:8000/admin/login
```

Expected result:

```text
/admin/login must show the admin login page.
```

Admin routing rules:

```text
GET  /admin/login       -> show admin login page if admin is not logged in
POST /admin/login       -> authenticate admin
POST /admin/logout      -> logout admin

GET  /admin             -> if guest, redirect to /admin/login
GET  /admin             -> if logged in, redirect to /admin/dashboard

GET  /admin/dashboard   -> protected dashboard
GET  /admin/*           -> protected admin routes
```

Authentication behaviour:

```text
If guest opens /admin/login:
    show login page

If logged-in admin opens /admin/login:
    redirect to /admin/dashboard

If guest opens /admin/dashboard:
    redirect to /admin/login

If logged-in admin opens /admin:
    redirect to /admin/dashboard

If guest opens /admin:
    redirect to /admin/login
```

Strict rules:

- Do not use the normal user login page for admin.
- Do not allow public admin registration.
- Do not allow unauthenticated access to `/admin/dashboard`.
- Do not expose admin CRUD routes without admin middleware.
- Admin login must be separate from public/user login.
- Use CSRF protection on all forms.
- Use login rate limiting.

---

## 3. Technology Stack

Use this stack only:

```text
Backend: Laravel
Database: SQLite
Frontend bridge: Inertia.js
Admin frontend: React + TypeScript
Styling: Tailwind CSS
UI components: Uploaded Admin UI Kit
Storage: Laravel public storage for uploaded files
```

Do not create a separate React app.

Do not create a separate REST API for this admin panel unless required for upload helpers.

Use this flow:

```text
Admin Route
↓
Laravel Controller
↓
SQLite Database Operation
↓
Inertia Response
↓
React TypeScript Page
↓
Uploaded UI Kit Components
```

---

## 4. SQLite Requirement

The admin panel must persist all data in SQLite.

Use SQLite for:

- Admin users
- CMS pages
- Products/services
- Categories
- Inquiries
- Members/team
- Roles
- Permissions
- Testimonials
- Galleries
- Gallery images
- Media/file records

Images/files must not be stored as BLOB data in SQLite.

Correct file handling:

```text
Uploaded file -> Laravel storage
SQLite        -> stores file path and metadata only
```

Recommended storage folders:

```text
storage/app/public/cms/
storage/app/public/products/
storage/app/public/categories/
storage/app/public/members/
storage/app/public/testimonials/
storage/app/public/galleries/
storage/app/public/logos/
```

---

## 5. Uploaded UI Kit Integration

Use the uploaded UI kit as the complete admin design system.

Place UI kit components here:

```text
resources/js/components/ui/
```

Use these components across the admin panel:

| UI Kit Component | Usage |
|---|---|
| Auth Layout | Admin login |
| Sidebar Layout | Main admin panel wrapper |
| Sidebar | Admin navigation |
| Navbar | Top bar, profile, logout |
| Table | Listing pages |
| Input | Form fields |
| Textarea | Content/message fields |
| Select | Status/category/role dropdown |
| Switch | Publish/active toggle |
| Badge | Status display |
| Dropdown | Row actions |
| Dialog | Delete confirmation |
| Button | Form and action buttons |
| Pagination | Paginated records |
| Avatar | Admin/member/testimonial image |

Frontend rules:

- Use Inertia `<Link>` for internal admin navigation.
- Use Inertia `useForm` or equivalent pattern for create/update/delete actions.
- Keep form UI consistent across all modules.
- Keep table UI consistent across all modules.
- Do not mix unrelated design systems.
- Do not create duplicate button/table/input components if the UI kit already has them.

---

## 6. Admin Sidebar

Use this exact sidebar order:

```text
Dashboard
CMS Pages
Products / Services
Categories
Inquiries
Members / Team
Roles & Permissions
Testimonials
Gallery Management
```

Optional profile dropdown items:

```text
Profile
Change Password
Logout
```

Do not show Settings as a sidebar module in this version unless the product manager approves it.

If logo or global branding is required, handle it inside CMS Page or as an internal `settings` table without showing a Settings menu.

---

## 7. Recommended Folder Structure

Use this structure:

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── Admin/
│   │       ├── AuthController.php
│   │       ├── DashboardController.php
│   │       ├── CmsPageController.php
│   │       ├── ProductServiceController.php
│   │       ├── CategoryController.php
│   │       ├── InquiryController.php
│   │       ├── MemberController.php
│   │       ├── RolePermissionController.php
│   │       ├── TestimonialController.php
│   │       └── GalleryController.php
│   ├── Middleware/
│   │   ├── AdminAuth.php
│   │   └── RedirectIfAdminAuthenticated.php
│   └── Requests/
│       └── Admin/

app/
├── Models/
│   ├── Admin.php
│   ├── CmsPage.php
│   ├── ProductService.php
│   ├── Category.php
│   ├── Inquiry.php
│   ├── Member.php
│   ├── Role.php
│   ├── Permission.php
│   ├── Testimonial.php
│   ├── Gallery.php
│   ├── GalleryImage.php
│   └── Media.php

resources/
└── js/
    ├── components/
    │   ├── ui/
    │   └── admin/
    ├── layouts/
    │   ├── AdminLayout.tsx
    │   └── AdminAuthLayout.tsx
    ├── pages/
    │   └── admin/
    │       ├── auth/
    │       │   └── Login.tsx
    │       ├── Dashboard.tsx
    │       ├── cms-pages/
    │       ├── products-services/
    │       ├── categories/
    │       ├── inquiries/
    │       ├── members/
    │       ├── roles-permissions/
    │       ├── testimonials/
    │       └── galleries/
    └── types/

database/
├── migrations/
├── seeders/
└── database.sqlite
```

---

## 8. Database Design

Create only the tables needed for the admin panel.

---

### 8.1 admins

Purpose: admin login accounts.

Fields:

```text
id
name
email
password
avatar
role_id
status
last_login_at
remember_token
created_at
updated_at
```

Rules:

- Email must be unique.
- Password must be hashed.
- Status values: active, inactive.
- Only active admins can log in.

---

### 8.2 roles

Purpose: admin roles.

Fields:

```text
id
name
slug
description
status
created_at
updated_at
```

Default roles:

```text
Super Admin
Admin
Content Manager
Viewer
```

Rules:

- Super Admin must not be deleted.
- Super Admin must always have all permissions.

---

### 8.3 permissions

Purpose: available permissions.

Fields:

```text
id
name
slug
module
created_at
updated_at
```

Permission modules:

```text
dashboard
cms_pages
products_services
categories
inquiries
members
roles_permissions
testimonials
galleries
```

Permission actions:

```text
view
create
edit
delete
publish
export
```

Example permission slugs:

```text
dashboard.view
cms_pages.view
cms_pages.create
cms_pages.edit
cms_pages.delete
products_services.view
products_services.create
products_services.edit
products_services.delete
inquiries.view
inquiries.edit
inquiries.delete
roles_permissions.view
roles_permissions.create
roles_permissions.edit
roles_permissions.delete
```

---

### 8.4 permission_role

Purpose: role-permission pivot table.

Fields:

```text
id
role_id
permission_id
created_at
updated_at
```

---

### 8.5 cms_pages

Purpose: manage all CMS pages with logo/content/page information.

Fields:

```text
id
title
slug
page_key
logo
banner_image
short_description
content
sections_json
meta_title
meta_description
meta_keywords
status
sort_order
created_by
updated_by
created_at
updated_at
```

Default seeded CMS pages:

```text
Homepage
About
Product / Service
Manufacture Process / Service Details
Contact Us
```

Status values:

```text
draft
published
hidden
```

Rules:

- Default pages can be edited.
- Default pages should not be permanently deleted.
- Slug must be unique.
- Logo and banner image store file paths only.

---

### 8.6 categories

Purpose: classify products/services.

Fields:

```text
id
name
slug
description
image
status
sort_order
created_at
updated_at
```

Status values:

```text
active
inactive
```

Rules:

- Category slug must be unique.
- Category with linked products/services should not be deleted unless products/services are reassigned or removed.

---

### 8.7 product_services

Purpose: manage products and services in one reusable module.

Fields:

```text
id
category_id
type
title
slug
short_description
description
featured_image
gallery_images
features_json
benefits_json
specifications_json
status
is_featured
sort_order
meta_title
meta_description
created_at
updated_at
```

Type values:

```text
product
service
```

Status values:

```text
draft
published
hidden
```

Rules:

- Product/service slug must be unique.
- Product/service must optionally belong to a category.
- Images store file paths only.

---

### 8.8 inquiries

Purpose: manage submitted inquiry/contact records.

Fields:

```text
id
inquiry_type
product_service_id
name
email
phone
subject
message
status
admin_note
ip_address
user_agent
created_at
updated_at
```

Inquiry type values:

```text
general
product
service
quote
```

Status values:

```text
new
read
in_progress
replied
closed
```

Rules:

- Admin can update status and admin note.
- Admin should not edit visitor-submitted name/email/message except for correction by Super Admin if required.
- Delete should require confirmation.

---

### 8.9 members

Purpose: manage team/member records.

Fields:

```text
id
name
designation
image
short_bio
email
phone
linkedin
twitter
instagram
status
sort_order
created_at
updated_at
```

Status values:

```text
active
inactive
```

Rules:

- Image stores file path only.
- Sort order controls display order.

---

### 8.10 testimonials

Purpose: manage client testimonials.

Fields:

```text
id
client_name
client_designation
company_name
image
rating
message
status
sort_order
created_at
updated_at
```

Status values:

```text
published
hidden
```

Rules:

- Rating must be between 1 and 5.
- Message is required.
- Image is optional.

---

### 8.11 galleries

Purpose: manage gallery albums.

Fields:

```text
id
title
slug
description
cover_image
status
sort_order
created_at
updated_at
```

Status values:

```text
published
hidden
```

Rules:

- Slug must be unique.
- Cover image stores file path only.

---

### 8.12 gallery_images

Purpose: manage images inside gallery albums.

Fields:

```text
id
gallery_id
image
title
alt_text
caption
status
sort_order
created_at
updated_at
```

Rules:

- Image stores file path only.
- Images must belong to a gallery.
- Gallery deletion should delete or detach related images safely.

---

### 8.13 media

Purpose: optional internal record of uploaded files.

Fields:

```text
id
file_name
original_name
file_path
file_type
mime_type
file_size
alt_text
uploaded_by
created_at
updated_at
```

Rules:

- This is an internal helper table.
- It does not need a sidebar page in version 1.

---

## 9. Admin Route Plan

Create all admin routes under `/admin`.

---

### 9.1 Authentication Routes

```text
GET  /admin/login
POST /admin/login
POST /admin/logout
GET  /admin
```

---

### 9.2 Dashboard Routes

```text
GET /admin/dashboard
```

---

### 9.3 CMS Page Routes

```text
GET    /admin/cms-pages
GET    /admin/cms-pages/create
POST   /admin/cms-pages
GET    /admin/cms-pages/{cmsPage}/edit
PUT    /admin/cms-pages/{cmsPage}
DELETE /admin/cms-pages/{cmsPage}
```

---

### 9.4 Product / Service Routes

```text
GET    /admin/products-services
GET    /admin/products-services/create
POST   /admin/products-services
GET    /admin/products-services/{productService}/edit
PUT    /admin/products-services/{productService}
DELETE /admin/products-services/{productService}
```

---

### 9.5 Category Routes

```text
GET    /admin/categories
GET    /admin/categories/create
POST   /admin/categories
GET    /admin/categories/{category}/edit
PUT    /admin/categories/{category}
DELETE /admin/categories/{category}
```

---

### 9.6 Inquiry Routes

```text
GET    /admin/inquiries
GET    /admin/inquiries/{inquiry}
PUT    /admin/inquiries/{inquiry}/status
PUT    /admin/inquiries/{inquiry}/note
DELETE /admin/inquiries/{inquiry}
```

---

### 9.7 Member / Team Routes

```text
GET    /admin/members
GET    /admin/members/create
POST   /admin/members
GET    /admin/members/{member}/edit
PUT    /admin/members/{member}
DELETE /admin/members/{member}
```

---

### 9.8 Roles & Permissions Routes

```text
GET    /admin/roles-permissions
GET    /admin/roles-permissions/roles/create
POST   /admin/roles-permissions/roles
GET    /admin/roles-permissions/roles/{role}/edit
PUT    /admin/roles-permissions/roles/{role}
DELETE /admin/roles-permissions/roles/{role}
```

---

### 9.9 Testimonial Routes

```text
GET    /admin/testimonials
GET    /admin/testimonials/create
POST   /admin/testimonials
GET    /admin/testimonials/{testimonial}/edit
PUT    /admin/testimonials/{testimonial}
DELETE /admin/testimonials/{testimonial}
```

---

### 9.10 Gallery Management Routes

```text
GET    /admin/galleries
GET    /admin/galleries/create
POST   /admin/galleries
GET    /admin/galleries/{gallery}/edit
PUT    /admin/galleries/{gallery}
DELETE /admin/galleries/{gallery}

POST   /admin/galleries/{gallery}/images
PUT    /admin/galleries/{gallery}/images/{galleryImage}
DELETE /admin/galleries/{gallery}/images/{galleryImage}
```

---

## 10. Inertia React Page Plan

Create these admin pages.

---

### 10.1 Auth

```text
resources/js/pages/admin/auth/Login.tsx
```

Function:

- Show admin login form
- Submit to `/admin/login`
- Show validation errors
- Redirect to dashboard after login

---

### 10.2 Dashboard

```text
resources/js/pages/admin/Dashboard.tsx
```

Dashboard should show:

- Total CMS Pages
- Total Products / Services
- Total Categories
- Total Inquiries
- Total Members
- Total Roles
- Total Testimonials
- Total Galleries
- Recent inquiries
- Quick action buttons

---

### 10.3 CMS Pages

```text
resources/js/pages/admin/cms-pages/Index.tsx
resources/js/pages/admin/cms-pages/Create.tsx
resources/js/pages/admin/cms-pages/Edit.tsx
```

Features:

- List CMS pages
- Search by title/slug
- Filter by status
- Create CMS page
- Edit CMS page
- Delete custom CMS page
- Protect default CMS pages from deletion
- Upload logo/banner
- Manage title, slug, content
- Manage JSON sections
- Manage SEO fields
- Manage status

---

### 10.4 Products / Services

```text
resources/js/pages/admin/products-services/Index.tsx
resources/js/pages/admin/products-services/Create.tsx
resources/js/pages/admin/products-services/Edit.tsx
```

Features:

- List records
- Search by title
- Filter by category
- Filter by type
- Filter by status
- Create record
- Edit record
- Delete record
- Upload featured image
- Manage gallery image paths
- Manage features, benefits, specifications
- Manage SEO fields

---

### 10.5 Categories

```text
resources/js/pages/admin/categories/Index.tsx
resources/js/pages/admin/categories/Create.tsx
resources/js/pages/admin/categories/Edit.tsx
```

Features:

- List categories
- Search categories
- Create category
- Edit category
- Delete category
- Upload image
- Manage status
- Manage sort order

---

### 10.6 Inquiries

```text
resources/js/pages/admin/inquiries/Index.tsx
resources/js/pages/admin/inquiries/Show.tsx
```

Features:

- List inquiries
- Search by name/email/phone
- Filter by inquiry type
- Filter by status
- View inquiry
- Update status
- Add admin note
- Delete inquiry

---

### 10.7 Members / Team

```text
resources/js/pages/admin/members/Index.tsx
resources/js/pages/admin/members/Create.tsx
resources/js/pages/admin/members/Edit.tsx
```

Features:

- List members
- Create member
- Edit member
- Delete member
- Upload image
- Manage designation
- Manage short bio
- Manage social links
- Manage status
- Manage sort order

---

### 10.8 Roles & Permissions

```text
resources/js/pages/admin/roles-permissions/Index.tsx
resources/js/pages/admin/roles-permissions/RoleCreate.tsx
resources/js/pages/admin/roles-permissions/RoleEdit.tsx
```

Features:

- List roles
- Create role
- Edit role
- Delete role
- Show permission matrix
- Assign permissions to role
- Protect Super Admin role
- Prevent current admin self-lockout

---

### 10.9 Testimonials

```text
resources/js/pages/admin/testimonials/Index.tsx
resources/js/pages/admin/testimonials/Create.tsx
resources/js/pages/admin/testimonials/Edit.tsx
```

Features:

- List testimonials
- Create testimonial
- Edit testimonial
- Delete testimonial
- Upload client image
- Manage rating
- Manage message
- Manage status
- Manage sort order

---

### 10.10 Gallery Management

```text
resources/js/pages/admin/galleries/Index.tsx
resources/js/pages/admin/galleries/Create.tsx
resources/js/pages/admin/galleries/Edit.tsx
```

Gallery edit page should include image management.

Features:

- List gallery albums
- Create gallery album
- Edit gallery album
- Delete gallery album
- Upload cover image
- Add gallery images
- Edit image title, alt text, caption
- Delete gallery image
- Manage status
- Manage sort order

---

## 11. Module CRUD Standards

Every module must follow this pattern:

```text
Index Page
Create Page
Edit Page
Delete Action
Validation
Success Message
Error Message
Search
Filter
Pagination
Status Badge
Action Dropdown
Delete Confirmation Dialog
```

Applicable modules:

- CMS Pages
- Products / Services
- Categories
- Members / Team
- Roles & Permissions
- Testimonials
- Gallery Management

Inquiries are different:

```text
Index Page
Show Page
Status Update
Admin Note Update
Delete Action
Search
Filter
Pagination
```

Dashboard is read-only:

```text
Stats
Recent records
Quick actions
```

---

## 12. Validation Plan

Use Laravel Form Request classes for all create/update operations.

Suggested request classes:

```text
Admin/LoginRequest
Admin/CmsPageRequest
Admin/ProductServiceRequest
Admin/CategoryRequest
Admin/InquiryStatusRequest
Admin/MemberRequest
Admin/RoleRequest
Admin/TestimonialRequest
Admin/GalleryRequest
Admin/GalleryImageRequest
```

Validation standards:

### Text

- Required where necessary
- Maximum length for titles/names
- Slugs must be URL-safe
- Slugs must be unique

### Images

- Allowed: jpg, jpeg, png, webp
- Max size: 2MB by default
- SVG disabled unless explicitly sanitized

### Status

- Must match allowed status values

### Email

- Must be valid email

### Password

- Minimum 8 characters
- Must be hashed before storage

### Rating

- Must be numeric
- Must be between 1 and 5

---

## 13. Permission Plan

Roles & Permissions must control module access.

Permission format:

```text
module.action
```

Examples:

```text
cms_pages.view
cms_pages.create
cms_pages.edit
cms_pages.delete

products_services.view
products_services.create
products_services.edit
products_services.delete

inquiries.view
inquiries.edit
inquiries.delete
```

Default Super Admin:

```text
Super Admin has all permissions.
```

Middleware behaviour:

```text
If admin does not have permission:
    show 403 page or redirect with error message
```

Protection rules:

- Super Admin role cannot be deleted.
- Current admin cannot remove own critical access.
- At least one Super Admin must always remain active.

---

## 14. Admin Reusable Components

Create reusable admin components using the uploaded UI kit internally.

Build these reusable components:

```text
AdminLayout
AdminAuthLayout
AdminPageHeader
AdminBreadcrumbs
AdminStatsCard
AdminDataTable
AdminSearchInput
AdminFilterBar
AdminStatusBadge
AdminActionDropdown
AdminDeleteDialog
AdminFormSection
AdminImageUpload
AdminGalleryUpload
AdminSeoFields
AdminPagination
PermissionMatrix
```

Purpose:

- Reduce repeated code
- Keep design consistent
- Make each new module easier to build
- Make the default admin panel reusable

---

## 15. Dashboard Requirements

Dashboard must be useful but simple.

Cards:

```text
CMS Pages Count
Products / Services Count
Categories Count
Inquiries Count
Members Count
Roles Count
Testimonials Count
Galleries Count
```

Recent records:

```text
Recent Inquiries
Recently Updated CMS Pages
Recently Added Products / Services
```

Quick actions:

```text
Add CMS Page
Add Product / Service
Add Member
Add Testimonial
Add Gallery
View Inquiries
```

---

## 16. Status Standards

Use these statuses consistently.

CMS Pages:

```text
draft
published
hidden
```

Products / Services:

```text
draft
published
hidden
```

Categories:

```text
active
inactive
```

Inquiries:

```text
new
read
in_progress
replied
closed
```

Members:

```text
active
inactive
```

Roles:

```text
active
inactive
```

Testimonials:

```text
published
hidden
```

Galleries:

```text
published
hidden
```

Gallery Images:

```text
active
inactive
```

Admins:

```text
active
inactive
```

---

## 17. Seeder Plan

Create seeders for default setup.

Seeders:

```text
AdminSeeder
RolePermissionSeeder
CmsPageSeeder
DemoContentSeeder optional
```

Default admin:

```text
name: Super Admin
email: admin@example.com
password: password
role: Super Admin
status: active
```

Default CMS pages:

```text
Homepage
About
Product / Service
Manufacture Process / Service Details
Contact Us
```

Default roles:

```text
Super Admin
Admin
Content Manager
Viewer
```

Default permissions:

```text
Create permissions for all modules and all actions.
Assign all permissions to Super Admin.
Assign limited permissions to Content Manager and Viewer.
```

---

## 18. Build Order for GPT-5 Codex

Codex must build the admin panel in this order.

### Phase 1: Foundation

1. Verify Laravel + Inertia + React TypeScript setup.
2. Configure SQLite.
3. Confirm uploaded UI kit is inside `resources/js/components/ui`.
4. Fix UI kit imports if needed.
5. Create `AdminAuthLayout`.
6. Create `AdminLayout`.

### Phase 2: Admin Authentication

1. Create admins table and Admin model.
2. Create admin guard/provider.
3. Create AdminAuth middleware.
4. Create RedirectIfAdminAuthenticated middleware.
5. Create `/admin/login`.
6. Create login/logout controller actions.
7. Create `/admin` redirect behaviour.
8. Create `/admin/dashboard` protected route.

### Phase 3: Roles & Permissions

1. Create roles table.
2. Create permissions table.
3. Create permission_role table.
4. Create seeders.
5. Create permission middleware/helper.
6. Create Roles & Permissions UI.

### Phase 4: Core Admin CRUD Modules

1. Build CMS Pages CRUD.
2. Build Categories CRUD.
3. Build Products / Services CRUD.
4. Build Members / Team CRUD.
5. Build Testimonials CRUD.
6. Build Gallery Management CRUD.
7. Build Inquiries index/show/status/note/delete.

### Phase 5: Dashboard and Polish

1. Add dashboard counts.
2. Add recent records.
3. Add quick actions.
4. Add search/filter/pagination everywhere.
5. Add delete confirmation dialogs.
6. Add empty states.
7. Add success/error messages.
8. Add responsive polish using the UI kit.

### Phase 6: Security and Final Testing

1. Test guest access to `/admin/login`.
2. Test guest access to protected routes.
3. Test logged-in admin redirects.
4. Test role permission blocking.
5. Test CRUD persistence in SQLite.
6. Test image uploads.
7. Test delete protections.
8. Test validation errors.
9. Test logout.

---

## 19. Strict Exclusions

Do not build these in this task:

```text
Public website frontend
Public homepage design
Public about page design
Public product details page
Public contact page
Shopping cart
Payment gateway
API-only backend
Mobile app
Blog module
Newsletter module
Advanced theme builder
Full media library sidebar page
SMTP settings page
Backup manager
Activity logs
```

This task is only for the admin panel and SQLite CRUD.

---

## 20. Acceptance Criteria

The admin panel is complete only when all conditions are met.

### Routing

- `/admin/login` opens the admin login page.
- `/admin` redirects correctly based on admin authentication.
- `/admin/dashboard` is protected.
- `/admin/*` routes are protected.
- Logged-in admin cannot access login page.

### Authentication

- Admin can log in.
- Admin can log out.
- Invalid credentials show safe error.
- Session regenerates after login.
- Inactive admin cannot log in.

### SQLite CRUD

- CMS Pages create/update/delete data in SQLite.
- Products / Services create/update/delete data in SQLite.
- Categories create/update/delete data in SQLite.
- Members create/update/delete data in SQLite.
- Roles & Permissions create/update/delete data in SQLite.
- Testimonials create/update/delete data in SQLite.
- Gallery albums/images create/update/delete data in SQLite.
- Inquiries can be viewed, updated by status/note, and deleted from SQLite.

### UI Kit

- Admin login uses uploaded UI kit.
- Sidebar uses uploaded UI kit.
- Tables use uploaded UI kit.
- Forms use uploaded UI kit.
- Delete dialogs use uploaded UI kit.
- Badges/dropdowns/buttons are consistent.

### Permissions

- Super Admin has all permissions.
- Permission middleware protects modules.
- Super Admin role cannot be deleted.
- Current admin cannot lock themselves out.

### File Uploads

- Images upload to Laravel storage.
- Database stores only file path.
- Invalid file types are rejected.
- Oversized files are rejected.

### Dashboard

- Dashboard cards show correct counts from SQLite.
- Recent records are displayed.
- Quick actions navigate correctly.

---

## 21. Final Expected Result

After implementation, this must work:

```text
http://localhost:8000/admin/login
```

It must show the admin login page.

After login, this must work:

```text
http://localhost:8000/admin/dashboard
```

The admin sidebar must show:

```text
Dashboard
CMS Pages
Products / Services
Categories
Inquiries
Members / Team
Roles & Permissions
Testimonials
Gallery Management
```

Each module must be able to store, update, and delete data from SQLite where applicable.

This is the final default admin panel scope.
