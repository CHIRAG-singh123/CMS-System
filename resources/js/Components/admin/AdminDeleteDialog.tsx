import { Alert, AlertActions, AlertBody, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AdminDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    onConfirm: () => void;
    processing?: boolean;
}

export default function AdminDeleteDialog({
    open,
    onClose,
    title,
    description,
    onConfirm,
    processing = false,
}: AdminDeleteDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Alert open={open} onClose={onClose}>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
            <AlertBody />
            <AlertActions>
                <Button plain onClick={onClose}>
                    Cancel
                </Button>
                <Button color="red" onClick={handleConfirm} disabled={processing}>
                    {processing ? 'Deleting...' : 'Delete'}
                </Button>
            </AlertActions>
        </Alert>
    );
}
