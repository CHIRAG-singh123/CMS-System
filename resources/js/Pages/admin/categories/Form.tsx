import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import FormField from '@/components/admin/FormField';
import type { Category } from '@/types/admin';
import { normalizeSlug } from '@/utils/slug';
import { useAutoSlug } from '@/utils/useAutoSlug';

interface CategoryFormProps {
    category?: Category;
    statuses: string[];
}

export default function CategoryForm({ category, statuses }: CategoryFormProps) {
    const form = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        status: category?.status ?? statuses[0],
        image: null as File | null,
    });

    useAutoSlug({
        source: form.data.name,
        slug: form.data.slug,
        setSlug: (value) => form.setData('slug', value),
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (category) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/categories/${category.id}`, {
                forceFormData: true,
            });
            return;
        }

        form.post('/admin/categories', { forceFormData: true });
    };

    return (
        <form id="category-form" className="space-y-6 pb-6" onSubmit={submit}>
            <AdminCard title="Category details" className="relative z-20">
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Name" error={form.errors.name}>
                        <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                    </FormField>
                    <FormField label="Slug" error={form.errors.slug} hint="Optional. Generated automatically when empty.">
                        <Input value={form.data.slug} onChange={(event) => form.setData('slug', normalizeSlug(event.target.value))} />
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Description" error={form.errors.description}>
                            <Textarea rows={4} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                        </FormField>
                    </div>
                    <FormField label="Status" error={form.errors.status}>
                        <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </Select>
                    </FormField>
                    {category ? (
                        <FormField label="UID">
                            <Input value={category.uid ?? ''} readOnly disabled />
                        </FormField>
                    ) : null}
                </div>
            </AdminCard>

            <AdminCard title="Category image" className="relative z-10">
                <AdminImageUpload
                    label="Category image"
                    file={form.data.image}
                    existing={category?.image}
                    onChange={(file) => form.setData('image', file)}
                    error={form.errors.image}
                />
            </AdminCard>

        </form>
    );
}
