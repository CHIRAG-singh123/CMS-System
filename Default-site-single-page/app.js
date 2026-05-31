const CMS_SITE_CONFIG = {
    useMockData: true,
    apiEndpoint: '',
    inquiryEndpoint: '',
    baseUrl: '',
    mediaBaseUrl: '',
    csrfToken: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    ...window.CMS_SITE_CONFIG,
};

const DEFAULT_INQUIRY_TYPES = ['general', 'product', 'service', 'quote'];

const mockCmsPayload = {
    siteSettings: {
        company_name: 'Northstar Fabrication Co.',
        legal_name: 'Northstar Fabrication Private Limited',
        company_address: 'Sector 18 Industrial Estate, Ahmedabad, Gujarat 380015',
        maintenance_mode: false,
        maintenance_message: 'We are refreshing a few sections. Please reach out directly for urgent requirements.',
        logo_light: '',
        logo_dark: '',
        brochure_file: '',
        export_email: 'hello@northstarfabrication.com',
        phone: '+91 98765 43210',
        whatsapp_number: '919876543210',
        whatsapp_chat_enabled: true,
        whatsapp_prefill_message: 'Hello, I want to discuss a new manufacturing project.',
        map_title: 'Northstar Fabrication HQ',
        map_address: 'Sector 18 Industrial Estate, Ahmedabad',
        map_embed: 'https://www.google.com/maps?q=Ahmedabad%20Gujarat&output=embed',
        linkedin_url: 'https://www.linkedin.com/',
        facebook_url: 'https://www.facebook.com/',
        instagram_url: 'https://www.instagram.com/',
    },
    cmsPages: [
        {
            page_key: 'homepage',
            slug: 'home',
            title: 'Engineered manufacturing for ambitious brands.',
            short_description: 'A single-page CMS website built for clean admin control, fast edits, and production-ready presentation.',
            content: 'This homepage is intentionally structured around your existing Laravel admin models. Hero copy, supporting blocks, highlights, and calls to action can all be driven from CMS page content plus structured sections JSON.',
            banner_image: '',
            meta_title: 'Northstar Fabrication | Dynamic CMS Single Page Site',
            meta_description: 'A Laravel-admin-ready single page website with dynamic content sections.',
            status: 'published',
            sort_order: 0,
            sections_json: {
                hero: {
                    eyebrow: 'Laravel CMS Ready',
                    title: 'A polished single-page website that stays easy to manage from admin.',
                    description: 'Use your existing admin panel to control hero copy, offerings, process content, team, testimonials, and inquiry capture without changing the frontend structure.',
                    primary_cta_label: 'Explore Services',
                    primary_cta_href: '#services',
                    secondary_cta_label: 'Send Inquiry',
                    secondary_cta_href: '#contact',
                    badges: [
                        'Static frontend, dynamic content source',
                        'Maps to existing SQLite admin models',
                        'No frontend framework required',
                    ],
                    stats: [
                        { value: '05', label: 'Core CMS content groups' },
                        { value: '01', label: 'Single page experience' },
                        { value: '100%', label: 'Admin-ready structure' },
                        { value: '0', label: 'Build tools needed to use it' },
                    ],
                },
                proof: {
                    items: [
                        {
                            title: 'Content-first layout',
                            description: 'Each section is designed around the fields you already manage in admin.',
                        },
                        {
                            title: 'Low-friction integration',
                            description: 'Inject Laravel JSON directly or fetch one payload endpoint and render everything.',
                        },
                        {
                            title: 'Safe default rendering',
                            description: 'The site escapes CMS text output by default and only special-cases trusted map embeds.',
                        },
                    ],
                },
            },
        },
        {
            page_key: 'about',
            slug: 'about',
            title: 'Built for teams that need clean process visibility.',
            short_description: 'This section can be managed from the protected `about` CMS page.',
            content: 'Keep the public experience simple while still letting admins manage copy, metrics, and structured talking points. The frontend reads the same content model every time, so changes stay predictable.',
            status: 'published',
            sort_order: 1,
            sections_json: {
                metrics: {
                    items: [
                        { value: '18+', label: 'Years of combined manufacturing leadership' },
                        { value: '24h', label: 'Typical first-response window' },
                        { value: '4x', label: 'Reusable content areas in homepage CMS data' },
                        { value: '1', label: 'Shared source of truth for website copy' },
                    ],
                },
                checklist: {
                    items: [
                        'Use `CmsPage` for section headings, summaries, and structured section JSON.',
                        'Use `SiteSetting` for company identity, socials, brochure, map, and WhatsApp.',
                        'Use `ProductService`, `Member`, and `Testimonial` to populate repeatable cards.',
                    ],
                },
            },
        },
        {
            page_key: 'products-services',
            slug: 'products-services',
            title: 'Offerings that can scale with the admin panel.',
            short_description: 'Products and services are rendered from published `ProductService` records.',
            content: 'This section is intentionally card-driven. It works well with short descriptions, benefit lists, featured flags, and optional brochure links.',
            status: 'published',
            sort_order: 2,
            sections_json: {
                summary_cards: {
                    items: [
                        {
                            title: 'Published-only output',
                            description: 'Only records marked as published are rendered on the website.',
                        },
                        {
                            title: 'Featured content priority',
                            description: 'Featured records are surfaced first without changing the card template.',
                        },
                        {
                            title: 'Inquiry handoff ready',
                            description: 'Each CTA can prefill the contact form with the selected item.',
                        },
                    ],
                },
                cta: {
                    label: 'Download Brochure',
                },
            },
        },
        {
            page_key: 'manufacture-process',
            slug: 'manufacture-process',
            title: 'A simple workflow from brief to delivery.',
            short_description: 'This section is driven by the protected `manufacture-process` page.',
            content: 'Use this area for process steps, milestone explanation, or a capability workflow. The current renderer expects a list of steps in `sections_json.steps.items`.',
            status: 'published',
            sort_order: 3,
            sections_json: {
                steps: {
                    items: [
                        {
                            title: 'Discover',
                            description: 'Capture business goals, desired output, technical constraints, and target timelines.',
                        },
                        {
                            title: 'Scope',
                            description: 'Translate the brief into a clean production plan with item-level clarity and approvals.',
                        },
                        {
                            title: 'Execute',
                            description: 'Run fabrication, finishing, assembly, or service delivery against agreed milestones.',
                        },
                        {
                            title: 'Support',
                            description: 'Close the loop with documentation, handover, and post-delivery assistance.',
                        },
                    ],
                },
            },
        },
        {
            page_key: 'contact-us',
            slug: 'contact-us',
            title: 'Start with one clear brief.',
            short_description: 'The contact section combines `SiteSetting` data with a frontend form shaped for the `Inquiry` model.',
            content: 'When you are ready, connect `CMS_SITE_CONFIG.inquiryEndpoint` to a Laravel route that accepts the existing inquiry fields. The form payload already matches the admin-side data shape.',
            status: 'published',
            sort_order: 4,
            sections_json: {
                contact_cards: {
                    items: [
                        { label: 'Email', value: 'hello@northstarfabrication.com' },
                        { label: 'Phone', value: '+91 98765 43210' },
                        { label: 'Address', value: 'Sector 18 Industrial Estate, Ahmedabad, Gujarat 380015' },
                    ],
                },
                office_hours: {
                    items: [
                        { label: 'Monday to Friday', value: '09:00 AM to 06:30 PM' },
                        { label: 'Saturday', value: '09:00 AM to 02:00 PM' },
                        { label: 'Sunday', value: 'Closed' },
                    ],
                },
                form: {
                    title: 'Tell us what you need',
                    description: 'The fields below map directly to your `Inquiry` model and can be sent to a Laravel endpoint later.',
                    success_message: 'Inquiry captured. Connect the endpoint to store it in Laravel admin.',
                    form_types: ['general', 'product', 'service', 'quote'],
                },
            },
        },
    ],
    productServices: [
        {
            id: 1,
            category: { id: 1, name: 'Consulting' },
            type: 'service',
            title: 'Turnkey Production Planning',
            slug: 'turnkey-production-planning',
            short_description: 'Operational planning, sequencing, and delivery design for teams scaling production.',
            description: 'A structured consulting engagement for operations teams that need clarity before expanding capacity.',
            featured_image: '',
            features_json: ['Capacity planning', 'SOP alignment', 'Delivery scheduling'],
            benefits_json: ['Less coordination waste', 'Faster handoff', 'Cleaner execution'],
            status: 'published',
            is_featured: true,
            sort_order: 0,
        },
        {
            id: 2,
            category: { id: 2, name: 'Fabrication' },
            type: 'product',
            title: 'Precision Sheet Metal Assemblies',
            slug: 'precision-sheet-metal-assemblies',
            short_description: 'Repeatable fabricated assemblies designed for consistent quality and fast turnaround.',
            description: 'Suitable for industrial enclosures, equipment housings, and custom component batches.',
            featured_image: '',
            features_json: ['Laser cutting ready', 'Assembly friendly', 'Custom finish options'],
            benefits_json: ['Reliable repeatability', 'Lower defect risk', 'Simpler vendor coordination'],
            status: 'published',
            is_featured: true,
            sort_order: 1,
        },
        {
            id: 3,
            category: { id: 3, name: 'Integration' },
            type: 'service',
            title: 'Vendor Consolidation Support',
            slug: 'vendor-consolidation-support',
            short_description: 'Reduce fragmented communication by centralizing supplier-facing delivery workflows.',
            description: 'Useful for companies that need one organized layer between commercial requirements and operational output.',
            featured_image: '',
            features_json: ['Single-owner coordination', 'Milestone tracking', 'Escalation handling'],
            benefits_json: ['Fewer delays', 'Better visibility', 'Clear accountability'],
            status: 'published',
            is_featured: false,
            sort_order: 2,
        },
        {
            id: 4,
            category: { id: 4, name: 'Packaging' },
            type: 'product',
            title: 'Branded Dispatch Kits',
            slug: 'branded-dispatch-kits',
            short_description: 'Dispatch-ready branded packaging kits that align presentation with operational speed.',
            description: 'A good fit for brands that need product experience consistency alongside reliable fulfilment.',
            featured_image: '',
            features_json: ['Custom inserts', 'Batch-ready layouts', 'Brand-safe output'],
            benefits_json: ['Cleaner presentation', 'Lower packing errors', 'Faster throughput'],
            status: 'published',
            is_featured: false,
            sort_order: 3,
        },
    ],
    members: [
        {
            id: 1,
            name: 'Aarav Patel',
            designation: 'Operations Director',
            short_bio: 'Leads execution systems, vendor coordination, and delivery predictability across client projects.',
            email: 'aarav@northstarfabrication.com',
            phone: '+91 98765 43211',
            linkedin: 'https://www.linkedin.com/',
            instagram: 'https://www.instagram.com/',
            twitter: 'https://x.com/',
            status: 'active',
            sort_order: 0,
        },
        {
            id: 2,
            name: 'Meera Shah',
            designation: 'Commercial Lead',
            short_bio: 'Owns proposal clarity, project scoping, and client-side communication from first brief to approval.',
            email: 'meera@northstarfabrication.com',
            phone: '+91 98765 43212',
            linkedin: 'https://www.linkedin.com/',
            instagram: 'https://www.instagram.com/',
            twitter: 'https://x.com/',
            status: 'active',
            sort_order: 1,
        },
        {
            id: 3,
            name: 'Rohan Desai',
            designation: 'Quality Systems Manager',
            short_bio: 'Maintains process controls, review loops, and delivery standards for repeatable output quality.',
            email: 'rohan@northstarfabrication.com',
            phone: '+91 98765 43213',
            linkedin: 'https://www.linkedin.com/',
            instagram: 'https://www.instagram.com/',
            twitter: 'https://x.com/',
            status: 'active',
            sort_order: 2,
        },
    ],
    testimonials: [
        {
            id: 1,
            client_name: 'Nikita Rao',
            client_designation: 'Procurement Head',
            company_name: 'Axon Equipments',
            rating: 5,
            message: 'The structure is clean, response cycles are fast, and every delivery update is easy to follow.',
            status: 'published',
            sort_order: 0,
        },
        {
            id: 2,
            client_name: 'Vikram Sethi',
            client_designation: 'Founder',
            company_name: 'WareGrid Systems',
            rating: 5,
            message: 'They simplified a messy multi-vendor flow into one dependable operating rhythm.',
            status: 'published',
            sort_order: 1,
        },
        {
            id: 3,
            client_name: 'Sana Merchant',
            client_designation: 'Program Manager',
            company_name: 'Buildlane Studio',
            rating: 4,
            message: 'Clear communication and dependable execution made the launch phase much easier to manage.',
            status: 'published',
            sort_order: 2,
        },
    ],
};

const dom = {
    body: document.body,
    brand: document.querySelector('.brand'),
    nav: document.getElementById('site-nav'),
    navToggle: document.querySelector('.nav-toggle'),
    headerCta: document.getElementById('header-cta'),
    hero: document.getElementById('hero'),
    about: document.getElementById('about'),
    services: document.getElementById('services'),
    process: document.getElementById('process'),
    team: document.getElementById('team'),
    testimonials: document.getElementById('testimonials'),
    contact: document.getElementById('contact'),
    footer: document.getElementById('footer'),
    whatsappFab: document.getElementById('whatsapp-fab'),
};

document.addEventListener('DOMContentLoaded', () => {
    void boot();
});

async function boot() {
    try {
        const rawPayload = window.CMS_SITE_PAYLOAD ?? await loadPayload();
        const site = normalizePayload(rawPayload);
        renderSite(site);
    } catch (error) {
        console.error('Unable to load live CMS payload. Falling back to local mock data.', error);
        renderSite(normalizePayload(mockCmsPayload));
    }
}

async function loadPayload() {
    if (CMS_SITE_CONFIG.useMockData || !CMS_SITE_CONFIG.apiEndpoint) {
        return mockCmsPayload;
    }

    const response = await fetch(CMS_SITE_CONFIG.apiEndpoint, {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to load CMS payload: ${response.status}`);
    }

    return response.json();
}

function renderSite(site) {
    renderMaintenanceBanner(site.siteSettings);
    applyDocumentMeta(site);
    renderBrand(site);
    renderHero(site);
    renderAbout(site);
    renderServices(site);
    renderProcess(site);
    renderTeam(site);
    renderTestimonials(site);
    renderContact(site);
    renderFooter(site);
    renderWhatsApp(site.siteSettings);
    renderNavigation(site);
    bindMenuToggle();
    bindSectionHighlighting();
    bindServicePrefill(site);
    bindInquiryForm(site);
    enableRevealMotion();
}

function normalizePayload(payload) {
    const siteSettings = normalizeRecord(payload.siteSettings ?? payload.settings);

    return {
        siteSettings,
        pages: indexPages(payload.cmsPages ?? payload.pages ?? []),
        productServices: sortByOrder(filterByStatus(payload.productServices ?? payload.productsServices, 'published')),
        members: sortByOrder(filterByStatus(payload.members, 'active')),
        testimonials: sortByOrder(filterByStatus(payload.testimonials, 'published')),
    };
}

function filterByStatus(value, targetStatus) {
    return toArray(value).filter((item) => !item?.status || item.status === targetStatus);
}

function sortByOrder(items) {
    return [...toArray(items)].sort((left, right) => {
        const leftOrder = Number(left?.sort_order ?? 0);
        const rightOrder = Number(right?.sort_order ?? 0);

        return leftOrder - rightOrder;
    });
}

function indexPages(source) {
    const pages = {};

    if (Array.isArray(source)) {
        source.forEach((page) => {
            if (!isRecord(page)) {
                return;
            }

            const pageKey = String(page.page_key || page.slug || '').trim();

            if (!pageKey) {
                return;
            }

            pages[pageKey] = normalizePage(page);
        });

        return pages;
    }

    if (!isRecord(source)) {
        return pages;
    }

    Object.entries(source).forEach(([fallbackKey, page]) => {
        if (!isRecord(page)) {
            return;
        }

        const pageKey = String(page.page_key || page.slug || fallbackKey).trim();
        pages[pageKey] = normalizePage({ ...page, page_key: pageKey });
    });

    return pages;
}

function normalizePage(page) {
    return {
        ...page,
        title: String(page.title ?? ''),
        short_description: String(page.short_description ?? ''),
        content: String(page.content ?? ''),
        sections_json: normalizeSections(page.sections_json),
    };
}

function normalizeSections(value) {
    if (Array.isArray(value)) {
        return value.reduce((accumulator, item, index) => {
            if (!isRecord(item)) {
                return accumulator;
            }

            const key = String(item.key || item.slug || item.name || `section-${index}`);
            accumulator[key] = item;

            return accumulator;
        }, {});
    }

    return normalizeRecord(value);
}

function normalizeRecord(value) {
    return isRecord(value) ? value : {};
}

function getPage(site, pageKey) {
    return site.pages[pageKey] ?? normalizePage({});
}

function getSection(page, sectionKey) {
    const section = normalizeRecord(page.sections_json)[sectionKey];
    return normalizeRecord(section);
}

function renderMaintenanceBanner(settings) {
    document.querySelector('.maintenance-banner')?.remove();

    if (!settings.maintenance_mode) {
        return;
    }

    const banner = document.createElement('div');
    banner.className = 'maintenance-banner';
    banner.textContent = settings.maintenance_message || 'This site is currently marked as under maintenance.';
    dom.body.insertBefore(banner, dom.body.firstChild);
}

function applyDocumentMeta(site) {
    const homepage = getPage(site, 'homepage');
    const title = homepage.meta_title || homepage.title || site.siteSettings.company_name || 'CMS Single Page Site';
    const description = homepage.meta_description || homepage.short_description || 'Dynamic single-page CMS website.';

    document.title = title;
    upsertMetaTag('description', description);
}

function upsertMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);

    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
    }

    meta.setAttribute('content', String(content || ''));
}

function renderBrand(site) {
    const homepage = getPage(site, 'homepage');
    const hero = getSection(homepage, 'hero');
    const brandName = site.siteSettings.company_name || homepage.title || 'CMS Site';
    const brandTagline = hero.eyebrow || homepage.short_description || 'Dynamic single page website';
    const logoPath = storageUrl(site.siteSettings.logo_light || site.siteSettings.logo_dark || homepage.logo);

    dom.brand.innerHTML = `
        ${logoPath
            ? `<img class="brand-logo" src="${escapeHtml(logoPath)}" alt="${escapeHtml(brandName)} logo">`
            : '<span class="brand-mark">CX</span>'}
        <span class="brand-copy">
            <span>${escapeHtml(brandName)}</span>
            <span>${escapeHtml(brandTagline)}</span>
        </span>
    `;
}

function renderHero(site) {
    const homepage = getPage(site, 'homepage');
    const hero = getSection(homepage, 'hero');
    const proof = getSection(homepage, 'proof');
    const title = hero.title || homepage.title || 'Single Page CMS Website';
    const description = hero.description || homepage.short_description || homepage.content;
    const primaryLabel = hero.primary_cta_label || 'Explore Services';
    const primaryHref = hero.primary_cta_href || '#services';
    const secondaryLabel = hero.secondary_cta_label || 'Contact Us';
    const secondaryHref = hero.secondary_cta_href || '#contact';
    const badges = getStringList(hero.badges);
    const stats = getMetricItems(hero.stats, site);
    const proofItems = getObjectList(proof.items).length > 0
        ? getObjectList(proof.items)
        : site.productServices.slice(0, 3).map((item) => ({
            title: item.title,
            description: item.short_description,
        }));
    const banner = storageUrl(homepage.banner_image);

    dom.hero.innerHTML = `
        <div class="container section-shell">
            <div class="hero-grid">
                <div class="hero-copy reveal">
                    <span class="eyebrow">${escapeHtml(hero.eyebrow || 'CMS Website')}</span>
                    <h1>${escapeHtml(title)}</h1>
                    <p class="lede">${escapeHtml(description)}</p>
                    <div class="hero-actions">
                        <a class="button" href="${escapeHtml(primaryHref)}">${escapeHtml(primaryLabel)}</a>
                        <a class="button-secondary" href="${escapeHtml(secondaryHref)}">${escapeHtml(secondaryLabel)}</a>
                    </div>
                    ${badges.length > 0 ? `<ul class="tag-list">${badges.map((badge) => `<li>${escapeHtml(badge)}</li>`).join('')}</ul>` : ''}
                    <div class="metric-grid">
                        ${stats.map((item) => `
                            <article class="metric-card">
                                <span class="metric-value">${escapeHtml(item.value)}</span>
                                <span class="metric-label">${escapeHtml(item.label)}</span>
                            </article>
                        `).join('')}
                    </div>
                </div>

                <div class="hero-panel reveal">
                    <span class="panel-label">CMS-managed spotlight</span>
                    <h3>${escapeHtml(homepage.short_description || 'A content structure that stays predictable')}</h3>
                    <div class="rich-text">${renderParagraphs(homepage.content)}</div>
                    <ul class="check-list">
                        ${proofItems.map((item) => `
                            <li>
                                <strong>${escapeHtml(item.title || 'Section block')}</strong><br>
                                ${escapeHtml(item.description || '')}
                            </li>
                        `).join('')}
                    </ul>
                    <div class="hero-visual">
                        ${banner
                            ? `<img src="${escapeHtml(banner)}" alt="${escapeHtml(title)}">`
                            : `<div class="hero-visual-placeholder">
                                    <div>
                                        <strong>${escapeHtml(site.siteSettings.legal_name || site.siteSettings.company_name || 'Your public website')}</strong>
                                        <p>This placeholder swaps automatically when homepage banner media is available from the admin panel.</p>
                                    </div>
                                </div>`}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAbout(site) {
    const aboutPage = getPage(site, 'about');
    const metrics = getObjectList(getSection(aboutPage, 'metrics').items);
    const checklist = getStringList(getSection(aboutPage, 'checklist').items);

    dom.about.innerHTML = `
        <div class="container section-shell">
            <div class="section-head reveal">
                <span class="eyebrow">About</span>
                <h2>${escapeHtml(aboutPage.title || 'A structured public face for your CMS')}</h2>
                <p class="section-copy">${escapeHtml(aboutPage.short_description || 'Content blocks designed to remain easy to maintain from admin.')}</p>
            </div>

            <div class="about-grid">
                <article class="content-card reveal">
                    <div class="rich-text">${renderParagraphs(aboutPage.content)}</div>
                    ${checklist.length > 0 ? `
                        <ul class="check-list">
                            ${checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
                        </ul>
                    ` : ''}
                </article>

                <div class="metric-grid reveal">
                    ${metrics.map((item) => `
                        <article class="metric-card">
                            <span class="metric-value">${escapeHtml(item.value || '--')}</span>
                            <span class="metric-label">${escapeHtml(item.label || '')}</span>
                        </article>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderServices(site) {
    const servicesPage = getPage(site, 'products-services');
    const summaryCards = getObjectList(getSection(servicesPage, 'summary_cards').items);
    const services = [...site.productServices].sort((left, right) => Number(Boolean(right.is_featured)) - Number(Boolean(left.is_featured)));
    const brochureUrl = storageUrl(site.siteSettings.brochure_file);
    const brochureLabel = getSection(servicesPage, 'cta').label || 'Download Brochure';

    dom.services.innerHTML = `
        <div class="container section-shell">
            <div class="section-head section-head-split reveal">
                <div class="section-head">
                    <span class="eyebrow">Products & Services</span>
                    <h2>${escapeHtml(servicesPage.title || 'Published offerings')}</h2>
                    <p class="section-copy">${escapeHtml(servicesPage.short_description || 'Dynamic offering cards driven by ProductService records.')}</p>
                </div>
                ${brochureUrl ? `<a class="button-secondary" href="${escapeHtml(brochureUrl)}" target="_blank" rel="noreferrer">${escapeHtml(brochureLabel)}</a>` : ''}
            </div>

            ${summaryCards.length > 0 ? `
                <div class="summary-grid">
                    ${summaryCards.map((item, index) => `
                        <article class="summary-card reveal" style="transition-delay:${index * 80}ms">
                            <span class="panel-label">Section note</span>
                            <h3>${escapeHtml(item.title || '')}</h3>
                            <p class="card-copy">${escapeHtml(item.description || '')}</p>
                        </article>
                    `).join('')}
                </div>
            ` : ''}

            <div class="service-grid">
                ${services.map((service, index) => renderServiceCard(service, index)).join('')}
            </div>
        </div>
    `;
}

function renderServiceCard(service, index) {
    const features = getStringList(service.features_json).slice(0, 3);
    const typeLabel = toTitleCase(service.type || 'item');
    const categoryLabel = service.category?.name || '';

    return `
        <article class="service-card reveal" style="transition-delay:${index * 70}ms">
            <div class="service-card-footer">
                <span class="badge">${escapeHtml(typeLabel)}</span>
                ${service.is_featured ? '<span class="panel-label">Featured</span>' : ''}
            </div>
            <h3>${escapeHtml(service.title || '')}</h3>
            <p class="card-copy">${escapeHtml(service.short_description || service.description || '')}</p>
            ${features.length > 0 ? `
                <ul class="feature-list">
                    ${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}
                </ul>
            ` : ''}
            <div class="service-card-footer">
                <span class="card-meta">${escapeHtml(categoryLabel || 'Admin-managed card')}</span>
                <a
                    class="button-ghost service-request"
                    href="#contact"
                    data-product-id="${escapeHtml(String(service.id || ''))}"
                    data-inquiry-type="${escapeHtml(service.type || 'general')}"
                >
                    Request Details
                </a>
            </div>
        </article>
    `;
}

function renderProcess(site) {
    const processPage = getPage(site, 'manufacture-process');
    const steps = getObjectList(getSection(processPage, 'steps').items);

    dom.process.innerHTML = `
        <div class="container section-shell">
            <div class="section-head reveal">
                <span class="eyebrow">Process</span>
                <h2>${escapeHtml(processPage.title || 'A repeatable delivery workflow')}</h2>
                <p class="section-copy">${escapeHtml(processPage.short_description || 'Use this section for process stages, milestones, or delivery steps.')}</p>
            </div>

            <div class="about-grid">
                <article class="content-card reveal">
                    <div class="rich-text">${renderParagraphs(processPage.content)}</div>
                </article>

                <div class="timeline">
                    ${steps.map((step, index) => `
                        <article class="timeline-card reveal" style="transition-delay:${index * 70}ms">
                            <span class="timeline-number">${String(index + 1).padStart(2, '0')}</span>
                            <div>
                                <h3>${escapeHtml(step.title || '')}</h3>
                                <p class="card-copy">${escapeHtml(step.description || '')}</p>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderTeam(site) {
    if (site.members.length === 0) {
        dom.team.hidden = true;
        return;
    }

    dom.team.hidden = false;
    dom.team.innerHTML = `
        <div class="container section-shell">
            <div class="section-head reveal">
                <span class="eyebrow">Team</span>
                <h2>People behind the workflow.</h2>
                <p class="section-copy">This section is populated from active member records in the admin panel.</p>
            </div>

            <div class="team-grid">
                ${site.members.map((member, index) => renderMemberCard(member, index)).join('')}
            </div>
        </div>
    `;
}

function renderMemberCard(member, index) {
    const image = storageUrl(member.image);
    const socials = [
        { label: 'LinkedIn', url: member.linkedin },
        { label: 'Twitter', url: member.twitter },
        { label: 'Instagram', url: member.instagram },
    ].filter((item) => item.url);

    return `
        <article class="member-card reveal" style="transition-delay:${index * 70}ms">
            ${image
                ? `<img class="member-avatar" src="${escapeHtml(image)}" alt="${escapeHtml(member.name || '')}">`
                : `<span class="member-avatar-fallback">${escapeHtml(initials(member.name || 'Member'))}</span>`}
            <div>
                <h3>${escapeHtml(member.name || '')}</h3>
                <p class="member-role">${escapeHtml(member.designation || '')}</p>
            </div>
            <p class="card-copy">${escapeHtml(member.short_bio || '')}</p>
            ${socials.length > 0 ? `
                <div class="member-card-footer">
                    <ul class="social-list">
                        ${socials.map((social) => `
                            <li><a href="${escapeHtml(social.url)}" target="_blank" rel="noreferrer">${escapeHtml(social.label)}</a></li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </article>
    `;
}

function renderTestimonials(site) {
    if (site.testimonials.length === 0) {
        dom.testimonials.hidden = true;
        return;
    }

    dom.testimonials.hidden = false;
    dom.testimonials.innerHTML = `
        <div class="container section-shell">
            <div class="section-head reveal">
                <span class="eyebrow">Testimonials</span>
                <h2>Proof that the content structure supports real business use.</h2>
                <p class="section-copy">Published testimonials map cleanly into reusable quote cards.</p>
            </div>

            <div class="testimonial-grid">
                ${site.testimonials.map((testimonial, index) => `
                    <article class="quote-card reveal" style="transition-delay:${index * 70}ms">
                        <span class="rating">${'â˜…'.repeat(Number(testimonial.rating || 0))}</span>
                        <p class="quote-copy">${escapeHtml(testimonial.message || '')}</p>
                        <div>
                            <h3>${escapeHtml(testimonial.client_name || '')}</h3>
                            <p class="card-copy">
                                ${escapeHtml([testimonial.client_designation, testimonial.company_name].filter(Boolean).join(', '))}
                            </p>
                        </div>
                    </article>
                `).join('')}
            </div>
        </div>
    `;
}

function renderContact(site) {
    const contactPage = getPage(site, 'contact-us');
    const contactCards = getObjectList(getSection(contactPage, 'contact_cards').items);
    const officeHours = getObjectList(getSection(contactPage, 'office_hours').items);
    const formSection = getSection(contactPage, 'form');
    const inquiryTypes = getStringList(formSection.form_types).length > 0
        ? getStringList(formSection.form_types)
        : DEFAULT_INQUIRY_TYPES;
    const mapSrc = resolveMapSource(site.siteSettings.map_embed, site.siteSettings.map_address || site.siteSettings.company_address || site.siteSettings.company_name);

    dom.contact.innerHTML = `
        <div class="container section-shell">
            <div class="section-head reveal">
                <span class="eyebrow">Contact</span>
                <h2>${escapeHtml(contactPage.title || 'Start with one clear brief')}</h2>
                <p class="section-copy">${escapeHtml(contactPage.short_description || 'Send a message or connect the form to your Laravel inquiry endpoint.')}</p>
            </div>

            <div class="contact-layout">
                <div class="contact-stack">
                    <article class="contact-card reveal">
                        <h3>Direct channels</h3>
                        <ul class="contact-list">
                            ${buildContactCardItems(contactCards, site.siteSettings).map((item) => `
                                <li>
                                    <span class="contact-label">${escapeHtml(item.label)}</span>
                                    <span>${escapeHtml(item.value)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </article>

                    <article class="contact-card reveal">
                        <h3>Office hours</h3>
                        <ul class="hours-list">
                            ${buildOfficeHourItems(officeHours).map((item) => `
                                <li>
                                    <span class="contact-label">${escapeHtml(item.label)}</span>
                                    <span>${escapeHtml(item.value)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </article>

                    <article class="map-card reveal">
                        <h3>${escapeHtml(site.siteSettings.map_title || 'Visit us')}</h3>
                        <p class="card-copy">${escapeHtml(site.siteSettings.map_address || site.siteSettings.company_address || '')}</p>
                        ${mapSrc
                            ? `<iframe class="map-frame" src="${escapeHtml(mapSrc)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${escapeHtml(site.siteSettings.map_title || 'Map')}"></iframe>`
                            : `<div class="map-fallback">Add a Google Maps embed URL, iframe, or API key in Site Settings to populate this block.</div>`}
                    </article>
                </div>

                <article class="contact-form-card reveal">
                    <div class="section-head">
                        <span class="eyebrow">Inquiry Form</span>
                        <h3>${escapeHtml(formSection.title || 'Tell us what you need')}</h3>
                        <p class="contact-copy">${escapeHtml(formSection.description || contactPage.content || '')}</p>
                    </div>

                    <form id="inquiry-form" novalidate>
                        <div class="field-grid">
                            <div class="field">
                                <label for="inquiry_type">Inquiry type</label>
                                <select id="inquiry_type" name="inquiry_type" required>
                                    ${inquiryTypes.map((type) => `
                                        <option value="${escapeHtml(type)}">${escapeHtml(toTitleCase(type))}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="field">
                                <label for="product_service_id">Related offering</label>
                                <select id="product_service_id" name="product_service_id">
                                    <option value="">Select if relevant</option>
                                    ${site.productServices.map((service) => `
                                        <option value="${escapeHtml(String(service.id || ''))}">${escapeHtml(service.title || '')}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="field">
                                <label for="name">Name</label>
                                <input id="name" name="name" type="text" required maxlength="255">
                            </div>

                            <div class="field">
                                <label for="email">Email</label>
                                <input id="email" name="email" type="email" required maxlength="255">
                            </div>

                            <div class="field">
                                <label for="phone">Phone</label>
                                <input id="phone" name="phone" type="text" maxlength="50">
                            </div>

                            <div class="field">
                                <label for="subject">Subject</label>
                                <input id="subject" name="subject" type="text" maxlength="255">
                            </div>

                            <div class="field field-full">
                                <label for="message">Message</label>
                                <textarea id="message" name="message" required></textarea>
                            </div>
                        </div>

                        <p class="status-message" id="inquiry-status" aria-live="polite"></p>

                        <button class="button" type="submit">Send Inquiry</button>
                    </form>
                </article>
            </div>
        </div>
    `;
}

function renderFooter(site) {
    const settings = site.siteSettings;
    const socials = [
        { label: 'LinkedIn', url: settings.linkedin_url },
        { label: 'Facebook', url: settings.facebook_url },
        { label: 'Instagram', url: settings.instagram_url },
    ].filter((item) => item.url);

    dom.footer.innerHTML = `
        <div class="container footer-grid">
            <article class="footer-card">
                <span class="eyebrow">Footer</span>
                <h3>${escapeHtml(settings.company_name || 'CMS Site')}</h3>
                <p class="card-copy">${escapeHtml(settings.company_address || 'Use Site Settings to control footer identity, address, and social links.')}</p>
            </article>

            <article class="footer-card">
                <div class="footer-links">
                    <div class="footer-link-row">
                        ${settings.export_email ? `<a href="mailto:${escapeHtml(settings.export_email)}">${escapeHtml(settings.export_email)}</a>` : ''}
                        ${settings.phone ? `<a href="tel:${escapeHtml(settings.phone.replace(/\s+/g, ''))}">${escapeHtml(settings.phone)}</a>` : ''}
                    </div>
                    ${socials.length > 0 ? `
                        <div class="footer-link-row">
                            ${socials.map((item) => `
                                <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="footer-bottom">
                        <span class="card-copy">Connect this static frontend with Laravel by injecting a window payload or using one API endpoint.</span>
                        <span class="card-copy">(c) ${new Date().getFullYear()}</span>
                    </div>
                </div>
            </article>
        </div>
    `;
}

function renderWhatsApp(settings) {
    const number = String(settings.whatsapp_number || '').replace(/[^\d]/g, '');

    if (!settings.whatsapp_chat_enabled || !number) {
        dom.whatsappFab.hidden = true;
        return;
    }

    const message = settings.whatsapp_prefill_message || 'Hello';
    dom.whatsappFab.hidden = false;
    dom.whatsappFab.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function renderNavigation(site) {
    const labels = [
        { id: 'about', label: getPage(site, 'about').title || 'About', hidden: dom.about.hidden },
        { id: 'services', label: 'Services', hidden: dom.services.hidden },
        { id: 'process', label: 'Process', hidden: dom.process.hidden },
        { id: 'team', label: 'Team', hidden: dom.team.hidden },
        { id: 'testimonials', label: 'Testimonials', hidden: dom.testimonials.hidden },
        { id: 'contact', label: 'Contact', hidden: dom.contact.hidden },
    ].filter((item) => !item.hidden);

    dom.nav.innerHTML = labels.map((item) => `
        <a href="#${item.id}" data-section-link="${item.id}">${escapeHtml(shortLabel(item.label))}</a>
    `).join('');

    const hero = getSection(getPage(site, 'homepage'), 'hero');
    dom.headerCta.textContent = hero.secondary_cta_label || 'Contact';
    dom.headerCta.href = hero.secondary_cta_href || '#contact';
}

function bindMenuToggle() {
    if (!dom.navToggle) {
        return;
    }

    dom.navToggle.addEventListener('click', () => {
        const isOpen = dom.nav.classList.toggle('is-open');
        dom.navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    dom.nav.addEventListener('click', (event) => {
        if (!(event.target instanceof HTMLAnchorElement)) {
            return;
        }

        dom.nav.classList.remove('is-open');
        dom.navToggle.setAttribute('aria-expanded', 'false');
    });
}

function bindSectionHighlighting() {
    const links = [...document.querySelectorAll('[data-section-link]')];
    const sections = links
        .map((link) => document.getElementById(link.getAttribute('data-section-link') || ''))
        .filter(Boolean);

    if (!('IntersectionObserver' in window) || links.length === 0 || sections.length === 0) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const targetId = entry.target.id;
            const link = document.querySelector(`[data-section-link="${targetId}"]`);

            if (!link) {
                return;
            }

            link.classList.toggle('is-active', entry.isIntersecting);
        });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0.01 });

    sections.forEach((section) => observer.observe(section));
}

function bindServicePrefill(site) {
    const inquiryTypeSelect = document.getElementById('inquiry_type');
    const productSelect = document.getElementById('product_service_id');

    if (!(inquiryTypeSelect instanceof HTMLSelectElement) || !(productSelect instanceof HTMLSelectElement)) {
        return;
    }

    document.querySelectorAll('.service-request').forEach((link) => {
        link.addEventListener('click', () => {
            const productId = link.getAttribute('data-product-id') || '';
            const inquiryType = link.getAttribute('data-inquiry-type') || 'general';

            productSelect.value = productId;
            inquiryTypeSelect.value = DEFAULT_INQUIRY_TYPES.includes(inquiryType) ? inquiryType : 'general';

            const selectedService = site.productServices.find((service) => String(service.id) === productId);
            const subjectInput = document.getElementById('subject');

            if (selectedService && subjectInput instanceof HTMLInputElement && subjectInput.value.trim() === '') {
                subjectInput.value = `Inquiry about ${selectedService.title}`;
            }
        });
    });
}

function bindInquiryForm(site) {
    const form = document.getElementById('inquiry-form');
    const status = document.getElementById('inquiry-status');

    if (!(form instanceof HTMLFormElement) || !(status instanceof HTMLElement)) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        status.className = 'status-message';
        status.textContent = '';

        if (!form.reportValidity()) {
            return;
        }

        const formData = new FormData(form);
        const payload = {
            inquiry_type: String(formData.get('inquiry_type') || 'general'),
            product_service_id: String(formData.get('product_service_id') || ''),
            name: String(formData.get('name') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            subject: String(formData.get('subject') || '').trim(),
            message: String(formData.get('message') || '').trim(),
        };

        try {
            status.textContent = 'Sending inquiry...';
            const message = await submitInquiry(payload, site);
            form.reset();
            status.classList.add('is-success');
            status.textContent = message;
        } catch (error) {
            status.classList.add('is-error');
            status.textContent = error instanceof Error ? error.message : 'Unable to send inquiry.';
        }
    });
}

async function submitInquiry(payload, site) {
    const contactPage = getPage(site, 'contact-us');
    const formSection = getSection(contactPage, 'form');
    const successMessage = formSection.success_message || 'Inquiry submitted successfully.';

    if (!CMS_SITE_CONFIG.inquiryEndpoint) {
        console.info('Inquiry payload ready for Laravel endpoint:', payload);
        return successMessage;
    }

    const body = new URLSearchParams();

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== '') {
            body.append(key, value);
        }
    });

    const response = await fetch(CMS_SITE_CONFIG.inquiryEndpoint, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            ...(CMS_SITE_CONFIG.csrfToken ? { 'X-CSRF-TOKEN': CMS_SITE_CONFIG.csrfToken } : {}),
        },
        body: body.toString(),
    });

    if (response.ok) {
        return successMessage;
    }

    const responseJson = await response.json().catch(() => null);
    const validationMessage = responseJson?.errors
        ? Object.values(responseJson.errors).flat()[0]
        : null;

    throw new Error(validationMessage || responseJson?.message || 'Unable to store inquiry.');
}

function enableRevealMotion() {
    const items = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
        items.forEach((item) => item.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.18 });

    items.forEach((item) => observer.observe(item));
}

function buildContactCardItems(items, settings) {
    if (items.length > 0) {
        return items;
    }

    return [
        { label: 'Email', value: settings.export_email || '--' },
        { label: 'Phone', value: settings.phone || '--' },
        { label: 'Address', value: settings.company_address || '--' },
    ];
}

function buildOfficeHourItems(items) {
    if (items.length > 0) {
        return items;
    }

    return [
        { label: 'Monday to Friday', value: '09:00 AM to 06:00 PM' },
        { label: 'Saturday', value: 'By appointment' },
        { label: 'Sunday', value: 'Closed' },
    ];
}

function getMetricItems(rawMetrics, site) {
    const metrics = getObjectList(rawMetrics);

    if (metrics.length > 0) {
        return metrics.slice(0, 4);
    }

    return [
        { value: String(site.productServices.length).padStart(2, '0'), label: 'Published offerings' },
        { value: String(site.members.length).padStart(2, '0'), label: 'Active member profiles' },
        { value: String(site.testimonials.length).padStart(2, '0'), label: 'Published testimonials' },
        { value: '01', label: 'Static frontend connected to CMS' },
    ];
}

function resolveMapSource(rawValue, fallbackQuery) {
    const value = String(rawValue || '').trim();

    if (!value) {
        return '';
    }

    if (value.includes('<iframe')) {
        const src = extractIframeSrc(value);
        return isSafeMapUrl(src) ? src : '';
    }

    if (/^https?:\/\//i.test(value)) {
        return isSafeMapUrl(value) ? value : '';
    }

    if (/^[A-Za-z0-9_\-]{20,}$/.test(value) && fallbackQuery) {
        return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(value)}&q=${encodeURIComponent(fallbackQuery)}`;
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(value)}&output=embed`;
}

function extractIframeSrc(markup) {
    try {
        const documentFragment = new DOMParser().parseFromString(markup, 'text/html');
        return documentFragment.querySelector('iframe')?.getAttribute('src') || '';
    } catch {
        return '';
    }
}

function isSafeMapUrl(url) {
    if (!url) {
        return false;
    }

    try {
        const parsed = new URL(url);
        return ['www.google.com', 'maps.google.com'].includes(parsed.hostname);
    } catch {
        return false;
    }
}

function storageUrl(path) {
    if (!path) {
        return '';
    }

    const rawPath = String(path);

    if (/^(?:https?:)?\/\//i.test(rawPath) || rawPath.startsWith('blob:') || rawPath.startsWith('data:')) {
        return rawPath;
    }

    if (rawPath.startsWith('/images/') || rawPath.startsWith('images/')) {
        return joinBaseUrl(CMS_SITE_CONFIG.baseUrl, rawPath);
    }

    const normalizedPath = rawPath
        .replace(/^\/+/, '')
        .replace(/^storage\//, '')
        .replace(/^media\//, '');

    return joinBaseUrl(
        CMS_SITE_CONFIG.mediaBaseUrl || CMS_SITE_CONFIG.baseUrl,
        `media/${normalizedPath.split('/').filter(Boolean).map((segment) => encodeURIComponent(segment)).join('/')}`,
    );
}

function joinBaseUrl(baseUrl, path) {
    const cleanPath = String(path || '').replace(/^\/+/, '');

    if (!cleanPath) {
        return '';
    }

    const cleanBase = String(baseUrl || '').replace(/\/+$/, '');

    return cleanBase ? `${cleanBase}/${cleanPath}` : `/${cleanPath}`;
}

function getObjectList(value) {
    return toArray(value).filter(isRecord);
}

function getStringList(value) {
    return toArray(value)
        .map((item) => String(item ?? '').trim())
        .filter(Boolean);
}

function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (isRecord(value) && Array.isArray(value.data)) {
        return value.data;
    }

    return [];
}

function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function renderParagraphs(value) {
    return String(value || '')
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');
}

function initials(value) {
    return String(value || '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'M';
}

function shortLabel(value) {
    return String(value || '')
        .replace(/[`'"]/g, '')
        .split(/\s+/)
        .slice(0, 2)
        .join(' ');
}

function toTitleCase(value) {
    return String(value || '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

