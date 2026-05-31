import { useEffect, useRef } from 'react';
import { normalizeSlug, shouldFollowSourceSlug } from '@/utils/slug';

interface UseAutoSlugOptions {
    source: string;
    slug: string;
    setSlug: (value: string) => void;
}

export function useAutoSlug({ source, slug, setSlug }: UseAutoSlugOptions): void {
    const previousSourceRef = useRef(source);

    useEffect(() => {
        const previousSource = previousSourceRef.current;

        if (source === previousSource) {
            return;
        }

        if (shouldFollowSourceSlug(slug, previousSource)) {
            setSlug(normalizeSlug(source));
        }

        previousSourceRef.current = source;
    }, [setSlug, slug, source]);
}
