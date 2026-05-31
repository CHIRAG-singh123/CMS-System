import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormField from './FormField';

interface AdminSeoFieldsProps {
    data: {
        meta_title?: string;
        meta_description?: string;
        meta_keywords?: string;
    };
    errors: Record<string, string>;
    setData: (key: string, value: string) => void;
}

export default function AdminSeoFields({ data, errors, setData }: AdminSeoFieldsProps) {
    return (
        <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Meta title" error={errors.meta_title}>
                <Input value={data.meta_title ?? ''} onChange={(event) => setData('meta_title', event.target.value)} />
            </FormField>
            <FormField label="Meta keywords" error={errors.meta_keywords}>
                <Input value={data.meta_keywords ?? ''} onChange={(event) => setData('meta_keywords', event.target.value)} />
            </FormField>
            <div className="md:col-span-2">
                <FormField label="Meta description" error={errors.meta_description}>
                    <Textarea
                        rows={4}
                        value={data.meta_description ?? ''}
                        onChange={(event) => setData('meta_description', event.target.value)}
                    />
                </FormField>
            </div>
        </div>
    );
}
