import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';

type AdminTableActionItem = {
    label: string;
    href?: string;
    onClick?: () => void;
    kind?: 'edit' | 'delete' | 'view';
};

function ActionIcon({ kind }: { kind?: AdminTableActionItem['kind'] }) {
    switch (kind) {
        case 'delete':
            return <TrashIcon data-slot="icon" className="size-4" />;
        case 'view':
            return <EyeIcon data-slot="icon" className="size-4" />;
        case 'edit':
        default:
            return <PencilSquareIcon data-slot="icon" className="size-4" />;
    }
}

export default function AdminTableActions({ items }: { items: AdminTableActionItem[] }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-1.5">
            {items.map((item) => {
                const key = `${item.kind ?? 'action'}:${item.label}:${item.href ?? 'button'}`;

                if (item.href) {
                    return (
                        <Button
                            key={key}
                            href={item.href}
                            prefetch={false}
                            plain
                            aria-label={item.label}
                            title={item.label}
                            className="!size-9 !px-0 !py-0"
                        >
                            <ActionIcon kind={item.kind} />
                            <span className="sr-only">{item.label}</span>
                        </Button>
                    );
                }

                return (
                    <Button
                        key={key}
                        onClick={item.onClick}
                        plain
                        aria-label={item.label}
                        title={item.label}
                        className="!size-9 !px-0 !py-0"
                    >
                        <ActionIcon kind={item.kind} />
                        <span className="sr-only">{item.label}</span>
                    </Button>
                );
            })}
        </div>
    );
}
