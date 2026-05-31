import { useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminFormActions from '@/components/admin/AdminFormActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import FormField from '@/components/admin/FormField';
import AdminLayout from '@/layouts/AdminLayout';
import type { Gallery, GalleryImage } from '@/types/admin';
import { storageUrl } from '@/utils/admin';
import GalleryForm from './Form';

function GalleryImageUploadCard({ galleryId }: { galleryId: number }) {
    const [selectedCount, setSelectedCount] = useState(0);
    const uploadTimeoutRef = useRef<number | null>(null);
    const form = useForm({
        images: [] as File[],
    });

    useEffect(() => {
        return () => {
            if (uploadTimeoutRef.current !== null) {
                window.clearTimeout(uploadTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!form.data.images.length) {
            if (uploadTimeoutRef.current !== null) {
                window.clearTimeout(uploadTimeoutRef.current);
                uploadTimeoutRef.current = null;
            }

            return;
        }

        if (uploadTimeoutRef.current !== null) {
            window.clearTimeout(uploadTimeoutRef.current);
        }

        uploadTimeoutRef.current = window.setTimeout(() => {
            form.post(`/admin/galleries/${galleryId}/images`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    form.reset('images');
                    setSelectedCount(0);
                },
            });
        }, 2000);

        return () => {
            if (uploadTimeoutRef.current !== null) {
                window.clearTimeout(uploadTimeoutRef.current);
                uploadTimeoutRef.current = null;
            }
        };
    }, [form.data.images, galleryId]);

    return (
        <AdminCard title="Upload new images">
            <FormField label="Gallery uploads" error={form.errors.images}>
                <div className="space-y-3">
                    <Input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(event) => {
                            const files = Array.from(event.target.files ?? []);

                            form.setData('images', files);
                            form.clearErrors('images');
                            setSelectedCount(files.length);
                        }}
                    />
                    <p className="text-xs text-zinc-500">
                        {form.processing
                            ? 'Uploading selected images and creating album cards...'
                            : selectedCount > 0
                            ? `${selectedCount} image${selectedCount === 1 ? '' : 's'} selected. Upload starts automatically in 2 seconds.`
                            : 'Choose images to create album cards automatically.'}
                    </p>
                </div>
            </FormField>
        </AdminCard>
    );
}

function GalleryImageEditor({
    galleryId,
    image,
    statuses,
}: {
    galleryId: number;
    image: GalleryImage;
    statuses: string[];
}) {
    const imageUrl = storageUrl(image.image);
    const form = useForm({
        title: image.title ?? '',
        alt_text: image.alt_text ?? '',
        caption: image.caption ?? '',
        status: image.status,
        sort_order: String(image.sort_order ?? 0).replace(/\D+/g, ''),
        image: null as File | null,
    });

    return (
        <form
            className="space-y-4 rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/90 p-4 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:ring-white/5"
            onSubmit={(event) => {
                event.preventDefault();
                form.transform((data) => ({ ...data, _method: 'put' }));
                form.post(`/admin/galleries/${galleryId}/images/${image.id}`, {
                    forceFormData: true,
                });
            }}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={image.alt_text ?? image.title ?? 'Gallery image'}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full rounded-[var(--app-surface-radius)] object-cover"
                />
            ) : null}
            <Input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(event) => form.setData('image', event.target.files?.[0] ?? null)} />
            <Input placeholder="Title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} />
            <Input placeholder="Alt text" value={form.data.alt_text} onChange={(event) => form.setData('alt_text', event.target.value)} />
            <Textarea rows={3} placeholder="Caption" value={form.data.caption} onChange={(event) => form.setData('caption', event.target.value)} />
            <div className="grid gap-3 md:grid-cols-2">
                <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </Select>
                <Input numericOnly value={form.data.sort_order} onChange={(event) => form.setData('sort_order', event.target.value)} />
            </div>
            <div className="flex gap-3">
                <Button type="submit" color="blue" disabled={form.processing}>Save image</Button>
                <Button type="button" color="red" onClick={() => router.post(`/admin/galleries/${galleryId}/images/${image.id}`, { _method: 'delete' })}>Delete</Button>
            </div>
        </form>
    );
}

export default function Edit({
    gallery,
    statuses,
    imageStatuses,
}: {
    gallery: Gallery;
    statuses: string[];
    imageStatuses: string[];
}) {
    const [openDelete, setOpenDelete] = useState(false);
    const uploadedImages = (gallery.images ?? []).filter((image) => storageUrl(image.image));

    return (
        <AdminLayout
            title="Edit Gallery"
            header={
                <AdminPageHeader
                    title={`Edit ${gallery.title}`}
                    description="Update album details and manage individual gallery images."
                    backHref="/admin/galleries"
                    sticky
                    actions={<AdminFormActions formId="gallery-form" cancelHref="/admin/galleries" processing={false} submitLabel="Update gallery" processingLabel="Saving..." />}
                />
            }
        >
            <GalleryForm gallery={gallery} statuses={statuses} withBottomSpacing={false} />

            <div className="mt-6 space-y-6 pb-6">
                <GalleryImageUploadCard galleryId={gallery.id} />

                <AdminCard title="Existing images" className="relative z-10">
                    {uploadedImages.length > 0 ? (
                        <div className="grid items-start gap-4 xl:grid-cols-2">
                            {uploadedImages.map((image) => (
                                <GalleryImageEditor key={image.id} galleryId={gallery.id} image={image} statuses={imageStatuses} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[var(--app-surface-radius)] border border-dashed border-zinc-950/10 bg-zinc-50/90 px-5 py-8 text-center ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:ring-white/5">
                            <p className="text-sm font-medium text-zinc-950 dark:text-white">Upload Image first than Album card appears.</p>
                        </div>
                    )}
                </AdminCard>

                <AdminCard title="Danger zone">
                    <Button color="red" onClick={() => setOpenDelete(true)}>Delete gallery</Button>
                </AdminCard>
            </div>

            <AdminDeleteDialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                title="Delete gallery"
                description="This permanently removes the gallery and all its images."
                onConfirm={() => router.post(`/admin/galleries/${gallery.id}`, { _method: 'delete' }, { onSuccess: () => setOpenDelete(false) })}
            />
        </AdminLayout>
    );
}
