import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import FormField from './FormField';
import { storageUrl } from '@/utils/admin';

interface AdminImageUploadProps {
    label: string;
    file: File | null;
    existing?: string | null;
    onChange: (file: File | null) => void;
    error?: string;
    square?: boolean;
    fallbackSrc?: string | null;
}

export default function AdminImageUpload({ label, file, existing, onChange, error, square = true, fallbackSrc = null }: AdminImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(storageUrl(existing));

    useEffect(() => {
        if (!file) {
            setPreview(storageUrl(existing));

            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [existing, file]);

    return (
        <FormField label={label} error={error} hint="JPG, PNG or WEBP up to 2MB.">
            <div className="flex items-center gap-4 rounded-[var(--app-surface-radius)] border border-dashed border-zinc-950/10 bg-zinc-50/90 p-4 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/50 dark:ring-white/5">
                <Avatar
                    square={square}
                    src={preview ?? undefined}
                    fallbackSrc={fallbackSrc ?? undefined}
                    initials={preview || fallbackSrc ? undefined : label.slice(0, 2)}
                    className="size-16 bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                />
                <div className="flex-1">
                    <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                    />
                </div>
            </div>
        </FormField>
    );
}
