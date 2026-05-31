# CMS Single Page Site

This site is wired to the Laravel admin in `..\Admin-Default` and can be served at `/site`.

## Expected content sources

- `siteSettings`: `cms_pages.page_key = site-settings`, with legacy `SiteSetting` fallback
- `cmsPages`: protected `CmsPage` keys `homepage`, `about`, `products-services`, `manufacture-process`, `contact-us`
- `productServices`: `products-services.sections_json.offerings.items`, with legacy `ProductService` fallback
- `members`: `team.sections_json.items`, with legacy `Member` fallback
- `testimonials`: `testimonials.sections_json.items`, with legacy `Testimonial` fallback

## Fastest integration

Open the Laravel-served site:

```text
http://localhost:8000/site
```

The page is configured to fetch one endpoint:

```html
<script>
window.CMS_SITE_CONFIG = {
    useMockData: false,
    apiEndpoint: '/api/site/home',
    inquiryEndpoint: '/inquiries',
    csrfToken: '{{ csrf_token() }}'
};
</script>
```

## Section mapping

- Hero: `homepage` + `homepage.sections_json.hero`
- About: `about` + `about.sections_json.metrics` and `about.sections_json.checklist`
- Services: `products-services.sections_json.offerings.items`
- Process: `manufacture-process` + `manufacture-process.sections_json.steps`
- Team: `team.sections_json.items`
- Testimonials: `testimonials.sections_json.items`
- Contact: `contact-us` + `site-settings`
- Form fields: shaped for `Inquiry`

## Notes

- Media paths follow the same `/media/...` pattern used by the admin panel.
- Text content is escaped before rendering.
- Map embeds only allow Google Maps URLs or iframe sources.
