import { Button } from '@/components/ui/button';

interface AdminFormActionsProps {
    cancelHref: string;
    processing: boolean;
    submitLabel: string;
    processingLabel: string;
    formId?: string;
}

export default function AdminFormActions({
    cancelHref,
    processing,
    submitLabel,
    processingLabel,
    formId,
}: AdminFormActionsProps) {
    return (
        <div className="flex flex-wrap items-center justify-end gap-3">
            <Button href={cancelHref} plain>
                Cancel
            </Button>
            <Button type="submit" form={formId} color="blue" disabled={processing}>
                {processing ? processingLabel : submitLabel}
            </Button>
        </div>
    );
}
