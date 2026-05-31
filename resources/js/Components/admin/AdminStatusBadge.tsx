import { Badge } from '@/components/ui/badge';

const colorMap: Record<string, React.ComponentProps<typeof Badge>['color']> = {
    active: 'green',
    inactive: 'zinc',
    published: 'emerald',
    hidden: 'zinc',
    draft: 'amber',
    new: 'blue',
    read: 'sky',
    in_progress: 'amber',
    replied: 'teal',
    closed: 'zinc',
};

export default function AdminStatusBadge({ status }: { status: string }) {
    return <Badge color={colorMap[status] ?? 'zinc'} className="capitalize">{status.replace(/_/g, ' ')}</Badge>;
}
