import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import FormField from '@/components/admin/FormField';
import type { Gallery } from '@/types/admin';
import { normalizeSlug } from '@/utils/slug';
import { useAutoSlug } from '@/utils/useAutoSlug';

interface PendingGalleryImageMeta {
    title: string;
    alt_text: string;
    caption: string;
    status: string;
    sort_order: string;
}

interface GalleryFormProps {
    gallery?: Gallery;
    statuses: string[];
    imageStatuses?: string[];
    showGalleryUploads?: boolean;
    withBottomSpacing?: boolean;
}

function resolveDefaultPendingTitle(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

function nextPendingSortOrder(items: PendingGalleryImageMeta[]): number {
    return items.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0) + 1;
}

export default function GalleryForm({
    gallery,
    statuses,
    imageStatuses = ['active', 'inactive'],
    showGalleryUploads = false,
    withBottomSpacing = true,
}: GalleryFormProps) {
    const form = useForm({
        title: gallery?.title ?? '',
        slug: gallery?.slug ?? '',
        description: gallery?.description ?? '',
        status: gallery?.status ?? statuses[0],
        cover_image: null as File | null,
        gallery_uploads: [] as File[],
        gallery_uploads_meta: [] as PendingGalleryImageMeta[],
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

    const handleGalleryUploadsChange = (files: File[]) => {
        const existingPendingKeys = new Set(
            form.data.gallery_uploads.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
        );
        const uniqueNewFiles = files.filter((file) => !existingPendingKeys.has(`${file.name}-${file.size}-${file.lastModified}`));
        const pendingMeta = [...form.data.gallery_uploads_meta];
        let nextSortOrder = nextPendingSortOrder(pendingMeta);

        form.setData('gallery_uploads', [...form.data.gallery_uploads, ...uniqueNewFiles]);
        form.setData('gallery_uploads_meta', [
            ...pendingMeta,
            ...uniqueNewFiles.map((file) => ({
                title: resolveDefaultPendingTitle(file.name),
                alt_text: '',
                caption: '',
                status: imageStatuses[0] ?? 'active',
                sort_order: String(nextSortOrder++),
            })),
        ]);
        form.clearErrors('gallery_uploads');
    };

    const removePendingGalleryUpload = (index: number) => {
        form.setData('gallery_uploads', form.data.gallery_uploads.filter((_, fileIndex) => fileIndex !== index));
        form.setData('gallery_uploads_meta', form.data.gallery_uploads_meta.filter((_, fileIndex) => fileIndex !== index));
    };

    const updatePendingGalleryMeta = <K extends keyof PendingGalleryImageMeta>(
        index: number,
        key: K,
        value: PendingGalleryImageMeta[K],
    ) => {
        form.setData('gallery_uploads_meta', form.data.gallery_uploads_meta.map((item, itemIndex) => (
            itemIndex === index
                ? { ...item, [key]: value }
                : item
        )));
    };

    const replacePendingGalleryUpload = (index: number, file: File | null) => {
        if (!file) {
            return;
        }

        const nextFiles = [...form.data.gallery_uploads];
        nextFiles[index] = file;
        form.setData('gallery_uploads', nextFiles);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (gallery) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/galleries/${gallery.id}`, {
                forceFormData: true,
            });
            return;
        }

        form.post('/admin/galleries', { forceFormData: true });
    };

    return (
        <form id="gallery-form" className={`space-y-6${withBottomSpacing ? ' pb-6' : ''}`} onSubmit={submit}>
            <AdminCard title="Gallery details" className="relative z-30">
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Title" error={form.errors.title}>
                        <Input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} />
                    </FormField>
                    <FormField label="Slug" error={form.errors.slug}>
                        <Input value={form.data.slug} onChange={(event) => form.setData('slug', normalizeSlug(event.target.value))} />
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Description" error={form.errors.description}>
                            <Textarea rows={5} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                        </FormField>
                    </div>
                    <FormField label="Status" error={form.errors.status}>
                        <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </Select>
                    </FormField>
                    {gallery ? (
                        <FormField label="UID">
                            <Input value={gallery.uid ?? ''} readOnly disabled />
                        </FormField>
                    ) : null}
                </div>
            </AdminCard>

            <AdminCard title="Cover image" className="relative z-10">
                <AdminImageUpload
                    label="Gallery cover"
                    file={form.data.cover_image}
                    existing={gallery?.cover_image}
                    onChange={(file) => form.setData('cover_image', file)}
                    error={form.errors.cover_image}
                />
            </AdminCard>

            {showGalleryUploads ? (
                <AdminCard title="Upload new images">
                    <div className="space-y-5">
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
                                    {form.data.gallery_uploads.length
                                        ? `${form.data.gallery_uploads.length} image${form.data.gallery_uploads.length === 1 ? '' : 's'} selected. Gallery cards are ready below and will be created when you save the gallery.`
                                        : 'Choose images to add them as gallery cards while creating the gallery.'}
                                </p>
                            </div>
                        </FormField>
                    </div>
                </AdminCard>
            ) : null}

            {showGalleryUploads ? (
                <AdminCard title="Existing images" className="relative z-10">
                    {form.data.gallery_uploads.length ? (
                        <div className="grid items-start gap-4 xl:grid-cols-2">
                            {form.data.gallery_uploads.map((file, index) => (
                                <div
                                    key={`pending-gallery-card-${file.name}-${index}`}
                                    className="space-y-4 rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/90 p-4 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:ring-white/5"
                                >
                                    {galleryUploadPreviews[index] ? (
                                        <img
                                            src={galleryUploadPreviews[index]}
                                            alt={form.data.gallery_uploads_meta[index]?.alt_text || form.data.gallery_uploads_meta[index]?.title || file.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-40 w-full rounded-[var(--app-surface-radius)] object-cover"
                                        />
                                    ) : null}
                                    <Input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={(event) => replacePendingGalleryUpload(index, event.target.files?.[0] ?? null)}
                                    />
                                    <Input
                                        placeholder="Title"
                                        value={form.data.gallery_uploads_meta[index]?.title ?? ''}
                                        onChange={(event) => updatePendingGalleryMeta(index, 'title', event.target.value)}
                                    />
                                    <Input
                                        placeholder="Alt text"
                                        value={form.data.gallery_uploads_meta[index]?.alt_text ?? ''}
                                        onChange={(event) => updatePendingGalleryMeta(index, 'alt_text', event.target.value)}
                                    />
                                    <Textarea
                                        rows={3}
                                        placeholder="Caption"
                                        value={form.data.gallery_uploads_meta[index]?.caption ?? ''}
                                        onChange={(event) => updatePendingGalleryMeta(index, 'caption', event.target.value)}
                                    />
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <Select
                                            value={form.data.gallery_uploads_meta[index]?.status ?? imageStatuses[0] ?? 'active'}
                                            onChange={(event) => updatePendingGalleryMeta(index, 'status', event.target.value)}
                                        >
                                            {imageStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                        </Select>
                                        <Input
                                            numericOnly
                                            placeholder="Sort order"
                                            value={form.data.gallery_uploads_meta[index]?.sort_order ?? ''}
                                            onChange={(event) => updatePendingGalleryMeta(index, 'sort_order', event.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button outline type="button" onClick={() => removePendingGalleryUpload(index)}>
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[var(--app-surface-radius)] border border-dashed border-zinc-950/10 bg-zinc-50/90 px-5 py-8 text-center ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:ring-white/5">
                            <p className="text-sm font-medium text-zinc-950 dark:text-white">Upload Image first than Album card appears.</p>
                        </div>
                    )}
                </AdminCard>
            ) : null}

        </form>
    );
}
