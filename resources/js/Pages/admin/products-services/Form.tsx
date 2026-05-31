import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import AdminSeoFields from '@/components/admin/AdminSeoFields';
import FormField from '@/components/admin/FormField';
import type { Category, ProductService } from '@/types/admin';
import { DEFAULT_PRODUCT_IMAGE, handleImageFallback, storageUrl } from '@/utils/admin';
import { normalizeSlug } from '@/utils/slug';
import { useAutoSlug } from '@/utils/useAutoSlug';

interface ProductServiceFormProps {
    record?: ProductService;
    categories: Array<Pick<Category, 'id' | 'name'>>;
    statuses: string[];
    types: string[];
}

const galleryImageLimit = 5;

function normalizeGalleryImages(images: Array<string | null | undefined> | null | undefined): string[] {
    return (images ?? []).filter((path): path is string => typeof path === 'string' && path.trim() !== '');
}

export default function ProductServiceForm({ record, categories, statuses, types }: ProductServiceFormProps) {
    const form = useForm({
        category_id: record?.category_id ? String(record.category_id) : '',
        type: record?.type ?? types[0],
        title: record?.title ?? '',
        slug: record?.slug ?? '',
        short_description: record?.short_description ?? '',
        description: record?.description ?? '',
        status: record?.status ?? statuses[0],
        is_featured: record?.is_featured ?? false,
        meta_title: record?.meta_title ?? '',
        meta_description: record?.meta_description ?? '',
        features_text: (record?.features_json ?? []).join('\n'),
        benefits_text: (record?.benefits_json ?? []).join('\n'),
        specifications_text: (record?.specifications_json ?? []).join('\n'),
        featured_image: null as File | null,
        gallery_uploads: [] as File[],
        existing_gallery_images: normalizeGalleryImages(record?.gallery_images),
    });
    const [galleryUploadPreviews, setGalleryUploadPreviews] = useState<string[]>([]);

    useAutoSlug({
        source: form.data.title,
        slug: form.data.slug,
        setSlug: (value) => form.setData('slug', value),
    });

    useEffect(() => {
        if (!form.data.gallery_uploads.length) {
            setGalleryUploadPreviews([]);

            return;
        }

        const objectUrls = form.data.gallery_uploads.map((file) => URL.createObjectURL(file));
        setGalleryUploadPreviews(objectUrls);

        return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
    }, [form.data.gallery_uploads]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (record) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/products-services/${record.id}`, {
                forceFormData: true,
            });
            return;
        }

        form.post('/admin/products-services', { forceFormData: true });
    };

    const removeGalleryImage = (path: string) => {
        const nextExistingGalleryImages = form.data.existing_gallery_images.filter((item) => item !== path && item.trim() !== '');

        form.setData(
            'existing_gallery_images',
            nextExistingGalleryImages,
        );

        if ((nextExistingGalleryImages.length + form.data.gallery_uploads.length) <= galleryImageLimit) {
            form.clearErrors('gallery_uploads');
        }
    };

    const handleGalleryUploadsChange = (files: File[]) => {
        const existingPendingFiles = form.data.gallery_uploads;
        const existingPendingKeys = new Set(
            existingPendingFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
        );
        const uniqueNewFiles = files.filter((file) => !existingPendingKeys.has(`${file.name}-${file.size}-${file.lastModified}`));
        const availableSlots = Math.max(0, galleryImageLimit - form.data.existing_gallery_images.length - existingPendingFiles.length);
        const acceptedFiles = uniqueNewFiles.slice(0, availableSlots);
        const nextFiles = [...existingPendingFiles, ...acceptedFiles];

        form.setData('gallery_uploads', nextFiles);

        if (uniqueNewFiles.length > availableSlots) {
            form.setError('gallery_uploads', `You can upload up to ${galleryImageLimit} gallery images in total.`);

            return;
        }

        form.clearErrors('gallery_uploads');
    };

    const removePendingGalleryUpload = (index: number) => {
        const nextGalleryUploads = form.data.gallery_uploads.filter((_, fileIndex) => fileIndex !== index);
        form.setData('gallery_uploads', nextGalleryUploads);

        if ((form.data.existing_gallery_images.length + nextGalleryUploads.length) <= galleryImageLimit) {
            form.clearErrors('gallery_uploads');
        }
    };

    const existingGalleryImages = normalizeGalleryImages(form.data.existing_gallery_images);
    const totalGalleryImages = existingGalleryImages.length + form.data.gallery_uploads.length;
    const remainingGallerySlots = Math.max(0, galleryImageLimit - totalGalleryImages);

    return (
        <form id="product-service-form" className="space-y-6 pb-6" onSubmit={submit}>
            <AdminCard title="Record details" className="relative z-40">
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Type" error={form.errors.type}>
                        <Select value={form.data.type} onChange={(event) => form.setData('type', event.target.value)}>
                            {types.map((type) => <option key={type} value={type}>{type}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Category" error={form.errors.category_id}>
                        <Select value={form.data.category_id} onChange={(event) => form.setData('category_id', event.target.value)}>
                            <option value="">Unassigned</option>
                            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Title" error={form.errors.title}>
                        <Input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} />
                    </FormField>
                    <FormField label="Slug" error={form.errors.slug}>
                        <Input value={form.data.slug} onChange={(event) => form.setData('slug', normalizeSlug(event.target.value))} />
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Short description" error={form.errors.short_description}>
                            <Textarea rows={3} value={form.data.short_description} onChange={(event) => form.setData('short_description', event.target.value)} />
                        </FormField>
                    </div>
                    <div className="md:col-span-2">
                        <FormField label="Description" error={form.errors.description}>
                            <Textarea rows={7} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                        </FormField>
                    </div>
                    <FormField label="Status" error={form.errors.status}>
                        <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Visibility">
                        <label className="mt-2 inline-flex max-w-full items-center gap-3 text-sm text-zinc-700 dark:text-zinc-100">
                            <Checkbox checked={form.data.is_featured} onChange={(checked) => form.setData('is_featured', checked)} />
                            <span>Mark as featured( Highlight this record across catalog listings and featured sections.)</span>
                        </label>
                    </FormField>
                </div>
            </AdminCard>

            <AdminCard title="Media" className="relative z-30">
                <div className="space-y-6">
                    <AdminImageUpload
                        label="Featured image"
                        file={form.data.featured_image}
                        existing={record?.featured_image}
                        fallbackSrc={DEFAULT_PRODUCT_IMAGE}
                        onChange={(file) => form.setData('featured_image', file)}
                        error={form.errors.featured_image}
                    />

                    <FormField label="Gallery uploads" error={form.errors.gallery_uploads}>
                        <div className="space-y-3">
                            <Input
                                type="file"
                                multiple
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={(event) => {
                                    handleGalleryUploadsChange(Array.from(event.target.files ?? []));
                                    event.target.value = '';
                                }}
                            />
                            <p className="text-xs text-zinc-500">
                                Upload up to {galleryImageLimit} gallery images total. {remainingGallerySlots} slot{remainingGallerySlots === 1 ? '' : 's'} currently available.
                            </p>
                        </div>
                    </FormField>

                    {form.data.gallery_uploads.length ? (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-100">
                                Pending uploads ({totalGalleryImages}/{galleryImageLimit})
                            </p>
                            <div className="grid gap-4 md:grid-cols-3">
                                {form.data.gallery_uploads.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/90 p-3 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:ring-white/5">
                                        {galleryUploadPreviews[index] ? (
                                            <img
                                                src={galleryUploadPreviews[index]}
                                                alt={file.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="h-32 w-full rounded-[var(--app-surface-radius)] object-cover"
                                            />
                                        ) : null}
                                        <p className="mt-3 truncate text-xs text-zinc-500">{file.name}</p>
                                        <Button outline type="button" className="mt-3 w-full justify-center sm:w-auto" onClick={() => removePendingGalleryUpload(index)}>
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {existingGalleryImages.length ? (
                        <div className="grid gap-4 md:grid-cols-3">
                            {existingGalleryImages.map((path) => {
                                const imageUrl = storageUrl(path);

                                return (
                                    <div key={path} className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/90 p-3 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:ring-white/5">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt="Gallery preview"
                                                loading="lazy"
                                                decoding="async"
                                                onError={(event) => handleImageFallback(event, DEFAULT_PRODUCT_IMAGE)}
                                                className="h-32 w-full rounded-[var(--app-surface-radius)] object-cover"
                                            />
                                        ) : null}
                                        <Button outline type="button" className="mt-3 w-full justify-center sm:w-auto" onClick={() => removeGalleryImage(path)}>
                                            Remove
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            </AdminCard>

            <AdminCard title="Structured highlights" className="relative z-20">
                <div className="grid gap-5 md:grid-cols-3">
                    <FormField label="Features" hint="One item per line." error={form.errors.features_text}>
                        <Textarea rows={6} value={form.data.features_text} onChange={(event) => form.setData('features_text', event.target.value)} />
                    </FormField>
                    <FormField label="Benefits" hint="One item per line." error={form.errors.benefits_text}>
                        <Textarea rows={6} value={form.data.benefits_text} onChange={(event) => form.setData('benefits_text', event.target.value)} />
                    </FormField>
                    <FormField label="Specifications" hint="One item per line." error={form.errors.specifications_text}>
                        <Textarea rows={6} value={form.data.specifications_text} onChange={(event) => form.setData('specifications_text', event.target.value)} />
                    </FormField>
                </div>
            </AdminCard>

            <AdminCard title="SEO fields" className="relative z-10">
                <AdminSeoFields data={form.data} errors={form.errors as Record<string, string>} setData={form.setData} />
            </AdminCard>

        </form>
    );
}
